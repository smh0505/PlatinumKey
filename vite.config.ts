import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue()],
  define: {
    'import.meta.env.BUILD_TIMESTAMP': JSON.stringify(new Date().toISOString())
  },
  server: {
    host: '0.0.0.0'
  }
})
