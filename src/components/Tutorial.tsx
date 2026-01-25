import React from 'react';

interface TutorialProps {
  onComplete: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black/90 text-white p-8">
      <div className="max-w-2xl bg-slate-800 border border-slate-600 p-8 rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">ようこそ、迷宮都市バベルへ</h2>
        
        <div className="space-y-4 text-slate-200 leading-relaxed mb-8">
          <p>
            あなたは神と契約し、ファミリアの一員としてダンジョンに挑む冒険者です。
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong className="text-white">街（拠点）</strong>で準備を整え、クエストを受注しましょう。</li>
            <li><strong className="text-white">ダンジョン</strong>は入るたびに形を変えます。最深部を目指してください。</li>
            <li>HPが0になると探索失敗となり、街に戻されます（デスペナルティは未実装）。</li>
            <li>矢印キーで移動、Aキー(Z/Enter)で決定・攻撃、Yキー(I)でメニューを開きます。</li>
          </ul>
        </div>

        <button 
          onClick={onComplete}
          className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded transition-colors"
        >
          理解した（冒険を始める）
        </button>
      </div>
    </div>
  );
};

export default Tutorial;
