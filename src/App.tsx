import React, { useState, useEffect, useRef } from 'react';
import {
  PlayMode,
  Player,
  Room,
  GameId,
  ActiveGameState,
  ChatMessage,
  GlobalChatMessage,
  ConnectFourState,
  BattleshipState,
  WordBombState,
  DrawGuessState,
  TicTacToeState,
  ChessState,
  UnoState,
  MonopolyState,
  HideSeekState,
  CellStatus,
} from './types/game';
import { socket } from './services/socket';
import { sounds } from './services/sound';
import {
  SYLLABLE_PROMPTS,
  COMMON_DICTIONARY,
  getBotConnectFourMove,
  getBotWord,
  getRandomWordOptions,
  generateHint,
  createInitialChessState,
  createInitialUnoState,
  createInitialMonopolyState,
  createInitialHideSeekState,
  getBotChessMove,
  getBotUnoMove,
  createUnoDeck,
} from './services/gameData';
import { Navbar } from './components/Navbar';
import { Lobby, GAME_CATALOG } from './components/Lobby';
import { OfflineSetup } from './components/OfflineSetup';
import { RoomChat } from './components/RoomChat';
import { ShareModal } from './components/ShareModal';
import { GameOverModal } from './components/GameOverModal';
import { ConnectFour } from './components/games/ConnectFour';
import { Battleship } from './components/games/Battleship';
import { WordBomb } from './components/games/WordBomb';
import { DrawAndGuess } from './components/games/DrawAndGuess';
import { TicTacToe } from './components/games/TicTacToe';
import { ChessGame } from './components/games/ChessGame';
import { UnoGame } from './components/games/UnoGame';
import { MonopolyGame } from './components/games/MonopolyGame';
import { HideAndSeekGame } from './components/games/HideAndSeekGame';
import { LeaderboardModal } from './components/LeaderboardModal';
import { leaderboardService } from './services/leaderboard';
import confetti from 'canvas-confetti';

export default function App() {
  const [playMode, setPlayMode] = useState<PlayMode>('online');

  // Player state
  const [currentPlayer, setCurrentPlayer] = useState<Player>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('playparty_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    const randId = `p-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
    return {
      id: randId,
      name: 'Player',
      avatar: '🦊',
      color: '#6366f1',
      score: 0,
    };
  });

  // Online Room State
  const [room, setRoom] = useState<Room | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [globalChat, setGlobalChat] = useState<GlobalChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Offline Game State
  const [offlinePlayers, setOfflinePlayers] = useState<Player[]>([]);
  const [offlineSelectedGame, setOfflineSelectedGame] = useState<GameId>('connect4');
  const [offlineGameState, setOfflineGameState] = useState<ActiveGameState | null>(null);
  const [offlineStatus, setOfflineStatus] = useState<'lobby' | 'playing' | 'gameover'>('lobby');

  // Floating Reactions
  const [reactions, setReactions] = useState<{ id: string; emoji: string; sender: string; x: number }[]>([]);

  // Timer Ref for Word Bomb offline loop
  const offlineBombTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Local Leaderboard state
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboardResult, setLeaderboardResult] = useState<{
    isNewHighScore: boolean;
    isPersonalBest: boolean;
    rank: number;
  } | null>(null);

  // Helper to record offline high score upon game completion
  const recordOfflineWin = (gameId: GameId, winnerIdx: number | null, details?: string) => {
    if (winnerIdx === null || winnerIdx === undefined || winnerIdx < 0 || winnerIdx >= offlinePlayers.length) {
      setLeaderboardResult(null);
      return;
    }
    const winnerPlayer = offlinePlayers[winnerIdx];
    const result = leaderboardService.recordScore({
      playerName: winnerPlayer.name,
      playerAvatar: winnerPlayer.avatar,
      gameId,
      mode: playMode === 'vs_bot' ? 'vs_bot' : 'pass_and_play',
      score: winnerPlayer.score,
      botDifficulty: winnerPlayer.botDifficulty,
      details: details || `${winnerPlayer.score} pts victory`,
      isBot: winnerPlayer.isBot,
    });
    setLeaderboardResult(result);
  };

  // Save user profile changes
  const handleUpdatePlayer = (updated: Partial<Player>) => {
    const newPlayer = { ...currentPlayer, ...updated };
    setCurrentPlayer(newPlayer);
    if (typeof window !== 'undefined') {
      localStorage.setItem('playparty_user', JSON.stringify(newPlayer));
    }
  };

  // Connect to WebSocket on mount
  useEffect(() => {
    socket.connect().then(connected => {
      setSocketConnected(connected);
    });

    const unsubRoom = socket.on('room_state', (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    const unsubGlobalHistory = socket.on('global_chat_history', (messages: GlobalChatMessage[]) => {
      setGlobalChat(messages);
    });

    const unsubGlobalMessage = socket.on('global_chat_message', (message: GlobalChatMessage) => {
      setGlobalChat(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    const unsubOnlineCount = socket.on('online_count', (count: number) => {
      setOnlineCount(count);
    });

    const unsubReaction = socket.on('reaction', (data: any) => {
      triggerReactionParticle(data.emoji, data.senderName);
    });

    const unsubConn = socket.on('connection_status', (status: any) => {
      setSocketConnected(status.connected);
    });

    // Check query param for room code (e.g. ?room=ABCD) - seamless open & play anywhere!
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        setPlayMode('online');
        socket.joinRoom(roomParam.toUpperCase(), currentPlayer);
      }
    }

    return () => {
      unsubRoom();
      unsubGlobalHistory();
      unsubGlobalMessage();
      unsubOnlineCount();
      unsubReaction();
      unsubConn();
    };
  }, []);

  const triggerReactionParticle = (emoji: string, sender: string) => {
    sounds.playClick();
    const id = `rx-${Date.now()}-${Math.random()}`;
    const x = 30 + Math.random() * 40; // 30% - 70% of screen width
    setReactions(prev => [...prev, { id, emoji, sender, x }]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2500);
  };

  // Clean offline timers on unmount or game change
  useEffect(() => {
    return () => {
      if (offlineBombTimerRef.current) clearInterval(offlineBombTimerRef.current);
    };
  }, []);

  // --- ONLINE ACTIONS ---
  const handleCreateRoom = async (gameId: GameId, roomName?: string) => {
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: currentPlayer, roomName, game: gameId }),
      });
      if (res.ok) {
        const data = await res.json();
        socket.joinRoom(data.room.code, currentPlayer);
      }
    } catch (err) {
      console.error('Create room error:', err);
    }
  };

  const handleJoinRoom = (code: string) => {
    socket.joinRoom(code.toUpperCase(), currentPlayer);
  };

  const handleSelectGame = (gameId: GameId) => {
    socket.send({ type: 'select_game', gameId });
  };

  const handleToggleReady = () => {
    socket.send({ type: 'toggle_ready' });
  };

  const handleStartOnlineGame = () => {
    socket.send({ type: 'start_game' });
  };

  const handleOnlineGameAction = (action: any) => {
    socket.send({ type: 'game_action', action });
  };

  const handleRematch = () => {
    if (playMode === 'online') {
      socket.send({ type: 'restart_game' });
    } else {
      handleStartOfflineGame(offlineSelectedGame, offlinePlayers);
    }
  };

  const handleReturnToLobby = () => {
    if (playMode === 'online') {
      socket.send({ type: 'return_to_lobby' });
    } else {
      if (offlineBombTimerRef.current) clearInterval(offlineBombTimerRef.current);
      setOfflineStatus('lobby');
      setOfflineGameState(null);
    }
  };

  const handleLeaveRoom = () => {
    socket.leaveRoom();
    setRoom(null);
  };

  const handleSendChat = (text: string) => {
    socket.send({ type: 'send_chat', text });
  };

  const handleSendGlobalChat = (text: string, roomInvite?: { roomCode: string; gameId: GameId; gameName: string }) => {
    socket.send({
      type: 'send_global_chat',
      text,
      player: {
        id: currentPlayer.id,
        name: currentPlayer.name,
        avatar: currentPlayer.avatar,
        color: currentPlayer.color,
      },
      roomInvite,
    });
  };

  const handleBroadcastRoomInvite = (roomCode: string, gameId: GameId) => {
    const gameInfo = GAME_CATALOG.find(g => g.id === gameId);
    handleSendGlobalChat(
      `Hey everyone! Come join my ${gameInfo?.name || gameId} game! 🎮 Click to join:`,
      {
        roomCode,
        gameId,
        gameName: gameInfo?.name || gameId,
      }
    );
  };

  const handleSendReaction = (emoji: string) => {
    triggerReactionParticle(emoji, currentPlayer.name);
    if (playMode === 'online' && room) {
      socket.send({ type: 'send_reaction', emoji });
    }
  };

  // --- OFFLINE GAME LAUNCHER & BOT HANDLERS ---
  const handleStartOfflineGame = (gameId: GameId, players: Player[]) => {
    if (offlineBombTimerRef.current) clearInterval(offlineBombTimerRef.current);
    setLeaderboardResult(null);

    setOfflineSelectedGame(gameId);
    setOfflinePlayers(players);
    setOfflineStatus('playing');

    let initialGame: ActiveGameState;
    switch (gameId) {
      case 'connect4': {
        initialGame = {
          type: 'connect4',
          data: {
            grid: Array(6)
              .fill(null)
              .map(() => Array(7).fill(null)),
            currentTurn: 0,
            winner: null,
            winningCells: null,
            movesCount: 0,
          },
        };
        break;
      }
      case 'battleship': {
        const createEmptyBoard = (playerId: string) => ({
          playerId,
          ships: [],
          placedAll: false,
          grid: Array(10)
            .fill(null)
            .map(() => Array(10).fill('empty' as CellStatus)),
          attacksReceived: [],
        });
        initialGame = {
          type: 'battleship',
          data: {
            phase: 'placement',
            currentTurn: 0,
            boards: [createEmptyBoard(players[0]?.id || 'p1'), createEmptyBoard(players[1]?.id || 'p2')],
            winner: null,
          },
        };
        break;
      }
      case 'word_bomb': {
        const prompt = SYLLABLE_PROMPTS[Math.floor(Math.random() * SYLLABLE_PROMPTS.length)];
        initialGame = {
          type: 'word_bomb',
          data: {
            bombTimer: 12,
            prompt,
            currentTurn: 0,
            playerLives: players.map(() => 3),
            usedWords: [],
            winner: null,
            round: 1,
          },
        };
        break;
      }
      case 'draw_guess': {
        const wordOptions = getRandomWordOptions(3).map(w => w.word);
        initialGame = {
          type: 'draw_guess',
          data: {
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
          },
        };
        break;
      }
      case 'tictactoe': {
        initialGame = {
          type: 'tictactoe',
          data: {
            boardSize: 3,
            grid: Array(3)
              .fill(null)
              .map(() => Array(3).fill(null)),
            currentTurn: 0,
            winner: null,
            winningLine: null,
            movesCount: 0,
          },
        };
        break;
      }
    }

    setOfflineGameState(initialGame);

    // If Word Bomb offline, start ticking loop
    if (gameId === 'word_bomb') {
      startOfflineWordBombLoop();
    }
  };

  const startOfflineWordBombLoop = () => {
    if (offlineBombTimerRef.current) clearInterval(offlineBombTimerRef.current);

    offlineBombTimerRef.current = setInterval(() => {
      setOfflineGameState(prev => {
        if (!prev || prev.type !== 'word_bomb' || prev.data.winner !== null) return prev;
        const wb = { ...prev.data };
        wb.bombTimer--;

        if (wb.bombTimer <= 0) {
          sounds.playExplosion();
          wb.playerLives = [...wb.playerLives];
          wb.playerLives[wb.currentTurn]--;

          const alive = wb.playerLives.map((l, idx) => ({ l, idx })).filter(x => x.l > 0);
          if (alive.length <= 1) {
            const winnerIdx = alive.length === 1 ? alive[0].idx : 0;
            wb.winner = winnerIdx;
            setOfflineStatus('gameover');
            offlinePlayers[winnerIdx].score += 100;
            if (offlineBombTimerRef.current) clearInterval(offlineBombTimerRef.current);
            recordOfflineWin('word_bomb', winnerIdx, `Survived ${wb.round} rounds`);
          } else {
            wb.prompt = SYLLABLE_PROMPTS[Math.floor(Math.random() * SYLLABLE_PROMPTS.length)];
            wb.bombTimer = Math.max(7, 12 - Math.floor(wb.round / 3));
            wb.currentTurn = (wb.currentTurn + 1) % wb.playerLives.length;
          }
        }

        return { ...prev, data: wb };
      });
    }, 1000);
  };

  // Bot Turn Automation for Offline
  useEffect(() => {
    if (playMode !== 'vs_bot' || !offlineGameState || offlineStatus !== 'playing') return;

    if (offlineGameState.type === 'connect4') {
      const c4 = offlineGameState.data;
      if (c4.currentTurn === 1 && c4.winner === null) {
        const timer = setTimeout(() => {
          const botCol = getBotConnectFourMove(c4.grid, 1, offlinePlayers[1]?.botDifficulty || 'medium');
          handleOfflineConnectFourMove(botCol);
        }, 600);
        return () => clearTimeout(timer);
      }
    } else if (offlineGameState.type === 'battleship') {
      const bs = offlineGameState.data;
      // Auto place bot ships if in placement phase
      if (bs.phase === 'placement' && !bs.boards[1].placedAll) {
        // Auto deploy bot
        const botShips = generateBotShips();
        bs.boards[1].ships = botShips;
        bs.boards[1].placedAll = true;
        for (const s of botShips) {
          for (const pos of s.positions) {
            bs.boards[1].grid[pos.r][pos.c] = 'ship';
          }
        }
        if (bs.boards[0].placedAll) {
          bs.phase = 'battle';
        }
        setOfflineGameState({ ...offlineGameState });
      } else if (bs.phase === 'battle' && bs.currentTurn === 1 && bs.winner === null) {
        // Bot attack
        const timer = setTimeout(() => {
          handleBotBattleshipAttack();
        }, 900);
        return () => clearTimeout(timer);
      }
    } else if (offlineGameState.type === 'word_bomb') {
      const wb = offlineGameState.data;
      if (wb.currentTurn === 1 && wb.winner === null) {
        const timer = setTimeout(() => {
          const botWord = getBotWord(wb.prompt, wb.usedWords);
          if (botWord) {
            handleOfflineWordBombSubmit(botWord);
          }
        }, 2200);
        return () => clearTimeout(timer);
      }
    }
  }, [offlineGameState, playMode]);

  // Offline Connect Four Move Handler
  const handleOfflineConnectFourMove = (col: number) => {
    if (!offlineGameState || offlineGameState.type !== 'connect4') return;
    const c4 = { ...offlineGameState.data };
    if (c4.winner !== null || c4.grid[0][col] !== null) return;

    let dropRow = -1;
    for (let r = 5; r >= 0; r--) {
      if (c4.grid[r][col] === null) {
        dropRow = r;
        break;
      }
    }
    if (dropRow === -1) return;

    const pIdx = c4.currentTurn;
    const newGrid = c4.grid.map(row => [...row]);
    newGrid[dropRow][col] = pIdx;
    c4.grid = newGrid;
    c4.movesCount++;
    c4.lastMove = { row: dropRow, col, player: pIdx };

    // Check win
    const winCells = checkConnectFourWinOffline(newGrid, dropRow, col, pIdx);
    if (winCells) {
      c4.winner = pIdx;
      c4.winningCells = winCells;
      setOfflineStatus('gameover');
      offlinePlayers[pIdx].score += 100;
      recordOfflineWin('connect4', pIdx, `${c4.movesCount} turns tactical win`);
    } else if (c4.movesCount >= 42) {
      c4.winner = 'draw';
      setOfflineStatus('gameover');
    } else {
      c4.currentTurn = pIdx === 0 ? 1 : 0;
    }

    setOfflineGameState({ type: 'connect4', data: c4 });
  };

  const checkConnectFourWinOffline = (grid: (number | null)[][], r: number, c: number, p: number): [number, number][] | null => {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (const [dr, dc] of directions) {
      const line: [number, number][] = [[r, c]];
      for (let s = 1; s <= 3; s++) {
        const nr = r + dr * s;
        const nc = c + dc * s;
        if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && grid[nr][nc] === p) line.push([nr, nc]);
        else break;
      }
      for (let s = 1; s <= 3; s++) {
        const nr = r - dr * s;
        const nc = c - dc * s;
        if (nr >= 0 && nr < 6 && nc >= 0 && nc < 7 && grid[nr][nc] === p) line.push([nr, nc]);
        else break;
      }
      if (line.length >= 4) return line;
    }
    return null;
  };

  // Offline Word Bomb Submit Handler
  const handleOfflineWordBombSubmit = (word: string) => {
    if (!offlineGameState || offlineGameState.type !== 'word_bomb') return;
    const wb = { ...offlineGameState.data };
    const rawWord = word.trim().toLowerCase();
    const prompt = wb.prompt.toLowerCase();

    let valid = true;
    let reason = '';
    if (!rawWord.includes(prompt)) {
      valid = false;
      reason = `Must contain "${wb.prompt.toUpperCase()}"`;
    } else if (rawWord.length < 3) {
      valid = false;
      reason = 'Word too short';
    } else if (wb.usedWords.includes(rawWord)) {
      valid = false;
      reason = 'Already used';
    } else if (!COMMON_DICTIONARY.has(rawWord)) {
      valid = false;
      reason = 'Word not recognized';
    }

    wb.lastWordSubmitted = { word: rawWord.toUpperCase(), player: wb.currentTurn, valid, reason };

    if (valid) {
      sounds.playCorrect();
      wb.usedWords = [...wb.usedWords, rawWord];
      offlinePlayers[wb.currentTurn].score += 20;
      wb.prompt = SYLLABLE_PROMPTS[Math.floor(Math.random() * SYLLABLE_PROMPTS.length)];
      wb.bombTimer = Math.max(7, 12 - Math.floor(wb.round / 3));
      wb.round++;

      let next = (wb.currentTurn + 1) % offlinePlayers.length;
      while (wb.playerLives[next] <= 0) {
        next = (next + 1) % offlinePlayers.length;
      }
      wb.currentTurn = next;
    } else {
      sounds.playWrong();
    }

    setOfflineGameState({ type: 'word_bomb', data: wb });
  };

  // Battleship bot random ship generator
  const generateBotShips = () => {
    const configs = [
      { type: 'carrier', name: 'Carrier', size: 5 },
      { type: 'battleship', name: 'Battleship', size: 4 },
      { type: 'cruiser', name: 'Cruiser', size: 3 },
      { type: 'submarine', name: 'Submarine', size: 3 },
      { type: 'destroyer', name: 'Destroyer', size: 2 },
    ];
    const ships: any[] = [];
    const occ = new Set<string>();

    for (const conf of configs) {
      let placed = false;
      while (!placed) {
        const isH = Math.random() > 0.5;
        const r = Math.floor(Math.random() * (isH ? 10 : 10 - conf.size));
        const c = Math.floor(Math.random() * (isH ? 10 - conf.size : 10));
        const pos: { r: number; c: number }[] = [];
        let coll = false;
        for (let i = 0; i < conf.size; i++) {
          const pr = isH ? r : r + i;
          const pc = isH ? c + i : c;
          if (occ.has(`${pr},${pc}`)) {
            coll = true;
            break;
          }
          pos.push({ r: pr, c: pc });
        }
        if (!coll) {
          pos.forEach(p => occ.add(`${p.r},${p.c}`));
          ships.push({
            id: `bot-${conf.type}`,
            type: conf.type,
            name: conf.name,
            size: conf.size,
            positions: pos,
            hits: 0,
            sunk: false,
          });
          placed = true;
        }
      }
    }
    return ships;
  };

  const handleBotBattleshipAttack = () => {
    if (!offlineGameState || offlineGameState.type !== 'battleship') return;
    const bs = { ...offlineGameState.data };
    const humanBoard = bs.boards[0];

    // Pick random unattacked cell
    let r = Math.floor(Math.random() * 10);
    let c = Math.floor(Math.random() * 10);
    let attempts = 0;
    while ((humanBoard.grid[r][c] === 'hit' || humanBoard.grid[r][c] === 'miss') && attempts < 100) {
      r = Math.floor(Math.random() * 10);
      c = Math.floor(Math.random() * 10);
      attempts++;
    }

    const cell = humanBoard.grid[r][c];
    let result: 'hit' | 'miss' | 'sunk' = 'miss';
    let sunkName: string | undefined;

    if (cell === 'ship') {
      humanBoard.grid[r][c] = 'hit';
      result = 'hit';
      sounds.playHit();
      const hitShip = humanBoard.ships.find(s => s.positions.some(p => p.r === r && p.c === c));
      if (hitShip) {
        hitShip.hits++;
        if (hitShip.hits >= hitShip.size) {
          hitShip.sunk = true;
          result = 'sunk';
          sunkName = hitShip.name;
        }
      }
    } else {
      humanBoard.grid[r][c] = 'miss';
      sounds.playMiss();
    }

    humanBoard.attacksReceived.push({ r, c, result, shipName: sunkName });
    bs.lastAttack = { playerIndex: 1, r, c, result, shipName: sunkName };

    const allSunk = humanBoard.ships.every(s => s.sunk);
    if (allSunk) {
      bs.phase = 'gameover';
      bs.winner = 1;
      setOfflineStatus('gameover');
      offlinePlayers[1].score += 150;
      recordOfflineWin('battleship', 1, 'AI Bot sunk human fleet');
    } else {
      bs.currentTurn = 0;
    }

    setOfflineGameState({ type: 'battleship', data: bs });
  };

  // Battleship offline action handler for player
  const handleOfflineBattleshipAction = (action: any) => {
    if (!offlineGameState || offlineGameState.type !== 'battleship') return;
    const bs = { ...offlineGameState.data };
    const pIdx = bs.currentTurn;

    if (action.subType === 'place_ships') {
      const b = bs.boards[pIdx];
      b.ships = action.ships;
      b.placedAll = true;
      b.grid = Array(10)
        .fill(null)
        .map(() => Array(10).fill('empty' as CellStatus));
      for (const s of b.ships) {
        for (const pos of s.positions) {
          b.grid[pos.r][pos.c] = 'ship';
        }
      }

      if (playMode === 'vs_bot') {
        // Auto place bot fleet
        const botShips = generateBotShips();
        bs.boards[1].ships = botShips;
        bs.boards[1].placedAll = true;
        for (const s of botShips) {
          for (const pos of s.positions) {
            bs.boards[1].grid[pos.r][pos.c] = 'ship';
          }
        }
        bs.phase = 'battle';
      } else {
        // Pass and play: wait for both
        if (bs.boards[0].placedAll && bs.boards[1].placedAll) {
          bs.phase = 'battle';
        } else {
          bs.currentTurn = 1; // pass to p2
        }
      }
    } else if (action.subType === 'attack' && bs.phase === 'battle') {
      const oppIdx = pIdx === 0 ? 1 : 0;
      const oppBoard = bs.boards[oppIdx];
      const { r, c } = action;

      let result: 'hit' | 'miss' | 'sunk' = 'miss';
      let sunkName: string | undefined;

      if (oppBoard.grid[r][c] === 'ship') {
        oppBoard.grid[r][c] = 'hit';
        result = 'hit';
        const hitShip = oppBoard.ships.find(s => s.positions.some(p => p.r === r && p.c === c));
        if (hitShip) {
          hitShip.hits++;
          if (hitShip.hits >= hitShip.size) {
            hitShip.sunk = true;
            result = 'sunk';
            sunkName = hitShip.name;
          }
        }
      } else {
        oppBoard.grid[r][c] = 'miss';
      }

      oppBoard.attacksReceived.push({ r, c, result, shipName: sunkName });
      bs.lastAttack = { playerIndex: pIdx, r, c, result, shipName: sunkName };

      const allSunk = oppBoard.ships.every(s => s.sunk);
      if (allSunk) {
        bs.phase = 'gameover';
        bs.winner = pIdx;
        setOfflineStatus('gameover');
        offlinePlayers[pIdx].score += 150;
        recordOfflineWin('battleship', pIdx, 'Sunk enemy armada');
      } else {
        bs.currentTurn = oppIdx;
      }
    }

    setOfflineGameState({ type: 'battleship', data: bs });
  };

  // Tic Tac Toe offline move handler
  const handleOfflineTicTacToeMove = (r: number, c: number) => {
    if (!offlineGameState || offlineGameState.type !== 'tictactoe') return;
    const ttt = { ...offlineGameState.data };
    if (ttt.winner !== null || ttt.grid[r][c] !== null) return;

    const pIdx = ttt.currentTurn;
    ttt.grid[r][c] = pIdx;
    ttt.movesCount++;

    // Win check
    const winLine = checkTicTacToeWinOffline(ttt.grid, r, c, pIdx, ttt.boardSize);
    if (winLine) {
      ttt.winner = pIdx;
      ttt.winningLine = winLine;
      setOfflineStatus('gameover');
      offlinePlayers[pIdx].score += 100;
      recordOfflineWin('tictactoe', pIdx, 'Neon line victory');
    } else if (ttt.movesCount >= ttt.boardSize * ttt.boardSize) {
      ttt.winner = 'draw';
      setOfflineStatus('gameover');
    } else {
      ttt.currentTurn = pIdx === 0 ? 1 : 0;
    }

    setOfflineGameState({ type: 'tictactoe', data: ttt });
  };

  const checkTicTacToeWinOffline = (grid: (number | null)[][], r: number, c: number, p: number, size: number) => {
    let winRow = true;
    for (let j = 0; j < size; j++) {
      if (grid[r][j] !== p) winRow = false;
    }
    if (winRow) return Array.from({ length: size }, (_, j) => [r, j] as [number, number]);

    let winCol = true;
    for (let i = 0; i < size; i++) {
      if (grid[i][c] !== p) winCol = false;
    }
    if (winCol) return Array.from({ length: size }, (_, i) => [i, c] as [number, number]);

    if (r === c) {
      let winD = true;
      for (let i = 0; i < size; i++) {
        if (grid[i][i] !== p) winD = false;
      }
      if (winD) return Array.from({ length: size }, (_, i) => [i, i] as [number, number]);
    }

    if (r + c === size - 1) {
      let winAnti = true;
      for (let i = 0; i < size; i++) {
        if (grid[i][size - 1 - i] !== p) winAnti = false;
      }
      if (winAnti) return Array.from({ length: size }, (_, i) => [i, size - 1 - i] as [number, number]);
    }

    return null;
  };

  // Draw & Guess offline action handler
  const handleOfflineDrawGuessAction = (action: any) => {
    if (!offlineGameState || offlineGameState.type !== 'draw_guess') return;
    const dg = { ...offlineGameState.data };

    if (action.subType === 'choose_word') {
      dg.secretWord = action.word.toUpperCase();
      dg.hint = generateHint(dg.secretWord);
      dg.status = 'drawing';
    } else if (action.subType === 'draw_stroke') {
      dg.strokes = [...dg.strokes, action.stroke];
    } else if (action.subType === 'clear_canvas') {
      dg.strokes = [];
    } else if (action.subType === 'undo_stroke') {
      dg.strokes.pop();
    } else if (action.subType === 'guess_word') {
      const guess = (action.guess || '').trim().toUpperCase();
      const isCorrect = guess === dg.secretWord;
      dg.guesses.push({
        id: `g-${Date.now()}`,
        playerId: 'guesser',
        playerName: 'Guesser',
        text: isCorrect ? '🎉 GUESSED THE WORD!' : guess,
        isCorrect,
        timestamp: Date.now(),
      });
      if (isCorrect) {
        sounds.playCorrect();
        dg.status = 'game_over';
        setOfflineStatus('gameover');
        offlinePlayers[dg.currentDrawer].score += 100;
        recordOfflineWin('draw_guess', dg.currentDrawer, `Word "${dg.secretWord}" solved`);
      }
    }
    setOfflineGameState({ type: 'draw_guess', data: dg });
  };

  // Determine active view & game
  const isOnlineActive = playMode === 'online';
  const activeRoom = isOnlineActive ? room : null;
  const isPlaying = isOnlineActive
    ? room && room.status === 'playing' && room.gameState !== null
    : offlineStatus === 'playing' && offlineGameState !== null;

  const currentActiveGameState = isOnlineActive ? room?.gameState : offlineGameState;
  const activePlayers = isOnlineActive ? room?.players || [currentPlayer] : offlinePlayers;

  // Winner calculation for Game Over Modal
  const isGameOver = isOnlineActive ? room?.status === 'gameover' : offlineStatus === 'gameover';
  let gameWinner: Player | 'draw' | null = null;
  if (isGameOver && currentActiveGameState) {
    if (currentActiveGameState.type === 'connect4') {
      const w = currentActiveGameState.data.winner;
      gameWinner = w === 'draw' ? 'draw' : typeof w === 'number' ? activePlayers[w] : null;
    } else if (currentActiveGameState.type === 'battleship') {
      const w = currentActiveGameState.data.winner;
      gameWinner = typeof w === 'number' ? activePlayers[w] : null;
    } else if (currentActiveGameState.type === 'word_bomb') {
      const w = currentActiveGameState.data.winner;
      gameWinner = typeof w === 'number' ? activePlayers[w] : null;
    } else if (currentActiveGameState.type === 'tictactoe') {
      const w = currentActiveGameState.data.winner;
      gameWinner = w === 'draw' ? 'draw' : typeof w === 'number' ? activePlayers[w] : null;
    } else if (currentActiveGameState.type === 'draw_guess') {
      gameWinner = activePlayers[currentActiveGameState.data.currentDrawer];
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-12">
      {/* Top Navbar */}
      <Navbar
        mode={playMode}
        onSelectMode={mode => {
          setPlayMode(mode);
          if (mode !== 'online') {
            setOfflineStatus('lobby');
          }
        }}
        currentPlayer={currentPlayer}
        onUpdatePlayer={handleUpdatePlayer}
        activeRoomCode={room?.code}
        onLeaveRoom={handleLeaveRoom}
        onlineCount={onlineCount}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Floating Animated Reaction Particles */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map(r => (
          <div
            key={r.id}
            style={{ left: `${r.x}%` }}
            className="absolute bottom-16 -translate-x-1/2 flex flex-col items-center animate-bounce transition-all duration-1000"
          >
            <span className="text-4xl drop-shadow-lg filter">{r.emoji}</span>
            <span className="text-[10px] bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded-full font-bold">
              {r.sender}
            </span>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4">
        {/* Mode 1: ONLINE */}
        {playMode === 'online' && (
          <>
            {!isPlaying ? (
              <Lobby
                room={room}
                currentPlayer={currentPlayer}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                onSelectGame={handleSelectGame}
                onToggleReady={handleToggleReady}
                onStartGame={handleStartOnlineGame}
                onLeaveRoom={handleLeaveRoom}
                onOpenShareModal={() => setIsShareModalOpen(true)}
              />
            ) : (
              /* Active Online Game Render */
              <div className="animate-in fade-in py-2">
                {currentActiveGameState?.type === 'connect4' && (
                  <ConnectFour
                    state={currentActiveGameState.data}
                    players={activePlayers}
                    currentPlayer={currentPlayer}
                    mode="online"
                    onMove={col => handleOnlineGameAction({ col })}
                  />
                )}

                {currentActiveGameState?.type === 'battleship' && (
                  <Battleship
                    state={currentActiveGameState.data}
                    players={activePlayers}
                    currentPlayer={currentPlayer}
                    mode="online"
                    onAction={handleOnlineGameAction}
                  />
                )}

                {currentActiveGameState?.type === 'word_bomb' && (
                  <WordBomb
                    state={currentActiveGameState.data}
                    players={activePlayers}
                    currentPlayer={currentPlayer}
                    mode="online"
                    onSubmitWord={word => handleOnlineGameAction({ word })}
                  />
                )}

                {currentActiveGameState?.type === 'draw_guess' && (
                  <DrawAndGuess
                    state={currentActiveGameState.data}
                    players={activePlayers}
                    currentPlayer={currentPlayer}
                    mode="online"
                    onAction={handleOnlineGameAction}
                  />
                )}

                {currentActiveGameState?.type === 'tictactoe' && (
                  <TicTacToe
                    state={currentActiveGameState.data}
                    players={activePlayers}
                    currentPlayer={currentPlayer}
                    mode="online"
                    onMove={(r, c) => handleOnlineGameAction({ r, c })}
                  />
                )}
              </div>
            )}

          </>
        )}

        {/* Mode 2 & 3: OFFLINE PASS & PLAY / VS AI BOT */}
        {(playMode === 'pass_and_play' || playMode === 'vs_bot') && (
          <>
            {offlineStatus === 'lobby' ? (
              <OfflineSetup
                mode={playMode}
                onStartOfflineGame={handleStartOfflineGame}
                onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              />
            ) : (
              /* Active Offline Game Render */
              <div className="animate-in fade-in py-2">
                {/* Back to Setup button */}
                <div className="max-w-xl mx-auto flex items-center justify-between mb-2">
                  <button
                    onClick={handleReturnToLobby}
                    className="text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-medium"
                  >
                    ← Exit to Mode Setup
                  </button>
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                    {playMode === 'pass_and_play' ? 'Couch Pass & Play' : 'Vs AI Bot'}
                  </span>
                </div>

                {offlineGameState?.type === 'connect4' && (
                  <ConnectFour
                    state={offlineGameState.data}
                    players={offlinePlayers}
                    currentPlayer={offlinePlayers[0]}
                    mode={playMode}
                    onMove={handleOfflineConnectFourMove}
                  />
                )}

                {offlineGameState?.type === 'battleship' && (
                  <Battleship
                    state={offlineGameState.data}
                    players={offlinePlayers}
                    currentPlayer={offlinePlayers[0]}
                    mode={playMode}
                    onAction={handleOfflineBattleshipAction}
                  />
                )}

                {offlineGameState?.type === 'word_bomb' && (
                  <WordBomb
                    state={offlineGameState.data}
                    players={offlinePlayers}
                    currentPlayer={offlinePlayers[0]}
                    mode={playMode}
                    onSubmitWord={handleOfflineWordBombSubmit}
                  />
                )}

                {offlineGameState?.type === 'draw_guess' && (
                  <DrawAndGuess
                    state={offlineGameState.data}
                    players={offlinePlayers}
                    currentPlayer={offlinePlayers[0]}
                    mode={playMode}
                    onAction={handleOfflineDrawGuessAction}
                  />
                )}

                {offlineGameState?.type === 'tictactoe' && (
                  <TicTacToe
                    state={offlineGameState.data}
                    players={offlinePlayers}
                    currentPlayer={offlinePlayers[0]}
                    mode={playMode}
                    onMove={handleOfflineTicTacToeMove}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Game Over Celebration Modal */}
      {isGameOver && (
        <GameOverModal
          winner={gameWinner}
          players={activePlayers}
          onRematch={handleRematch}
          onReturnToLobby={handleReturnToLobby}
          isHost={isOnlineActive ? room?.hostId === currentPlayer.id : true}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          leaderboardResult={!isOnlineActive ? leaderboardResult : null}
        />
      )}

      {/* Local Offline Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        defaultGameFilter={offlineSelectedGame}
      />

      {/* Share Room Modal with direct link, Web Share, QR code, and global broadcast */}
      {room && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          room={room}
          onShareToGlobalChat={(code, g) => handleBroadcastRoomInvite(code, g as GameId)}
        />
      )}

      {/* Global Community Lounge & In-Room Chat Hub (Available Everywhere) */}
      <RoomChat
        chat={room?.chat || []}
        globalChat={globalChat}
        currentPlayer={currentPlayer}
        onSendChat={handleSendChat}
        onSendGlobalChat={handleSendGlobalChat}
        onSendReaction={handleSendReaction}
        onJoinRoomFromChat={(code) => handleJoinRoom(code)}
        hasActiveRoom={!!room}
        onlineCount={onlineCount}
      />
    </div>
  );
}
