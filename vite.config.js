import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // host: '0.0.0.0', // 允许外部访问
    port: 3000,      // 自定义端口
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9880', // 后端接口地址
        changeOrigin: true,              // 修改请求源为后端地址
        rewrite: (path) => path.replace(/^\/api/, '') // 路径重写（可选）
      },
      '/qwen': {
        target: 'http://127.0.0.1:8000', // 后端接口地址
        changeOrigin: true,              // 修改请求源为后端地址
        rewrite: (path) => path.replace(/^\/qwen/, '') // 路径重写（可选）
      },
    }
  },
  base: './', // 设置基础路径为当前目录
})
