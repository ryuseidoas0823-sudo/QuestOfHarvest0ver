// ... existing imports ...

export interface VisualEffect {
  id: string;
  isDead: boolean;
  update(deltaTime: number): void;
  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void;
}

// ... existing FloatingText, Particle, Shockwave classes ...
// 前回のAttackSlash, ClawEffectも含めて維持してください。
// ここでは省略せず、HealEffectを追加した完全な形を提供します。

export class FloatingText implements VisualEffect {
  id: string;
  isDead: boolean = false;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  velocity: { x: number; y: number };
  constructor(text: string, x: number, y: number, color: string = '#ffffff') {
    this.id = crypto.randomUUID();
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.life = 1000;
    this.maxLife = 1000;
    this.velocity = { x: (Math.random() - 0.5) * 1.0, y: -2.0 };
  }
  update(deltaTime: number) {
    this.life -= deltaTime;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.y += 0.05;
    this.velocity.x *= 0.95;
    if (this.life <= 0) this.isDead = true;
  }
  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;
    const alpha = Math.min(1, this.life / 300);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 12px "Courier New", monospace'; 
    ctx.fillStyle = this.color;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    ctx.strokeText(this.text, drawX, drawY);
    ctx.fillText(this.text, drawX, drawY);
    ctx.restore();
  }
}

export class Particle implements VisualEffect {
  id: string;
  isDead: boolean = false;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
  velocity: { x: number; y: number };
  constructor(x: number, y: number, color: string) {
    this.id = crypto.randomUUID();
    this.x = x;
    this.y = y;
    this.color = color;
    this.life = 300 + Math.random() * 300;
    this.maxLife = this.life;
    this.size = 2 + Math.random() * 3;
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    this.velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
  }
  update(deltaTime: number) {
    this.life -= deltaTime;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.velocity.x *= 0.9;
    this.velocity.y *= 0.9;
    if (this.life <= 0) this.isDead = true;
  }
  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(drawX - this.size / 2, drawY - this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

export class Shockwave implements VisualEffect {
  id: string;
  isDead: boolean = false;
  x: number;
  y: number;
  maxRadius: number;
  currentRadius: number = 0;
  color: string;
  life: number;
  maxLife: number;
  constructor(x: number, y: number, maxRadius: number = 20, color: string = 'rgba(255, 255, 255, 0.7)') {
    this.id = crypto.randomUUID();
    this.x = x;
    this.y = y;
    this.maxRadius = maxRadius;
    this.color = color;
    this.life = 200;
    this.maxLife = 200;
  }
  update(deltaTime: number) {
    this.life -= deltaTime;
    const progress = 1 - (this.life / this.maxLife);
    this.currentRadius = this.maxRadius * progress;
    if (this.life <= 0) this.isDead = true;
  }
  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2;
    ctx.arc(drawX, drawY, this.currentRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

export class AttackSlash implements VisualEffect {
  id: string;
  isDead: boolean = false;
  x: number;
  y: number;
  direction: string;
  life: number;
  maxLife: number;
  size: number;
  constructor(x: number, y: number, direction: string = 'right') {
    this.id = crypto.randomUUID();
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.life = 150;
    this.maxLife = this.life;
    this.size = 24;
  }
  update(deltaTime: number) {
    this.life -= deltaTime;
    if (this.life <= 0) this.isDead = true;
  }
  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;
    const progress = 1 - (this.life / this.maxLife);
    ctx.save();
    ctx.translate(drawX, drawY);
    let rotation = 0;
    switch (this.direction) {
        case 'up': rotation = -Math.PI / 2; break;
        case 'down': rotation = Math.PI / 2; break;
        case 'left': rotation = Math.PI; break;
        case 'right': rotation = 0; break;
    }
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`; 
    ctx.lineWidth = 3;
    const startAngle = -Math.PI / 3;
    const endAngle = Math.PI / 3;
    const offset = 8 + (progress * 8);
    ctx.arc(offset, 0, this.size, startAngle, endAngle);
    ctx.stroke();
    ctx.fillStyle = `rgba(200, 240, 255, ${0.4 * (1 - progress)})`;
    ctx.beginPath();
    ctx.moveTo(0, 0); 
    ctx.arc(0, 0, this.size + offset, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

export class ClawEffect implements VisualEffect {
  id: string;
  isDead: boolean = false;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  size: number;
  constructor(x: number, y: number) {
    this.id = crypto.randomUUID();
    this.x = x;
    this.y = y;
    this.life = 200;
    this.maxLife = 200;
    this.size = 20;
  }
  update(deltaTime: number) {
    this.life -= deltaTime;
    if (this.life <= 0) this.isDead = true;
  }
  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;
    const progress = 1 - (this.life / this.maxLife);
    ctx.save();
    ctx.translate(drawX, drawY);
    ctx.strokeStyle = `rgba(255, 50, 50, ${1 - progress})`;
    ctx.lineWidth = 2;
    const swipeLen = this.size * 1.5 * progress;
    const startX = -this.size / 2;
    const startY = -this.size / 2;
    for(let i = 0; i < 3; i++) {
        const offset = (i - 1) * 8;
        ctx.beginPath();
        ctx.moveTo(startX + offset, startY);
        ctx.lineTo(startX + offset + swipeLen, startY + swipeLen);
        ctx.stroke();
    }
    ctx.restore();
  }
}

// --- 新規追加: 回復エフェクト ---
export class HealEffect implements VisualEffect {
  id: string;
  isDead: boolean = false;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  
  // 上昇するパーティクル群
  particles: {x: number, y: number, vy: number, size: number, life: number, offset: number}[] = [];

  constructor(x: number, y: number) {
    this.id = crypto.randomUUID();
    this.x = x;
    this.y = y;
    this.life = 800;
    this.maxLife = 800;

    // 5〜8個の十字パーティクルを生成
    for(let i=0; i<6; i++) {
        this.particles.push({
            x: (Math.random() - 0.5) * 30, // 横のばらつき
            y: (Math.random() - 0.5) * 10,
            vy: -0.5 - Math.random() * 1.5, // 上昇速度
            size: 4 + Math.random() * 4,
            life: 1.0,
            offset: Math.random() * 200 // 出現のタイミングずらし
        });
    }
  }

  update(deltaTime: number) {
    this.life -= deltaTime;
    
    // パーティクルの更新
    this.particles.forEach(p => {
        if (this.life < this.maxLife - p.offset) {
            p.y += p.vy;
            p.life -= 0.03; // フェードアウト
        }
    });

    if (this.life <= 0) this.isDead = true;
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;

    ctx.save();
    ctx.translate(drawX, drawY);
    
    this.particles.forEach(p => {
        if (this.life >= this.maxLife - p.offset || p.life <= 0) return;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = '#44ff44'; // 明るい緑
        ctx.strokeStyle = '#006600';
        ctx.lineWidth = 1;
        
        // 十字の描画
        const s = p.size;
        const w = s / 3;
        
        ctx.beginPath();
        // 縦棒
        ctx.fillRect(p.x - w/2, p.y - s/2, w, s);
        // 横棒
        ctx.fillRect(p.x - s/2, p.y - w/2, s, w);
        ctx.fill();
    });

    ctx.restore();
  }
}

export class VisualManager {
  effects: VisualEffect[] = [];
  lastTime: number = 0;

  constructor() {
    this.lastTime = performance.now();
  }

  add(effect: VisualEffect) {
    this.effects.push(effect);
  }

  addDamageText(text: string, x: number, y: number, color: string = '#ffffff') {
    this.add(new FloatingText(text, x, y, color));
  }

  addHitEffect(x: number, y: number, color: string = '#ffff00') {
    this.add(new Shockwave(x, y, 20, color));
    for (let i = 0; i < 6; i++) {
      this.add(new Particle(x, y, color));
    }
  }

  update() {
    const now = performance.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;
    this.effects.forEach(effect => effect.update(deltaTime));
    this.effects = this.effects.filter(effect => !effect.isDead);
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    this.update();
    this.effects.forEach(effect => effect.draw(ctx, cameraX, cameraY));
  }
  
  clear() {
    this.effects = [];
  }
}
