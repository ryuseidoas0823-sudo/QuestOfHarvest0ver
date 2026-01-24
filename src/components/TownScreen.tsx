import React, { useState } from 'react';
import { INITIAL_QUESTS } from '../data/quests';
import { Quest } from '../types/quest';

interface TownScreenProps {
  onGoToDungeon: () => void;
  onBackToTitle: () => void;
}

type Facility = 'main' | 'guild' | 'home' | 'market' | 'tavern';

export const TownScreen: React.FC<TownScreenProps> = ({ onGoToDungeon, onBackToTitle }) => {
  const [currentFacility, setCurrentFacility] = useState<Facility>('main');
  const [acceptedQuests, setAcceptedQuests] = useState<string[]>([]);

  const handleAcceptQuest = (questId: string) => {
    if (!acceptedQuests.includes(questId)) {
      setAcceptedQuests([...acceptedQuests, questId]);
      alert('クエストを受注しました！');
    }
  };

  // 施設ごとのレンダリング
  const renderFacilityContent = () => {
    switch (currentFacility) {
      case 'guild':
        return (
          <div className="bg-slate-800 p-6 rounded-lg border-2 border-yellow-600 h-full overflow-auto">
            <h2 className="text-2xl font-bold text-yellow-500 mb-4 border-b border-yellow-700 pb-2">冒険者ギルド - 受付</h2>
            <div className="mb-4 text-slate-300 italic">
              「新人さんね。まずは掲示板の依頼をこなして実力を示して。」 —— 受付嬢ミリア
            </div>
            
            <div className="grid gap-4">
              {INITIAL_QUESTS.map((quest: Quest) => (
                <div key={quest.id} className={`p-4 rounded border ${acceptedQuests.includes(quest.id) ? 'bg-slate-700 border-green-500' : 'bg-slate-900 border-slate-600'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white">
                      {quest.isKeyQuest && <span className="text-red-500 mr-2">[重要]</span>}
                      {quest.title}
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
                    <div className="text-yellow-400">
                      報酬: {quest.reward.gold} G / Exp {quest.reward.experience}
                    </div>
                    {acceptedQuests.includes(quest.id) ? (
                      <span className="text-green-400 font-bold px-4 py-1 border border-green-400 rounded">受注中</span>
                    ) : (
                      <button
                        onClick={() => handleAcceptQuest(quest.id)}
                        className="bg-yellow-700 hover:bg-yellow-600 text-white px-4 py-1 rounded transition-colors"
                      >
                        受注する
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setCurrentFacility('main')}
              className="mt-6 text-slate-400 hover:text-white underline"
            >
              ← 街へ戻る
            </button>
          </div>
        );

      case 'home':
        return (
          <div className="bg-indigo-900 p-6 rounded-lg border-2 border-indigo-400 h-full flex flex-col items-center justify-center">
             <h2 className="text-2xl font-bold text-indigo-200 mb-4">ファミリア・ホーム</h2>
             <p className="text-indigo-300 mb-8">「おかえりなさい！ 今日の成果をステータスに反映しましょう。」</p>
             <div className="text-slate-400">(ステータス更新・倉庫機能は開発中です)</div>
             <button 
              onClick={() => setCurrentFacility('main')}
              className="mt-8 text-slate-400 hover:text-white underline"
            >
              ← 街へ戻る
            </button>
          </div>
        );

      case 'market':
      case 'tavern':
        return (
           <div className="bg-slate-800 p-6 rounded-lg border-2 border-slate-600 h-full flex flex-col items-center justify-center">
             <h2 className="text-2xl font-bold text-slate-200 mb-4">
               {currentFacility === 'market' ? '豊穣の市場 & 鍛冶工房' : '酒場『勇気の杯』'}
             </h2>
             <p className="text-slate-400 mb-8">店主は留守のようだ...</p>
             <div className="text-slate-500">(ショップ機能は開発中です)</div>
             <button 
              onClick={() => setCurrentFacility('main')}
              className="mt-8 text-slate-400 hover:text-white underline"
            >
              ← 街へ戻る
            </button>
          </div>
        );

      case 'main':
      default:
        return (
          <div className="flex flex-col h-full justify-between">
            <div className="text-center py-8">
              <h1 className="text-4xl font-bold text-white drop-shadow-md mb-2">迷宮都市 バベル</h1>
              <p className="text-slate-300 text-lg">冒険の拠点</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto w-full px-8">
              <button
                onClick={() => setCurrentFacility('guild')}
                className="bg-slate-800 hover:bg-slate-700 border-2 border-yellow-600 p-6 rounded-lg flex flex-col items-center group transition-all"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📜</span>
                <span className="font-bold text-yellow-500 text-xl">冒険者ギルド</span>
                <span className="text-xs text-slate-400 mt-2">クエスト受注・換金</span>
              </button>

              <button
                onClick={() => setCurrentFacility('home')}
                className="bg-slate-800 hover:bg-slate-700 border-2 border-indigo-500 p-6 rounded-lg flex flex-col items-center group transition-all"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏠</span>
                <span className="font-bold text-indigo-400 text-xl">ファミリアホーム</span>
                <span className="text-xs text-slate-400 mt-2">ステータス更新・倉庫</span>
              </button>

              <button
                onClick={() => setCurrentFacility('market')}
                className="bg-slate-800 hover:bg-slate-700 border-2 border-orange-500 p-6 rounded-lg flex flex-col items-center group transition-all"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">⚒️</span>
                <span className="font-bold text-orange-400 text-xl">市場 & 工房</span>
                <span className="text-xs text-slate-400 mt-2">装備購入・強化</span>
              </button>

              <button
                onClick={() => setCurrentFacility('tavern')}
                className="bg-slate-800 hover:bg-slate-700 border-2 border-amber-700 p-6 rounded-lg flex flex-col items-center group transition-all"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🍺</span>
                <span className="font-bold text-amber-500 text-xl">酒場</span>
                <span className="text-xs text-slate-400 mt-2">情報収集・食事</span>
              </button>
            </div>

            <div className="flex justify-center mt-8 pb-8 gap-4">
              <button
                onClick={onBackToTitle}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded shadow-lg transition-colors"
              >
                タイトルへ
              </button>
              <button
                onClick={onGoToDungeon}
                className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-12 rounded shadow-lg border-2 border-red-500 animate-pulse transition-all transform hover:scale-105"
              >
                ダンジョンへ出発
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="absolute inset-0 bg-slate-900 text-white overflow-hidden flex flex-col">
      {/* 簡易的な背景装飾 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-900 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black to-transparent"></div>
      </div>
      
      {/* メインコンテンツエリア */}
      <div className="relative z-10 w-full h-full p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-5xl h-full bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl border border-slate-700">
          {renderFacilityContent()}
        </div>
      </div>
    </div>
  );
};
