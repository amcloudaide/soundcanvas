/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  // Force cache + fs allow inside project so a stray D:\node_modules doesn't
  // get picked up (Windows/network drive issue).
  cacheDir: resolve(__dirname, 'node_modules/.vite'),
  server: {
    fs: {
      allow: [resolve(__dirname)],
    },
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test-setup.ts',
  },
})
