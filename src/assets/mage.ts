import { JobAssets, svgToUrl } from './types';

const male_idle = svgToUrl(`
<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="88" rx="20" ry="6" fill="rgba(0,0,0,0.2)" />
  <path d="M12 10h40v4H12z" fill="#512da8" />
  <path d="M16 30h32v54H16z" fill="#311b92" />
</svg>`);

const female_idle = svgToUrl(`
<svg viewBox="0 0 64 96" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="88" rx="20" ry="5" fill="rgba(0,0,0,0.15)" />
  <path d="M10 12h44v4H10z" fill="#ad1457" />
  <path d="M18 16h28v60H18z" fill="#f48fb1" />
</svg>`);

export const mage: JobAssets = {
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
