import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Rutas relativas: el build sirve igual en la raíz de un dominio o en una subcarpeta
  base: './',
  plugins: [react()],
  // Nombres de salida fijos (sin hash): el prototipo no necesita cache busting y
  // así el HTML que se publica no cambia en cada build.
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/ritmo.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/ritmo.[ext]',
      },
    },
  },
  server: { port: 5173, open: false }
})
