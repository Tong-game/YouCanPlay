import { GameId, BotDifficulty } from '../types/game';

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  playerAvatar: string;
  gameId: GameId;
  mode: 'pass_and_play' | 'vs_bot';
  score: number;
  date: number;
  botDifficulty?: BotDifficulty;
  details?: string;
  isBot?: boolean;
}

export interface LeaderboardStats {
  totalGames: number;
  totalPoints: number;
  highestScore: number;
  favoriteGame: GameId | null;
  botWinsCount: number;
  passPlayCount: number;
}

const STORAGE_KEY = 'playparty_local_leaderboard';

// Initial starter sample scores so the leaderboard is immediately exciting to view
const DEFAULT_SEED_SCORES: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    playerName: 'Alex',
    playerAvatar: '🦁',
    gameId: 'connect4',
    mode: 'vs_bot',
    score: 180,
    date: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    botDifficulty: 'master',
    details: 'Master Bot Defeated',
  },
  {
    id: 'seed-2',
    playerName: 'Sarah',
    playerAvatar: '🦊',
    gameId: 'word_bomb',
    mode: 'pass_and_play',
    score: 240,
    date: Date.now() - 1000 * 60 * 60 * 18,
    details: '12 Word Chain Streak',
  },
  {
    id: 'seed-3',
    playerName: 'Commander Kai',
    playerAvatar: '🚀',
    gameId: 'battleship',
    mode: 'vs_bot',
    score: 210,
    date: Date.now() - 1000 * 60 * 60 * 10,
    botDifficulty: 'medium',
    details: 'All 5 Enemy Ships Sunk',
  },
  {
    id: 'seed-4',
    playerName: 'Doodler Max',
    playerAvatar: '🎨',
    gameId: 'draw_guess',
    mode: 'pass_and_play',
    score: 150,
    date: Date.now() - 1000 * 60 * 60 * 5,
    details: 'Fast Guess in 6s',
  },
  {
    id: 'seed-5',
    playerName: 'Nova',
    playerAvatar: '⚡',
    gameId: 'tictactoe',
    mode: 'vs_bot',
    score: 120,
    date: Date.now() - 1000 * 60 * 60 * 2,
    botDifficulty: 'master',
    details: 'Perfect Diagonal Line',
  },
];

class LocalLeaderboardService {
  private entries: LeaderboardEntry[] = [];

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.entries = JSON.parse(raw);
      } else {
        // Seed initial records for first run
        this.entries = [...DEFAULT_SEED_SCORES];
        this.save();
      }
    } catch {
      this.entries = [...DEFAULT_SEED_SCORES];
    }
  }

  private save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch (err) {
      console.error('Failed to save local leaderboard to localStorage', err);
    }
  }

  public recordScore(entry: {
    playerName: string;
    playerAvatar: string;
    gameId: GameId;
    mode: 'pass_and_play' | 'vs_bot';
    score: number;
    botDifficulty?: BotDifficulty;
    details?: string;
    isBot?: boolean;
  }): { isNewHighScore: boolean; isPersonalBest: boolean; rank: number } {
    this.load();

    // Check previous all-time highest score for this game
    const previousGameScores = this.entries.filter(e => e.gameId === entry.gameId);
    const previousBestForGame = previousGameScores.length > 0 ? Math.max(...previousGameScores.map(e => e.score)) : 0;
    const isNewHighScore = entry.score > previousBestForGame;

    // Check personal best for this player in this game
    const personalGameScores = this.entries.filter(e => e.gameId === entry.gameId && e.playerName.toLowerCase() === entry.playerName.toLowerCase());
    const personalBest = personalGameScores.length > 0 ? Math.max(...personalGameScores.map(e => e.score)) : 0;
    const isPersonalBest = entry.score > personalBest;

    const newEntry: LeaderboardEntry = {
      id: `score-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerName: entry.playerName,
      playerAvatar: entry.playerAvatar,
      gameId: entry.gameId,
      mode: entry.mode,
      score: entry.score,
      date: Date.now(),
      botDifficulty: entry.botDifficulty,
      details: entry.details,
      isBot: entry.isBot,
    };

    this.entries.push(newEntry);

    // Keep max 200 entries to manage localStorage cleanly
    if (this.entries.length > 200) {
      this.entries.sort((a, b) => b.score - a.score);
      this.entries = this.entries.slice(0, 200);
    }

    this.save();

    // Calculate current rank in this game
    const gameRanking = this.getLeaderboard(entry.gameId, entry.mode);
    const rank = gameRanking.findIndex(e => e.id === newEntry.id) + 1;

    return {
      isNewHighScore,
      isPersonalBest,
      rank: rank > 0 ? rank : 1,
    };
  }

  public getLeaderboard(gameId?: GameId, mode?: 'pass_and_play' | 'vs_bot', limit = 50): LeaderboardEntry[] {
    this.load();
    let filtered = [...this.entries];

    if (gameId) {
      filtered = filtered.filter(e => e.gameId === gameId);
    }

    if (mode) {
      filtered = filtered.filter(e => e.mode === mode);
    }

    // Sort descending by score, then most recent date
    filtered.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.date - a.date;
    });

    return filtered.slice(0, limit);
  }

  public getStatsSummary(): LeaderboardStats {
    this.load();
    const totalGames = this.entries.length;
    const totalPoints = this.entries.reduce((sum, e) => sum + e.score, 0);
    const highestScore = this.entries.length > 0 ? Math.max(...this.entries.map(e => e.score)) : 0;
    const botWinsCount = this.entries.filter(e => e.mode === 'vs_bot').length;
    const passPlayCount = this.entries.filter(e => e.mode === 'pass_and_play').length;

    // Calculate favorite/most played game
    const gameCounts: Record<string, number> = {};
    for (const e of this.entries) {
      gameCounts[e.gameId] = (gameCounts[e.gameId] || 0) + 1;
    }
    let favoriteGame: GameId | null = null;
    let maxCount = 0;
    for (const [gid, count] of Object.entries(gameCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteGame = gid as GameId;
      }
    }

    return {
      totalGames,
      totalPoints,
      highestScore,
      favoriteGame,
      botWinsCount,
      passPlayCount,
    };
  }

  public clearLeaderboard(): void {
    this.entries = [];
    this.save();
  }

  public resetToDefaults(): void {
    this.entries = [...DEFAULT_SEED_SCORES];
    this.save();
  }
}

export const leaderboardService = new LocalLeaderboardService();
