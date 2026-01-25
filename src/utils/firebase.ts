import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ビルド環境から提供される変数の型定義
declare const __firebase_config: string;
declare const __app_id: string;
declare const __initial_auth_token: string | undefined;

// Firebase設定のパース
let firebaseConfig = {};
try {
  // 環境変数が定義されていない場合のエラー回避
  if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(__firebase_config);
  }
} catch (e) {
  console.warn("Firebase config parse error", e);
}

// Firebaseの初期化 (設定が空でない場合のみ)
const app = Object.keys(firebaseConfig).length > 0 ? initializeApp(firebaseConfig) : null;

// 各サービスのインスタンスをエクスポート
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'quest-of-harvest';

// 認証初期化ヘルパー
export const initAuth = async () => {
  if (!auth) return null;
  
  try {
    // 既にログイン済みなら何もしない
    if (auth.currentUser) return auth.currentUser;

    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      // カスタムトークンがある場合（Canvas環境など）
      await signInWithCustomToken(auth, __initial_auth_token);
    } else {
      // それ以外は匿名認証
      await signInAnonymously(auth);
    }
    return auth.currentUser;
  } catch (error) {
    console.error("Firebase Auth failed:", error);
    return null;
  }
};
