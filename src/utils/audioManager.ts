/**
 * Web Audio APIを使用した簡易オーディオマネージャー
 * 外部ファイルを使わず、オシレーターでレトロなSE/BGMを生成します。
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private bgmOscillators: OscillatorNode[] = [];

  constructor() {
    // ユーザーアクション後に初期化する必要がある
  }

  // オーディオコンテキストの初期化（クリックイベント等で呼ぶ）
  init() {
    if (this.ctx) return;
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx!.createGain();
    this.masterGain.connect(this.ctx!.destination);
    this.masterGain.gain.value = 0.1; // 音量控えめ
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.1;
    }
    return this.isMuted;
  }

  // --- SE再生機能 ---

  // 汎用的なビープ音生成
  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

    gain.connect(this.masterGain);
    osc.connect(gain);

    // エンベロープ（減衰）
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  // 決定音
  playSeSelect() {
    this.init();
    this.playTone(880, 'square', 0.1); // A5
    this.playTone(1760, 'square', 0.1, 0.05); // A6
  }

  // キャンセル/戻る音
  playSeCancel() {
    this.init();
    this.playTone(440, 'triangle', 0.1);
    this.playTone(330, 'triangle', 0.1, 0.05);
  }

  // 攻撃音
  playSeAttack() {
    this.init();
    // ノイズっぽい音を擬似的に作る（周波数を急激に下げる）
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
    
    gain.connect(this.masterGain);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // ダメージ音
  playSeDamage() {
    this.init();
    this.playTone(150, 'sawtooth', 0.2);
    this.playTone(100, 'square', 0.2, 0.05);
  }

  // レベルアップ音
  playSeLevelUp() {
    this.init();
    this.playTone(440, 'square', 0.1, 0.0);
    this.playTone(554, 'square', 0.1, 0.1);
    this.playTone(659, 'square', 0.1, 0.2);
    this.playTone(880, 'square', 0.4, 0.3);
  }

  // --- BGM機能 (簡易ループ) ---
  // 本格的なBGMは外部ファイル推奨ですが、雰囲気だけ出すループ
  
  stopBgm() {
    this.bgmOscillators.forEach(osc => osc.stop());
    this.bgmOscillators = [];
  }

  playBgmDungeon() {
    // 簡易的な環境音（低音の持続音）
    if (this.bgmOscillators.length > 0) return; // 再生中なら何もしない
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 (低音)
    
    // LFOで揺らぎを作る
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.5; // 0.5Hz
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune); // ピッチを揺らす
    
    gain.connect(this.masterGain);
    osc.connect(gain);
    gain.gain.value = 0.05; // 小さく

    osc.start();
    lfo.start();
    
    this.bgmOscillators.push(osc);
    this.bgmOscillators.push(lfo);
  }
}

export const audioManager = new AudioManager();
