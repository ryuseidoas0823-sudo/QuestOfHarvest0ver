import React, { useState } from 'react';

interface TutorialProps {
  onClose: () => void;
}

const TUTORIAL_PAGES = [
  {
    title: "ようこそ、冒険者よ",
    content: (
      <>
        <p>「Quest of Harvest」へようこそ。</p>
        <p>あなたは神と契約した冒険者となり、迷宮都市バベルの地下に広がるダンジョンを攻略します。</p>
        <p className="mt-4">まずは<span className="text-yellow-400 font-bold">「職業」</span>を選び、契約する<span className="text-yellow-400 font-bold">「神」</span>を決めてください。</p>
      </>
    ),
    image: "🏰" // プレースホルダー
  },
  {
    title: "ダンジョンの探索",
    content: (
      <>
        <p>ダンジョンは入るたびに形が変わります。</p>
        <p>階段を見つけて、より深い階層を目指しましょう。</p>
        <p className="mt-4 text-sm text-gray-400">
          移動: 矢印キー または 十字キー<br/>
          決定/攻撃: Enter または Aボタン
        </p>
      </>
    ),
    image: "🗺️"
  },
  {
    title: "戦闘とスキル",
    content: (
      <>
        <p>敵に接触すると攻撃を行います。</p>
        <p>数字キー（1〜4）で<span className="text-blue-400 font-bold">「スキル」</span>を使用できます。</p>
        <p>スキルにはクールダウン（待ち時間）があるので、使いどころを見極めましょう。</p>
      </>
    ),
    image: "⚔️"
  },
  {
    title: "街での準備",
    content: (
      <>
        <p>ダンジョンから帰還したら、街で準備を整えましょう。</p>
        <ul className="list-disc list-inside mt-2 text-left pl-4">
          <li><span className="text-red-400">市場</span>: アイテムの購入</li>
          <li><span className="text-blue-400">ギルド</span>: クエストの受注</li>
          <li><span className="text-yellow-400">ファミリア</span>: ステータスの強化</li>
        </ul>
      </>
    ),
    image: "🏘️"
  }
];

export const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < TUTORIAL_PAGES.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const page = TUTORIAL_PAGES[currentPage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-yellow-600 rounded-lg w-full max-w-lg shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-yellow-500">チュートリアル ({currentPage + 1}/{TUTORIAL_PAGES.length})</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center min-h-[300px]">
          <div className="text-6xl mb-6 animate-float">{page.image}</div>
          <h3 className="text-2xl font-bold text-white mb-4">{page.title}</h3>
          <div className="text-gray-300 leading-relaxed text-lg">
            {page.content}
          </div>
        </div>

        {/* Footer / Navigation */}
        <div className="bg-slate-800 p-4 border-t border-slate-700 flex justify-between">
          <button 
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded font-bold ${currentPage === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white hover:bg-slate-700'}`}
          >
            ← 前へ
          </button>

          <div className="flex gap-2 items-center">
            {TUTORIAL_PAGES.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i === currentPage ? 'bg-yellow-500' : 'bg-slate-600'}`}
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="px-6 py-2 bg-yellow-700 hover:bg-yellow-600 text-white font-bold rounded shadow transition-colors"
          >
            {currentPage === TUTORIAL_PAGES.length - 1 ? '冒険を始める' : '次へ →'}
          </button>
        </div>

      </div>
    </div>
  );
};
