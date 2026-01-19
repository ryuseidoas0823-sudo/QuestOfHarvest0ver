import { JobAssets, svgToUrl } from './types';

const male_idle = svgToUrl(`
<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="88" rx="24" ry="7" fill="rgba(0,0,0,0.25)" />
  <path d="M20 4h24v16H20z" fill="#b71c1c" />
  <path d="M16 34h32v16H16z" fill="#ffccaa" />
  <path d="M52 30h4v50h-4z" fill="#4e342e" />
</svg>`);

const female_idle = svgToUrl(`
<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="88" rx="20" ry="5" fill="rgba(0,0,0,0.2)" />
  <path d="M18 10h28v60H18z" fill="#fdd835" />
  <path d="M26 14h12v12H26z" fill="#ffdbbd" />
</svg>`);

export const warrior: JobAssets = {
  male: {
    idle: male_idle,
    move: male_idle,
    attack: male_idle,
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
