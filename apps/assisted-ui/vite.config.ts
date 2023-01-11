import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_',);
  return {
    build: {
      outDir: 'build',
      sourcemap: 'hidden'
    },
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_APP_API_URL,
          changeOrigin: true,
        }
      },
    },
  };
});
