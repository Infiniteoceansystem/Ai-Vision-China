import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      allowedHosts: [
        '.zeabur.app', // 允许所有 zeabur.app 子域名
        '.vercel.app', // 允许所有 vercel.app 子域名
        'your-custom-domain.com', // 替换为您未来的自定义域名
        // 如果您想允许所有域名访问（在生产环境容器中很常见），也可以直接设置为:
        // allowedHosts: true,
      ],
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
