import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import EnvironmentPlugin from 'vite-plugin-environment';
import 'zx/globals';

export const getDefaultValuesForEnvironmentVariables = async () => {
  $.verbose = false;
  const commitSignature = (await $`git rev-parse --short HEAD`).toString().trim();

  return {
    AIUI_APP_IMAGE_REPO: 'quay.io/edge-infrastructure/assisted-disconnected-ui',
    AIUI_APP_GIT_SHA: commitSignature,
    AIUI_APP_VERSION: `latest+sha.${commitSignature}`,
  };
};

export default defineConfig(async () => {
  const envVarsPrefix = 'AIUI_';
  const defaultValues = await getDefaultValuesForEnvironmentVariables();

  return {
    build: {
      emptyOutDir: true,
      outDir: 'build',
      sourcemap: true,
    },
    resolve: {
      conditions: ['source'],
    },
    plugins: [
      EnvironmentPlugin(defaultValues, {
        prefix: envVarsPrefix,
        defineOn: 'process.env',
      }),
      react(),
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001/api',
        },
      },
    },
  };
});
