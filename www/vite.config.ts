import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5001,
  },
  build: {
    outDir: path.resolve(process.cwd(), "..", "public")
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src")
    }
  }
})
