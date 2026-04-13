import { loadEnv } from 'vite';

import { defineConfig } from '@vben/vite-config';

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:15000';

  return {
    application: {},
    vite: {
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            target: proxyTarget,
            ws: true,
          },
        },
      },
    },
  };
});
