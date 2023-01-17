/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly TRANSLATION_NAMESPACE: string;
  readonly VITE_APP_API_ROOT: string;
  readonly VITE_APP_CLUSTER_PERMISSIONS: string;
  readonly VITE_APP_VERSION: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
