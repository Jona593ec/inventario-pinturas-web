/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const isDev = process.env.NODE_ENV !== 'production'

export default defineConfig({
  plugins: isDev ? [react(), basicSsl()] : [react()],
  server: {
    https: true,
    host: true,
    port: 5173,
  },
  build: {
    sourcemap: false,
    outDir: 'dist',
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})
