import { svgToUrl } from './types';

/**
 * 街の人々（NPC）のビジュアル定義
 * 幼児、少年、青年、中年、老人の男女10パターン
 */

// 共通パーツ：影
const shadow = '<ellipse cx="32" cy="88" rx="16" ry="4" fill="rgba(0,0,0,0.15)" />';

const createTownsperson = (content: string) => svgToUrl(`
<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  ${shadow}
  ${content}
</svg>`);

export const townspeople = {
  male: {
    toddler: createTownsperson(`
      <circle cx="32" cy="65" r="10" fill="#ffe0b2" /> <!-- 顔 -->
      <path d="M25 75h14v10h-14z" fill="#ff7043" /> <!-- 服 -->
      <path d="M28 58h8v4h-8z" fill="#5d4037" /> <!-- 髪 -->
    `),
    boy: createTownsperson(`
      <path d="M24 35h16v18H24z" fill="#ffe0b2" /> <!-- 顔 -->
      <path d="M22 28h20v10H22z" fill="#8d6e63" /> <!-- 髪 -->
      <path d="M20 53h24v20H20z" fill="#42a5f5" /> <!-- 服 -->
      <path d="M24 73h6v12h-6zm10 0h6v12h-6z" fill="#5d4037" /> <!-- 脚 -->
    `),
    youth: createTownsperson(`
      <path d="M24 20h16v18H24z" fill="#ffe0b2" /> <!-- 顔 -->
      <path d="M22 14h20v10H22z" fill="#4e342e" /> <!-- 髪 -->
      <path d="M18 38h28v30H18z" fill="#66bb6a" /> <!-- 服 -->
      <path d="M22 68h8v20h-8zm12 0h8v20h-8z" fill="#3e2723" /> <!-- 脚 -->
    `),
    middleAged: createTownsperson(`
      <path d="M24 20h16v18H24z" fill="#ffccaa" /> <!-- 顔 -->
      <path d="M22 14h20v10H22z" fill="#3e2723" /> <!-- 髪 -->
      <path d="M16 38h32v32H16z" fill="#78909c" /> <!-- 服 -->
      <path d="M16 45h32v5H16z" fill="#546e7a" /> <!-- ベルト -->
      <path d="M22 70h8v18h-8zm12 0h8v18h-8z" fill="#263238" />
    `),
    elderly: createTownsperson(`
      <path d="M25 25h14v16H25z" fill="#ffdbbd" /> <!-- 顔 -->
      <path d="M23 18h18v10H23z" fill="#cfd8dc" /> <!-- 白髪 -->
      <path d="M20 41h24v35 L32 80 L20 76z" fill="#a1887f" /> <!-- ローブ -->
      <path d="M45 50h2v30h-2z" fill="#5d4037" /> <!-- 杖 -->
    `)
  },
  female: {
    toddler: createTownsperson(`
      <circle cx="32" cy="65" r="10" fill="#fff3e0" /> <!-- 顔 -->
      <path d="M25 75h14l3 10h-20z" fill="#f06292" /> <!-- ワンピース -->
      <path d="M25 58h14v6h-14z" fill="#ffb74d" /> <!-- 髪 -->
    `),
    girl: createTownsperson(`
      <path d="M24 35h16v18H24z" fill="#fff3e0" /> <!-- 顔 -->
      <path d="M20 28h24v12H20z" fill="#ffb74d" /> <!-- 髪 -->
      <path d="M20 53h24v22l-4 4h-16z" fill="#ba68c8" /> <!-- 服 -->
      <path d="M22 14h4v4h-4z" fill="#d32f2f" /> <!-- リボン -->
    `),
    youth: createTownsperson(`
      <path d="M25 20h14v18H25z" fill="#fff3e0" /> <!-- 顔 -->
      <path d="M20 14h24v30H20z" fill="#6d4c41" /> <!-- ロングヘア -->
      <path d="M20 38h24v30H20z" fill="#ff8a65" /> <!-- ブラウス -->
      <path d="M18 68h28v15l-14 3-14-3z" fill="#ec407a" /> <!-- スカート -->
    `),
    middleAged: createTownsperson(`
      <path d="M25 20h14v18H25z" fill="#ffdbbd" /> <!-- 顔 -->
      <path d="M22 14h20v12H22z" fill="#4e342e" /> <!-- 髪 -->
      <path d="M18 38h28v40H18z" fill="#8d6e63" /> <!-- エプロンドレス -->
      <path d="M20 45h24v25H20z" fill="#f5f5f5" opacity="0.8" /> <!-- エプロン -->
    `),
    elderly: createTownsperson(`
      <path d="M25 25h14v16H25z" fill="#ffdbbd" /> <!-- 顔 -->
      <path d="M23 20h18v8H23z" fill="#eceff1" /> <!-- 白髪 -->
      <path d="M20 41h24v38H20z" fill="#455a64" /> <!-- 古いドレス -->
      <path d="M22 41h20v6H22z" fill="#cfd8dc" opacity="0.5" /> <!-- ショール -->
    `)
  }
};
