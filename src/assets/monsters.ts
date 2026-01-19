import { svgToUrl } from './types';

export const MONSTER_ASSETS = {
  Slime: {
    idle: svgToUrl(`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="20" fill="#4fc3f7" /></svg>`),
    damage: ""
  },
  Dragon: {
    idle: svgToUrl(`<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><path d="M48 40 L10 10 L30 50 L10 70 L48 60 Z" fill="#4a148c" /></svg>`),
    attack: ""
  }
};
