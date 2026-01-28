import React, { useState } from 'react';
import { GameState, PlayerState } from '../types/gameState';
import { Item, ItemStats, EnchantInstance } from '../types/item';
import { calculatePlayerStats } from '../utils/stats';
import { ALL_ENCHANTS } from '../data/enchants';
import { getSetById, SetDef } from '../data/sets';
import { 
  Shield, Sword, Zap, User, ArrowLeft, Trash2, 
  Info, Sparkles, AlertTriangle, Layers
} from 'lucide-react';

interface InventoryMenuProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onClose: () => void;
  addLog: (text: string, type?: 'info' | 'success' | 'warning' | 'danger') => void;
}

const InventoryMenu: React.FC<InventoryMenuProps> = ({ gameState, setGameState, onClose, addLog }) => {
  const { player } = gameState;
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // 装備変更処理
  const handleEquip = (item: Item) => {
    // 装備条件チェック
    if (item.requirements) {
      if (item.requirements.level && player.level < item.requirements.level) {
        addLog(`レベルが足りません (必要: Lv${item.requirements.level})`, 'warning');
        return;
      }
      if (item.requirements.stats) {
        const stats = calculatePlayerStats(player);
        if (item.requirements.stats.str && (stats.str || 0) < item.requirements.stats.str) {
          addLog(`STRが足りません (必要: ${item.requirements.stats.str})`, 'warning');
          return;
        }
        if (item.requirements.stats.dex && (stats.dex || 0) < item.requirements.stats.dex) {
          addLog(`DEXが足りません (必要: ${item.requirements.stats.dex})`, 'warning');
          return;
        }
        if (item.requirements.stats.int && (stats.int || 0) < item.requirements.stats.int) {
          addLog(`INTが足りません (必要: ${item.requirements.stats.int})`, 'warning');
          return;
        }
      }
    }

    setGameState(prev => {
      const newPlayer = { ...prev.player };
      const equipSlot = 
        item.type === 'weapon' ? 'mainHand' :
        item.type === 'armor' ? 'armor' :
        item.type === 'accessory' ? 'accessory' : null;

      if (!equipSlot) return prev;

      const currentEquip = newPlayer.equipment[equipSlot];
      if (currentEquip) {
        newPlayer.inventory.push(currentEquip);
      }

      const invIndex = newPlayer.inventory.findIndex(i => i.id === item.id);
      if (invIndex > -1) {
        newPlayer.inventory.splice(invIndex, 1);
      } else {
        const uIndex = newPlayer.inventory.findIndex(i => i.uniqueId === item.uniqueId);
        if (uIndex > -1) newPlayer.inventory.splice(uIndex, 1);
      }

      newPlayer.equipment[equipSlot] = item;
      
      addLog(`${item.name}を装備しました`, 'success');
      return { ...prev, player: newPlayer };
    });
    setSelectedItem(null);
  };

  // 装備解除
  const handleUnequip = (slot: keyof PlayerState['equipment']) => {
    setGameState(prev => {
      const newPlayer = { ...prev.player };
      const item = newPlayer.equipment[slot];
      
      if (!item) return prev;
      if (newPlayer.inventory.length >= newPlayer.maxInventorySize) {
        addLog('インベントリがいっぱいです', 'warning');
        return prev;
      }

      newPlayer.equipment[slot] = null;
      newPlayer.inventory.push(item);
      
      addLog(`${item.name}を外しました`, 'info');
      return { ...prev, player: newPlayer };
    });
    setSelectedItem(null);
  };

  // アイテム破棄
  const handleDiscard = (item: Item) => {
    if (!window.confirm(`${item.name}を捨てますか？`)) return;

    setGameState(prev => {
      const newPlayer = { ...prev.player };
      const index = newPlayer.inventory.findIndex(i => i.uniqueId ? i.uniqueId === item.uniqueId : i.id === item.id);
      if (index > -1) {
        newPlayer.inventory.splice(index, 1);
        addLog(`${item.name}を捨てました`, 'info');
      }
      return { ...prev, player: newPlayer };
    });
    setSelectedItem(null);
  };

  const handleUse = (item: Item) => {
    addLog(`${item.name}を使用しました（効果未実装）`, 'info');
  };

  const getRarityColor = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-slate-300 border-slate-600';
      case 'uncommon': return 'text-green-400 border-green-600';
      case 'rare': return 'text-blue-400 border-blue-500';
      case 'epic': return 'text-purple-400 border-purple-500';
      case 'legendary': return 'text-orange-400 border-orange-500';
      case 'godly': return 'text-yellow-400 border-yellow-500 shadow-[0_0_10px_rgba(250,204,21,0.5)]';
      default: return 'text-slate-300 border-slate-600';
    }
  };

  const getRarityBg = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'uncommon': return 'bg-green-900/20';
      case 'rare': return 'bg-blue-900/20';
      case 'epic': return 'bg-purple-900/20';
      case 'legendary': return 'bg-orange-900/20';
      case 'godly': return 'bg-yellow-900/20';
      default: return 'bg-slate-800';
    }
  };

  // 現在の装備からセットカウントを計算
  const getEquippedSetCount = (setId: string): number => {
    const equip = player.equipment;
    let count = 0;
    if (equip.mainHand?.setId === setId) count++;
    if (equip.offHand?.setId === setId) count++;
    if (equip.armor?.setId === setId) count++;
    if (equip.accessory?.setId === setId) count++;
    return count;
  };

  const renderEnchant = (enchant: EnchantInstance) => {
    const def = ALL_ENCHANTS.find(e => e.id === enchant.defId);
    if (!def) return null;
    const isPositive = enchant.value > 0;
    return (
      <div key={enchant.defId + enchant.roll} className="text-xs flex justify-between items-center text-slate-300 border-b border-slate-700/50 py-0.5 last:border-0">
        <span className="flex items-center gap-1">
            <Sparkles size={10} className="text-yellow-500/70" />
            <span>{def.description.replace('+', '').replace('-%', '').replace('+%', '')}</span>
        </span>
        <span className={`font-mono font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
           {isPositive ? '+' : ''}{enchant.value}{def.isPercentage ? '%' : ''}
        </span>
      </div>
    );
  };

  // セットボーナス表示
  const renderSetBonuses = (setId: string) => {
    const setDef = getSetById(setId);
    if (!setDef) return null;

    const count = getEquippedSetCount(setId);

    return (
      <div className="mb-4">
        <div className="text-xs font-bold text-green-400 border-b border-green-900/50 mb-1 pb-1 flex items-center gap-1">
           <Layers size={12} /> {setDef.name} Set ({count}/?)
        </div>
        <div className="space-y-1">
          {setDef.bonuses.map((bonus, idx) => {
            const isActive = count >= bonus.requiredCount;
            return (
              <div key={idx} className={`text-xs flex gap-2 ${isActive ? 'text-green-300' : 'text-slate-600'}`}>
                <span className="font-mono">({bonus.requiredCount})</span>
                <span>{bonus.description}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderItemDetail = (item: Item) => {
    const rarityColor = getRarityColor(item.rarity);
    
    return (
      <div className="h-full flex flex-col p-4 bg-slate-900 border-l border-slate-700 overflow-y-auto">
        <div className={`text-lg font-bold mb-1 ${rarityColor.split(' ')[0]} flex flex-col`}>
          {item.name}
          {item.isUnique && <span className="text-[10px] text-yellow-500 uppercase tracking-widest border border-yellow-500/50 rounded px-1 w-fit mt-1">Unique</span>}
        </div>
        <div className="text-xs text-slate-500 mb-4 flex justify-between">
          <span>{item.type.toUpperCase()} {item.subType !== 'none' && `- ${item.subType}`}</span>
          {item.tier && <span className="text-slate-400">Tier {item.tier}</span>}
        </div>

        <div className="w-full h-32 bg-slate-950 rounded border border-slate-800 mb-4 flex items-center justify-center relative overflow-hidden">
            <div className={`absolute inset-0 opacity-20 ${getRarityBg(item.rarity)}`} />
            {item.type === 'weapon' ? <Sword size={48} className="text-slate-600" /> :
             item.type === 'armor' ? <Shield size={48} className="text-slate-600" /> :
             item.type === 'accessory' ? <Zap size={48} className="text-slate-600" /> :
             <Info size={48} className="text-slate-600" />}
        </div>

        {/* 基礎ステータス */}
        <div className="mb-4 space-y-1">
            <div className="text-xs font-bold text-slate-400 border-b border-slate-700 mb-1 pb-1">Stats</div>
            {item.stats && Object.entries(item.stats).map(([key, val]) => {
                if (val === 0) return null;
                // 表示用にPercentを整形
                const isPct = key.includes('Percent');
                const label = key.replace('Percent', '');
                return (
                    <div key={key} className="flex justify-between text-sm text-slate-300">
                        <span className="capitalize">{label}</span>
                        <span className="font-mono">{val > 0 ? '+' : ''}{val}{isPct ? '%' : ''}</span>
                    </div>
                );
            })}
        </div>

        {/* エンチャント */}
        {item.enchants && item.enchants.length > 0 && (
            <div className="mb-4">
                <div className="text-xs font-bold text-purple-400 border-b border-purple-900/50 mb-1 pb-1 flex items-center gap-1">
                    <Sparkles size={12} /> Enchantments
                </div>
                <div className="space-y-1">
                    {item.enchants.map(renderEnchant)}
                </div>
            </div>
        )}

        {/* セットボーナス */}
        {item.setId && renderSetBonuses(item.setId)}

        {/* 装備要件 */}
        {item.requirements && (
            <div className="mb-4 p-2 bg-slate-950/50 rounded border border-slate-800">
                 <div className="text-xs font-bold text-slate-500 mb-1">Requirements</div>
                 {item.requirements.level && (
                     <div className={`text-xs ${player.level >= item.requirements.level ? 'text-green-500' : 'text-red-500'}`}>
                        Level {item.requirements.level}
                     </div>
                 )}
                 {item.requirements.stats && Object.entries(item.requirements.stats).map(([k, v]) => (
                     <div key={k} className={`text-xs ${(player as any)[k] >= v ? 'text-green-500' : 'text-red-500'}`}>
                        {k.toUpperCase()} {v}
                     </div>
                 ))}
            </div>
        )}

        <div className="text-xs text-slate-400 italic mt-auto pt-4 border-t border-slate-800">
          {item.description}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
            {item.type === 'consumable' ? (
                 <button onClick={() => handleUse(item)} className="bg-green-700 hover:bg-green-600 text-white py-2 rounded text-sm font-bold">使う</button>
            ) : (
                player.inventory.includes(item) ? (
                    <button onClick={() => handleEquip(item)} className="bg-yellow-700 hover:bg-yellow-600 text-white py-2 rounded text-sm font-bold">装備</button>
                ) : (
                     <button onClick={() => {
                         const slot = item.type === 'weapon' ? 'mainHand' : item.type === 'armor' ? 'armor' : 'accessory';
                         handleUnequip(slot as any);
                     }} className="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm font-bold">外す</button>
                )
            )}
            <button onClick={() => handleDiscard(item)} className="bg-red-900/50 hover:bg-red-900 text-red-200 py-2 rounded text-sm flex items-center justify-center gap-1">
                <Trash2 size={14} /> 捨てる
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col z-30">
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <User className="text-slate-400" />
            <h2 className="text-xl font-bold text-white">Inventory & Equipment</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Equipped</h3>
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Main Hand', slot: 'mainHand', icon: <Sword size={20} /> },
                        { label: 'Off Hand', slot: 'offHand', icon: <Shield size={20} /> },
                        { label: 'Armor', slot: 'armor', icon: <User size={20} /> },
                        { label: 'Accessory', slot: 'accessory', icon: <Zap size={20} /> },
                    ].map(({ label, slot, icon }) => {
                        const item = player.equipment[slot as keyof typeof player.equipment];
                        return (
                            <div 
                                key={slot}
                                onClick={() => item && setSelectedItem(item)}
                                className={`
                                    relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all
                                    ${item ? getRarityColor(item.rarity) + ' ' + getRarityBg(item.rarity) : 'border-slate-800 bg-slate-900 text-slate-700 hover:border-slate-600'}
                                    ${selectedItem === item ? 'ring-2 ring-yellow-500' : ''}
                                `}
                            >
                                {item ? (
                                    <>
                                        <div className="text-2xl font-bold">{item.name.charAt(0)}</div>
                                        <div className="absolute bottom-1 text-[10px] w-full text-center truncate px-1">{item.name}</div>
                                        {item.enchants && item.enchants.length > 0 && (
                                            <div className="absolute top-1 right-1 text-purple-400"><Sparkles size={12} /></div>
                                        )}
                                        {item.setId && (
                                            <div className="absolute top-1 left-1 text-green-400"><Layers size={12} /></div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-1">{icon}</div>
                                        <span className="text-[10px]">{label}</span>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Bag</h3>
                    <span className="text-xs text-slate-500 font-mono">
                        {player.inventory.length} / {player.maxInventorySize}
                    </span>
                </div>
                <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {player.inventory.map((item, idx) => (
                        <div 
                            key={item.uniqueId || item.id + idx}
                            onClick={() => setSelectedItem(item)}
                            className={`
                                aspect-square rounded border relative cursor-pointer hover:brightness-110 transition-all flex items-center justify-center
                                ${getRarityColor(item.rarity)} ${getRarityBg(item.rarity)}
                                ${selectedItem === item ? 'ring-2 ring-yellow-500 z-10' : ''}
                            `}
                        >
                            <span className="font-bold text-lg">{item.name.charAt(0)}</span>
                            {item.quantity && item.quantity > 1 && (
                                <span className="absolute bottom-0.5 right-1 text-[10px] font-mono bg-black/50 px-1 rounded text-white">
                                    x{item.quantity}
                                </span>
                            )}
                            {item.enchants && item.enchants.length > 0 && (
                                <div className="absolute top-0.5 right-0.5 text-purple-400"><Sparkles size={10} /></div>
                            )}
                             {item.setId && (
                                <div className="absolute top-0.5 left-0.5 text-green-400"><Layers size={10} /></div>
                            )}
                        </div>
                    ))}
                    {Array.from({ length: Math.max(0, player.maxInventorySize - player.inventory.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square rounded border border-slate-800 bg-slate-900/50" />
                    ))}
                </div>
            </div>
        </div>

        <div className="w-80 border-l border-slate-800 bg-slate-950">
            {selectedItem ? (
                renderItemDetail(selectedItem)
            ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-sm italic">
                    アイテムを選択してください
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default InventoryMenu;
