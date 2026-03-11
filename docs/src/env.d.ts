/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GA_MEASUREMENT_ID?: string;
  readonly PUBLIC_FEELBACK_CONTENT_SET_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
