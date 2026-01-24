// src/App.tsx の修正案抜粋
// 特に handleUpgradeStatus と handleBuyItem、および TownScreen への props 渡し方について

// ... imports

export default function App() {
  // ... (state definitions)

  // 修正案1: アイテム購入時のインベントリ制限チェックの強化とUX改善
  const handleBuyItem = (item: ShopItem) => {
    if (gold >= item.price) {
      if (inventory.length >= MAX_INVENTORY_SIZE) {
          audioManager.playSeCancel();
          // alertの代わりにログや独自の通知UIを使うのが望ましいが、
          // 簡易対応としてメッセージログに出すなどの改修が推奨される
          console.warn("持ち物がいっぱいです"); 
          return;
      }
      audioManager.playSeSelect();
      setGold(gold - item.price);
      setInventory([...inventory, item.id]);
      setTimeout(performAutoSave, 100);
    } else {
      audioManager.playSeCancel();
    }
  };

  // 修正案2: ステータスアップのコスト計算バグの修正
  // 以前はコストが100固定で、UIから渡されるcostを無視していた
  const handleUpgradeStatus = (stat: 'str' | 'vit' | 'dex' | 'agi' | 'int' | 'luc', cost: number) => {
      // 渡された cost を使用して判定する
      if (playerExp >= cost) {
          audioManager.playSeSelect();
          const newExp = playerExp - cost;
          setPlayerExp(newExp);
          
          // レベル再計算（必要であれば。ステータス購入でレベルが下がるわけではないなら不要かもしれないが、
          // 経験値消費によってレベル表記と矛盾が出る場合は仕様検討が必要。
          // 原作(DanMachi)的には「経験値を使ってステータスを上げる」＝「熟練度反映」なので、
          // プレイヤーレベル(Rank)自体は下がらないのが自然。）
          // ここでは単純に消費のみとする。
          
          setBaseStats(prev => ({
              ...prev,
              [stat]: prev[stat] + 1
          }));
          
          setTimeout(performAutoSave, 100);
      } else {
          audioManager.playSeCancel();
      }
  };

  return (
    <div className="w-full h-screen bg-black text-white font-sans">
      {/* ... Title, JobSelect, GodSelect ... */}

      {screen === 'town' && (
        <TownScreen 
            playerJob={playerJob} 
            gold={gold} 
            chapter={chapter} 
            activeQuests={activeQuests} 
            completedQuestIds={completedQuestIds} 
            
            // 修正案3: 不適切な any キャストとデータ欠落の修正
            // TownScreen側で itemData を参照するロジックになっているため、
            // ここでは無理にオブジェクト化せず、inventory (IDの配列) をそのまま渡す設計に変更するか、
            // 正しいデータをマッピングして渡す。
            // 今回は TownScreen の型定義に合わせて、最低限正しいデータを渡す形に修正。
            items={inventory.map(id => {
                const data = itemData.find(i => i.id === id);
                return {
                    id,
                    name: data ? data.name : 'Unknown Item',
                    price: data ? data.price : 0
                };
            })} 
            
            onGoToDungeon={handleGoToDungeon} 
            onAcceptQuest={handleAcceptQuest} 
            onReportQuest={handleReportQuest} 
            onBuyItem={handleBuyItem} 
            
            // 型定義の不一致を解消するためにキャストが必要な場合があるが、
            // 根本的には TownScreen の Props 定義を (stat, cost) を受け取るように修正すべき。
            onUpgradeStatus={handleUpgradeStatus as any} 
            
            playerStats={finalStats} 
            playerExp={playerExp} 
        />
      )}
      
      {/* ... Inventory, Dungeon, Result ... */}
    </div>
  );
}
