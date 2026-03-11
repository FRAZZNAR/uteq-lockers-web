import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 7130,
    proxy: {
      '/api': {
        target: 'http://localhost:7120',
        changeOrigin: true,
      },
    },
  },
})
