// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  // point Vite at your PostCSS config:
  css: {
    postcss: './postcss.config.cjs',
  },
  server: {
    proxy: {
      '/api/expedition': {
        target: 'https://api.expedition.mitosis.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/expedition/, '/v1/status'),
      },
      '/api/theo': {
        target: 'https://matrix-proxy.mitomat.workers.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/theo/, '/theo/portfolio'),
      },
      '/api/testnet': {
        target: 'https://mito-api.customrpc.workers.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/testnet/, '/api/wallet'),
      },
    },
  },
})
