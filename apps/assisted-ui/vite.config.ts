import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react-swc';

const buildServerConfig = (env: Record<string, string>) => ({
  strictPort: true,
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      // TODO not working, check why
      // target: env.VITE_APP_API_URL,
      changeOrigin: false,
    }
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_',);
  const serverConfig = buildServerConfig(env);
  return {
    build: {
      outDir: 'build',
      sourcemap: 'hidden'
    },
    plugins: [react()],
    server: serverConfig,
    // Preview used for integration-tests
    preview: serverConfig,
  };
});
