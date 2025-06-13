/* filepath: /home/mahesh/Documents/mini-delivery/vite.config.js */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  server: {
    host: true, // Enable host access for mobile testing
    port: 5173
  }
})