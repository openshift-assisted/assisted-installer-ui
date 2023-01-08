import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_APP');
  return {
    build: {
      outDir: 'build'
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
