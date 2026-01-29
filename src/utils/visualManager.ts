export interface VisualEffect {
  id: string;
  isDead: boolean;
  update(deltaTime: number): void;
  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void;
}

// ダメージ数値などのポップアップテキスト
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
    this.life = 1000; // 1秒生存
    this.maxLife = 1000;
    // ランダムに少し跳ねるような動き
    this.velocity = {
      x: (Math.random() - 0.5) * 1.0,
      y: -2.0 // 上昇
    };
  }

  update(deltaTime: number) {
    this.life -= deltaTime;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    
    // 重力効果
    this.velocity.y += 0.05;
    // 空気抵抗
    this.velocity.x *= 0.95;

    if (this.life <= 0) {
      this.isDead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;
    // フェードアウト
    const alpha = Math.min(1, this.life / 300);

    ctx.save();
    ctx.globalAlpha = alpha;
    // ピクセルアート風のフォント設定（環境によってフォールバック）
    ctx.font = 'bold 12px "Courier New", monospace'; 
    ctx.fillStyle = this.color;
    // 視認性を高めるための縁取り
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.textAlign = 'center';
    
    ctx.strokeText(this.text, drawX, drawY);
    ctx.fillText(this.text, drawX, drawY);
    
    ctx.restore();
  }
}

// 汎用パーティクル（ヒットエフェクト等）
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
    const speed = 1 + Math.random() * 4; // 弾ける速度
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed
    };
  }

  update(deltaTime: number) {
    this.life -= deltaTime;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    // 減速
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

// 衝撃波エフェクト（円形に広がる）
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

// 攻撃の斬撃アニメーション（新規追加）
export class AttackSlash implements VisualEffect {
  id: string;
  isDead: boolean = false;
  x: number;
  y: number;
  direction: string; // 'up' | 'down' | 'left' | 'right'
  life: number;
  maxLife: number;
  size: number;

  constructor(x: number, y: number, direction: string = 'right') {
    this.id = crypto.randomUUID();
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.life = 150; // 0.15秒で消える高速な動き
    this.maxLife = this.life;
    this.size = 24; // 斬撃の半径
  }

  update(deltaTime: number) {
    this.life -= deltaTime;
    if (this.life <= 0) {
      this.isDead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;
    const progress = 1 - (this.life / this.maxLife); // 0.0 -> 1.0

    ctx.save();
    ctx.translate(drawX, drawY);

    // 方向に応じた回転
    let rotation = 0;
    switch (this.direction) {
        case 'up': rotation = -Math.PI / 2; break;
        case 'down': rotation = Math.PI / 2; break;
        case 'left': rotation = Math.PI; break;
        case 'right': rotation = 0; break;
    }
    ctx.rotate(rotation);

    // 斬撃の軌跡描画
    ctx.beginPath();
    // 白くて透明度のある軌跡
    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - progress})`; 
    ctx.lineWidth = 3;
    
    // 円弧を描く (動きをつける)
    // 進行度に応じて弧が伸びていく
    const startAngle = -Math.PI / 3;
    const endAngle = Math.PI / 3;
    
    // 中心から少しオフセットさせて「振っている」感じを出す
    const offset = 8 + (progress * 8);
    
    ctx.arc(offset, 0, this.size, startAngle, endAngle);
    ctx.stroke();

    // 剣閃（塗りつぶし）部分
    ctx.fillStyle = `rgba(200, 240, 255, ${0.4 * (1 - progress)})`;
    ctx.beginPath();
    ctx.moveTo(0, 0); // 中心から
    ctx.arc(0, 0, this.size + offset, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

// 視覚効果全体を管理するマネージャー
export class VisualManager {
  effects: VisualEffect[] = [];
  lastTime: number = 0;

  constructor() {
    this.lastTime = performance.now();
  }

  // 汎用メソッド: 任意のEffectを追加可能
  add(effect: VisualEffect) {
    this.effects.push(effect);
  }

  // 便利メソッド: ダメージテキスト
  addDamageText(text: string, x: number, y: number, color: string = '#ffffff') {
    this.add(new FloatingText(text, x, y, color));
  }

  // 便利メソッド: ヒットエフェクト
  addHitEffect(x: number, y: number, color: string = '#ffff00') {
    // 衝撃波
    this.add(new Shockwave(x, y, 20, color));
    // 飛び散るパーティクル
    for (let i = 0; i < 6; i++) {
      this.add(new Particle(x, y, color));
    }
  }

  update() {
    const now = performance.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    // 各エフェクトの更新
    this.effects.forEach(effect => effect.update(deltaTime));
    
    // 寿命が尽きたエフェクトを削除
    this.effects = this.effects.filter(effect => !effect.isDead);
  }

  draw(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    // 描画サイクルで更新も呼ぶ（簡易実装）
    // 本来はupdateとdrawは分けるべきだが、Reactコンポーネント内での利用を考慮
    this.update();

    this.effects.forEach(effect => effect.draw(ctx, cameraX, cameraY));
  }
  
  clear() {
    this.effects = [];
  }
}
