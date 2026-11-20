import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Rutas relativas: el build sirve igual en la raíz de un dominio o en una subcarpeta
  base: './',
  plugins: [react()],
  // Con hash en el nombre: si el nombre fuera fijo, el navegador del moderador
  // podría quedarse con una versión vieja en caché justo el día de la prueba.
  server: { port: 5173, open: false }
})
