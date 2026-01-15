import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  define: {
    // Cloudflare Pages上で環境変数エラーにならないためのダミー定義
    // 本番環境でFirebaseを動作させるには、ここで正しい設定を渡すか
    // App.tsx内の firebaseConfig を直接書き換えてください。
    __firebase_config: JSON.stringify("{}"), 
    __app_id: JSON.stringify("quest-of-harvest")
  }
})
