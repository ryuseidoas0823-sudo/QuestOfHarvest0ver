import { ShoppingBag, Hammer, Coins, X, Compass, User, Settings, Skull } from 'lucide-react';
import { Item, PlayerEntity, PerkData, EnemyEntity, MenuType, ResolutionMode, GAME_CONFIG, ASSETS_SVG, ICONS, PERK_DEFINITIONS } from '../types'; // Adjust imports as necessary if types are in a separate file, but here we assume imports from main/utils for now or just inline. 
// Since we are splitting, we should assume types are available. For this output, I will inline the component code but please ensure types are imported correctly in a real environment.
// For Canvas single file, these are just parts of the main file. 

// NOTE: In a real split, imports would be like: import { ... } from '../types';

export const ShopMenu = ({ type, player, onClose, onBuy, onCraft }: any) => {
    return (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-8">
            <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-8 w-full max-w-2xl shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24}/></button>
                <h2 className="text-3xl font-bold text-yellow-500 mb-6 flex items-center gap-3">
                    {type === 'general' ? <ShoppingBag size={32}/> : <Hammer size={32}/>}
                    {type === 'general' ? 'General Store' : 'Blacksmith Forge'}
                </h2>
                {type === 'general' ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-700 p-4 rounded flex justify-between items-center">
                            <div className="flex items-center gap-3"><div className="text-2xl">🔥</div><div><div className="font-bold text-white">松明 (Torch)</div><div className="text-xs text-slate-400">暗闇を照らす</div></div></div>
                            <button onClick={() => onBuy('torch')} className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded text-white font-bold flex items-center gap-1">50 <span className="text-xs">G</span></button>
                        </div>
                        <div className="bg-slate-700 p-4 rounded flex justify-between items-center">
                            <div className="flex items-center gap-3"><div className="text-2xl">🧪</div><div><div className="font-bold text-white">ポーション</div><div className="text-xs text-slate-400">HP 50回復</div></div></div>
                            <button onClick={() => onBuy('potion')} className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded text-white font-bold flex items-center gap-1">100 <span className="text-xs">G</span></button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-slate-400 mb-4">素材とゴールドを使って、新しい装備を作成します。</p>
                        <div className="bg-slate-700 p-4 rounded flex justify-between items-center">
                            <div><div className="font-bold text-white text-lg">ランダム装備作成</div><div className="text-xs text-slate-400">必要: 木材x2, 石x2, 200G</div></div>
                            <button onClick={onCraft} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded text-white font-bold uppercase tracking-wider">CRAFT</button>
                        </div>
                    </div>
                )}
                <div className="mt-8 pt-4 border-t border-slate-600 flex justify-between text-slate-300">
                    <div className="flex items-center gap-2"><Coins size={16} className="text-yellow-500"/> {player.gold} G</div>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">🪵 {player.inventory.find((i:Item)=>i.name==='木材')?.count || 0}</span>
                        <span className="flex items-center gap-1">🪨 {player.inventory.find((i:Item)=>i.name==='石')?.count || 0}</span>
                        <span className="flex items-center gap-1">⛏️ {player.inventory.find((i:Item)=>i.name==='鉱石')?.count || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const GameHUD = ({ uiState, dungeonLevel, toggleMenu, activeShop, bossData }: any) => (
  <>
    {bossData && !bossData.dead && (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[600px] z-50 pointer-events-none">
          <div className="flex justify-between text-red-500 font-bold mb-1 items-center">
              <span className="flex items-center gap-2 text-xl filter drop-shadow-md"><Skull size={24}/> {bossData.race}</span>
              <span className="text-sm">{bossData.hp}/{bossData.maxHp}</span>
          </div>
          <div className="h-6 bg-slate-900/80 border-2 border-red-900 rounded overflow-hidden relative shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              <div className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-500 transition-all duration-300" style={{ width: `${(bossData.hp/bossData.maxHp)*100}%` }}></div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          </div>
      </div>
    )}

    <div className="absolute top-4 right-20 flex gap-4 text-white pointer-events-none">
       <div className="bg-slate-900/80 px-4 py-2 rounded border border-slate-700 flex items-center gap-2"><Compass size={16} className="text-yellow-500" /><span className="font-mono font-bold text-lg">{dungeonLevel === 0 ? "Town" : `Floor B${dungeonLevel}`}</span></div>
    </div>
    <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
      <div className="bg-slate-900/90 border border-slate-700 p-3 rounded text-white w-64 shadow-lg pointer-events-auto">
        <div className="flex justify-between items-center mb-2"><span className="font-bold text-yellow-500">{uiState.job} Lv.{uiState.level}</span><span className="text-xs text-slate-400">GOLD: {uiState.gold}</span></div>
        <div className="mb-2 space-y-1 text-xs text-slate-300">
           <div className="flex justify-between"><span>攻撃: {uiState.attack}</span><span>防御: {uiState.defense}</span></div>
           <div className="flex justify-between"><span>速度: {uiState.speed.toFixed(1)}</span></div>
        </div>
        <div className="mb-1">
          <div className="flex justify-between text-xs mb-0.5"><span className="text-green-400">ST</span><span>{Math.floor(uiState.stamina)}/{uiState.calculatedStats.maxStamina}</span></div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-75" style={{ width: `${(uiState.stamina/uiState.calculatedStats.maxStamina)*100}%` }}></div></div>
        </div>
        <div className="mb-1">
          <div className="flex justify-between text-xs mb-0.5"><span>HP</span><span>{uiState.hp}/{uiState.maxHp}</span></div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(uiState.hp/uiState.maxHp)*100}%` }}></div></div>
        </div>
         <div>
          <div className="flex justify-between text-xs mb-0.5"><span>XP</span><span>{uiState.xp}/{uiState.nextLevelXp}</span></div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${(uiState.xp/uiState.nextLevelXp)*100}%` }}></div></div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-700 flex flex-wrap gap-1">
          {uiState.perks.map((p: any) => {
             // We need PERK_DEFINITIONS here, passed as prop or imported
             const def = PERK_DEFINITIONS[p.id];
             if(!def) return null;
             const Icon = def.icon;
             return <div key={p.id} className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center border border-slate-600 text-slate-300 relative" title={`${def.name} Lv.${p.level}`}><Icon size={12} style={{color:def.color}}/>
             {p.level > 1 && <span className="absolute -top-1 -right-1 text-[8px] bg-black text-white px-0.5 rounded border border-slate-500">{p.level}</span>}
             </div>;
          })}
        </div>
      </div>
    </div>
    {activeShop && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-500/80 text-black px-4 py-2 rounded-full animate-bounce font-bold border-2 border-white pointer-events-none">
            PRESS F TO SHOP
        </div>
    )}
    <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
      <button onClick={() => toggleMenu('inventory')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600 relative"><ShoppingBag size={20} />{uiState?.inventory.length ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span> : null}</button>
      <button onClick={() => toggleMenu('stats')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600 relative"><User size={20} />{uiState && uiState.statPoints > 0 ? <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span> : null}</button>
      <button onClick={() => toggleMenu('status')} className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 border border-slate-600"><Settings size={20} /></button>
    </div>
  </>
);

const InventoryMenu = ({ uiState, onEquip, onUnequip, onClose }: any) => (
  <div className="bg-slate-900 border border-slate-600 rounded-lg w-full max-w-4xl h-[600px] flex text-white overflow-hidden shadow-2xl">
    <div className="w-1/3 bg-slate-800/50 p-6 border-r border-slate-700 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-yellow-500 mb-2 border-b border-slate-700 pb-2">装備</h3>
      {[{ slot: 'mainHand', label: '右手', icon: '⚔️' }, { slot: 'offHand', label: '左手', icon: '🛡️' }, { slot: 'helm', label: '頭', icon: '🪖' }, { slot: 'armor', label: '体', icon: '🛡️' }, { slot: 'boots', label: '足', icon: '👢' }].map((s) => {
        const item = uiState.equipment[s.slot];
        // Note: svgToUrl needs to be available
        const imgSrc = item && item.icon.startsWith('svg:') ? svgToUrl(ASSETS_SVG[item.icon.split(':')[1]]) : null;
        
        return (
          <div key={s.slot} className="flex items-center gap-3 p-2 bg-slate-800 rounded border border-slate-700 relative group">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-2xl border border-slate-600 rounded">{imgSrc ? <img src={imgSrc} className="w-8 h-8" /> : (item ? item.icon : s.icon)}</div>
            <div className="flex-1">
              <div className="text-xs text-slate-400 uppercase">{s.label}</div>
              <div className={`font-bold text-sm ${item ? '' : 'text-slate-600'}`} style={{ color: item?.color }}>{item ? item.name : 'なし'}</div>
              {item && (
                <div className="text-[10px] text-slate-300 grid grid-cols-2 gap-x-1 mt-0.5">
                  {item.stats.attack > 0 && <span>攻+{item.stats.attack}</span>}
                  {item.stats.defense > 0 && <span>防+{item.stats.defense}</span>}
                  {item.stats.speed > 0 && <span>速+{item.stats.speed}</span>}
                  {item.stats.maxHp > 0 && <span>HP+{item.stats.maxHp}</span>}
                  <div className="col-span-2 flex flex-wrap gap-1 mt-1">
                    {item.enchantments.map((e:any, i:number) => (
                      <span key={i} className="text-[9px] px-1 rounded bg-purple-900 text-purple-200">{e.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {item && (<button onClick={() => onUnequip(s.slot)} className="absolute right-2 top-2 p-1 hover:bg-red-900 rounded text-slate-400 hover:text-red-200"><X size={14} /></button>)}
          </div>
        );
      })}
    </div>
    <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
      <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">持ち物 ({uiState.inventory.length})</h3><button onClick={onClose} className="p-1 hover:bg-slate-700 rounded"><X /></button></div>
      <div className="grid grid-cols-2 gap-3">
        {uiState.inventory.map((item: any) => {
          const imgSrc = item.icon.startsWith('svg:') ? svgToUrl(ASSETS_SVG[item.icon.split(':')[1]]) : null;
          return (
          <div key={item.id} onClick={() => onEquip(item)} className="flex gap-3 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-yellow-500 rounded cursor-pointer transition-colors group">
            <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-2xl border border-slate-600 rounded shrink-0 relative">
                {imgSrc ? <img src={imgSrc} className="w-8 h-8" /> : item.icon}
                {item.count && item.count > 1 && <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[10px] px-1 rounded">{item.count}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate" style={{ color: item.color }}>{item.name}</div>
              <div className="text-xs text-slate-400">{item.type} {item.subType ? `(${item.subType})` : ''}</div>
              <div className="text-xs mt-1 grid grid-cols-2 gap-x-2 text-slate-300">
                {item.stats.attack > 0 && <span>攻撃 +{item.stats.attack}</span>} {item.stats.defense > 0 && <span>防御 +{item.stats.defense}</span>}
                {(item.type === 'Consumable' || item.type === 'Material') && <span className="text-yellow-300">{item.type === 'Consumable' ? '消耗品' : '素材'}</span>}
                {item.enchantments && item.enchantments.length > 0 && (
                   <div className="col-span-2 flex flex-wrap gap-1 mt-1">
                    {item.enchantments.map((e:any, i:number) => (
                      <span key={i} className="text-[9px] px-1 rounded bg-purple-900 text-purple-200">{e.name}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )})}
        {uiState.inventory.length === 0 && (<div className="col-span-2 text-center text-slate-500 py-10">アイテムがありません。</div>)}
      </div>
    </div>
  </div>
);
