/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EMU_LLC?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
