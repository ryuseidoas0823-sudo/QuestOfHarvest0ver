import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  define: {
    // 開発環境や本番環境で環境変数を使用したい場合は、ここで process.env の値を渡します。
    // App.tsx 側の手動設定(MANUAL_FIREBASE_CONFIG)が優先されるため、
    // ここはデフォルト値として空文字にしておくか、
    // 以下のように環境変数を参照するように書き換えてください。
    
    // 例: process.env.FIREBASE_CONFIG がある場合
    // __firebase_config: process.env.FIREBASE_CONFIG || JSON.stringify("{}"),
    
    __firebase_config: JSON.stringify("{}"), 
    __app_id: JSON.stringify("quest-of-harvest")
  }
})
