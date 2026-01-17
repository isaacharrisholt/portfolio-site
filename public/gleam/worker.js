import initGleamCompiler from './compiler.js'
import stdlib from './stdlib.js'

const compiler = await initGleamCompiler()
const project = compiler.newProject()

// Load all stdlib and gleam_json modules into the project
for (const [name, code] of Object.entries(stdlib)) {
  project.writeModule(name, code)
}

// Capture stdout/stderr output
let logged = ''
let errored = ''
const originalLog = console.log
const originalError = console.error
console.log = (...args) => {
  originalLog(...args)
  logged += `${args.map((e) => `${e}`).join(' ')}\n`
}
console.error = (...args) => {
  originalError(...args)
  errored += `${args.map((e) => `${e}`).join(' ')}\n`
}

async function loadProgram(js) {
  // URL to worker.js
  const url = new URL(import.meta.url)
  // Remove 'worker.js', keep just the base path
  url.pathname = url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1)
  url.hash = ''
  url.search = ''
  const href = url.toString()

  let editedJs = js

  // If echo has been used, add the dict module import
  if (editedJs.includes('return value instanceof $stdlib$dict.default;')) {
    editedJs = `import * as $stdlib$dict from "./dict.mjs";\n${js}`
  }

  // Rewrite imports to reference precompiled modules
  // ./gleam/json.mjs -> precompiled/gleam_json/gleam/json.mjs (gleam_json package)
  // ./gleam/xxx.mjs -> precompiled/gleam_stdlib/gleam/xxx.mjs (stdlib)
  // ./gleam.mjs -> precompiled/gleam_stdlib/gleam.mjs (prelude)
  editedJs = editedJs.replaceAll(
    /from\s+"\.\/gleam\/json\.mjs"/g,
    `from "${href}precompiled/gleam_json/gleam/json.mjs"`,
  )
  editedJs = editedJs.replaceAll(
    /from\s+"\.\/gleam\/(.+)"/g,
    `from "${href}precompiled/gleam_stdlib/gleam/$1"`,
  )
  editedJs = editedJs.replaceAll(
    /from\s+"\.\/gleam\.mjs"/g,
    `from "${href}precompiled/gleam_stdlib/gleam.mjs"`,
  )

  // Evaluate the code via blob URL (same-origin, can import from localhost)
  const blob = new Blob([editedJs], { type: 'application/javascript' })
  const blobUrl = URL.createObjectURL(blob)
  try {
    const module = await import(blobUrl)
    return module.main
  } finally {
    URL.revokeObjectURL(blobUrl)
  }
}

async function compileEval(code) {
  logged = ''
  errored = ''
  const result = {
    log: null,
    error: null,
    stderr: null,
    warnings: [],
  }

  try {
    project.writeModule('main', code)
    project.compilePackage('javascript')
    const js = project.readCompiledJavaScript('main')
    const main = await loadProgram(js)
    if (main) main()
  } catch (error) {
    console.error(error)
    result.error = error.toString()
  }

  for (const warning of project.takeWarnings()) {
    result.warnings.push(warning)
  }
  result.log = logged
  result.stderr = errored

  return result
}

self.onmessage = async (event) => {
  const result = await compileEval(event.data)
  postMessage(result)
}

// Signal that the worker is ready
postMessage({ ready: true })
