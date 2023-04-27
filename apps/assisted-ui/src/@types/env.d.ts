/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly AIUI_APP_GIT_SHA: string;
  readonly AIUI_APP_IMAGE_REPO: string;
  readonly AIUI_APP_VERSION: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
