import puppeteer from 'puppeteer';
import readline from 'readline/promises';
import TurndownService from 'turndown'
import https from 'https';
import fs from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  codeBlockStyle: 'fenced',
})

async function scrapeMedium(url) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 2560, height: 1440 });
  await page.goto(url);

  const article = await page.$eval('article', el => el.innerHTML);
  const title = await page.$eval('h1', el => el.innerText);
  const subtitle = await page.$eval('h2', el => el.innerText);
  const date = await page.$eval('[data-testid="storyPublishDate"]', el => {
    let text = el.innerText;
    if (!text.includes(',')) {
      text = text + ', 2023';
    }
    return new Date('01:00 ' + text).toISOString().split('T')[0];
  });

  const markdown = turndownService.turndown(article);

  await browser.close();

  return {
    markdown,
    title,
    subtitle,
    date,
  };
}

async function createAssetsDirectory(slug) {
  const dir = `./src/assets/images/${slug}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

async function downloadImage(url, slug, filename, extension) {
  const path = `./src/assets/images/${slug}/${filename}.${extension}`;
  const file = fs.createWriteStream(path);
  https.get(url, function(response) {
    response.pipe(file);
  });
  return path.replace('./src', '../..')
}

async function processArticle(markdown, slug) {
  // Find images and extract url
  const images = markdown.match(/!\[\]\(.*\)/g);
  const imageUrls = images.map(image => {
    const url = image.match(/\(.*\)/g)[0];
    return url.substring(1, url.length - 1);
  })
  await createAssetsDirectory(slug);
  const paths = await Promise.all(imageUrls.map(async (url, index) => {
    const filename = `image-${index}`;
    let extension = url.split('.').pop();
    if (extension.length > 3) {
      extension = 'jpg';
    }
    return await downloadImage(url, slug, filename, extension);
  }))

  let imports = ["import { Image } from 'astro:assets'"]
  // Replace markdown images with Astro images
  imageUrls.forEach((url, index) => {
    const importName = `image${index}`
    const path = paths[index];
    const astroImage = `<Image src={${importName}} alt="TODO" />`;
    markdown = markdown.replace(images[index], astroImage);
    imports.push(`import ${importName} from '${path}'`);
  })

  // Remove medium bloat
  const shareIndex = markdown.indexOf('Share\n\n');
  markdown = markdown.substring(shareIndex + 7, markdown.length);

  // Add imports to top of markdown
  markdown = imports.join('\n') + '\n\n' + markdown;

  return markdown;
}

function saveMarkdown(markdown, slug) {
  fs.writeFileSync(`./src/content/posts/${slug}.mdx`, markdown);
}

async function main() {
  let url = process.argv[2];
  if (!url) {
    url = await rl.question('Enter Medium article URL: ');
  }
  const article = await scrapeMedium(url);
  rl.close();

  const slug = article.title.toLowerCase().replace(/[^\w\d\s]+/g, '').replace(/\s+/g, '-');

  const processed = await processArticle(article.markdown, slug);

  const mdown = `---
title: "${article.title}"
subtitle: "${article.subtitle}"
date: ${article.date}
---
${processed}
`;
  saveMarkdown(mdown, slug);
  console.log('Processed', slug);
}

main();
