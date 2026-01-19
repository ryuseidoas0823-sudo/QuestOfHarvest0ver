/**
 * SVG Assets for the game
 * Characters, Monsters, and UI elements defined as raw SVG strings.
 */

export const ASSETS_SVG: Record<string, string> = {
  // Player Jobs - Male
  Swordsman_Male: `<svg viewBox="0 0 32 56" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="44" width="6" height="12" fill="#334155"/><rect x="18" y="44" width="6" height="12" fill="#334155"/><rect x="6" y="20" width="20" height="24" fill="#64748b"/><rect x="8" y="4" width="16" height="16" fill="#ffdbac"/><rect x="2" y="22" width="4" height="12" fill="#ffdbac"/><rect x="26" y="22" width="4" height="12" fill="#ffdbac"/><rect x="24" y="10" width="10" height="2" fill="#94a3b8" transform="rotate(-45 24 10)"/></svg>`,
  Warrior_Male: `<svg viewBox="0 0 32 56" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="44" width="6" height="12" fill="#450a0a"/><rect x="18" y="44" width="6" height="12" fill="#450a0a"/><rect x="6" y="20" width="20" height="24" fill="#991b1b"/><rect x="8" y="4" width="16" height="16" fill="#d2b48c"/><rect x="22" y="10" width="12" height="4" fill="#475569"/></svg>`,
  Archer_Male: `<svg viewBox="0 0 32 56" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="44" width="6" height="12" fill="#064e3b"/><rect x="18" y="44" width="6" height="12" fill="#064e3b"/><rect x="6" y="20" width="20" height="24" fill="#166534"/><rect x="8" y="4" width="16" height="16" fill="#ffdbac"/><path d="M26 15 Q 32 28 26 41" stroke="#78350f" fill="none" stroke-width="2"/></svg>`,
  Mage_Male: `<svg viewBox="0 0 32 56" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="44" width="6" height="12" fill="#1e1b4b"/><rect x="18" y="44" width="6" height="12" fill="#1e1b4b"/><rect x="6" y="20" width="20" height="24" fill="#3730a3"/><rect x="8" y="4" width="16" height="16" fill="#ffdbac"/><rect x="26" y="12" width="2" height="20" fill="#78350f"/><circle cx="27" cy="10" r="3" fill="#fbbf24"/></svg>`,

  // Player Jobs - Female
  Swordsman_Female: `<svg viewBox="0 0 32 56" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="44" width="6" height="12" fill="#334155"/><rect x="18" y="44" width="6" height="12" fill="#334155"/><rect x="6" y="20" width="20" height="24" fill="#94a3b8"/><rect x="8" y="4" width="16" height="16" fill="#ffdbac"/><rect x="24" y="10" width="10" height="2" fill="#94a3b8" transform="rotate(-45 24 10)"/></svg>`,
  Warrior_Female: `<svg viewBox="0 0 32 56" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="44" width="6" height="12" fill="#450a0a"/><rect x="18" y="44" width="6" height="12" fill="#450a0a"/><rect x="6" y="20" width="20" height="24" fill="#ef4444"/><rect x="8" y="4" width="16" height="16" fill="#ffdbac"/><rect x="22" y="10" width="12" height="4" fill="#475569"/></svg>`,
  Archer_Female: `<svg viewBox="0 0 32 56" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="44" width="6" height="12" fill="#064e3b"/><rect x="18" y="44" width="6" height="12" fill="#064e3b"/><rect x="6" y="20" width="20" height="24" fill="#22c55e"/><rect x="8" y="4" width="16" height="16" fill="#ffdbac"/><path d="M26 15 Q 32 28 26 41" stroke="#78350f" fill="none" stroke-width="2"/></svg>`,
  Mage_Female: `<svg viewBox="0 0 32 56" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="44" width="6" height="12" fill="#1e1b4b"/><rect x="18" y="44" width="6" height="12" fill="#1e1b4b"/><rect x="6" y="20" width="20" height="24" fill="#6366f1"/><rect x="8" y="4" width="16" height="16" fill="#ffdbac"/><rect x="26" y="12" width="2" height="20" fill="#78350f"/><circle cx="27" cy="10" r="3" fill="#fbbf24"/></svg>`,

  // Monsters
  Monster_Slime: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M4 24 Q 4 10 16 10 Q 28 10 28 24 L 28 28 L 4 28 Z" fill="#22c55e"/><circle cx="10" cy="18" r="2" fill="white"/><circle cx="22" cy="18" r="2" fill="white"/></svg>`,
  Monster_Bat: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 10 L 4 4 L 8 16 L 16 12 L 24 16 L 28 4 Z" fill="#1e293b"/><circle cx="13" cy="10" r="1" fill="#ef4444"/><circle cx="19" cy="10" r="1" fill="#ef4444"/></svg>`,
  Monster_Skeleton: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="4" width="12" height="12" rx="2" fill="#f1f5f9"/><rect x="12" y="18" width="8" height="12" fill="#f1f5f9"/><rect x="11" y="8" width="3" height="3" fill="#000"/><rect x="18" y="8" width="3" height="3" fill="#000"/></svg>`,
  Monster_Dragon: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M10 50 Q 10 10 40 10 L 55 25 L 40 40 Q 30 45 10 50" fill="#b91c1c"/><path d="M40 10 L 30 0 L 20 10" fill="#7f1d1d"/><circle cx="45" cy="20" r="3" fill="#facc15"/></svg>`
};

/**
 * Converts SVG string to a Data URL that can be used as an img src.
 */
export const svgToUrl = (svg: string): string => {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
