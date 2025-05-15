// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// this is Vite’s Tailwind plugin — not PostCSS’s:
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    // this is Vite’s Tailwind plugin — not PostCSS’s:
    tailwind(),
  ],
  server: {
    proxy: {
      '/api/expedition': {
        target: 'https://api.expedition.mitosis.org',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api\/expedition/, '/v1/status'),
      },
      '/api/theo': {
        target: 'https://matrix-proxy.mitomat.workers.dev',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api\/theo/, '/theo/portfolio'),
      },
      '/api/testnet': {
        target: 'https://mito-api.customrpc.workers.dev',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api\/testnet/, '/api/wallet'),
      },
    },
  },
})
