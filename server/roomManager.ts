import { WebSocket } from 'ws';
import {
  Room,
  Player,
  GameId,
  ActiveGameState,
  ChatMessage,
  ConnectFourState,
  BattleshipState,
  WordBombState,
  DrawGuessState,
  TicTacToeState,
  ChessState,
  UnoState,
  MonopolyState,
  HideSeekState,
  BattleshipPlayerBoard,
  Ship,
  CellStatus,
  GuessMessage,
} from '../src/types/game.js';
import {
  SYLLABLE_PROMPTS,
  COMMON_DICTIONARY,
  getRandomWordOptions,
  generateHint,
  createInitialChessState,
  createInitialUnoState,
  createInitialMonopolyState,
  createInitialHideSeekState,
  createUnoDeck,
} from '../src/services/gameData.js';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private socketRoomMap: Map<WebSocket, { roomCode: string; playerId: string }> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {}

  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 5; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    } while (this.rooms.has(code));
    return code;
  }

  public getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public getAllPublicRooms(): { code: string; name: string; game: GameId; playerCount: number; maxPlayers: number }[] {
    const list: { code: string; name: string; game: GameId; playerCount: number; maxPlayers: number }[] = [];
    for (const room of this.rooms.values()) {
      if (room.players.length < room.maxPlayers) {
        list.push({
          code: room.code,
          name: room.name,
          game: room.selectedGame,
          playerCount: room.players.length,
          maxPlayers: room.maxPlayers,
        });
      }
    }
    return list;
  }

  public createRoom(
    hostPlayer: { id: string; name: string; avatar: string; color: string },
    roomName?: string,
    initialGame: GameId = 'connect4'
  ): Room {
    const code = this.generateRoomCode();
    const player: Player = {
      id: hostPlayer.id,
      name: hostPlayer.name || 'Host',
      avatar: hostPlayer.avatar || '👑',
      color: hostPlayer.color || '#6366f1',
      isHost: true,
      isReady: true,
      score: 0,
      isOnline: true,
    };

    const room: Room = {
      code,
      name: roomName || `${player.name}'s Party`,
      hostId: player.id,
      selectedGame: initialGame,
      status: 'lobby',
      players: [player],
      gameState: null,
      chat: [
        {
          id: `sys-${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          avatar: '🎮',
          text: `Welcome to room ${code}! Invite friends to join with this code.`,
          timestamp: Date.now(),
          isSystem: true,
        },
      ],
      maxPlayers: this.getMaxPlayersForGame(initialGame),
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    return room;
  }

  public registerSocket(ws: WebSocket, roomCode: string, playerId: string) {
    this.socketRoomMap.set(ws, { roomCode, playerId });
  }

  public unregisterSocket(ws: WebSocket): { roomCode: string; playerId: string } | undefined {
    const info = this.socketRoomMap.get(ws);
    if (info) {
      this.socketRoomMap.delete(ws);
    }
    return info;
  }

  public joinRoom(roomCode: string, playerData: { id: string; name: string; avatar: string; color: string }): { room: Room; error?: string } {
    const code = roomCode.toUpperCase();
    const room = this.rooms.get(code);
    if (!room) {
      return { room: null as any, error: 'Room not found. Check code.' };
    }

    const existingPlayerIndex = room.players.findIndex(p => p.id === playerData.id);
    if (existingPlayerIndex >= 0) {
      // Reconnecting player
      room.players[existingPlayerIndex].isOnline = true;
      room.players[existingPlayerIndex].name = playerData.name || room.players[existingPlayerIndex].name;
      room.players[existingPlayerIndex].avatar = playerData.avatar || room.players[existingPlayerIndex].avatar;
      return { room };
    }

    if (room.players.length >= room.maxPlayers) {
      return { room: null as any, error: `Room is full (max ${room.maxPlayers} players)` };
    }

    const newPlayer: Player = {
      id: playerData.id,
      name: playerData.name || `Player ${room.players.length + 1}`,
      avatar: playerData.avatar || '🕹️',
      color: playerData.color || '#ec4899',
      isHost: false,
      isReady: false,
      score: 0,
      isOnline: true,
    };

    room.players.push(newPlayer);
    this.addSystemChat(room, `${newPlayer.name} joined the room! 👋`);

    return { room };
  }

  public leaveRoom(roomCode: string, playerId: string): { room?: Room; deleted?: boolean } {
    const code = roomCode.toUpperCase();
    const room = this.rooms.get(code);
    if (!room) return {};

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return { room };

    const leavingPlayer = room.players[playerIndex];
    room.players.splice(playerIndex, 1);

    if (room.players.length === 0) {
      this.clearRoomTimers(code);
      this.rooms.delete(code);
      return { deleted: true };
    }

    // Pass host if host left
    if (leavingPlayer.isHost && room.players.length > 0) {
      room.players[0].isHost = true;
      room.hostId = room.players[0].id;
      this.addSystemChat(room, `${room.players[0].name} is now the host! 👑`);
    }

    this.addSystemChat(room, `${leavingPlayer.name} left the room.`);
    return { room };
  }

  public selectGame(roomCode: string, gameId: GameId, playerId: string): Room | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || room.hostId !== playerId) return null;

    room.selectedGame = gameId;
    room.maxPlayers = this.getMaxPlayersForGame(gameId);
    room.status = 'lobby';
    room.gameState = null;
    this.clearRoomTimers(roomCode);

    this.addSystemChat(room, `Game changed to ${this.getGameTitle(gameId)}! 🎯`);
    return room;
  }

  public toggleReady(roomCode: string, playerId: string): Room | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;

    const p = room.players.find(x => x.id === playerId);
    if (p) {
      p.isReady = !p.isReady;
    }
    return room;
  }

  public startGame(roomCode: string, playerId: string, broadcastCb: (room: Room) => void): Room | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || room.hostId !== playerId) return null;
    if (room.players.length < 2 && room.selectedGame !== 'draw_guess') return null;

    room.status = 'playing';
    room.gameState = this.initGameState(room.selectedGame, room.players);
    this.addSystemChat(room, `Game started! Good luck have fun! 🚀`);

    // Setup active game timers if needed (word_bomb, draw_guess)
    this.setupGameLoops(room, broadcastCb);

    return room;
  }

  public handleGameAction(
    roomCode: string,
    playerId: string,
    action: any,
    broadcastCb: (room: Room) => void
  ): Room | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room || !room.gameState) return null;

    const pIndex = room.players.findIndex(p => p.id === playerId);
    if (pIndex === -1) return null;

    switch (room.gameState.type) {
      case 'connect4':
        this.handleConnectFourMove(room, room.gameState.data, pIndex, action);
        break;
      case 'battleship':
        this.handleBattleshipAction(room, room.gameState.data, pIndex, action);
        break;
      case 'word_bomb':
        this.handleWordBombAction(room, room.gameState.data, pIndex, action, broadcastCb);
        break;
      case 'draw_guess':
        this.handleDrawGuessAction(room, room.gameState.data, pIndex, action, broadcastCb);
        break;
      case 'tictactoe':
        this.handleTicTacToeMove(room, room.gameState.data, pIndex, action);
        break;
      case 'chess':
        this.handleChessMove(room, room.gameState.data, pIndex, action);
        break;
      case 'uno':
        this.handleUnoAction(room, room.gameState.data, pIndex, action);
        break;
      case 'monopoly':
        this.handleMonopolyAction(room, room.gameState.data, pIndex, action);
        break;
      case 'hide_seek':
        this.handleHideSeekAction(room, room.gameState.data, pIndex, action);
        break;
    }

    return room;
  }

  public restartGame(roomCode: string, broadcastCb: (room: Room) => void): Room | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;

    this.clearRoomTimers(roomCode);
    room.status = 'playing';
    room.gameState = this.initGameState(room.selectedGame, room.players);
    this.addSystemChat(room, `Starting rematch! 🔄`);
    this.setupGameLoops(room, broadcastCb);
    return room;
  }

  public returnToLobby(roomCode: string): Room | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;

    this.clearRoomTimers(roomCode);
    room.status = 'lobby';
    room.gameState = null;
    room.players.forEach(p => (p.isReady = false));
    this.addSystemChat(room, `Returned to lobby.`);
    return room;
  }

  public addChatMessage(roomCode: string, sender: Player, text: string): ChatMessage | null {
    const room = this.rooms.get(roomCode.toUpperCase());
    if (!room) return null;

    const chatMsg: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: sender.id,
      senderName: sender.name,
      avatar: sender.avatar,
      text: text.slice(0, 200),
      timestamp: Date.now(),
    };

    room.chat.push(chatMsg);
    if (room.chat.length > 50) room.chat.shift();
    return chatMsg;
  }

  public addSystemChat(room: Room, text: string) {
    room.chat.push({
      id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: 'system',
      senderName: 'System',
      avatar: '🔔',
      text,
      timestamp: Date.now(),
      isSystem: true,
    });
    if (room.chat.length > 50) room.chat.shift();
  }

  private clearRoomTimers(roomCode: string) {
    const t = this.timers.get(roomCode);
    if (t) {
      clearInterval(t);
      this.timers.delete(roomCode);
    }
  }

  private getMaxPlayersForGame(gameId: GameId): number {
    switch (gameId) {
      case 'connect4':
      case 'battleship':
      case 'tictactoe':
      case 'chess':
        return 2;
      case 'uno':
      case 'monopoly':
        return 4;
      case 'hide_seek':
        return 6;
      default:
        return 8;
    }
  }

  private getGameTitle(gameId: GameId): string {
    switch (gameId) {
      case 'connect4':
        return 'Four-in-a-Row Turbo';
      case 'battleship':
        return 'Tactical Battleship';
      case 'word_bomb':
        return 'Word Bomb Blitz';
      case 'draw_guess':
        return 'Pixel Draw & Guess';
      case 'tictactoe':
        return 'Neon Tic-Tac-Toe Ultra';
      case 'chess':
        return 'Grandmaster Chess';
      case 'uno':
        return 'Color Clash Uno';
      case 'monopoly':
        return 'Tycoon Monopoly';
      case 'hide_seek':
        return 'Haunted Hide & Seek';
      default:
        return gameId;
    }
  }

  // Initial Game State Factory
  private initGameState(gameId: GameId, players: Player[]): ActiveGameState {
    switch (gameId) {
      case 'connect4': {
        const grid: (number | null)[][] = Array(6)
          .fill(null)
          .map(() => Array(7).fill(null));
        const c4: ConnectFourState = {
          grid,
          currentTurn: 0,
          winner: null,
          winningCells: null,
          movesCount: 0,
        };
        return { type: 'connect4', data: c4 };
      }
      case 'battleship': {
        const createEmptyBoard = (playerId: string): BattleshipPlayerBoard => ({
          playerId,
          ships: [],
          placedAll: false,
          grid: Array(10)
            .fill(null)
            .map(() => Array(10).fill('empty' as CellStatus)),
          attacksReceived: [],
        });
        const bs: BattleshipState = {
          phase: 'placement',
          currentTurn: 0,
          boards: [createEmptyBoard(players[0]?.id || 'p1'), createEmptyBoard(players[1]?.id || 'p2')],
          winner: null,
        };
        return { type: 'battleship', data: bs };
      }
      case 'word_bomb': {
        const prompt = SYLLABLE_PROMPTS[Math.floor(Math.random() * SYLLABLE_PROMPTS.length)];
        const wb: WordBombState = {
          bombTimer: 12,
          prompt,
          currentTurn: 0,
          playerLives: players.map(() => 3),
          usedWords: [],
          winner: null,
          round: 1,
        };
        return { type: 'word_bomb', data: wb };
      }
      case 'draw_guess': {
        const wordOptions = getRandomWordOptions(3).map(w => w.word);
        const dg: DrawGuessState = {
          currentDrawer: 0,
          secretWord: wordOptions[0],
          hint: generateHint(wordOptions[0]),
          round: 1,
          totalRounds: Math.min(players.length * 2, 6),
          roundTimer: 60,
          status: 'choosing',
          strokes: [],
          wordOptions,
          guesses: [],
          guessedPlayers: [],
          winner: null,
        };
        return { type: 'draw_guess', data: dg };
      }
      case 'tictactoe': {
        const ttt: TicTacToeState = {
          boardSize: 3,
          grid: Array(3)
            .fill(null)
            .map(() => Array(3).fill(null)),
          currentTurn: 0,
          winner: null,
          winningLine: null,
          movesCount: 0,
        };
        return { type: 'tictactoe', data: ttt };
      }
      case 'chess': {
        return { type: 'chess', data: createInitialChessState() };
      }
      case 'uno': {
        return { type: 'uno', data: createInitialUnoState(Math.max(2, players.length)) };
      }
      case 'monopoly': {
        return { type: 'monopoly', data: createInitialMonopolyState(Math.max(2, players.length)) };
      }
      case 'hide_seek': {
        return { type: 'hide_seek', data: createInitialHideSeekState(Math.max(2, players.length)) };
      }
    }
  }

  // --- CONNECT FOUR LOGIC ---
  private handleConnectFourMove(room: Room, state: ConnectFourState, pIndex: number, action: { col: number }) {
    if (state.winner !== null || state.currentTurn !== pIndex) return;
    const col = action.col;
    if (col < 0 || col > 6 || state.grid[0][col] !== null) return;

    // Drop to lowest available row
    let dropRow = -1;
    for (let r = 5; r >= 0; r--) {
      if (state.grid[r][col] === null) {
        dropRow = r;
        break;
      }
    }
    if (dropRow === -1) return;

    state.grid[dropRow][col] = pIndex;
    state.movesCount++;
    state.lastMove = { row: dropRow, col, player: pIndex };

    // Check win condition
    const winCells = this.checkConnectFourWin(state.grid, dropRow, col, pIndex);
    if (winCells) {
      state.winner = pIndex;
      state.winningCells = winCells;
      room.status = 'gameover';
      room.players[pIndex].score += 100;
      this.addSystemChat(room, `🎉 ${room.players[pIndex].name} won the match!`);
    } else if (state.movesCount >= 42) {
      state.winner = 'draw';
      room.status = 'gameover';
      this.addSystemChat(room, `Match tied in a draw!`);
    } else {
      state.currentTurn = pIndex === 0 ? 1 : 0;
    }
  }

  private checkConnectFourWin(grid: (number | null)[][], r: number, c: number, p: number): [number, number][] | null {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (const [dr, dc] of directions) {
      const line: [number, number][] = [[r, c]];
      // forward
      for (let s = 1; s <= 3; s++) {
        const nr = r + dr * s;
        const nc = c + dc * s;
        if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && grid[nr][nc] === p) {
          line.push([nr, nc]);
        } else break;
      }
      // backward
      for (let s = 1; s <= 3; s++) {
        const nr = r - dr * s;
        const nc = c - dc * s;
        if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && grid[nr][nc] === p) {
          line.push([nr, nc]);
        } else break;
      }
      if (line.length >= 4) return line;
    }
    return null;
  }

  // --- TIC TAC TOE LOGIC ---
  private handleTicTacToeMove(room: Room, state: TicTacToeState, pIndex: number, action: { r: number; c: number }) {
    if (state.winner !== null || state.currentTurn !== pIndex) return;
    const { r, c } = action;
    const size = state.boardSize;
    if (r < 0 || r >= size || c < 0 || c >= size || state.grid[r][c] !== null) return;

    state.grid[r][c] = pIndex;
    state.movesCount++;

    // Check winner
    const winLine = this.checkTicTacToeWin(state.grid, r, c, pIndex, size);
    if (winLine) {
      state.winner = pIndex;
      state.winningLine = winLine;
      room.status = 'gameover';
      room.players[pIndex].score += 100;
      this.addSystemChat(room, `🎉 ${room.players[pIndex].name} won Tic-Tac-Toe!`);
    } else if (state.movesCount >= size * size) {
      state.winner = 'draw';
      room.status = 'gameover';
      this.addSystemChat(room, `Tic-Tac-Toe ended in a draw!`);
    } else {
      state.currentTurn = pIndex === 0 ? 1 : 0;
    }
  }

  private checkTicTacToeWin(
    grid: (number | null)[][],
    r: number,
    c: number,
    p: number,
    size: number
  ): [number, number][] | null {
    // Row check
    let winRow = true;
    const rowCells: [number, number][] = [];
    for (let j = 0; j < size; j++) {
      if (grid[r][j] !== p) {
        winRow = false;
        break;
      }
      rowCells.push([r, j]);
    }
    if (winRow) return rowCells;

    // Col check
    let winCol = true;
    const colCells: [number, number][] = [];
    for (let i = 0; i < size; i++) {
      if (grid[i][c] !== p) {
        winCol = false;
        break;
      }
      colCells.push([i, c]);
    }
    if (winCol) return colCells;

    // Main diag
    if (r === c) {
      let winDiag = true;
      const diagCells: [number, number][] = [];
      for (let i = 0; i < size; i++) {
        if (grid[i][i] !== p) {
          winDiag = false;
          break;
        }
        diagCells.push([i, i]);
      }
      if (winDiag) return diagCells;
    }

    // Anti diag
    if (r + c === size - 1) {
      let winAnti = true;
      const antiCells: [number, number][] = [];
      for (let i = 0; i < size; i++) {
        if (grid[i][size - 1 - i] !== p) {
          winAnti = false;
          break;
        }
        antiCells.push([i, size - 1 - i]);
      }
      if (winAnti) return antiCells;
    }

    return null;
  }

  // --- BATTLESHIP LOGIC ---
  private handleBattleshipAction(room: Room, state: BattleshipState, pIndex: number, action: any) {
    if (action.subType === 'place_ships') {
      const board = state.boards[pIndex];
      board.ships = action.ships;
      board.placedAll = true;

      // Update grid
      board.grid = Array(10)
        .fill(null)
        .map(() => Array(10).fill('empty' as CellStatus));
      for (const ship of board.ships) {
        for (const pos of ship.positions) {
          board.grid[pos.r][pos.c] = 'ship';
        }
      }

      // Check if both players placed all ships
      if (state.boards[0].placedAll && state.boards[1].placedAll) {
        state.phase = 'battle';
        this.addSystemChat(room, `Both commanders are ready! Battle initiated! 💥`);
      }
    } else if (action.subType === 'attack' && state.phase === 'battle') {
      if (state.currentTurn !== pIndex) return;
      const opponentIndex = pIndex === 0 ? 1 : 0;
      const oppBoard = state.boards[opponentIndex];
      const { r, c } = action;

      if (r < 0 || r >= 10 || c < 0 || c >= 10) return;
      const targetCell = oppBoard.grid[r][c];
      if (targetCell === 'hit' || targetCell === 'miss') return; // already fired

      let result: 'hit' | 'miss' | 'sunk' = 'miss';
      let sunkShipName: string | undefined;

      if (targetCell === 'ship') {
        oppBoard.grid[r][c] = 'hit';
        result = 'hit';

        // Check which ship was hit
        const hitShip = oppBoard.ships.find(s => s.positions.some(pos => pos.r === r && pos.c === c));
        if (hitShip) {
          hitShip.hits++;
          if (hitShip.hits >= hitShip.size) {
            hitShip.sunk = true;
            result = 'sunk';
            sunkShipName = hitShip.name;
            this.addSystemChat(room, `💥 ${room.players[pIndex].name} SUNK ${room.players[opponentIndex].name}'s ${hitShip.name}!`);
          }
        }
      } else {
        oppBoard.grid[r][c] = 'miss';
      }

      oppBoard.attacksReceived.push({ r, c, result, shipName: sunkShipName });
      state.lastAttack = {
        playerIndex: pIndex,
        r,
        c,
        result,
        shipName: sunkShipName,
      };

      // Check win (all opponent ships sunk)
      const allSunk = oppBoard.ships.every(s => s.sunk);
      if (allSunk) {
        state.phase = 'gameover';
        state.winner = pIndex;
        room.status = 'gameover';
        room.players[pIndex].score += 150;
        this.addSystemChat(room, `🏆 ${room.players[pIndex].name} destroyed the entire enemy fleet! Victory!`);
      } else {
        // Change turn
        state.currentTurn = opponentIndex;
      }
    }
  }

  // --- WORD BOMB LOGIC ---
  private handleWordBombAction(
    room: Room,
    state: WordBombState,
    pIndex: number,
    action: { word: string },
    broadcastCb: (room: Room) => void
  ) {
    if (state.winner !== null || state.currentTurn !== pIndex) return;

    const rawWord = (action.word || '').trim().toLowerCase();
    const prompt = state.prompt.toLowerCase();

    // Check validity
    let valid = true;
    let reason = '';

    if (!rawWord.includes(prompt)) {
      valid = false;
      reason = `Must contain "${state.prompt.toUpperCase()}"`;
    } else if (rawWord.length < 3) {
      valid = false;
      reason = 'Word too short';
    } else if (state.usedWords.includes(rawWord)) {
      valid = false;
      reason = 'Already used';
    } else if (!COMMON_DICTIONARY.has(rawWord)) {
      valid = false;
      reason = 'Word not recognized';
    }

    state.lastWordSubmitted = { word: rawWord.toUpperCase(), player: pIndex, valid, reason };

    if (valid) {
      state.usedWords.push(rawWord);
      room.players[pIndex].score += 20;

      // Pick new prompt
      state.prompt = SYLLABLE_PROMPTS[Math.floor(Math.random() * SYLLABLE_PROMPTS.length)];
      // Reset timer (gets slightly faster as round increases)
      state.bombTimer = Math.max(7, 12 - Math.floor(state.round / 3));

      // Advance to next active player
      state.currentTurn = this.getNextWordBombPlayer(state, room.players.length);
      state.round++;
      broadcastCb(room);
    }
  }

  private getNextWordBombPlayer(state: WordBombState, totalPlayers: number): number {
    let next = (state.currentTurn + 1) % totalPlayers;
    for (let i = 0; i < totalPlayers; i++) {
      if (state.playerLives[next] > 0) {
        return next;
      }
      next = (next + 1) % totalPlayers;
    }
    return next;
  }

  // --- DRAW & GUESS LOGIC ---
  private handleDrawGuessAction(
    room: Room,
    state: DrawGuessState,
    pIndex: number,
    action: any,
    broadcastCb: (room: Room) => void
  ) {
    if (action.subType === 'choose_word' && state.status === 'choosing' && state.currentDrawer === pIndex) {
      state.secretWord = action.word.toUpperCase();
      state.hint = generateHint(state.secretWord);
      state.status = 'drawing';
      state.roundTimer = 60;
      this.addSystemChat(room, `${room.players[pIndex].name} picked a word! Start guessing! ✏️`);
      broadcastCb(room);
    } else if (action.subType === 'draw_stroke' && state.currentDrawer === pIndex && state.status === 'drawing') {
      state.strokes.push(action.stroke);
      broadcastCb(room);
    } else if (action.subType === 'clear_canvas' && state.currentDrawer === pIndex) {
      state.strokes = [];
      broadcastCb(room);
    } else if (action.subType === 'undo_stroke' && state.currentDrawer === pIndex) {
      state.strokes.pop();
      broadcastCb(room);
    } else if (action.subType === 'guess_word') {
      const guess = (action.guess || '').trim().toUpperCase();
      const player = room.players[pIndex];
      if (pIndex === state.currentDrawer || state.guessedPlayers.includes(player.id)) {
        return;
      }

      const isCorrect = guess === state.secretWord;
      const guessMsg: GuessMessage = {
        id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        playerId: player.id,
        playerName: player.name,
        text: isCorrect ? '🎉 GUESSED THE WORD!' : guess,
        isCorrect,
        timestamp: Date.now(),
      };
      state.guesses.push(guessMsg);

      if (isCorrect) {
        state.guessedPlayers.push(player.id);
        player.score += 100;
        room.players[state.currentDrawer].score += 40;
        this.addSystemChat(room, `🎯 ${player.name} correctly guessed the word!`);

        // If all non-drawer players guessed, finish round early
        const nonDrawers = room.players.filter((_, idx) => idx !== state.currentDrawer);
        if (state.guessedPlayers.length >= nonDrawers.length) {
          this.endDrawGuessRound(room, state, broadcastCb);
        }
      }
      broadcastCb(room);
    }
  }

  private endDrawGuessRound(room: Room, state: DrawGuessState, broadcastCb: (room: Room) => void) {
    state.status = 'round_over';
    this.addSystemChat(room, `Round over! The secret word was: ${state.secretWord}`);

    setTimeout(() => {
      if (state.round >= state.totalRounds) {
        state.status = 'game_over';
        room.status = 'gameover';
        // Highest score is winner
        let highest = -1;
        let bestIdx = 0;
        room.players.forEach((p, idx) => {
          if (p.score > highest) {
            highest = p.score;
            bestIdx = idx;
          }
        });
        state.winner = bestIdx;
        this.addSystemChat(room, `🏆 Game over! Winner is ${room.players[bestIdx].name}!`);
      } else {
        // Next round
        state.round++;
        state.currentDrawer = (state.currentDrawer + 1) % room.players.length;
        state.strokes = [];
        state.guesses = [];
        state.guessedPlayers = [];
        state.status = 'choosing';
        state.wordOptions = getRandomWordOptions(3).map(w => w.word);
        state.secretWord = state.wordOptions[0];
        state.hint = generateHint(state.secretWord);
        this.addSystemChat(room, `Round ${state.round}! It's ${room.players[state.currentDrawer].name}'s turn to draw!`);
      }
      broadcastCb(room);
    }, 4000);
  }

  // --- TIMED GAME LOOPS ---
  private setupGameLoops(room: Room, broadcastCb: (room: Room) => void) {
    this.clearRoomTimers(room.code);

    const interval = setInterval(() => {
      if (!room.gameState || room.status !== 'playing') {
        this.clearRoomTimers(room.code);
        return;
      }

      if (room.gameState.type === 'word_bomb') {
        const wb = room.gameState.data;
        if (wb.winner !== null) return;

        wb.bombTimer--;
        if (wb.bombTimer <= 0) {
          // BOMB EXPLODED ON CURRENT PLAYER!
          wb.playerLives[wb.currentTurn]--;
          const explodedPlayer = room.players[wb.currentTurn];
          this.addSystemChat(room, `💥 BOOM! Bomb exploded on ${explodedPlayer.name}! (${wb.playerLives[wb.currentTurn]} lives left)`);

          // Check if only 1 player alive
          const alive = wb.playerLives.map((lives, idx) => ({ lives, idx })).filter(x => x.lives > 0);
          if (alive.length <= 1) {
            wb.winner = alive.length === 1 ? alive[0].idx : 0;
            room.status = 'gameover';
            room.players[wb.winner].score += 100;
            this.addSystemChat(room, `🏆 ${room.players[wb.winner].name} survived the Word Bomb! Victory!`);
            this.clearRoomTimers(room.code);
          } else {
            // Next player & reset timer
            wb.prompt = SYLLABLE_PROMPTS[Math.floor(Math.random() * SYLLABLE_PROMPTS.length)];
            wb.bombTimer = Math.max(7, 12 - Math.floor(wb.round / 3));
            wb.currentTurn = this.getNextWordBombPlayer(wb, room.players.length);
          }
        }
        broadcastCb(room);
      } else if (room.gameState.type === 'draw_guess') {
        const dg = room.gameState.data;
        if (dg.status === 'drawing') {
          dg.roundTimer--;
          if (dg.roundTimer <= 0) {
            this.endDrawGuessRound(room, dg, broadcastCb);
          }
          broadcastCb(room);
        }
      }
    }, 1000);

    this.timers.set(room.code, interval);
  }

  // --- CHESS LOGIC ---
  private handleChessMove(room: Room, state: ChessState, pIndex: number, action: { from: [number, number]; to: [number, number] }) {
    const expectedColor = pIndex === 0 ? 'w' : 'b';
    if (state.winner !== null || state.currentTurn !== expectedColor) return;
    const [fr, fc] = action.from;
    const [tr, tc] = action.to;
    const piece = state.board[fr]?.[fc];
    if (!piece || piece.color !== expectedColor) return;

    const target = state.board[tr]?.[tc];
    if (target) {
      if (target.color === 'w') {
        state.capturedWhite.push(target.type);
      } else {
        state.capturedBlack.push(target.type);
      }
      if (target.type === 'k') {
        state.winner = expectedColor;
        room.status = 'gameover';
        room.players[pIndex].score += 150;
        this.addSystemChat(room, `♚ Checkmate! ${room.players[pIndex].name} defeated the King for the victory!`);
      }
    }

    piece.hasMoved = true;
    if (piece.type === 'p' && (tr === 0 || tr === 7)) {
      piece.type = 'q';
    }

    state.board[tr][tc] = piece;
    state.board[fr][fc] = null;
    state.movesCount++;
    state.lastMove = { from: action.from, to: action.to, piece };

    if (state.winner === null) {
      state.currentTurn = state.currentTurn === 'w' ? 'b' : 'w';
    }
  }

  // --- UNO LOGIC ---
  private handleUnoAction(room: Room, state: UnoState, pIndex: number, action: any) {
    if (action.type === 'call_uno') {
      state.unoCalled[pIndex] = true;
      this.addSystemChat(room, `🃏 UNO! ${room.players[pIndex].name} called UNO!`);
      return;
    }

    if (state.winner !== null || state.currentTurn !== pIndex) return;

    if (action.type === 'draw') {
      const newCard = createUnoDeck()[0];
      state.hands[pIndex].push(newCard);
      state.lastActionText = `${room.players[pIndex].name} drew a card.`;
      state.currentTurn = (state.currentTurn + state.direction + room.players.length) % room.players.length;
      return;
    }

    if (action.type === 'play') {
      const cardId = action.cardId;
      const cardIdx = state.hands[pIndex].findIndex(c => c.id === cardId);
      if (cardIdx === -1) return;

      const card = state.hands[pIndex][cardIdx];
      state.hands[pIndex].splice(cardIdx, 1);
      state.discardPile.push(card);

      if (card.color === 'wild') {
        state.currentColor = action.chosenColor || 'red';
      } else {
        state.currentColor = card.color;
      }

      let skipNext = false;
      if (card.type === 'reverse') {
        state.direction = state.direction === 1 ? -1 : 1;
        state.lastActionText = `${room.players[pIndex].name} reversed play direction! 🔄`;
      } else if (card.type === 'skip') {
        skipNext = true;
        state.lastActionText = `${room.players[pIndex].name} skipped next player! 🚫`;
      } else if (card.type === 'draw2') {
        skipNext = true;
        const nextP = (state.currentTurn + state.direction + room.players.length) % room.players.length;
        const bonusCards = createUnoDeck().slice(0, 2);
        state.hands[nextP].push(...bonusCards);
        state.lastActionText = `${room.players[pIndex].name} forced ${room.players[nextP].name} to draw 2! +2`;
      } else if (card.type === 'wild4') {
        skipNext = true;
        const nextP = (state.currentTurn + state.direction + room.players.length) % room.players.length;
        const bonusCards = createUnoDeck().slice(0, 4);
        state.hands[nextP].push(...bonusCards);
        state.lastActionText = `${room.players[pIndex].name} dropped WILD +4 and chose ${state.currentColor.toUpperCase()}! 🌈`;
      } else {
        state.lastActionText = `${room.players[pIndex].name} played ${card.color.toUpperCase()} ${card.symbol}`;
      }

      if (state.hands[pIndex].length === 0) {
        state.winner = pIndex;
        room.status = 'gameover';
        room.players[pIndex].score += 150;
        this.addSystemChat(room, `🎉 UNO VICTORY! ${room.players[pIndex].name} emptied their hand and won!`);
        return;
      }

      const step = skipNext ? 2 * state.direction : state.direction;
      state.currentTurn = ((state.currentTurn + step) % room.players.length + room.players.length) % room.players.length;
    }
  }

  // --- MONOPOLY LOGIC ---
  private handleMonopolyAction(room: Room, state: MonopolyState, pIndex: number, action: any) {
    if (state.winner !== null || state.currentTurn !== pIndex) return;

    if (action.type === 'roll') {
      if (state.phase !== 'roll') return;
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      state.lastDice = [d1, d2];
      const rollTotal = d1 + d2;

      const oldPos = state.playerPositions[pIndex];
      const newPos = (oldPos + rollTotal) % state.tiles.length;
      state.playerPositions[pIndex] = newPos;

      if (newPos < oldPos) {
        state.playerCash[pIndex] += 200;
        state.log.unshift(`${room.players[pIndex].name} passed GO and collected $200! 💵`);
      }

      const tile = state.tiles[newPos];
      state.log.unshift(`${room.players[pIndex].name} rolled ${d1}+${d2}=${rollTotal} and landed on ${tile.name}.`);

      if (tile.type === 'tax') {
        const tax = tile.price || 75;
        state.playerCash[pIndex] = Math.max(0, state.playerCash[pIndex] - tax);
        state.log.unshift(`${room.players[pIndex].name} paid $${tax} in taxes.`);
      } else if (tile.type === 'chance') {
        const reward = Math.random() > 0.5 ? 100 : -50;
        state.playerCash[pIndex] = Math.max(0, state.playerCash[pIndex] + reward);
        state.log.unshift(`Lucky Chance! ${room.players[pIndex].name} ${reward > 0 ? 'won $100' : 'lost $50'}.`);
      } else if (tile.type === 'property' && tile.owner !== undefined && tile.owner !== pIndex) {
        const rent = tile.rent || 25;
        state.playerCash[pIndex] = Math.max(0, state.playerCash[pIndex] - rent);
        state.playerCash[tile.owner] += rent;
        state.log.unshift(`${room.players[pIndex].name} paid $${rent} rent to ${room.players[tile.owner].name}.`);
      }

      state.phase = 'action';

      if (state.playerCash[pIndex] <= 0) {
        state.log.unshift(`💀 ${room.players[pIndex].name} went bankrupt!`);
      }
    } else if (action.type === 'buy') {
      if (state.phase !== 'action') return;
      const pos = state.playerPositions[pIndex];
      const tile = state.tiles[pos];
      if (tile.type === 'property' && tile.owner === undefined && tile.price && state.playerCash[pIndex] >= tile.price) {
        state.playerCash[pIndex] -= tile.price;
        tile.owner = pIndex;
        state.log.unshift(`🏢 ${room.players[pIndex].name} purchased ${tile.name} for $${tile.price}!`);
      }
      state.phase = 'roll';
      state.currentTurn = (state.currentTurn + 1) % room.players.length;
    } else if (action.type === 'end_turn') {
      state.phase = 'roll';
      state.currentTurn = (state.currentTurn + 1) % room.players.length;
    }
  }

  // --- HIDE AND SEEK LOGIC ---
  private handleHideSeekAction(room: Room, state: HideSeekState, pIndex: number, action: any) {
    if (state.phase === 'hiding') {
      if (pIndex === state.seekerIndex) return;
      if (action.type === 'pick_spot' && action.spotId) {
        state.playerHidingSpots[pIndex] = action.spotId;
        this.addSystemChat(room, `${room.players[pIndex].name} found a secret hiding spot.`);

        const nonSeekerIndices = room.players.map((_, idx) => idx).filter(idx => idx !== state.seekerIndex);
        const allHidden = nonSeekerIndices.every(idx => state.playerHidingSpots[idx] !== undefined);
        if (allHidden) {
          state.phase = 'seeking';
          state.lastEventText = `All hiders are concealed! ${room.players[state.seekerIndex].name}, find them!`;
          this.addSystemChat(room, `🔦 Seeking begins! Search the rooms!`);
        }
      }
    } else if (state.phase === 'seeking') {
      if (pIndex !== state.seekerIndex) return;
      if (action.type === 'search_spot' && action.spotId) {
        const spot = state.spots.find(s => s.id === action.spotId);
        if (!spot || spot.isSearched) return;
        spot.isSearched = true;
        state.searchesLeft--;

        const foundIndices = Object.entries(state.playerHidingSpots)
          .filter(([_, spotId]) => spotId === action.spotId)
          .map(([pi]) => parseInt(pi, 10));

        if (foundIndices.length > 0) {
          for (const idx of foundIndices) {
            if (!state.foundPlayers.includes(idx)) {
              state.foundPlayers.push(idx);
              this.addSystemChat(room, `👀 FOUND! ${room.players[idx].name} was discovered in ${spot.name}!`);
            }
          }
        } else {
          state.lastEventText = `Nothing here in ${spot.name}! (${state.searchesLeft} flashlight beams left)`;
        }

        const nonSeekers = room.players.map((_, idx) => idx).filter(idx => idx !== state.seekerIndex);
        const allFound = nonSeekers.every(idx => state.foundPlayers.includes(idx));

        if (allFound) {
          state.winner = state.seekerIndex;
          room.status = 'gameover';
          room.players[state.seekerIndex].score += 120;
          this.addSystemChat(room, `🏆 ${room.players[state.seekerIndex].name} found ALL hiders! Victory!`);
        } else if (state.searchesLeft <= 0) {
          state.winner = 'hiders';
          room.status = 'gameover';
          nonSeekers.forEach(idx => {
            if (!state.foundPlayers.includes(idx)) {
              room.players[idx].score += 100;
            }
          });
          this.addSystemChat(room, `👻 The hiders stayed hidden and escaped the Haunted Manor! Hiders Win!`);
        }
      }
    }
  }
}
