// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import the Vite-specific Tailwind plugin:
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    // ← Note: we call `tailwind()`, matching the name we imported above
    tailwind(),
  ],
  server: {
    proxy: {
      '/api/expedition': {
        target: 'https://api.expedition.mitosis.org',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/expedition/, '/v1/status'),
      },
      '/api/theo': {
        target: 'https://matrix-proxy.mitomat.workers.dev',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/theo/, '/theo/portfolio'),
      },
      '/api/testnet': {
        target: 'https://mito-api.customrpc.workers.dev',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/testnet/, '/api/wallet'),
      },
    },
  },
})
