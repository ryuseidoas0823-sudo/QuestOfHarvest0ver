import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  define: {
    __firebase_config: JSON.stringify("{}"), 
    __app_id: JSON.stringify("quest-of-harvest")
  }
})
