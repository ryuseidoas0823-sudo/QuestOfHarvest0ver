// ... existing code ...
  const switchLocation = (newLocationId: string) => {
    if (!gameState.current) return;
    const state = gameState.current;

    // 移動クールダウン中なら何もしない（無限ループ防止）
    // 60フレーム(約1秒)は再移動を禁止する
    if (state.lastTeleportTime && state.gameTime - state.lastTeleportTime < 60) {
      console.log("Teleport cooldown active");
      return;
    }

    if (state.locationId === 'world') {
      state.lastWorldPos = { x: state.player.x, y: state.player.y };
    }

    // 1. 移動前の現在のマップ状態を保存する
    state.savedChunks[state.locationId] = {
        map: state.map,
        enemies: state.enemies,
        droppedItems: state.droppedItems,
        biome: state.currentBiome,
        locationId: state.locationId
    };

    // 2. 新しいマップの読み込み
    let newChunk: ChunkData;
    if (state.savedChunks[newLocationId]) {
        newChunk = state.savedChunks[newLocationId];
    } else {
        newChunk = getMapData(newLocationId);
        // 新規生成した場合は保存しておく
        state.savedChunks[newLocationId] = newChunk;
    }

    state.map = newChunk.map;
    state.enemies = newChunk.enemies;
    state.droppedItems = newChunk.droppedItems;
    state.currentBiome = newChunk.biome;
    state.locationId = newChunk.locationId;
    state.projectiles = [];
    state.lastTeleportTime = state.gameTime; // テレポート時刻を記録
    
    // 入力をリセット（移動しっぱなしでの即時再移動を防ぐ）
    input.current.keys = {};
    input.current.mouse.down = false;

    if (newLocationId === 'world' && state.lastWorldPos) {
       // ワールドマップに戻る場合、前回の位置（街の入り口の前）に戻す
       // 修正: ポータルの真上(y+32)だと近すぎて再突入してしまうため、
       // さらに距離を取って(y+64)配置する
       state.player.x = state.lastWorldPos.x;
       state.player.y = state.lastWorldPos.y + 64;
    } else {
       // ダンジョンや街に入ったときは、決まった入り口（通常は下側中央）に出現
       state.player.x = (newChunk.map[0].length * 32) / 2;
       state.player.y = (newChunk.map.length * 32) - 64;
    }

    setWorldInfo({x: state.worldX, y: state.worldY, biome: state.currentBiome});
    setMessage(`${BIOME_NAMES[state.currentBiome] || state.currentBiome} に移動しました`); 
    setTimeout(() => setMessage(null), 2000);
  };


  const gameLoop = () => {
// ... existing code ...
