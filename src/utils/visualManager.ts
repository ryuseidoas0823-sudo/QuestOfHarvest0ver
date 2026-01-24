// エフェクトの種類
export type VisualEffectType = 'slash' | 'fire' | 'heal';

// ダメージポップアップ定義
export interface DamagePopup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number; // 1.0 -> 0.0
  velocity: number;
}

// 視覚エフェクト定義
export interface VisualEffect {
  id: number;
  x: number;
  y: number;
  type: VisualEffectType;
  life: number; // 1.0 -> 0.0
}

class VisualManager {
  popups: DamagePopup[] = [];
  effects: VisualEffect[] = [];
  private nextId = 0;

  // ダメージ数値を追加
  addPopup(x: number, y: number, text: string, color: string) {
    this.popups.push({
      id: this.nextId++,
      x,
      y,
      text,
      color,
      life: 1.0,
      velocity: 0.05 // 上昇速度
    });
  }

  // エフェクトを追加
  addEffect(x: number, y: number, type: VisualEffectType) {
    this.effects.push({
      id: this.nextId++,
      x,
      y,
      type,
      life: 1.0
    });
  }

  // 毎フレーム更新 (アニメーション進行)
  update() {
    // ポップアップ更新 (上昇・フェードアウト)
    this.popups.forEach(p => {
      p.y -= p.velocity;
      p.life -= 0.02;
    });
    this.popups = this.popups.filter(p => p.life > 0);

    // エフェクト更新 (フェードアウト)
    this.effects.forEach(e => {
      e.life -= 0.05; // エフェクトは早めに消える
    });
    this.effects = this.effects.filter(e => e.life > 0);
  }

  // 全クリア (フロア移動時など)
  clear() {
    this.popups = [];
    this.effects = [];
  }
}

export const visualManager = new VisualManager();
