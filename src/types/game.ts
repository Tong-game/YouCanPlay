export type GameId =
  | 'connect4'
  | 'battleship'
  | 'word_bomb'
  | 'draw_guess'
  | 'tictactoe'
  | 'chess'
  | 'uno'
  | 'monopoly'
  | 'hide_seek';

export type PlayMode = 'online' | 'pass_and_play' | 'vs_bot';

export type BotDifficulty = 'easy' | 'medium' | 'master';

export interface Player {
  id: string;
  name: string;
  avatar: string; // emoji or avatar id
  color: string;
  isHost?: boolean;
  isReady?: boolean;
  score: number;
  isOnline?: boolean;
  isBot?: boolean;
  botDifficulty?: BotDifficulty;
}

// Connect Four Types
export interface ConnectFourState {
  grid: (number | null)[][]; // 6 rows x 7 cols, value is player index (0 or 1)
  currentTurn: number; // 0 or 1
  winner: number | null | 'draw';
  winningCells: [number, number][] | null;
  movesCount: number;
  lastMove?: { row: number; col: number; player: number };
}

// Battleship Types
export type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer';

export interface Ship {
  id: string;
  type: ShipType;
  size: number;
  name: string;
  positions: { r: number; c: number }[];
  hits: number;
  sunk: boolean;
}

export type CellStatus = 'empty' | 'ship' | 'hit' | 'miss';

export interface BattleshipPlayerBoard {
  playerId: string;
  ships: Ship[];
  placedAll: boolean;
  grid: CellStatus[][]; // 10x10
  attacksReceived: { r: number; c: number; result: 'hit' | 'miss' | 'sunk'; shipName?: string }[];
}

export interface BattleshipState {
  phase: 'placement' | 'battle' | 'gameover';
  currentTurn: number; // player index 0 or 1
  boards: [BattleshipPlayerBoard, BattleshipPlayerBoard];
  winner: number | null;
  lastAttack?: {
    playerIndex: number;
    r: number;
    c: number;
    result: 'hit' | 'miss' | 'sunk';
    shipName?: string;
  };
}

// Word Bomb Types
export interface WordBombState {
  bombTimer: number; // remaining seconds
  prompt: string; // e.g. "BL", "STR", "ING"
  currentTurn: number;
  playerLives: number[]; // remaining lives per player
  usedWords: string[];
  lastWordSubmitted?: { word: string; player: number; valid: boolean; reason?: string };
  winner: number | null;
  round: number;
}

// Draw & Guess Types
export interface DrawStroke {
  color: string;
  size: number;
  points: { x: number; y: number }[];
  isEraser?: boolean;
}

export interface GuessMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  isCorrect?: boolean;
  timestamp: number;
}

export interface DrawGuessState {
  currentDrawer: number; // player index
  secretWord: string;
  hint: string;
  round: number;
  totalRounds: number;
  roundTimer: number;
  status: 'choosing' | 'drawing' | 'round_over' | 'game_over';
  strokes: DrawStroke[];
  wordOptions?: string[];
  guesses: GuessMessage[];
  guessedPlayers: string[];
  winner: number | null;
}

// Tic Tac Toe Types
export interface TicTacToeState {
  boardSize: 3 | 5;
  grid: (number | null)[][];
  currentTurn: number;
  winner: number | null | 'draw';
  winningLine: [number, number][] | null;
  movesCount: number;
}

// --- NEW GAME: CHESS TYPES ---
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type PieceColor = 'w' | 'b';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface ChessState {
  board: (ChessPiece | null)[][]; // 8x8
  currentTurn: PieceColor;
  winner: PieceColor | 'draw' | null;
  isCheck: boolean;
  capturedWhite: PieceType[]; // pieces captured by black
  capturedBlack: PieceType[]; // pieces captured by white
  movesCount: number;
  lastMove?: { from: [number, number]; to: [number, number]; piece: ChessPiece };
}

// --- NEW GAME: UNO TYPES ---
export type UnoColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type UnoCardType = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

export interface UnoCard {
  id: string;
  color: UnoColor;
  value: string;
  symbol: string;
  type: UnoCardType;
}

export interface UnoState {
  hands: UnoCard[][];
  discardPile: UnoCard[];
  drawPileCount: number;
  currentColor: 'red' | 'blue' | 'green' | 'yellow';
  currentTurn: number;
  direction: 1 | -1;
  winner: number | null;
  pendingWild: boolean;
  unoCalled: Record<number, boolean>;
  lastActionText: string;
}

// --- NEW GAME: MONOPOLY TYPES ---
export type TileType = 'go' | 'property' | 'jail' | 'chance' | 'tax' | 'parking';

export interface MonopolyTile {
  id: number;
  name: string;
  type: TileType;
  price?: number;
  rent?: number;
  owner?: number; // player index
  color?: string;
  houses?: number;
}

export interface MonopolyState {
  tiles: MonopolyTile[];
  playerCash: number[];
  playerPositions: number[];
  inJail: boolean[];
  currentTurn: number;
  lastDice: [number, number];
  winner: number | null;
  phase: 'roll' | 'action' | 'gameover';
  log: string[];
}

// --- NEW GAME: HIDE AND SEEK TYPES ---
export interface HidingSpot {
  id: string;
  name: string;
  room: string;
  icon: string;
  noiseLevel: number; // 0 - 100
  isSearched: boolean;
}

export interface HideSeekState {
  phase: 'hiding' | 'seeking' | 'round_end' | 'gameover';
  seekerIndex: number;
  round: number;
  maxRounds: number;
  spots: HidingSpot[];
  playerHidingSpots: Record<number, string>; // playerIndex -> spotId
  foundPlayers: number[];
  searchesLeft: number;
  lastEventText: string;
  winner: number | 'hiders' | null;
}

// Union Game State
export type ActiveGameState =
  | { type: 'connect4'; data: ConnectFourState }
  | { type: 'battleship'; data: BattleshipState }
  | { type: 'word_bomb'; data: WordBombState }
  | { type: 'draw_guess'; data: DrawGuessState }
  | { type: 'tictactoe'; data: TicTacToeState }
  | { type: 'chess'; data: ChessState }
  | { type: 'uno'; data: UnoState }
  | { type: 'monopoly'; data: MonopolyState }
  | { type: 'hide_seek'; data: HideSeekState };

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface GlobalChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  avatar: string;
  color?: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  roomInvite?: {
    roomCode: string;
    gameId: GameId;
    gameName: string;
  };
}

export interface Room {
  code: string;
  name: string;
  hostId: string;
  selectedGame: GameId;
  status: 'lobby' | 'playing' | 'gameover';
  players: Player[];
  gameState: ActiveGameState | null;
  chat: ChatMessage[];
  maxPlayers: number;
  createdAt: number;
}

// Socket Actions
export type ClientAction =
  | { type: 'join_room'; roomCode: string; player: { id: string; name: string; avatar: string; color: string } }
  | { type: 'leave_room' }
  | { type: 'select_game'; gameId: GameId }
  | { type: 'toggle_ready' }
  | { type: 'start_game' }
  | { type: 'game_action'; action: any }
  | { type: 'send_chat'; text: string }
  | { type: 'send_reaction'; emoji: string }
  | { type: 'send_global_chat'; text: string; player: { id: string; name: string; avatar: string; color: string }; roomInvite?: { roomCode: string; gameId: GameId; gameName: string } }
  | { type: 'get_global_chat' }
  | { type: 'restart_game' }
  | { type: 'return_to_lobby' };

export type ServerMessage =
  | { type: 'room_state'; room: Room }
  | { type: 'error'; message: string }
  | { type: 'chat_message'; message: ChatMessage }
  | { type: 'global_chat_history'; messages: GlobalChatMessage[] }
  | { type: 'global_chat_message'; message: GlobalChatMessage }
  | { type: 'online_count'; count: number }
  | { type: 'reaction'; emoji: string; senderName: string; senderId: string }
  | { type: 'player_joined'; player: Player }
  | { type: 'player_left'; playerId: string }
  | { type: 'game_started'; gameState: ActiveGameState }
  | { type: 'game_updated'; gameState: ActiveGameState }
  | { type: 'pong' };
