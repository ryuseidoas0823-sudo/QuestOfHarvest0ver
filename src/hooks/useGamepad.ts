import { useEffect, useRef, useCallback } from 'react';
import { InputAction } from '../types/input';

interface GamepadConfig {
  deadzone: number;     // スティックのデッドゾーン (0.0 - 1.0)
  repeatDelay: number;  // ボタン押しっぱなし時のリピート間隔 (ms)
}

const DEFAULT_CONFIG: GamepadConfig = {
  deadzone: 0.3,
  repeatDelay: 200, // ターン制なので少し長めに
};

// 一般的なゲームパッドのボタンマッピング (Standard Gamepad Mapping)
// 0: A/×, 1: B/○, 2: X/□, 3: Y/△, 4: L1, 5: R1 ... 9: Start/Options, 8: Select/Share
const BUTTON_MAP: Record<number, InputAction> = {
  0: 'CONFIRM', // A / Cross
  1: 'CANCEL',  // B / Circle
  2: 'SKILL_1', // X / Square
  3: 'MENU',    // Y / Triangle
  4: 'SKILL_2', // L1
  5: 'SKILL_3', // R1
  9: 'PAUSE',   // Start / Options
};

export const useGamepad = (
  onInput: (action: InputAction) => void,
  config: GamepadConfig = DEFAULT_CONFIG
) => {
  const lastInputTime = useRef<number>(0);
  const prevButtons = useRef<boolean[]>([]); // 前フレームのボタン状態

  const checkGamepad = useCallback(() => {
    const gamepads = navigator.getGamepads();
    if (!gamepads) return;

    const gp = gamepads[0]; // 1コンのみ対応
    if (!gp) return;

    const now = Date.now();
    // リピート制御（簡易実装：ボタン押しっぱなしは今回は考慮せず、トリガーのみにするか、必要に応じて調整）
    // 今回は「押した瞬間」のみを検知するエッジトリガー方式を採用
    
    // --- ボタン入力 ---
    gp.buttons.forEach((btn, index) => {
      const isPressed = btn.pressed;
      const wasPressed = prevButtons.current[index] || false;

      if (isPressed && !wasPressed) {
        // ボタンが押された瞬間
        if (BUTTON_MAP[index]) {
          onInput(BUTTON_MAP[index]);
          lastInputTime.current = now;
        } else {
            // マッピングされていないボタンへの対応（必要なら）
            if (index === 12) onInput('UP');    // 十字キー上
            if (index === 13) onInput('DOWN');  // 十字キー下
            if (index === 14) onInput('LEFT');  // 十字キー左
            if (index === 15) onInput('RIGHT'); // 十字キー右
            if (index === 6) onInput('SKILL_4'); // L2 (Triggerだとvalueを見る必要があるがpressedで簡易判定)
        }
      }
      prevButtons.current[index] = isPressed;
    });

    // --- スティック入力 (Lスティック) ---
    // スティックは連続入力になりがちなので、クールタイムを設ける
    if (now - lastInputTime.current > config.repeatDelay) {
      const x = gp.axes[0];
      const y = gp.axes[1];

      if (Math.abs(y) > config.deadzone) {
        if (y < 0) onInput('UP');
        else onInput('DOWN');
        lastInputTime.current = now;
      } else if (Math.abs(x) > config.deadzone) {
        if (x < 0) onInput('LEFT');
        else onInput('RIGHT');
        lastInputTime.current = now;
      }
    }

  }, [onInput, config]);

  useEffect(() => {
    let animationFrameId: number;
    const loop = () => {
      checkGamepad();
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [checkGamepad]);
};
