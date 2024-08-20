/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NETWORK_RPC_URL: string;
  readonly VITE_NETWORK_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
