// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Servir por HTTP en LAN (para cámara en móvil)
export default defineConfig({
  plugins: [react()],
  server: {
    https: false,   // 👈 MUY IMPORTANTE: desactivar https
    host: true,     // escucha en LAN
    port: 5173,
  },
})
