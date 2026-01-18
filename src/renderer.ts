import { GameState, CombatEntity, PlayerEntity, EnemyEntity } from './types';
import { GAME_CONFIG } from './config';
import { JOB_DATA, ENEMY_TYPES } from './data';

export const renderGame = (ctx: CanvasRenderingContext2D, state: GameState, images: Record<string, HTMLImageElement>) => {
  const { width, height } = ctx.canvas;
  const T = GAME_CONFIG.TILE_SIZE;
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, width, height);
  ctx.save();
  
  // Center camera on player
  const camX = Math.floor(state.player.x + state.player.width/2 - width/2);
  const camY = Math.floor(state.player.y + state.player.height/2 - height/2);
  ctx.translate(-camX, -camY);
  state.camera = { x: camX, y: camY };

  const startCol = Math.max(0, Math.floor(camX / T));
  const endCol = startCol + (width / T) + 1; // Allow slightly out of bounds for smooth scrolling
  const startRow = Math.max(0, Math.floor(camY / T));
  const endRow = startRow + (height / T) + 1;

  // Render Map
  for (let y = startRow; y <= endRow; y++) {
    if (!state.map[y]) continue;
    for (let x = startCol; x <= endCol; x++) {
      const tile = state.map[y][x];
      if (!tile) continue;
      
      // Basic colors
      // @ts-ignore
      let color = {
        grass:'#1b2e1b', dirt:'#3e2723', sand:'#fbc02d', snow:'#e3f2fd', 
        rock:'#616161', wall:'#424242', water:'#1a237e', floor:'#5d4037',
        portal_out: '#5e35b1', town_entrance: '#795548', dungeon_entrance: '#212121'
      }[tile.type] || '#000';

      ctx.fillStyle = color;
      ctx.fillRect(tile.x, tile.y, T, T);
      ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.strokeRect(tile.x, tile.y, T, T);
      
      // Tile details
      if (tile.type === 'wall' || tile.type === 'rock') { 
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(tile.x, tile.y+T-4, T, 4); 
      }
      if (tile.type === 'town_entrance') {
        ctx.fillStyle = '#fff'; ctx.font = '20px Arial'; ctx.textAlign='center'; ctx.fillText('🏠', tile.x+T/2, tile.y+T/1.5);
      }
      if (tile.type === 'dungeon_entrance') {
        ctx.fillStyle = '#fff'; ctx.font = '20px Arial'; ctx.textAlign='center'; ctx.fillText('💀', tile.x+T/2, tile.y+T/1.5);
      }
      if (tile.type === 'portal_out') {
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(tile.x+T/2, tile.y+T/2, T/3, 0, Math.PI*2); ctx.fill();
      }
    }
  }

  // Render Dropped Items
  state.droppedItems.forEach(drop => {
    const bob = Math.sin(state.gameTime / 10) * 5 + drop.bounceOffset;
    ctx.shadowColor = drop.item.color; ctx.shadowBlur = 10;
    ctx.fillStyle = '#8d6e63'; ctx.fillRect(drop.x + 8, drop.y + 8 + bob, 16, 16);
    ctx.fillStyle = drop.item.color; ctx.fillRect(drop.x + 8, drop.y + 12 + bob, 16, 4);
    ctx.font = '16px Arial'; ctx.textAlign = 'center'; ctx.fillText(drop.item.icon, drop.x + 16, drop.y + 4 + bob); ctx.shadowBlur = 0;
  });

  // Render Characters function
  const renderCharacter = (e: CombatEntity, icon?: string) => {
    const vw = e.visualWidth || e.width, vh = e.visualHeight || e.height;
    const centerX = e.x + e.width / 2, bottomY = e.y + e.height;
    let imgKey: string | null = null;
    
    if (e.type === 'player') imgKey = `${(e as PlayerEntity).job}_${(e as PlayerEntity).gender}`;
    else if (e.type === 'enemy') {
       const race = (e as EnemyEntity).race;
       if (race.includes('Slime')) imgKey = 'Slime';
       else if (race.includes('Bandit')) imgKey = 'Bandit';
       else if (race.includes('Zombie') || race.includes('Ghoul')) imgKey = 'Zombie';
       else if (race.includes('Ant') || race.includes('Spider')) imgKey = 'Insect';
       else if (race.includes('Imp') || race.includes('Demon')) imgKey = 'Demon';
       else if (race.includes('Bat')) imgKey = 'Bat';
       else if (race.includes('Dragon')) imgKey = 'Dragon';
       else if (race.includes('Boar') || race.includes('Wolf')) imgKey = race.includes('Wolf') ? 'Wolf' : 'Beast';
       else if (race.includes('Ghost')) imgKey = 'Ghost';
    }

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath();
    ctx.ellipse(centerX, bottomY - 2, e.width/2 * (['flying','ghost'].includes(e.shape || '') ? 0.8 : 1.2), 4, 0, 0, Math.PI*2); ctx.fill();

    // Body
    if (imgKey && images[imgKey]) {
      const isMoving = Math.abs(e.vx || 0) > 0.1 || Math.abs(e.vy || 0) > 0.1;
      const bounce = isMoving ? Math.sin(state.gameTime / 2) : 0;
      const scaleX = (isMoving ? 1 + bounce * 0.1 : 1) * (e.isAttacking ? 1.2 : 1) * (e.direction === 2 ? -1 : 1);
      const scaleY = (isMoving ? 1 - bounce * 0.1 : 1) * (e.isAttacking ? 0.8 : 1);
      ctx.save(); ctx.translate(centerX, bottomY + (bounce > 0 ? -bounce * 5 : 0));
      ctx.scale(scaleX, scaleY); ctx.drawImage(images[imgKey], -vw / 2, -vh, vw, vh); ctx.restore();
    } else {
      // Fallback box
      const bob = Math.sin(state.gameTime / 3) * ((Math.abs(e.vx||0)>0.1 || Math.abs(e.vy||0)>0.1) ? 2 : 0);
      ctx.fillStyle = e.color; if (e.shape === 'ghost') ctx.globalAlpha = 0.6;
      ctx.fillRect(e.x + (e.width-vw)/2, e.y + e.height - vh + bob, vw, vh); ctx.globalAlpha = 1.0;
      if (icon) { ctx.font = `${Math.min(vw, vh) * 0.6}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.fillText(icon, e.x+e.width/2, e.y+e.height-vh/2+bob); }
    }
    
    // HP Bar
    if (e.type === 'enemy' && e.hp < e.maxHp) {
      const barX = centerX - vw/2, barY = bottomY - vh - 12;
      ctx.fillStyle='#000'; ctx.fillRect(barX, barY, vw, 4); ctx.fillStyle='#f44336'; ctx.fillRect(barX, barY, vw * (e.hp/e.maxHp), 4);
    }
  };

  // Render all entities sorted by Y
  [...state.enemies, state.player].sort((a,b)=>(a.y+a.height)-(b.y+b.height)).forEach(e => {
    if (e.dead) return;
    const icon = e.type==='player' ? JOB_DATA[(e as PlayerEntity).job]?.icon : ENEMY_TYPES.find(t=>t.name===(e as EnemyEntity).race)?.icon;
    renderCharacter(e as CombatEntity, icon);
  });

  // Attack Effect
  if (state.player.isAttacking) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath();
    const radius = Math.max(0, 60 * Math.min(Math.max((Date.now() - state.player.lastAttackTime) / 200, 0), 1));
    ctx.arc(state.player.x + state.player.width/2, state.player.y + state.player.height/2, radius, 0, Math.PI*2); ctx.stroke();
  }

  // Floating Texts
  state.floatingTexts.forEach(t => {
    ctx.font = 'bold 16px monospace'; ctx.fillStyle = 'black'; ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.textAlign = 'center';
    ctx.strokeText(t.text, t.x, t.y); ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
  });
  ctx.restore();
};
