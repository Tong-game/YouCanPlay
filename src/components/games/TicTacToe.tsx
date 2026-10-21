import React from 'react';
import { TicTacToeState, Player, PlayMode } from '../../types/game';
import { sounds } from '../../services/sound';
import { Sparkles } from 'lucide-react';

interface TicTacToeProps {
  state: TicTacToeState;
  players: Player[];
  currentPlayer: Player;
  mode: PlayMode;
  onMove: (r: number, c: number) => void;
}

export const TicTacToe: React.FC<TicTacToeProps> = ({
  state,
  players,
  currentPlayer,
  mode,
  onMove,
}) => {
  const p0 = players[0] || { name: 'Player 1', avatar: '❌' };
  const p1 = players[1] || { name: 'Player 2', avatar: '⭕' };

  const isMyTurn = () => {
    if (state.winner !== null) return false;
    if (mode === 'pass_and_play') return true;
    if (mode === 'vs_bot') return state.currentTurn === 0;
    const myIndex = players.findIndex(p => p.id === currentPlayer.id);
    return myIndex === state.currentTurn;
  };

  const handleCellClick = (r: number, c: number) => {
    if (!isMyTurn() || state.grid[r][c] !== null || state.winner !== null) return;
    sounds.playDrop();
    onMove(r, c);
  };

  const isWinningCell = (r: number, c: number) => {
    if (!state.winningLine) return false;
    return state.winningLine.some(([wr, wc]) => wr === r && wc === c);
  };

  const currentTurnPlayer = state.currentTurn === 0 ? p0 : p1;

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full px-2 py-6 space-y-6">
      {/* Header Turn Card */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            state.currentTurn === 0 && state.winner === null
              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
              : 'border-transparent text-slate-400'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
            ✕
          </div>
          <span className="text-xs font-bold text-white">{p0.name}</span>
        </div>

        <div className="text-center">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Turn</div>
          <div className="text-sm font-bold text-white flex items-center gap-1">
            <span>{currentTurnPlayer.avatar}</span>
            <span>{currentTurnPlayer.name}</span>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
            state.currentTurn === 1 && state.winner === null
              ? 'bg-pink-600/20 border-pink-500 text-pink-300'
              : 'border-transparent text-slate-400'
          }`}
        >
          <span className="text-xs font-bold text-white">{p1.name}</span>
          <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center text-white font-bold text-lg">
            ○
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-2xl">
        <div
          className={`grid gap-2.5 sm:gap-3 ${
            state.boardSize === 3 ? 'grid-cols-3' : 'grid-cols-5'
          }`}
        >
          {state.grid.map((row, r) =>
            row.map((cell, c) => {
              const isWin = isWinningCell(r, c);
              return (
                <button
                  key={`${r}-${c}`}
                  disabled={!isMyTurn() || cell !== null || state.winner !== null}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black transition-all ${
                    isWin
                      ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/30 animate-pulse'
                      : cell === 0
                      ? 'bg-indigo-950/40 border border-indigo-700/60 text-indigo-400 shadow-inner'
                      : cell === 1
                      ? 'bg-pink-950/40 border border-pink-700/60 text-pink-400 shadow-inner'
                      : isMyTurn()
                      ? 'bg-slate-950 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/40 cursor-pointer'
                      : 'bg-slate-950 border border-slate-800/60 cursor-not-allowed opacity-80'
                  }`}
                >
                  {cell === 0 ? '✕' : cell === 1 ? '○' : ''}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
