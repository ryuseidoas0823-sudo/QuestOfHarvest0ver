import { JobAssets, svgToUrl } from './types';

// 超高解像度(64x96) SVG データの定義（一部抜粋して定義）
const male_idle = svgToUrl(`
<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="88" rx="20" ry="6" fill="rgba(0,0,0,0.2)" />
  <path d="M16 32 L8 48 L12 80 L32 84 L52 80 L56 48 L48 32 Z" fill="#1a237e" />
  <path d="M18 32h28v36H18z" fill="#455a64" />
  <path d="M24 10h16v18H24z" fill="#ffe0b2" />
  <path d="M22 6h20v14H22z" fill="#cfd8dc" />
</svg>`);

const female_idle = svgToUrl(`
<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="88" rx="20" ry="5" fill="rgba(0,0,0,0.15)" />
  <path d="M22 8h20v24H22z" fill="#ffb300" />
  <path d="M25 12h14v18H25z" fill="#fff3e0" />
</svg>`);

export const swordsman: JobAssets = {
  male: {
    idle: male_idle,
    move: male_idle, // モーションが用意できるまで idle を流用
    attack: "http://googleusercontent.com/image_generation_content/0", // 生成したイラストURL
    damage: male_idle,
    death: male_idle
  },
  female: {
    idle: female_idle,
    move: female_idle,
    attack: female_idle,
    damage: female_idle,
    death: female_idle
  }
};
