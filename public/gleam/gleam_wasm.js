let wasm

function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc()
  wasm.__wbindgen_externrefs.set(idx, obj)
  return idx
}

function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len)
}

let cachedDataViewMemory0 = null
function getDataViewMemory0() {
  if (
    cachedDataViewMemory0 === null ||
    cachedDataViewMemory0.buffer.detached === true ||
    (cachedDataViewMemory0.buffer.detached === undefined &&
      cachedDataViewMemory0.buffer !== wasm.memory.buffer)
  ) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer)
  }
  return cachedDataViewMemory0
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0
  return decodeText(ptr, len)
}

let cachedUint8ArrayMemory0 = null
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer)
  }
  return cachedUint8ArrayMemory0
}

function handleError(f, args) {
  try {
    return f.apply(this, args)
  } catch (e) {
    const idx = addToExternrefTable0(e)
    wasm.__wbindgen_exn_store(idx)
  }
}

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0
  getUint8ArrayMemory0().set(arg, ptr / 1)
  WASM_VECTOR_LEN = arg.length
  return ptr
}

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg)
    const ptr = malloc(buf.length, 1) >>> 0
    getUint8ArrayMemory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf)
    WASM_VECTOR_LEN = buf.length
    return ptr
  }

  let len = arg.length
  let ptr = malloc(len, 1) >>> 0

  const mem = getUint8ArrayMemory0()

  let offset = 0

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset)
    if (code > 0x7f) break
    mem[ptr + offset] = code
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset)
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len)
    const ret = cachedTextEncoder.encodeInto(arg, view)

    offset += ret.written
    ptr = realloc(ptr, len, offset, 1) >>> 0
  }

  WASM_VECTOR_LEN = offset
  return ptr
}

function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx)
  wasm.__externref_table_dealloc(idx)
  return value
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true })
cachedTextDecoder.decode()
const MAX_SAFARI_DECODE_BYTES = 2146435072
let numBytesDecoded = 0
function decodeText(ptr, len) {
  numBytesDecoded += len
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true })
    cachedTextDecoder.decode()
    numBytesDecoded = len
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len))
}

const cachedTextEncoder = new TextEncoder()

if (!('encodeInto' in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function (arg, view) {
    const buf = cachedTextEncoder.encode(arg)
    view.set(buf)
    return {
      read: arg.length,
      written: buf.length,
    }
  }
}

let WASM_VECTOR_LEN = 0

/**
 * Run the package compiler. If this succeeds you can use
 * @param {number} project_id
 * @param {string} target
 */
export function compile_package(project_id, target) {
  const ptr0 = passStringToWasm0(
    target,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  )
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.compile_package(project_id, ptr0, len0)
  if (ret[1]) {
    throw takeFromExternrefTable0(ret[0])
  }
}

/**
 * Delete project, freeing any memory associated with it.
 * @param {number} project_id
 */
export function delete_project(project_id) {
  wasm.delete_project(project_id)
}

/**
 * You should call this once to ensure that if the compiler crashes it gets
 * reported in JavaScript.
 * @param {boolean} debug
 */
export function initialise_panic_hook(debug) {
  wasm.initialise_panic_hook(debug)
}

/**
 * Pop the latest warning from the compiler.
 * @param {number} project_id
 * @returns {string | undefined}
 */
export function pop_warning(project_id) {
  const ret = wasm.pop_warning(project_id)
  let v1
  if (ret[0] !== 0) {
    v1 = getStringFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
  }
  return v1
}

/**
 * Get the compiled Erlang output for a given module.
 *
 * You need to call `compile_package` before calling this function.
 * @param {number} project_id
 * @param {string} module_name
 * @returns {string | undefined}
 */
export function read_compiled_erlang(project_id, module_name) {
  const ptr0 = passStringToWasm0(
    module_name,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  )
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.read_compiled_erlang(project_id, ptr0, len0)
  let v2
  if (ret[0] !== 0) {
    v2 = getStringFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
  }
  return v2
}

/**
 * Get the compiled JavaScript output for a given module.
 *
 * You need to call `compile_package` before calling this function.
 * @param {number} project_id
 * @param {string} module_name
 * @returns {string | undefined}
 */
export function read_compiled_javascript(project_id, module_name) {
  const ptr0 = passStringToWasm0(
    module_name,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  )
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.read_compiled_javascript(project_id, ptr0, len0)
  let v2
  if (ret[0] !== 0) {
    v2 = getStringFromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
  }
  return v2
}

/**
 * Read a file from the virtual file system.
 * @param {number} project_id
 * @param {string} path
 * @returns {Uint8Array | undefined}
 */
export function read_file_bytes(project_id, path) {
  const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len0 = WASM_VECTOR_LEN
  const ret = wasm.read_file_bytes(project_id, ptr0, len0)
  let v2
  if (ret[0] !== 0) {
    v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice()
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
  }
  return v2
}

/**
 * Reset the virtual file system to an empty state.
 * @param {number} project_id
 */
export function reset_filesystem(project_id) {
  wasm.reset_filesystem(project_id)
}

/**
 * Clear any stored warnings. This is performed automatically when before compilation.
 * @param {number} project_id
 */
export function reset_warnings(project_id) {
  wasm.reset_warnings(project_id)
}

/**
 * Write a file to the virtual file system.
 * @param {number} project_id
 * @param {string} path
 * @param {string} content
 */
export function write_file(project_id, path, content) {
  const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passStringToWasm0(
    content,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  )
  const len1 = WASM_VECTOR_LEN
  wasm.write_file(project_id, ptr0, len0, ptr1, len1)
}

/**
 * Write a non-text file to the virtual file system.
 * @param {number} project_id
 * @param {string} path
 * @param {Uint8Array} content
 */
export function write_file_bytes(project_id, path, content) {
  const ptr0 = passStringToWasm0(path, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passArray8ToWasm0(content, wasm.__wbindgen_malloc)
  const len1 = WASM_VECTOR_LEN
  wasm.write_file_bytes(project_id, ptr0, len0, ptr1, len1)
}

/**
 * Write a Gleam module to the `/src` directory of the virtual file system.
 * @param {number} project_id
 * @param {string} module_name
 * @param {string} code
 */
export function write_module(project_id, module_name, code) {
  const ptr0 = passStringToWasm0(
    module_name,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  )
  const len0 = WASM_VECTOR_LEN
  const ptr1 = passStringToWasm0(code, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
  const len1 = WASM_VECTOR_LEN
  wasm.write_module(project_id, ptr0, len0, ptr1, len1)
}

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default'])

async function __wbg_load(module, imports) {
  if (typeof Response === 'function' && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      try {
        return await WebAssembly.instantiateStreaming(module, imports)
      } catch (e) {
        const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type)

        if (
          validResponse &&
          module.headers.get('Content-Type') !== 'application/wasm'
        ) {
          console.warn(
            '`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n',
            e,
          )
        } else {
          throw e
        }
      }
    }

    const bytes = await module.arrayBuffer()
    return await WebAssembly.instantiate(bytes, imports)
  } else {
    const instance = await WebAssembly.instantiate(module, imports)

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module }
    } else {
      return instance
    }
  }
}

function __wbg_get_imports() {
  const imports = {}
  imports.wbg = {}
  imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = function (arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1))
  }
  imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function (arg0, arg1) {
    let deferred0_0
    let deferred0_1
    try {
      deferred0_0 = arg0
      deferred0_1 = arg1
      console.error(getStringFromWasm0(arg0, arg1))
    } finally {
      wasm.__wbindgen_free(deferred0_0, deferred0_1, 1)
    }
  }
  imports.wbg.__wbg_log_0cc1b7768397bcfe = function (
    arg0,
    arg1,
    arg2,
    arg3,
    arg4,
    arg5,
    arg6,
    arg7,
  ) {
    let deferred0_0
    let deferred0_1
    try {
      deferred0_0 = arg0
      deferred0_1 = arg1
      console.log(
        getStringFromWasm0(arg0, arg1),
        getStringFromWasm0(arg2, arg3),
        getStringFromWasm0(arg4, arg5),
        getStringFromWasm0(arg6, arg7),
      )
    } finally {
      wasm.__wbindgen_free(deferred0_0, deferred0_1, 1)
    }
  }
  imports.wbg.__wbg_log_cb9e190acc5753fb = function (arg0, arg1) {
    let deferred0_0
    let deferred0_1
    try {
      deferred0_0 = arg0
      deferred0_1 = arg1
      console.log(getStringFromWasm0(arg0, arg1))
    } finally {
      wasm.__wbindgen_free(deferred0_0, deferred0_1, 1)
    }
  }
  imports.wbg.__wbg_mark_7438147ce31e9d4b = function (arg0, arg1) {
    performance.mark(getStringFromWasm0(arg0, arg1))
  }
  imports.wbg.__wbg_measure_fb7825c11612c823 = function () {
    return handleError(function (arg0, arg1, arg2, arg3) {
      let deferred0_0
      let deferred0_1
      let deferred1_0
      let deferred1_1
      try {
        deferred0_0 = arg0
        deferred0_1 = arg1
        deferred1_0 = arg2
        deferred1_1 = arg3
        performance.measure(
          getStringFromWasm0(arg0, arg1),
          getStringFromWasm0(arg2, arg3),
        )
      } finally {
        wasm.__wbindgen_free(deferred0_0, deferred0_1, 1)
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
      }
    }, arguments)
  }
  imports.wbg.__wbg_new_8a6f238a6ece86ea = function () {
    const ret = new Error()
    return ret
  }
  imports.wbg.__wbg_stack_0ed75d68575b0f3c = function (arg0, arg1) {
    const ret = arg1.stack
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
  }
  imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function (arg0, arg1) {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1)
    return ret
  }
  imports.wbg.__wbindgen_init_externref_table = function () {
    const table = wasm.__wbindgen_externrefs
    const offset = table.grow(4)
    table.set(0, undefined)
    table.set(offset + 0, undefined)
    table.set(offset + 1, null)
    table.set(offset + 2, true)
    table.set(offset + 3, false)
  }

  return imports
}

function __wbg_finalize_init(instance, module) {
  wasm = instance.exports
  __wbg_init.__wbindgen_wasm_module = module
  cachedDataViewMemory0 = null
  cachedUint8ArrayMemory0 = null

  wasm.__wbindgen_start()
  return wasm
}

function initSync(module) {
  if (wasm !== undefined) return wasm

  if (typeof module !== 'undefined') {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ;({ module } = module)
    } else {
      console.warn(
        'using deprecated parameters for `initSync()`; pass a single object instead',
      )
    }
  }

  const imports = __wbg_get_imports()
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module)
  }
  const instance = new WebAssembly.Instance(module, imports)
  return __wbg_finalize_init(instance, module)
}

async function __wbg_init(module_or_path) {
  if (wasm !== undefined) return wasm

  if (typeof module_or_path !== 'undefined') {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ;({ module_or_path } = module_or_path)
    } else {
      console.warn(
        'using deprecated parameters for the initialization function; pass a single object instead',
      )
    }
  }

  if (typeof module_or_path === 'undefined') {
    module_or_path = new URL('gleam_wasm_bg.wasm', import.meta.url)
  }
  const imports = __wbg_get_imports()

  if (
    typeof module_or_path === 'string' ||
    (typeof Request === 'function' && module_or_path instanceof Request) ||
    (typeof URL === 'function' && module_or_path instanceof URL)
  ) {
    module_or_path = fetch(module_or_path)
  }

  const { instance, module } = await __wbg_load(await module_or_path, imports)

  return __wbg_finalize_init(instance, module)
}

export { initSync }
export default __wbg_init
