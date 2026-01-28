// 視覚効果の基本インターフェース
export interface VisualEffect {
  id: string;
  isDead: boolean;
  update(deltaTime: number): void;
  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void;
}

// ダメージ数値などの浮遊テキスト
export class FloatingText implements VisualEffect {
  id: string;
  isDead: boolean = false;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  velocityY: number;
  scale: number;

  constructor(text: string, x: number, y: number, color: string = '#ffffff', duration: number = 1000) {
    this.id = crypto.randomUUID();
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.life = duration;
    this.maxLife = duration;
    this.velocityY = -0.05; // ゆっくり上昇
    this.scale = 1.0;
    
    // クリティカルなどの強調
    if (color === '#ff0000' || text.includes('!')) {
        this.scale = 1.5;
        this.velocityY = -0.08;
    }
  }

  update(deltaTime: number) {
    this.life -= deltaTime;
    this.y += this.velocityY * deltaTime;
    
    if (this.life <= 0) {
      this.isDead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const alpha = Math.max(0, this.life / this.maxLife);
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.font = `bold ${Math.floor(16 * this.scale)}px "Courier New", monospace`;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.strokeText(this.text, drawX, drawY);
    ctx.fillText(this.text, drawX, drawY);
    ctx.restore();
  }
}

// 単純なパーティクル（ヒットエフェクトなど）
export class Particle implements VisualEffect {
  id: string;
  isDead: boolean = false;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;

  constructor(x: number, y: number, color: string) {
    this.id = crypto.randomUUID();
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.1 + 0.05;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color;
    this.size = Math.random() * 3 + 2;
    this.life = 500 + Math.random() * 300;
    this.maxLife = this.life;
  }

  update(deltaTime: number) {
    this.life -= deltaTime;
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.size *= 0.95; // 徐々に小さく

    if (this.life <= 0 || this.size < 0.5) {
      this.isDead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 範囲攻撃などのエフェクトリング
export class Shockwave implements VisualEffect {
    id: string;
    isDead: boolean = false;
    x: number;
    y: number;
    size: number;
    maxSize: number;
    color: string;
    life: number;

    constructor(x: number, y: number, maxSize: number = 50, color: string = '#ffffff') {
        this.id = crypto.randomUUID();
        this.x = x;
        this.y = y;
        this.size = 1;
        this.maxSize = maxSize;
        this.color = color;
        this.life = 300;
    }

    update(deltaTime: number) {
        this.life -= deltaTime;
        this.size += (this.maxSize - this.size) * 0.1; // イージング
        
        if (this.life <= 0) this.isDead = true;
    }

    draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
        const drawX = this.x - cameraX;
        const drawY = this.y - cameraY;
        const alpha = Math.max(0, this.life / 300);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

// マネージャークラス
export class VisualManager {
  effects: VisualEffect[] = [];

  add(effect: VisualEffect) {
    this.effects.push(effect);
  }

  addDamageText(text: string, x: number, y: number, color?: string) {
    // 少し位置を散らす
    const offsetX = (Math.random() - 0.5) * 16;
    const offsetY = (Math.random() - 0.5) * 16;
    this.add(new FloatingText(text, x + offsetX, y + offsetY, color));
  }

  addHitEffect(x: number, y: number, color: string = '#ffff00', count: number = 5) {
      for(let i=0; i<count; i++) {
          this.add(new Particle(x, y, color));
      }
  }

  update(deltaTime: number) {
    this.effects.forEach(e => e.update(deltaTime));
    this.effects = this.effects.filter(e => !e.isDead);
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    this.effects.forEach(e => e.draw(ctx, cameraX, cameraY));
  }

  clear() {
      this.effects = [];
  }
}
