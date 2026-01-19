import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, User, Sword, Heart, Zap } from 'lucide-react';

// 画像生成APIを使用して、イラストレベルのビジュアルを取得するロジックのデモンストレーション
const App = () => {
  const [images, setImages] = useState({
    maleSwordsman: null,
    femaleSwordsman: null
  });
  const [loading, setLoading] = useState(true);
  const apiKey = ""; // 実行環境から自動提供

  const generateCharacters = async () => {
    setLoading(true);
    const prompts = {
      maleSwordsman: "Full body game character illustration of a handsome cool male knight, silver plate armor with gold highlights, long blue cape, sharp blue eyes, high fantasy anime style, detailed muscle lines and anatomy, heroic pose, white background",
      femaleSwordsman: "Full body game character illustration of a beautiful cute female swordsman, light blue and white fantasy armor, mini-skirt armor design, red ribbon in blonde ponytail, sexy and athletic silhouette, detailed facial features, heroic yet charming pose, white background"
    };

    const fetchImage = async (prompt) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
      const payload = {
        instances: [{ prompt }],
        parameters: { sampleCount: 1 }
      };

      try {
        const response = await fetch(url, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
      } catch (error) {
        console.error("Image generation failed", error);
        return null;
      }
    };

    const maleImg = await fetchImage(prompts.maleSwordsman);
    const femaleImg = await fetchImage(prompts.femaleSwordsman);

    setImages({ maleSwordsman: maleImg, femaleSwordsman: femaleImg });
    setLoading(false);
  };

  useEffect(() => {
    generateCharacters();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-tighter text-yellow-500 mb-4 flex items-center justify-center gap-3">
            <Sparkles className="animate-pulse" /> キャラクター・ビジュアル・アップグレード
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            ドット絵から「画像レベル」のイラストへの進化。ボディライン、顔立ち、質感を極限まで高めた次世代の『Quest of Harvest』の姿です。
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-yellow-500 font-bold animate-pulse">イラストを生成中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 男性剣士カード */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
              <div className="aspect-[3/4] relative bg-slate-800">
                {images.maleSwordsman ? (
                  <img src={images.maleSwordsman} alt="Male Swordsman" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">画像生成に失敗しました</div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 p-6">
                  <span className="bg-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Cool & Strong</span>
                  <h2 className="text-3xl font-black mt-2">SWORDSMAN <span className="text-blue-400 font-normal">(MALE)</span></h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                    <User className="text-blue-400" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Face Detail</div>
                      <div className="text-sm font-bold text-slate-200">精悍な顔立ち</div>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                    <Shield className="text-blue-400" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Armor Style</div>
                      <div className="text-sm font-bold text-slate-200">重厚な銀の甲冑</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 女性剣士カード */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
              <div className="aspect-[3/4] relative bg-slate-800">
                {images.femaleSwordsman ? (
                  <img src={images.femaleSwordsman} alt="Female Swordsman" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">画像生成に失敗しました</div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 p-6">
                  <span className="bg-pink-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Cute & Sexy</span>
                  <h2 className="text-3xl font-black mt-2">SWORDSMAN <span className="text-pink-400 font-normal">(FEMALE)</span></h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                    <Heart className="text-pink-400" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Silhouette</div>
                      <div className="text-sm font-bold text-slate-200">美麗な曲線美</div>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-800 p-3 rounded-xl border border-slate-700 flex items-center gap-3">
                    <Zap className="text-pink-400" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Hair Detail</div>
                      <div className="text-sm font-bold text-slate-200">ポニーテール & リボン</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-500"><Sword /> 実装へのステップ</h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-300">
            <li className="space-y-2">
              <div className="font-bold text-white border-b border-slate-700 pb-1">1. 全職業の生成</div>
              <p>戦士、狩人、魔術師も同様のプロンプトで最高レベルのイラストを生成し、アセット化します。</p>
            </li>
            <li className="space-y-2">
              <div className="font-bold text-white border-b border-slate-700 pb-1">2. スプライトシート化</div>
              <p>イラストから背景を除去し、ゲーム内の移動アニメーション（歩行、攻撃）に合わせた各ポーズを作成します。</p>
            </li>
            <li className="space-y-2">
              <div className="font-bold text-white border-b border-slate-700 pb-1">3. レンダリング更新</div>
              <p><code>renderer.ts</code> を修正し、従来の矩形描画の代わりに、高精細な <code>drawImage</code> を実行するように変更します。</p>
            </li>
          </ul>
        </div>
        
        <div className="mt-8 text-center">
            <button 
                onClick={generateCharacters}
                className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-black rounded-full transition-all shadow-xl active:scale-95"
            >
                別パターンのビジュアルを生成する
            </button>
        </div>
      </div>
    </div>
  );
};

export default App;
