import React, { useState, useEffect } from 'react';
import { Job } from '../types/job';
import { Quest } from '../types/quest';
import { ShopItem } from '../data/shopItems';
import { GameHUD } from './GameHUD';
import { DialogueWindow } from './DialogueWindow';
import { SpeakerId } from '../types/dialogue';
import { getBestDialogue } from '../utils';
import { quests as allQuests } from '../data/quests';

// 簡易的なアイテム表示用の型定義
interface DisplayItem {
  id: string;
  name: string;
  price: number;
}

interface TownScreenProps {
  playerJob: Job;
  gold: number;
  chapter: number;
  activeQuests: Quest[];
  completedQuestIds: string[];
  items: DisplayItem[]; // any[] から修正
  onGoToDungeon: () => void;
  onAcceptQuest: (quest: Quest) => void;
  onReportQuest: (quest: Quest) => void;
  onBuyItem: (item: ShopItem) => void;
  // onUpgradeStatus の型定義を修正 (cost引数を追加)
  onUpgradeStatus: (stat: 'str' | 'vit' | 'dex' | 'agi' | 'int' | 'luc', cost: number) => void;
  playerStats: any; // Stats型があればそれを使うべきだが、互換性維持のため
  playerExp: number;
}

export const TownScreen: React.FC<TownScreenProps> = ({
  playerJob,
  gold,
  chapter,
  activeQuests,
  completedQuestIds,
  // items, // 現在未使用だが、将来的にInventoryMenuなどをここに統合する場合に使用
  // onGoToDungeon, // 同上
  // onAcceptQuest,
  // onReportQuest,
  // onBuyItem,
  // onUpgradeStatus,
  playerStats,
  playerExp
}) => {
  const [activeFacility, setActiveFacility] = useState<'none' | 'guild' | 'shop' | 'status' | 'inventory'>('none');
  const [currentDialogue, setCurrentDialogue] = useState<string>('');
  const [currentSpeaker, setCurrentSpeaker] = useState<SpeakerId>('unknown');

  const availableQuestIds = allQuests
    .filter(q => {
      if (completedQuestIds.includes(q.id)) return false;
      if (activeQuests.some(aq => aq.id === q.id)) return false;
      
      if (q.requirements?.questCompleted) {
        const allPreReqsMet = q.requirements.questCompleted.every(reqId => completedQuestIds.includes(reqId));
        if (!allPreReqsMet) return false;
      }
      if (q.requirements?.minLevel && playerStats.level < q.requirements.minLevel) return false;
      
      return true;
    })
    .map(q => q.id);

  const readyToReportQuestIds = activeQuests.map(q => q.id); 

  useEffect(() => {
    let speaker: SpeakerId = 'unknown';
    
    switch (activeFacility) {
      case 'guild': speaker = 'guild_receptionist'; break;
      case 'shop': speaker = 'shopkeeper'; break;
      case 'status': speaker = 'goddess'; break;
      default:
        speaker = 'unknown';
        setCurrentDialogue('');
        setCurrentSpeaker('unknown');
        return;
    }

    setCurrentSpeaker(speaker);

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

  }, [activeFacility, chapter, activeQuests, completedQuestIds, availableQuestIds, readyToReportQuestIds]);

  return (
    <div className="relative w-full h-full bg-gray-800 text-white overflow-hidden" 
         style={{ 
           backgroundImage: 'url(https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)',
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <GameHUD 
        playerJob={playerJob}
        level={playerStats.level || 1}
        hp={playerStats.hp}
        maxHp={playerStats.maxHp}
        exp={playerExp}
        nextExp={100 * (playerStats.level || 1)}
        floor={0}
        gold={gold}
      />

      {/* 街のメインメニュー（ボタンなど）の実装が必要ならここに記述 */}
      {/* 仮: 施設へのアクセスボタン */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center space-x-4 z-10">
          <button onClick={() => setActiveFacility('guild')} className="px-6 py-3 bg-blue-700 rounded border-2 border-blue-400 hover:bg-blue-600">冒険者ギルド</button>
          <button onClick={() => setActiveFacility('shop')} className="px-6 py-3 bg-red-700 rounded border-2 border-red-400 hover:bg-red-600">豊穣の市場</button>
          <button onClick={() => setActiveFacility('status')} className="px-6 py-3 bg-yellow-700 rounded border-2 border-yellow-400 hover:bg-yellow-600">ファミリアホーム</button>
      </div>

      {activeFacility !== 'none' && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-20 p-4">
          
          <div className="w-full max-w-4xl mb-4">
             <DialogueWindow
                speakerName={
                    currentSpeaker === 'goddess' ? '女神' : 
                    currentSpeaker === 'guild_receptionist' ? '受付嬢' : 
                    currentSpeaker === 'shopkeeper' ? '店主' : ''
                }
                text={currentDialogue}
                onNext={() => {}} 
             />
          </div>

          <div className="w-full max-w-4xl bg-gray-900 border-2 border-yellow-600 rounded-lg p-6 max-h-[70vh] overflow-y-auto">
             {activeFacility === 'guild' && (
               <div className="text-center">
                 <h2 className="text-2xl font-bold text-yellow-500 mb-4">冒険者ギルド</h2>
                 {/* TODO: クエスト一覧コンポーネントを表示 */}
                 <p className="mb-4">現在受注可能なクエストを確認しています...</p>
                 <button onClick={() => setActiveFacility('none')} className="mt-4 px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">閉じる</button>
               </div>
             )}
             {activeFacility === 'shop' && (
                 <div className="text-center">
                     <h2 className="text-2xl font-bold text-yellow-500 mb-4">豊穣の市場</h2>
                     {/* TODO: ShopMenuを表示 */}
                     <p className="mb-4">いらっしゃいませ！</p>
                     <button onClick={() => setActiveFacility('none')} className="mt-4 px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">閉じる</button>
                 </div>
             )}
             {activeFacility === 'status' && (
                 <div className="text-center">
                     <h2 className="text-2xl font-bold text-yellow-500 mb-4">ファミリアホーム</h2>
                     {/* TODO: StatusUpgradeMenuを表示 */}
                     <p className="mb-4">ステータスを更新しますか？</p>
                     <button onClick={() => setActiveFacility('none')} className="mt-4 px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">閉じる</button>
                 </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
