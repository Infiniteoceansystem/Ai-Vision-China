import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      allowedHosts: true,
      proxy: {
        '/kling-api': {
          target: 'https://api.klingai.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/kling-api/, '')
        }
      }
    },
  };
});
