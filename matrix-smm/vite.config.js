import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api-proxy': {
        target: 'https://twiboost.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api-proxy/, '/api/v2'),
      },
    },
  },
})
