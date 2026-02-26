import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/employees': { target: 'http://localhost:8080', changeOrigin: true },
      '/department': { target: 'http://localhost:8080', changeOrigin: true },
      '/leaves':     { target: 'http://localhost:8080', changeOrigin: true },
      '/payroll':    { target: 'http://localhost:8080', changeOrigin: true },
      '/report':     { target: 'http://localhost:8080', changeOrigin: true },
    }
  }
})
