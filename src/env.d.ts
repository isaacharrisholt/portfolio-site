/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly POLAR_SH_KEY: string
  readonly POLAR_SH_ORG_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
