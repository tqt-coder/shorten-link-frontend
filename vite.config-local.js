import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config()
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_BASE_URL,
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  
})
console.log('REACT_APP_BASE_URL:', process.env.REACT_APP_BASE_URL);
