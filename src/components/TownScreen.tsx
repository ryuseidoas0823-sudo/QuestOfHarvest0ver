import React, { useState } from 'react';
import { INITIAL_QUESTS } from '../data/quests';
import { Quest } from '../types/quest';
import { DialogueWindow } from './DialogueWindow';
import { DIALOGUES } from '../data/dialogues';
import { DialogueTree } from '../types/dialogue';
import { ShopMenu } from './ShopMenu'; // 追加
import { StatusUpgradeMenu } from './StatusUpgradeMenu'; // 追加
import { Stats } from '../types'; // 追加
import { ShopItem } from '../data/shopItems'; // 追加

interface TownScreenProps {
  onGoToDungeon: () => void;
  onBackToTitle: () => void;
  acceptedQuests: string[];
  onAcceptQuest: (questId: string) => void;
  completedQuests: string[];
  readyToReportQuests: string[];
  onReportQuest: (questId: string) => void;
  // 追加Props
  playerGold: number;
  playerStats: Stats;
  onUpdateGold: (amount: number) => void;
  onUpdateStats: (newStats: Stats) => void;
  onAddItem: (itemId: string) => void;
}

type Facility = 'main' | 'guild' | 'home' | 'market' | 'tavern';

export const TownScreen: React.FC<TownScreenProps> = ({ 
  onGoToDungeon, 
  onBackToTitle,
  acceptedQuests,
  onAcceptQuest,
  completedQuests,
  readyToReportQuests,
  onReportQuest,
  playerGold,
  playerStats,
  onUpdateGold,
  onUpdateStats,
  onAddItem
}) => {
  const [currentFacility, setCurrentFacility] = useState<Facility>('main');
  const [activeDialogue, setActiveDialogue] = useState<DialogueTree | null>(null);

  const startDialogue = (dialogueId: string) => {
    const dialogue = DIALOGUES[dialogueId];
    if (dialogue) {
      setActiveDialogue(dialogue);
    }
  };

  // アイテム購入処理
  const handleBuyItem = (item: ShopItem) => {
    if (playerGold >= item.price) {
      onUpdateGold(playerGold - item.price);
      onAddItem(item.id);
      // 購入完了エフェクトや音などを入れると良い
    }
  };

  // ステータス強化処理
  const handleUpgradeStat = (statKey: keyof Stats, cost: number) => {
    if (playerStats.exp >= cost) {
      const newStats = { ...playerStats };
      newStats.exp -= cost;
      
      // ステータスごとの上昇幅定義
      if (statKey === 'maxHp') {
        newStats.maxHp += 10;
        newStats.hp += 10; // 現在HPも回復
      } else if (statKey === 'attack') {
        newStats.attack += 1;
      } else if (statKey === 'defense') {
        newStats.defense += 1;
      } else if (statKey === 'speed') {
        newStats.speed += 0.5; // 小数点計算に注意が必要だが簡易的に
      }

      onUpdateStats(newStats);
    }
  };

  const renderFacilityContent = () => {
    switch (currentFacility) {
      case 'guild':
        // ... (ギルドのコードは変更なし、前回の内容を維持)
        return (
          <div className="bg-slate-800 p-6 rounded-lg border-2 border-yellow-600 h-full overflow-hidden flex flex-col w-full relative">
            <div className="flex justify-between items-center mb-4 border-b border-yellow-700 pb-2 shrink-0">
              <h2 className="text-2xl font-bold text-yellow-500">冒険者ギルド - 受付</h2>
              <button 
                onClick={() => startDialogue('guild_talk')}
                className="bg-yellow-800 hover:bg-yellow-700 text-yellow-100 px-4 py-1 rounded border border-yellow-600 text-sm flex items-center gap-2 transition-colors"
              >
                <span>💬</span> 受付嬢と話す
              </button>
            </div>
            
            <div className="mb-4 text-slate-300 italic shrink-0 text-sm">
              カウンターの奥で、受付嬢のミリアが書類整理をしている。
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {INITIAL_QUESTS.map((quest: Quest) => {
                const isAccepted = acceptedQuests.includes(quest.id);
                const isReadyToReport = readyToReportQuests.includes(quest.id);
                const isCompleted = completedQuests.includes(quest.id);

                return (
                  <div key={quest.id} className={`p-4 rounded border transition-all ${
                    isReadyToReport ? 'bg-slate-800 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]' :
                    isCompleted ? 'bg-slate-900/50 border-slate-700 opacity-70' :
                    isAccepted ? 'bg-slate-700 border-green-500' : 
                    'bg-slate-900 border-slate-600 hover:border-slate-400'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-white flex items-center">
                        {quest.isKeyQuest && <span className="text-red-500 mr-2 animate-pulse">【重要】</span>}
                        {quest.title}
                        {isCompleted && <span className="ml-2 text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded">済</span>}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        quest.rank === 'S' ? 'bg-purple-600' :
                        quest.rank === 'A' ? 'bg-red-600' :
                        quest.rank === 'B' ? 'bg-orange-600' :
                        'bg-slate-600'
                      }`}>
                        RANK {quest.rank}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{quest.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <div className="text-yellow-400 font-mono">
                        報酬: {quest.reward.gold} G / Exp {quest.reward.experience}
                      </div>
                      {isCompleted ? (
                         <span className="text-slate-500 font-bold px-4 py-1 border border-slate-600 rounded bg-slate-800">達成済み</span>
                      ) : isReadyToReport ? (
                        <button
                          onClick={() => onReportQuest(quest.id)}
                          className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-4 py-1 rounded border-2 border-yellow-400 animate-bounce shadow-lg"
                        >
                          報告する！
                        </button>
                      ) : isAccepted ? (
                        <span className="text-green-400 font-bold px-4 py-1 border border-green-400 rounded bg-green-900/30">受注中</span>
                      ) : (
                        <button
                          onClick={() => onAcceptQuest(quest.id)}
                          className="bg-yellow-700 hover:bg-yellow-600 text-white px-4 py-1 rounded transition-colors shadow-md active:transform active:scale-95"
                        >
                          受注する
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button 
              onClick={() => setCurrentFacility('main')}
              className="mt-4 text-slate-400 hover:text-white underline shrink-0 self-start"
            >
              ← 街へ戻る
            </button>
          </div>
        );

      case 'home':
        return (
          <StatusUpgradeMenu 
            stats={playerStats}
            onUpgrade={handleUpgradeStat}
            onClose={() => setCurrentFacility('main')}
          />
        );

      case 'market':
        return (
          <ShopMenu 
            playerGold={playerGold}
            onBuy={handleBuyItem}
            onClose={() => setCurrentFacility('main')}
          />
        );

      case 'tavern':
        return (
           <div className="bg-slate-800 p-6 rounded-lg border-2 border-slate-600 h-full flex flex-col items-center justify-center w-full">
             <h2 className="text-3xl font-bold text-slate-200 mb-6">酒場『勇気の杯』</h2>
             <p className="text-slate-400 mb-8 text-lg">店主は留守のようだ...</p>
             <div className="text-slate-500 mb-8 bg-black/30 p-4 rounded">(情報収集機能は開発中です)</div>
             <button 
              onClick={() => setCurrentFacility('main')}
              className="text-slate-400 hover:text-white underline"
            >
              ← 街へ戻る
            </button>
          </div>
        );

      case 'main':
      default:
        // ... (メインメニューは変更なし、前回の内容を維持)
        return (
          <div className="flex flex-col h-full justify-between py-4 w-full">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-2 tracking-wider font-serif">迷宮都市 バベル</h1>
              <p className="text-slate-300 text-xl tracking-widest uppercase border-b border-slate-500 inline-block pb-1">Center of Adventure</p>
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto w-full px-8 flex-grow content-center">
              <button
                onClick={() => setCurrentFacility('guild')}
                className="bg-slate-800/90 hover:bg-slate-700 border-2 border-yellow-600 p-8 rounded-xl flex flex-col items-center group transition-all transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]"
              >
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📜</span>
                <span className="font-bold text-yellow-500 text-2xl">冒険者ギルド</span>
                <span className="text-sm text-slate-400 mt-2">クエスト受注・換金</span>
                {readyToReportQuests.length > 0 && (
                   <span className="absolute top-4 right-4 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentFacility('home')}
                className="bg-slate-800/90 hover:bg-slate-700 border-2 border-indigo-500 p-8 rounded-xl flex flex-col items-center group transition-all transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🏠</span>
                <span className="font-bold text-indigo-400 text-2xl">ファミリアホーム</span>
                <span className="text-sm text-slate-400 mt-2">ステータス更新・倉庫</span>
              </button>

              <button
                onClick={() => setCurrentFacility('market')}
                className="bg-slate-800/90 hover:bg-slate-700 border-2 border-orange-500 p-8 rounded-xl flex flex-col items-center group transition-all transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
              >
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚒️</span>
                <span className="font-bold text-orange-400 text-2xl">市場 & 工房</span>
                <span className="text-sm text-slate-400 mt-2">アイテム購入・強化</span>
              </button>

              <button
                onClick={() => setCurrentFacility('tavern')}
                className="bg-slate-800/90 hover:bg-slate-700 border-2 border-amber-700 p-8 rounded-xl flex flex-col items-center group transition-all transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(180,83,9,0.3)]"
              >
                <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🍺</span>
                <span className="font-bold text-amber-500 text-2xl">酒場</span>
                <span className="text-sm text-slate-400 mt-2">情報収集・食事</span>
              </button>
            </div>

            <div className="flex justify-center gap-6 mt-6">
              <button
                onClick={onBackToTitle}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 px-8 rounded shadow-lg transition-colors border border-gray-600"
              >
                タイトルへ
              </button>
              <button
                onClick={onGoToDungeon}
                className="bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-bold py-4 px-16 rounded shadow-lg border-2 border-red-400 animate-pulse transition-all transform hover:scale-105 text-xl tracking-wider"
              >
                ダンジョンへ出発
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-900 text-white overflow-hidden flex flex-col font-sans">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-2/3 bg-gradient-to-b from-blue-900/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-black to-transparent opacity-80"></div>
      </div>
      
      <div className="relative z-10 w-full h-full p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl h-[95%] bg-black/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-slate-600 flex flex-col items-center">
          {renderFacilityContent()}
        </div>
      </div>

      {activeDialogue && (
        <DialogueWindow 
          dialogueTree={activeDialogue}
          onFinish={() => setActiveDialogue(null)}
          onAction={(action) => console.log('Action:', action)}
        />
      )}
    </div>
  );
};
