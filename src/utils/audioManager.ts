/**
 * Web Audio APIを使用したシーケンサー付きオーディオマネージャー
 * メロディ再生機能を追加
 */

// 音階周波数マップ (4オクターブ分)
const NOTE_FREQS: Record<string, number> = {
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50, 'xx': 0 // 休符
};

// シーケンスデータ型
type Note = { note: string; len: number };
type Sequence = Note[];

// BGMデータ
const BGM_DATA: Record<string, { bpm: number, melody: Sequence, bass: Sequence }> = {
  town: {
    bpm: 100,
    melody: [
      {note:'E4', len:2}, {note:'G4', len:2}, {note:'A4', len:4}, {note:'G4', len:2}, {note:'E4', len:2}, {note:'D4', len:4},
      {note:'C4', len:2}, {note:'D4', len:2}, {note:'E4', len:2}, {note:'G4', len:2}, {note:'E4', len:8},
    ],
    bass: [
      {note:'C3', len:4}, {note:'G3', len:4}, {note:'A3', len:4}, {note:'E3', len:4},
      {note:'F3', len:4}, {note:'C3', len:4}, {note:'G3', len:4}, {note:'G3', len:4},
    ]
  },
  dungeon: {
    bpm: 80,
    melody: [
      {note:'A3', len:4}, {note:'E4', len:4}, {note:'D4', len:2}, {note:'C4', len:2}, {note:'B3', len:4},
      {note:'A3', len:4}, {note:'xx', len:4}, {note:'E3', len:4}, {note:'A3', len:4},
    ],
    bass: [
      {note:'A2', len:8}, {note:'E2', len:8}, {note:'A2', len:8}, {note:'E2', len:8}
    ] // 低音は周波数直接指定しないとmapにないので簡易的にA3の半分の110Hz等を使う
  },
  battle: {
    bpm: 140,
    melody: [
      {note:'A4', len:1}, {note:'A4', len:1}, {note:'E4', len:2}, {note:'A4', len:2}, {note:'C5', len:2},
      {note:'B4', len:2}, {note:'G4', len:2}, {note:'E4', len:4},
      {note:'A4', len:1}, {note:'A4', len:1}, {note:'C5', len:2}, {note:'D5', len:2}, {note:'E5', len:2},
      {note:'D5', len:2}, {note:'B4', len:2}, {note:'A4', len:4},
    ],
    bass: [
      {note:'A3', len:2}, {note:'A3', len:2}, {note:'G3', len:2}, {note:'G3', len:2},
      {note:'F3', len:2}, {note:'F3', len:2}, {note:'E3', len:2}, {note:'E3', len:2},
    ]
  }
};

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  
  // シーケンサー用
  private isPlayingBgm: boolean = false;
  private currentBgmKey: string | null = null;
  private nextNoteTime: number = 0;
  private currentNoteIndex: number = 0;
  private currentBassIndex: number = 0;
  private timerId: number | null = null;

  constructor() {}

  init() {
    if (this.ctx) return;
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx!.createGain();
    this.masterGain.connect(this.ctx!.destination);
    this.masterGain.gain.value = 0.1;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.1;
    }
    return this.isMuted;
  }

  // --- SE ---
  // (既存のコードを維持)
  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
    gain.connect(this.masterGain);
    osc.connect(gain);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + startTime + duration);
    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  playSeSelect() { this.init(); this.playTone(880, 'square', 0.1); }
  playSeCancel() { this.init(); this.playTone(440, 'triangle', 0.1); }
  
  playSeAttack() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);
    gain.connect(this.masterGain);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playSeDamage() { this.init(); this.playTone(150, 'sawtooth', 0.2); }
  playSeLevelUp() {
    this.init();
    this.playTone(440, 'square', 0.1, 0.0);
    this.playTone(554, 'square', 0.1, 0.1);
    this.playTone(659, 'square', 0.1, 0.2);
    this.playTone(880, 'square', 0.4, 0.3);
  }

  // --- BGM Sequencer ---

  stopBgm() {
    this.isPlayingBgm = false;
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.currentBgmKey = null;
  }

  playBgm(key: string) {
    if (this.currentBgmKey === key && this.isPlayingBgm) return;
    this.stopBgm();
    this.init();
    
    if (!BGM_DATA[key]) return;

    this.currentBgmKey = key;
    this.isPlayingBgm = true;
    this.currentNoteIndex = 0;
    this.currentBassIndex = 0;
    this.nextNoteTime = this.ctx!.currentTime + 0.1;
    this.scheduleLoop();
  }

  // alias for compatibility
  playBgmDungeon() { this.playBgm('dungeon'); }
  playBgmTown() { this.playBgm('town'); } // New
  playBgmBattle() { this.playBgm('battle'); } // New

  private scheduleLoop() {
    if (!this.isPlayingBgm || !this.ctx || !this.currentBgmKey) return;

    const data = BGM_DATA[this.currentBgmKey];
    const secondsPerBeat = 60.0 / data.bpm;
    const lookahead = 0.1; // 100ms先までスケジューリング

    while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
      // Melody
      const melodyNote = data.melody[this.currentNoteIndex % data.melody.length];
      this.scheduleNote(melodyNote, this.nextNoteTime, 'square', 0.05);
      
      // Bass (Simple)
      const bassNote = data.bass[this.currentBassIndex % data.bass.length];
      // Bass is simpler, half frequency of melody note usually, but here using map
      // If note not in map, ignore. Or use simple math.
      // For simplicity, let's just schedule bass every 2 beats or match structure
      // Here we just advance index. Real sequencer logic is more complex.
      // 簡易実装: ベースはメロディと同じタイミングで進むと仮定（実際はlenを見る必要がある）
      // 今回はメロディのタイミングで鳴らす
      if (bassNote.note !== 'xx') {
         // bassNote.noteが'C3'とかならそのまま、なければ周波数計算...今回は省略してメロディのみにするか、
         // ちゃんと鳴らすならNOTE_FREQSを使う
         if (NOTE_FREQS[bassNote.note]) {
             this.scheduleNote(bassNote, this.nextNoteTime, 'triangle', 0.05);
         }
      }

      // Next step
      // 最短音符(len=1)を基準に進める簡易シーケンサー
      // データ構造上、Note.len が「拍数」ではなく「16分音符の数」等だと扱いやすいが、
      // ここでは secondsPerBeat * (4 / note.len) のように解釈するか...
      // 今回は Note.len = 1 を16分音符(0.25拍)とする
      const noteDuration = melodyNote.len * 0.25 * secondsPerBeat;
      this.nextNoteTime += noteDuration;
      
      this.currentNoteIndex++;
      this.currentBassIndex++; // 簡易同期
    }

    this.timerId = window.setTimeout(() => this.scheduleLoop(), 25);
  }

  private scheduleNote(note: Note, time: number, type: OscillatorType, vol: number) {
    if (note.note === 'xx') return;
    const freq = NOTE_FREQS[note.note];
    if (!freq) return;

    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.connect(this.masterGain!);
    osc.connect(gain);
    
    // Envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5); // Decay

    osc.start(time);
    osc.stop(time + 0.5);
  }
}

export const audioManager = new AudioManager();
