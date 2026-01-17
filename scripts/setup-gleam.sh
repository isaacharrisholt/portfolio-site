#!/bin/bash
set -e

GLEAM_VERSION="1.14.0"
STDLIB_VERSION="0.68.1"
JSON_VERSION="3.1.0"

PUBLIC_DIR="public/gleam"
TEMP_DIR=".gleam-temp"

echo "Setting up Gleam WASM compiler and stdlib..."

# Cleanup any previous temp
rm -rf "$TEMP_DIR"

# Create directories
mkdir -p "$PUBLIC_DIR/precompiled/gleam"
mkdir -p "$TEMP_DIR"

# Download WASM compiler
echo "Downloading Gleam WASM compiler v${GLEAM_VERSION}..."
curl -sL "https://github.com/gleam-lang/gleam/releases/download/v${GLEAM_VERSION}/gleam-v${GLEAM_VERSION}-browser.tar.gz" \
  -o "$TEMP_DIR/compiler.tar.gz"

mkdir -p "$TEMP_DIR/compiler"
tar -xzf "$TEMP_DIR/compiler.tar.gz" -C "$TEMP_DIR/compiler"
cp "$TEMP_DIR/compiler/gleam_wasm.js" "$PUBLIC_DIR/gleam_wasm.js"
cp "$TEMP_DIR/compiler/gleam_wasm_bg.wasm" "$PUBLIC_DIR/gleam_wasm_bg.wasm"

# Create compiler wrapper (provides Compiler and Project classes)
cat > "$PUBLIC_DIR/compiler.js" << 'COMPILER_EOF'
let compiler;

export default async function initGleamCompiler() {
  const wasm = await import("./gleam_wasm.js");
  await wasm.default();
  wasm.initialise_panic_hook();
  if (!compiler) {
    compiler = new Compiler(wasm);
  }
  return compiler;
}

class Compiler {
  #wasm;
  #nextId = 0;
  #projects = new Map();

  constructor(wasm) {
    this.#wasm = wasm;
  }

  get wasm() {
    return this.#wasm;
  }

  newProject() {
    const id = this.#nextId++;
    const project = new Project(id);
    this.#projects.set(id, new WeakRef(project));
    return project;
  }

  garbageCollectProjects() {
    const gone = [];
    for (const [id, project] of this.#projects) {
      if (!project.deref()) gone.push(id);
    }
    for (const id of gone) {
      this.#projects.delete(id);
      this.#wasm.delete_project(id);
    }
  }
}

class Project {
  #id;

  constructor(id) {
    this.#id = id;
  }

  get projectId() {
    return this.#id;
  }

  writeModule(moduleName, code) {
    compiler.wasm.write_module(this.#id, moduleName, code);
  }

  compilePackage(target) {
    compiler.garbageCollectProjects();
    compiler.wasm.reset_warnings(this.#id);
    compiler.wasm.compile_package(this.#id, target);
  }

  readCompiledJavaScript(moduleName) {
    return compiler.wasm.read_compiled_javascript(this.#id, moduleName);
  }

  readCompiledErlang(moduleName) {
    return compiler.wasm.read_compiled_erlang(this.#id, moduleName);
  }

  resetFilesystem() {
    compiler.wasm.reset_filesystem(this.#id);
  }

  delete() {
    compiler.wasm.delete_project(this.#id);
  }

  takeWarnings() {
    const warnings = [];
    while (true) {
      const warning = compiler.wasm.pop_warning(this.#id);
      if (!warning) return warnings;
      warnings.push(warning.trimStart());
    }
  }
}
COMPILER_EOF

# Download gleam_stdlib source from hex.pm
echo "Downloading gleam_stdlib v${STDLIB_VERSION}..."
curl -sL "https://repo.hex.pm/tarballs/gleam_stdlib-${STDLIB_VERSION}.tar" \
  -o "$TEMP_DIR/stdlib.tar"
mkdir -p "$TEMP_DIR/stdlib"
tar -xf "$TEMP_DIR/stdlib.tar" -C "$TEMP_DIR/stdlib"
# The tar contains a contents.tar.gz with the actual files
tar -xzf "$TEMP_DIR/stdlib/contents.tar.gz" -C "$TEMP_DIR/stdlib"

# Download gleam_json source from hex.pm
echo "Downloading gleam_json v${JSON_VERSION}..."
curl -sL "https://repo.hex.pm/tarballs/gleam_json-${JSON_VERSION}.tar" \
  -o "$TEMP_DIR/json.tar"
mkdir -p "$TEMP_DIR/json"
tar -xf "$TEMP_DIR/json.tar" -C "$TEMP_DIR/json"
tar -xzf "$TEMP_DIR/json/contents.tar.gz" -C "$TEMP_DIR/json"

# Generate stdlib.js bundle (source code for the compiler)
echo "Generating stdlib.js bundle..."
{
  echo "export default {"

  # Add stdlib modules (including subdirectories)
  find "$TEMP_DIR/stdlib/src/gleam" -name "*.gleam" | while read -r file; do
    # Get relative path from src/gleam
    rel_path="${file#$TEMP_DIR/stdlib/src/}"
    module_name="${rel_path%.gleam}"
    base_name=$(basename "$file" .gleam)

    # Skip deprecated modules
    if [[ "$base_name" == "bit_string" || "$base_name" == "bit_builder" || "$base_name" == "map" ]]; then
      continue
    fi

    # Escape backticks, backslashes, and dollar signs for JS template literal
    code=$(cat "$file" | sed 's/\\/\\\\/g' | sed 's/`/\\`/g' | sed 's/\$/\\$/g' | grep -v "^[[:space:]]*//")
    echo "  \"$module_name\": \`$code\`,"
  done

  # Add gleam_json module
  if [ -f "$TEMP_DIR/json/src/gleam/json.gleam" ]; then
    code=$(cat "$TEMP_DIR/json/src/gleam/json.gleam" | sed 's/\\/\\\\/g' | sed 's/`/\\`/g' | sed 's/\$/\\$/g' | grep -v "^[[:space:]]*//")
    echo "  \"gleam/json\": \`$code\`,"
  fi

  echo "}"
} > "$PUBLIC_DIR/stdlib.js"

# We need to compile the stdlib modules to JavaScript
# For this, we'll create a temporary Gleam project and build it
echo "Compiling stdlib modules to JavaScript..."

# Create temporary Gleam project for compiling stdlib
GLEAM_PROJECT="$TEMP_DIR/gleam_project"
mkdir -p "$GLEAM_PROJECT/src"

cat > "$GLEAM_PROJECT/gleam.toml" << 'EOF'
name = "precompile"
version = "1.0.0"
target = "javascript"

[dependencies]
gleam_stdlib = ">= 0.68.1"
gleam_json = ">= 3.1.0"
EOF

# Build to get compiled JS
cd "$GLEAM_PROJECT"
gleam build 2>/dev/null || true
cd - > /dev/null

# Copy the entire gleam_stdlib compiled output (preserving structure)
if [ -d "$GLEAM_PROJECT/build/dev/javascript/gleam_stdlib" ]; then
  cp -r "$GLEAM_PROJECT/build/dev/javascript/gleam_stdlib" "$PUBLIC_DIR/precompiled/"
fi

# Copy the entire gleam_json compiled output
if [ -d "$GLEAM_PROJECT/build/dev/javascript/gleam_json" ]; then
  cp -r "$GLEAM_PROJECT/build/dev/javascript/gleam_json" "$PUBLIC_DIR/precompiled/"
fi

# Copy the prelude
if [ -f "$GLEAM_PROJECT/build/dev/javascript/prelude.mjs" ]; then
  cp "$GLEAM_PROJECT/build/dev/javascript/prelude.mjs" "$PUBLIC_DIR/precompiled/"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo "Done! Gleam WASM compiler and stdlib are ready in $PUBLIC_DIR"
echo ""
echo "Files created:"
find "$PUBLIC_DIR" -type f | head -20
