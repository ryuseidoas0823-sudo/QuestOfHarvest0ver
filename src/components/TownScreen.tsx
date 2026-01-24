import React, { useState, useEffect } from 'react';
import { Job, JobId } from '../types/job';
import { Quest } from '../types/quest';
import { ShopItem } from '../data/shopItems';
import { jobs } from '../data/jobs';
import { shopItems } from '../data/shopItems';
import { GameHUD } from './GameHUD';
import { DialogueWindow } from './DialogueWindow';
import { ShopMenu } from './ShopMenu';
import { InventoryMenu } from './InventoryMenu';
import { StatusUpgradeMenu } from './StatusUpgradeMenu';
import { SpeakerId } from '../types/dialogue';
import { getBestDialogue } from '../utils';
import { quests as allQuests } from '../data/quests'; // クエストマスタデータ

// ... existing code ...

interface TownScreenProps {
  playerJob: Job;
  gold: number;
  chapter: number; // 追加: 現在の章
  activeQuests: Quest[];
  completedQuestIds: string[];
  items: any[]; // InventoryItem[]
  onGoToDungeon: () => void;
  onAcceptQuest: (quest: Quest) => void;
  onReportQuest: (quest: Quest) => void;
  onBuyItem: (item: ShopItem) => void;
  onUpgradeStatus: (stat: 'str' | 'vit' | 'dex' | 'agi' | 'int' | 'luc') => void;
  playerStats: any; // Stats
  playerExp: number;
}

export const TownScreen: React.FC<TownScreenProps> = ({
  playerJob,
  gold,
  chapter,
  activeQuests,
  completedQuestIds,
  items,
  onGoToDungeon,
  onAcceptQuest,
  onReportQuest,
  onBuyItem,
  onUpgradeStatus,
  playerStats,
  playerExp
}) => {
  const [activeFacility, setActiveFacility] = useState<'none' | 'guild' | 'shop' | 'status' | 'inventory'>('none');
  const [currentDialogue, setCurrentDialogue] = useState<string>('');
  const [currentSpeaker, setCurrentSpeaker] = useState<SpeakerId>('unknown');

  // クエストの状態判定（簡易版）
  // 実際にはApp.tsxなどで計算して渡すのが望ましいが、ここで計算する
  const availableQuestIds = allQuests
    .filter(q => {
      // 既に完了または受注中でない
      if (completedQuestIds.includes(q.id)) return false;
      if (activeQuests.some(aq => aq.id === q.id)) return false;
      
      // 前提条件チェック
      if (q.requirements?.questCompleted) {
        const allPreReqsMet = q.requirements.questCompleted.every(reqId => completedQuestIds.includes(reqId));
        if (!allPreReqsMet) return false;
      }
      if (q.requirements?.minLevel && playerStats.level < q.requirements.minLevel) return false;
      
      return true;
    })
    .map(q => q.id);

  // 報告待ち（条件達成済み）のクエストID
  // 今回は簡易的に「受注中」かつ「TownScreenにいる＝帰還した」クエストは全て報告可能扱いにするか、
  // 本来は討伐数などのチェックが必要。
  // ここでは「activeQuestsにあるものは（デバッグ的に）会話優先度判定のために報告待ち候補」として扱う、
  // または厳密なチェックを省略し、activeQuestsのIDをそのまま渡す（completed条件の会話が出るかは運次第になる）。
  // 修正：本来は Quest オブジェクトに progress が必要。
  // 今回は「クエスト報告ボタンが押せる状態」＝「Questオブジェクトの progress >= target」と仮定したいが、
  // Quest型にはまだ progress がないため、activeQuestsのIDをそのまま使う（getBestDialogue側で制御）。
  const readyToReportQuestIds = activeQuests.map(q => q.id); 


  // 施設切り替え時に会話を更新
  useEffect(() => {
    let speaker: SpeakerId = 'unknown';
    
    switch (activeFacility) {
      case 'guild':
        speaker = 'guild_receptionist';
        break;
      case 'shop':
        speaker = 'shopkeeper';
        break;
      case 'status': // ファミリアホーム
        speaker = 'goddess';
        break;
      default:
        speaker = 'unknown';
        setCurrentDialogue('');
        setCurrentSpeaker('unknown');
        return;
    }

    setCurrentSpeaker(speaker);

    // 会話データを取得
    const bestDialogue = getBestDialogue(
      speaker,
      chapter,
      activeQuests,
      completedQuestIds,
      availableQuestIds,
      readyToReportQuestIds
    );

    if (bestDialogue) {
      setCurrentDialogue(bestDialogue.text);
    } else {
      setCurrentDialogue('...');
    }

  }, [activeFacility, chapter, activeQuests, completedQuestIds]); // 依存配列

  // ... existing code ...
  
  // レンダリング部分の DialogueWindow に currentDialogue を渡す
  // <DialogueWindow 
  //   speakerName={currentSpeaker === 'goddess' ? '女神' : currentSpeaker === 'guild_receptionist' ? '受付嬢' : '店主'} 
  //   text={currentDialogue} 
  //   ... 
  // />

  return (
    <div className="relative w-full h-full bg-gray-800 text-white overflow-hidden" 
         style={{ 
           backgroundImage: 'url(https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)',
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      
      {/* 背景オーバーレイ */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* ヘッダー情報 */}
      <GameHUD 
        playerJob={playerJob}
        level={playerStats.level || 1} // 仮
        hp={playerStats.hp}
        maxHp={playerStats.maxHp}
        exp={playerExp}
        nextExp={100 * (playerStats.level || 1)} // 仮
        floor={0}
        gold={gold}
      />

      {/* ... existing UI ... */}
      
      {/* 施設メニューのオーバーレイ表示 */}
      {activeFacility !== 'none' && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-20 p-4">
          
          {/* 会話ウィンドウを表示 (施設が開いている時) */}
          <div className="w-full max-w-4xl mb-4">
             <DialogueWindow
                speakerName={
                    currentSpeaker === 'goddess' ? '女神' : 
                    currentSpeaker === 'guild_receptionist' ? '受付嬢' : 
                    currentSpeaker === 'shopkeeper' ? '店主' : ''
                }
                text={currentDialogue}
                onNext={() => {}} // シンプルな表示のみ
             />
          </div>

          <div className="w-full max-w-4xl bg-gray-900 border-2 border-yellow-600 rounded-lg p-6 max-h-[70vh] overflow-y-auto">
             {/* ... 各メニューコンポーネント ... */}
             {activeFacility === 'guild' && (
               <div className="text-center">
                 <h2 className="text-2xl font-bold text-yellow-500 mb-4">冒険者ギルド</h2>
                 {/* クエストリスト表示ロジックなど */}
                 {/* ... existing quest list code ... */}
                 <button onClick={() => setActiveFacility('none')} className="mt-4 px-4 py-2 bg-gray-600 rounded">閉じる</button>
               </div>
             )}
             {/* Shop, StatusMenu も同様に */}
          </div>
        </div>
      )}
      
      {/* ... existing code ... */}
    </div>
  );
};
