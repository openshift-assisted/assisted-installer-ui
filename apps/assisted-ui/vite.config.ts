import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import EnvironmentPlugin from 'vite-plugin-environment';
import 'zx/globals';

export const getDefaultValuesForEnvironmentVariables = async () => {
  $.verbose = false;
  const commitSignature = (await $`git rev-parse --short HEAD`).toString().trim();

  return {
    AIUI_APP_API_ROOT: '/api/assisted-install',
    AIUI_APP_IMAGE_REPO: 'quay.io/edge-infrastructure/assisted-installer-ui',
    AIUI_APP_GIT_SHA: commitSignature,
    AIUI_APP_VERSION: `latest+sha.${commitSignature}`,
  };
};

export default defineConfig(async ({ mode }) => {
  const envVarsPrefix = 'AIUI_';
  const env = loadEnv(mode, process.cwd(), envVarsPrefix);
  const defaultValues = await getDefaultValuesForEnvironmentVariables();

  const allEnvs = { ...defaultValues, ...env };

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
      EnvironmentPlugin(allEnvs, {
        prefix: envVarsPrefix,
        defineOn: 'import.meta.env',
      }),
      EnvironmentPlugin(allEnvs, {
        prefix: envVarsPrefix,
        defineOn: 'process.env',
      }),
      react(),
    ],
    server: {
      proxy: {
        '/api': {
          target: env.AIUI_APP_API_URL,
          changeOrigin: true,
        },
        '/chatbot': {
          target: env.AIUI_CHAT_API_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/chatbot/, ''),
        },
        '/token': {
          target: env.AIUI_SSO_API_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/token/, ''),
        },
      },
    },
  };
});
