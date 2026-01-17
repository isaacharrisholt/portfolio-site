<script>
  import { onMount } from 'svelte'
  import CodeFlask from 'codeflask'
  import Prism from 'prismjs'

  // The read-only top section (imports + types)
  const topCode = `import gleam/io
import gleam/json

// === Types ===

pub type Page {
  Page(
    name: String,
    tagline: String,
    links: List(Link),
  )
}

pub type Link {
  Link(label: String, href: String, external: Bool)
}`

  // The editable middle section (page function)
  const defaultEditableCode = `pub fn page() -> Page {
  Page(
    name: "Isaac Harris-Holt",
    tagline: "Head of Engineering @ Medfin, content creator on YouTube",
    links: [
      Link(label: "Blog", href: "/blog", external: False),
      Link(label: "Now", href: "/now", external: False),
      Link(label: "Uses", href: "/uses", external: False),
      Link(label: "CV", href: "/cv", external: False),
      Link(label: "YouTube", href: "https://youtube.com/IsaacHarrisHolt", external: True),
    ],
  )
}`

  // The read-only bottom section (encoding + main)
  const bottomCode = `// === Encoding ===

fn encode_link(link: Link) -> json.Json {
  json.object([
    #("label", json.string(link.label)),
    #("href", json.string(link.href)),
    #("external", json.bool(link.external)),
  ])
}

fn encode_page(p: Page) -> json.Json {
  json.object([
    #("name", json.string(p.name)),
    #("tagline", json.string(p.tagline)),
    #("links", json.array(p.links, encode_link)),
  ])
}

pub fn main() {
  page()
  |> encode_page
  |> json.to_string
  |> io.println
}`

  // Reactive state
  let editableCode = $state(defaultEditableCode)
  let output = $state('')
  let stderrOutput = $state('')
  let warnings = $state([])
  let isCompiling = $state(false)
  let isReady = $state(false)
  let pageData = $state(null)

  let worker = $state(null)
  let editorElement = $state(null)
  let codeflaskInstance = $state(null)
  let debounceTimer = $state(null)

  // Highlighted readonly code
  let topCodeHighlighted = $state('')
  let bottomCodeHighlighted = $state('')

  // Parse JSON output into page data
  function parseOutput(log) {
    if (!log || !log.trim()) return null
    const lines = log.split('\n')
    for (const [idx, line] of lines.entries()) {
      try {
        const pageData = JSON.parse(line.trim())
        const { name, tagline, links } = pageData
        if (!name || !tagline || !links) {
          continue
        }
        const programOutput = lines.filter((_, i) => i !== idx).join('\n')
        return { pageData, programOutput }
      } catch {}
    }
    return null
  }

  // Escape HTML for safe rendering
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  // Compile the full code
  function compile() {
    if (!worker || !isReady) return
    isCompiling = true
    const fullCode =
      topCode +
      '\n\n// === Your Data (edit below!) ===\n\n' +
      editableCode +
      '\n\n' +
      bottomCode
    worker.postMessage(fullCode)
  }

  // Debounced compile
  function debouncedCompile() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(compile, 300)
  }

  // Reset to default code
  function reset() {
    if (debounceTimer) clearTimeout(debounceTimer)
    editableCode = defaultEditableCode
    if (codeflaskInstance) {
      codeflaskInstance.updateCode(defaultEditableCode)
    }
    compile()
  }

  // Define Gleam syntax highlighting grammar for Prism (shared)
  const gleamGrammar = {
    comment: {
      pattern: /\/\/.*/,
      greedy: true,
    },
    string: {
      pattern: /"(?:[^"\\]|\\.)*"/,
      greedy: true,
    },
    keyword:
      /\b(?:as|assert|case|const|external|fn|if|import|let|opaque|panic|pub|todo|type|use)\b/,
    boolean: /\b(?:True|False)\b/,
    'type-name': {
      pattern: /\b[A-Z][a-zA-Z0-9_]*\b/,
      alias: 'class-name',
    },
    function: {
      pattern: /\b[a-z_][a-z0-9_]*(?=\s*\()/,
    },
    number: /\b\d+(?:\.\d+)?\b/,
    operator: /->|<-|\|>|&&|\|\||[+\-*/%<>=!]+/,
    punctuation: /[{}[\](),.:]/,
  }

  onMount(async () => {
    // Register Gleam language with Prism
    Prism.languages.gleam = gleamGrammar

    // Highlight readonly sections
    topCodeHighlighted = Prism.highlight(topCode, Prism.languages.gleam, 'gleam')
    bottomCodeHighlighted = Prism.highlight(bottomCode, Prism.languages.gleam, 'gleam')

    // Create a temporary instance to register the language
    const tempFlask = new CodeFlask(document.createElement('div'), {
      language: 'js',
    })
    tempFlask.addLanguage('gleam', gleamGrammar)

    // Initialise CodeFlask editor
    codeflaskInstance = new CodeFlask(editorElement, {
      language: 'gleam',
      defaultTheme: false,
    })

    codeflaskInstance.updateCode(editableCode)

    codeflaskInstance.onUpdate((code) => {
      editableCode = code
      debouncedCompile()
    })

    // Initialise Web Worker
    worker = new Worker('/gleam/worker.js', { type: 'module' })

    worker.onmessage = (event) => {
      const result = event.data

      if (result.ready) {
        isReady = true
        compile()
        return
      }

      isCompiling = false
      const log = result.log || ''
      const err = result.stderr || result.error || ''
      output = log
      stderrOutput = err
      warnings = result.warnings || []
      const parsed = parseOutput(log)
      if (parsed) {
        const { pageData: p, programOutput } = parseOutput(log)
        pageData = p
        output = programOutput
      }
    }

    worker.onerror = (e) => {
      console.error('Worker error:', e)
      output = ''
      pageData = null
      stderrOutput = 'Worker failed to load'
      isCompiling = false
    }

    return () => {
      if (worker) worker.terminate()
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  })
</script>

<div class="flex flex-col gap-12 lg:gap-16">
  <section class="min-w-0 flex flex-col gap-6">
    {#if warnings.length > 0}
      <div>
        <div
          class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-commit-hash"
        >
          Warnings ({warnings.length})
        </div>
        {#each warnings as warning}
          <pre
            class="mb-2 whitespace-pre-wrap font-mono text-sm leading-relaxed text-yellow-200">{warning}</pre>
        {/each}
      </div>
    {/if}

    {#if pageData}
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <h1 class="text-4xl font-bold tracking-tight text-accent-blue md:text-5xl">
            {pageData.name}
          </h1>
          <p class="text-lg text-surface-200">{pageData.tagline}</p>
        </div>
        <nav class="flex flex-wrap gap-x-8 gap-y-3">
          {#each pageData.links as link}
            <a
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener' : undefined}
              class="inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-sm font-semibold text-surface-100 transition hover:border-accent-blue hover:text-accent-blue"
            >
              {link.label}
              {#if link.external}<span class="text-xs text-surface-300 pb-0.5">↗</span
                >{/if}
            </a>
          {/each}
        </nav>
      </div>
    {:else if !isReady}
      <div
        class="flex flex-col items-center justify-center gap-4 py-16 text-surface-300"
      >
        <div
          class="h-6 w-6 animate-spin rounded-full border-2 border-surface-400 border-t-accent-blue"
        ></div>
        <span class="text-xs uppercase tracking-[0.2em]">Initialising...</span>
      </div>
    {/if}

    {#if output}
      <pre
        class="whitespace-pre-wrap text-sm leading-relaxed text-surface-200">{output}</pre>
    {/if}

    {#if stderrOutput}
      <pre
        class="whitespace-pre-wrap text-sm leading-relaxed text-red-200">{stderrOutput}</pre>
    {/if}
  </section>

  <section class="min-w-0 flex flex-col gap-6">
    <div class="text-sm text-surface-300">
      Edit the <a
        href="https://gleam.run"
        class="underline"
        target="_blank"
        rel="noopener noreferrer">Gleam</a
      > code below to see the hero update.
    </div>
    <div class="min-h-72 overflow-y-auto relative">
      <div class="editor-container font-mono" bind:this={editorElement}></div>
    </div>

    <details class="group">
      <summary
        class="flex cursor-pointer select-none list-none items-center gap-2 text-xs text-surface-300 transition-colors hover:text-surface-200 [&::-webkit-details-marker]:hidden"
      >
        <span
          class="inline-block w-3 before:content-['+'] group-open:before:content-['−']"
        ></span>
        View types & encoding
      </summary>

      <pre class="code-readonly font-mono mt-3"><code
          >{@html topCodeHighlighted || escapeHtml(topCode)}</code
        ></pre>
      <pre class="code-readonly font-mono mt-4"><code
          >{@html bottomCodeHighlighted || escapeHtml(bottomCode)}</code
        ></pre>
    </details>
  </section>
</div>

<style>
  /* Read-only code blocks */
  .code-readonly {
    font-size: 0.8125rem;
    line-height: 1.7;
    color: #9ca3af;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .code-readonly code {
    font-family: inherit;
  }

  /* CodeFlask overrides */
  .editor-container :global(.codeflask) {
    background: transparent !important;
  }

  .editor-container :global(.codeflask__textarea) {
    caret-color: #50c5d9 !important;
  }

  .editor-container :global(.codeflask__flatten) {
    padding: 0;
  }

  /* Syntax highlighting */
  .code-readonly :global(.token.keyword),
  .editor-container :global(.token.keyword) {
    color: #ff79c6;
  }

  .code-readonly :global(.token.function),
  .editor-container :global(.token.function) {
    color: #50c5d9;
  }

  .code-readonly :global(.token.string),
  .editor-container :global(.token.string) {
    color: #a5d6ff;
  }

  .code-readonly :global(.token.number),
  .editor-container :global(.token.number) {
    color: #ffa657;
  }

  .code-readonly :global(.token.boolean),
  .editor-container :global(.token.boolean) {
    color: #ffa657;
  }

  .code-readonly :global(.token.operator),
  .editor-container :global(.token.operator) {
    color: #ff79c6;
  }

  .code-readonly :global(.token.punctuation),
  .editor-container :global(.token.punctuation) {
    color: #9ca3af;
  }

  .code-readonly :global(.token.comment),
  .editor-container :global(.token.comment) {
    color: #6b7280;
    font-style: italic;
  }

  .code-readonly :global(.token.class-name),
  .editor-container :global(.token.class-name) {
    color: #6fd98a;
  }
</style>
