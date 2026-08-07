import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    // 绑 0.0.0.0，让同网段的人也连得到（预设只听 localhost）。
    // 注意：开了这个之后，dev server 不再是「只有本机连得到」，
    // PhoneContainer 里 mock chrome 的显示前提要跟着一起看。
    host: true,
  },
})
