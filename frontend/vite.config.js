import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@ui': '/src/components/ui',
      '@apis': '/src/apis',
      '@libs': '/src/libs',
      '@src': '/src',
    },
  },
})
