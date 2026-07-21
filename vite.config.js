import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  base: "/vuePage",
  build: {
    outDir: './docs',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      // 모든 경로 설정을 하나의 alias 객체 안에 모았습니다.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@css': path.resolve(__dirname, 'src/assets/css'),
    }
  }
})
