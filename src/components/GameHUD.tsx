import { Compass, ShoppingBag, User, Settings } from 'lucide-react';
import { PlayerEntity, MenuType, Biome } from '../types';
import { BIOME_NAMES } from '../data';

interface GameHUDProps {
  uiState: PlayerEntity;
  worldInfo: { x: number; y: number; biome: Biome };
  toggleMenu: (m: MenuType) => void;
}

export const GameHUD = ({ uiState, worldInfo, toggleMenu }: GameHUDProps) => (
  <>
    <div className="absolute top-4 right-20 flex gap-4 text-white pointer-events-none">
       <div className="bg-slate-900/80 px-4 py-2 rounded border border-slate-700 flex items-center gap-2">
          <Compass size={16} className="text-yellow-500" />
          <span className="font-mono">{BIOME_NAMES[worldInfo.biome] || worldInfo.biome} ({worldInfo.x}, {worldInfo.y})</span>
       </div>
    </div>

    <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
      <div className="bg-slate-900/90 border border-slate-700 p-3 rounded text-white w-64 shadow-lg pointer-events-auto">
        <div className="flex justify-between items-center mb-2"><span className="font-bold text-yellow-500">{uiState.job} Lv.{uiState.level}</span><span className="text-xs text-slate-400">GOLD: {uiState.gold}</span></div>
        <div className="mb-2 space-y-1 text-xs text-slate-300">
           <div className="flex justify-between"><span>攻撃: {uiState.attack}</span><span>防御: {uiState.defense}</span></div>
           <div className="flex justify-between"><span>速度: {uiState.speed.toFixed(1)}</span></div>
        </div>
        <div className="mb-1">
          <div className="flex justify-between text-xs mb-0.5"><span>HP</span><span>{uiState.hp}/{uiState.maxHp}</span></div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(uiState.hp/uiState.maxHp)*100}%` }}></div></div>
        </div>
         <div>
          <div className="flex justify-between text-xs mb-0.5"><span>XP</span><span>{uiState.xp}/{uiState.nextLevelXp}</span></div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(uiState.xp/uiState.nextLevelXp)*100}%` }}></div></div>
        </div>
      </div>
    </div>

    <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
      <button onClick={() => toggleMenu('inventory')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600 relative"><ShoppingBag size={20} />{uiState?.inventory.length ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span> : null}</button>
      <button onClick={() => toggleMenu('stats')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600 relative"><User size={20} />{uiState && uiState.statPoints > 0 ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span> : null}</button>
      <button onClick={() => toggleMenu('status')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600"><Settings size={20} /></button>
    </div>
  </>
);
