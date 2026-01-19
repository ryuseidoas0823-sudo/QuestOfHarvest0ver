import { JobAssets, svgToUrl } from './types';

const male_idle = svgToUrl(`
<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="88" rx="18" ry="5" fill="rgba(0,0,0,0.2)" />
  <path d="M20 6h24v22H20z" fill="#1b5e20" />
  <path d="M18 32h28v40H18z" fill="#1b5e20" />
</svg>`);

const female_idle = svgToUrl(`
<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="88" rx="18" ry="5" fill="rgba(0,0,0,0.15)" />
  <path d="M22 8h20v16H22z" fill="#6d4c41" />
  <path d="M26 14h12v16H26z" fill="#ffdbbd" />
</svg>`);

export const archer: JobAssets = {
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
