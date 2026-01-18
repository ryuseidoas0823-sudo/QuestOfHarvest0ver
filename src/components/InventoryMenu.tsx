import { X } from 'lucide-react';
import { PlayerEntity, Item, EquipmentType } from '../types';

interface InventoryMenuProps {
  uiState: PlayerEntity;
  onEquip: (item: Item) => void;
  onUnequip: (slot: keyof PlayerEntity['equipment']) => void;
  onClose: () => void;
}

export const InventoryMenu = ({ uiState, onEquip, onUnequip, onClose }: InventoryMenuProps) => (
  <div className="bg-slate-900 border border-slate-600 rounded-lg w-full max-w-4xl h-[600px] flex text-white overflow-hidden shadow-2xl">
    <div className="w-1/3 bg-slate-800/50 p-6 border-r border-slate-700 flex flex-col gap-4">
      <h3 className="text-xl font-bold text-yellow-500 mb-2 border-b border-slate-700 pb-2">装備</h3>
      {[{ slot: 'mainHand', label: '右手', icon: '⚔️' }, { slot: 'offHand', label: '左手', icon: '🛡️' }, { slot: 'helm', label: '頭', icon: '🪖' }, { slot: 'armor', label: '体', icon: '🛡️' }, { slot: 'boots', label: '足', icon: '👢' }].map((s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const equipmentType: EquipmentType | string = s.icon; // Dummy usage to avoid unused var warning if needed, or remove EquipmentType from imports if not strictly used in types here.
        const item = uiState.equipment[s.slot as keyof PlayerEntity['equipment']];
        return (
          <div key={s.slot} className="flex items-center gap-3 p-2 bg-slate-800 rounded border border-slate-700 relative group">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center text-2xl border border-slate-600 rounded">{item ? item.icon : s.icon}</div>
            <div className="flex-1"><div className="text-xs text-slate-400 uppercase">{s.label}</div><div className={`font-bold text-sm ${item ? '' : 'text-slate-600'}`} style={{ color: item?.color }}>{item ? item.name : 'なし'}</div></div>
            {item && (<button onClick={() => onUnequip(s.slot as keyof PlayerEntity['equipment'])} className="absolute right-2 top-2 p-1 hover:bg-red-900 rounded text-slate-400 hover:text-red-200"><X size={14} /></button>)}
          </div>
        );
      })}
    </div>
    <div className="flex-1 p-6 overflow-y-auto bg-slate-900">
      <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">持ち物 ({uiState.inventory.length})</h3><button onClick={onClose} className="p-1 hover:bg-slate-700 rounded"><X /></button></div>
      <div className="grid grid-cols-2 gap-3">
        {uiState.inventory.map((item: any) => (
          <div key={item.id} onClick={() => onEquip(item)} className="flex gap-3 p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-yellow-500 rounded cursor-pointer transition-colors group">
            <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-2xl border border-slate-600 rounded shrink-0">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold truncate" style={{ color: item.color }}>{item.name}</div>
              <div className="text-xs text-slate-400">{item.type} {item.subType ? `(${item.subType})` : ''}</div>
              <div className="text-xs mt-1 grid grid-cols-2 gap-x-2 text-slate-300">
                {item.stats.attack > 0 && <span>攻撃 +{item.stats.attack}</span>} {item.stats.defense > 0 && <span>防御 +{item.stats.defense}</span>}
              </div>
            </div>
          </div>
        ))}
        {uiState.inventory.length === 0 && (<div className="col-span-2 text-center text-slate-500 py-10">アイテムがありません。</div>)}
      </div>
    </div>
  </div>
);
