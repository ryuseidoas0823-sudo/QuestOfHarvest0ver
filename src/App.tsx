import React, { useState, useEffect, useRef } from 'react';
import TitleScreen from './components/TitleScreen';
import NameInputScreen from './components/NameInputScreen';
import JobSelectScreen from './components/JobSelectScreen';
import GodSelectScreen from './components/GodSelectScreen';
import TownScreen from './components/TownScreen';
import GameHUD from './components/GameHUD';
import ResultScreen from './components/ResultScreen';
import Tutorial from './components/Tutorial';
import PauseMenu from './components/PauseMenu';
import StatusUpgradeMenu from './components/StatusUpgradeMenu';
import ShopMenu from './components/ShopMenu';
import InventoryMenu from './components/InventoryMenu';
import SkillTreeMenu from './components/SkillTreeMenu';
import TargetingOverlay from './components/TargetingOverlay'; // 追加
import { Renderer } from './renderer';
import { useGameCore } from './hooks/useGameCore';
import { useItemSystem } from './hooks/useItemSystem';
import { useSkillSystem } from './hooks/useSkillSystem';
import { useTargeting } from './hooks/useTargeting'; // 追加
import { Backpack, Zap } from 'lucide-react';
import { JobId } from './types/job';
import { JOB_SKILL_TREE, SKILLS } from './data/skills'; // 追加

type AppState = 'title' | 'nameInput' | 'jobSelect' | 'godSelect' | 'town' | 'dungeon' | 'result';

function App() {
  const { 
    gameState, 
    setGameState, 
    addLog, 
    startGame, 
    useQuickPotion, 
    refillPotions 
  } = useGameCore();

  const { useItem, unequipItem } = useItemSystem(setGameState, addLog);
  const { increaseMastery, learnSkill, useActiveSkill } = useSkillSystem(setGameState, addLog);
  const { targetingState, startTargeting, moveCursor, cancelTargeting } = useTargeting(gameState); // 追加

  const [appState, setAppState] = useState<AppState>('title');
  const [playerName, setPlayerName] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobId>('soldier');

  const [showTutorial, setShowTutorial] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new Renderer(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    let animationId: number;
    const render = () => {
      if (rendererRef.current && appState === 'dungeon') {
        rendererRef.current.render(gameState);
      }
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [gameState, appState]);

  useEffect(() => {
    if (gameState.isGameOver || gameState.isGameClear) {
      const timer = setTimeout(() => {
        setAppState('result');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.isGameOver, gameState.isGameClear]);

  // キーボードハンドリング
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (appState !== 'dungeon' || gameState.isGameOver || showPauseMenu) return;

      // --- ターゲットモード中の操作 ---
      if (targetingState.isActive) {
        if (e.key === 'ArrowUp') moveCursor(0, -1);
        else if (e.key === 'ArrowDown') moveCursor(0, 1);
        else if (e.key === 'ArrowLeft') moveCursor(-1, 0);
        else if (e.key === 'ArrowRight') moveCursor(1, 0);
        
        else if (e.key === 'Enter' || e.key === 'z') {
          // 決定: スキル発動
          if (targetingState.skillId) {
            // カーソル位置にいる敵を探す（単体指定スキルの場合のフォールバック用）
            const enemiesAtPos = gameState.enemies.filter(en => 
                en.position.x === targetingState.cursorPos.x && 
                en.position.y === targetingState.cursorPos.y
            );
            
            // ターゲットIDの特定（いれば）
            const targetId = enemiesAtPos.length > 0 ? enemiesAtPos[0].id : undefined;

            // スキル発動実行
            // 座標(cursorPos)を渡すことで、敵がいなくても地点指定(Area)スキルが発動可能になる
            await useActiveSkill(
              targetingState.skillId, 
              targetId, 
              targetingState.cursorPos
            );
            
            // ターゲットモード終了
            cancelTargeting();
          }
        }
        else if (e.key === 'Escape' || e.key === 'x') {
          cancelTargeting();
        }
        return; // ターゲットモード中は他の操作を受け付けない
      }

      // --- 通常時の操作 ---
      
      // UI開閉
      if (e.key === 'i' || e.key === 'I') {
        setShowInventory(prev => !prev);
        setShowSkillTree(false);
      }
      if (e.key === 'k' || e.key === 'K') {
        setShowSkillTree(prev => !prev);
        setShowInventory(false);
      }
      if (e.key === 'Escape') {
          setShowPauseMenu(true);
      }

      // スキルショートカット (1, 2, 3, 4)
      if (['1', '2', '3', '4'].includes(e.key)) {
        // 現在のジョブのスキルリストを取得
        const currentJobId = gameState.player.jobState.mainJob || 'soldier';
        const availableSkills = JOB_SKILL_TREE[currentJobId] || [];
        
        // 習得済みのアクティブスキルを抽出
        const learntActiveSkills = availableSkills.filter(sid => {
            const level = (gameState.player as any).skills?.[sid] || 0;
            const skill = SKILLS[sid];
            return level > 0 && skill.type === 'active';
        });

        const index = parseInt(e.key) - 1;
        if (learntActiveSkills[index]) {
            const skillId = learntActiveSkills[index];
            const skill = SKILLS[skillId];
            
            // ターゲット不要スキル（自己バフなど）は即発動
            if (skill.targetType === 'self' || skill.targetType === 'none') {
                useActiveSkill(skillId);
            } else {
                // ターゲット選択モードへ
                startTargeting(skillId);
            }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, gameState, showPauseMenu, targetingState, startTargeting, moveCursor, cancelTargeting, useActiveSkill]);

  const handleStartGame = () => {
    setAppState('nameInput');
  };

  const handleNameDecided = (name: string) => {
    setPlayerName(name);
    setAppState('jobSelect');
  };

  const handleJobSelected = (jobId: string) => {
    setSelectedJob(jobId as JobId);
    setAppState('godSelect');
  };

  const handleGodSelected = (godId: string) => {
    // 簡易的に引数なしで呼ぶ（usePlayer側でデフォルトjob等は設定済みと仮定）
    // 本来は player作成時に job を渡す必要がある
    startGame(playerName); 
    setAppState('town');
    setShowTutorial(true);
  };

  const handleDungeonStart = () => {
    setAppState('dungeon');
  };

  const handleReturnToTown = () => {
    setAppState('town');
    setShowPauseMenu(false);
    setShowInventory(false);
    setShowSkillTree(false);
    cancelTargeting();
  };
  
  const handleTitleReturn = () => {
    setAppState('title');
    setShowPauseMenu(false);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none font-sans">
      {appState === 'title' && <TitleScreen onStart={handleStartGame} />}
      {appState === 'nameInput' && <NameInputScreen onConfirm={handleNameDecided} onBack={() => setAppState('title')} />}
      {appState === 'jobSelect' && <JobSelectScreen onSelect={handleJobSelected} onBack={() => setAppState('nameInput')} />}
      {appState === 'godSelect' && <GodSelectScreen onSelect={handleGodSelected} onBack={() => setAppState('jobSelect')} />}

      {appState === 'town' && (
        <TownScreen 
          gameState={gameState} 
          onStartDungeon={handleDungeonStart}
          onSave={() => alert('セーブ機能は未実装です')}
          onRefillPotions={() => refillPotions(setGameState)}
        />
      )}

      {appState === 'dungeon' && (
        <>
          <canvas 
            ref={canvasRef} 
            width={800} 
            height={600}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-2xl border border-slate-800"
            style={{ imageRendering: 'pixelated' }}
          />
          
          {/* ターゲットUIオーバーレイ */}
          <TargetingOverlay gameState={gameState} targetingState={targetingState} />

          <GameHUD gameState={gameState} onUsePotion={() => useQuickPotion(gameState, setGameState, addLog)} />
          
          {/* ショートカットガイド */}
          <div className="absolute top-4 left-4 text-white/50 text-xs pointer-events-none">
             <div>[1-4]: Skill Shortcut</div>
             <div>[Q]: Potion</div>
          </div>

          <div className="absolute bottom-20 right-4 z-10 pointer-events-auto flex flex-col gap-2">
             <button 
               onClick={() => setShowSkillTree(true)}
               className="bg-slate-800/80 hover:bg-slate-700 text-white p-3 rounded-full border-2 border-slate-600 shadow-lg transition-all active:scale-95 group"
               title="スキルツリー (K)"
             >
               <Zap size={24} className="text-purple-400 group-hover:text-purple-300" />
               <div className="absolute -top-2 -right-2 bg-slate-900 text-[10px] text-white px-1.5 py-0.5 rounded border border-slate-600">K</div>
             </button>

             <button 
               onClick={() => setShowInventory(true)}
               className="bg-slate-800/80 hover:bg-slate-700 text-white p-3 rounded-full border-2 border-slate-600 shadow-lg transition-all active:scale-95 group"
               title="アイテム一覧 (I)"
             >
               <Backpack size={24} className="text-amber-400 group-hover:text-amber-300" />
               <div className="absolute -top-2 -right-2 bg-slate-900 text-[10px] text-white px-1.5 py-0.5 rounded border border-slate-600">I</div>
             </button>
          </div>

          {showInventory && (
            <InventoryMenu 
              gameState={gameState} 
              onClose={() => setShowInventory(false)} 
              onUseItem={useItem}
              onUnequip={unequipItem}
            />
          )}

          {showSkillTree && (
            <SkillTreeMenu 
                gameState={gameState}
                onClose={() => setShowSkillTree(false)}
                onIncreaseMastery={increaseMastery}
                onLearnSkill={learnSkill}
            />
          )}

          {showPauseMenu && (
            <PauseMenu 
              onResume={() => setShowPauseMenu(false)}
              onReturnTown={handleReturnToTown}
              onTitle={handleTitleReturn}
            />
          )}
        </>
      )}

      {appState === 'result' && <ResultScreen gameState={gameState} onReturnTown={handleReturnToTown} />}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}
      
      {showStatusMenu && <StatusUpgradeMenu gameState={gameState} onClose={() => setShowStatusMenu(false)} />}
      {showShopMenu && <ShopMenu gameState={gameState} onClose={() => setShowShopMenu(false)} />}
    </div>
  );
}

export default App;
