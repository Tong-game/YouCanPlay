import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles, Award, Medal } from 'lucide-react';
import { Player } from '../types/game';
import { sounds } from '../services/sound';

interface GameOverModalProps {
  winner: Player | 'draw' | null;
  players: Player[];
  onRematch: () => void;
  onReturnToLobby: () => void;
  isHost?: boolean;
  onOpenLeaderboard?: () => void;
  leaderboardResult?: { isNewHighScore: boolean; isPersonalBest: boolean; rank: number } | null;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  players,
  onRematch,
  onReturnToLobby,
  isHost = true,
  onOpenLeaderboard,
  leaderboardResult,
}) => {
  useEffect(() => {
    if (winner && winner !== 'draw') {
      sounds.playWin();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch {}
    } else {
      sounds.playCorrect();
    }
  }, [winner]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 text-center shadow-2xl relative overflow-hidden space-y-5">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Winner Trophy / Draw Icon */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-xl shadow-amber-500/30 mx-auto">
          {winner === 'draw' ? (
            <Sparkles className="w-10 h-10" />
          ) : (
            <Trophy className="w-10 h-10 animate-bounce" />
          )}
        </div>

        {/* Title */}
        <div>
          {winner === 'draw' ? (
            <div>
              <h2 className="text-2xl font-black text-white">It's a Stalemate!</h2>
              <p className="text-slate-400 text-sm mt-1">Both players fought with equal mastery!</p>
            </div>
          ) : winner ? (
            <div>
              <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                <span>{winner.avatar}</span>
                <span>{winner.name} Wins!</span>
              </h2>
              <p className="text-emerald-400 font-semibold text-sm mt-1 flex items-center justify-center gap-1">
                <Award className="w-4 h-4" />
                Victory &amp; Glory!
              </p>
            </div>
          ) : null}
        </div>

        {/* Leaderboard High Score Highlight Badge */}
        {leaderboardResult && (
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
              leaderboardResult.isNewHighScore
                ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 ring-2 ring-amber-500/20'
                : 'bg-indigo-950/60 border-indigo-700/60 text-indigo-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {leaderboardResult.isNewHighScore ? '👑' : '⭐'}
              </span>
              <div className="text-left">
                <div className="font-bold">
                  {leaderboardResult.isNewHighScore
                    ? 'NEW ALL-TIME RECORD!'
                    : leaderboardResult.isPersonalBest
                    ? 'New Personal Best!'
                    : `Leaderboard Rank #${leaderboardResult.rank}`}
                </div>
                <div className="text-[10px] text-slate-400">Saved to Local Leaderboard</div>
              </div>
            </div>

            {onOpenLeaderboard && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenLeaderboard();
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold border border-slate-700"
              >
                View
              </button>
            )}
          </div>
        )}

        {/* Players Scoreboard */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 divide-y divide-slate-800/80">
          {players.map((p, idx) => {
            const isWinner = winner && winner !== 'draw' && winner.id === p.id;
            return (
              <div key={p.id || idx} className="flex items-center justify-between py-2 px-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.avatar}</span>
                  <span className={`font-semibold ${isWinner ? 'text-amber-400' : 'text-slate-300'}`}>
                    {p.name} {p.isBot && '(Bot)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-base">{p.score} pts</span>
                  {isWinner && <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">WINNER</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                sounds.playClick();
                onReturnToLobby();
              }}
              className="flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <Home className="w-4 h-4" />
              Lobby
            </button>

            {onOpenLeaderboard && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onOpenLeaderboard();
                }}
                className="flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                Leaderboard
              </button>
            )}

            <button
              onClick={() => {
                sounds.playClick();
                onRematch();
              }}
              className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Rematch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
