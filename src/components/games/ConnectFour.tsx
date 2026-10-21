import React, { useState, useEffect } from 'react';
import { ConnectFourState, Player, PlayMode } from '../../types/game';
import { sounds } from '../../services/sound';
import { getBotConnectFourMove } from '../../services/gameData';

interface ConnectFourProps {
  state: ConnectFourState;
  players: Player[];
  currentPlayer: Player;
  mode: PlayMode;
  onMove: (col: number) => void;
  onRestart?: () => void;
}

export const ConnectFour: React.FC<ConnectFourProps> = ({
  state,
  players,
  currentPlayer,
  mode,
  onMove,
  onRestart,
}) => {
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  const p0 = players[0] || { name: 'Player 1', avatar: '🔴', color: '#ef4444' };
  const p1 = players[1] || { name: 'Player 2', avatar: '🟡', color: '#eab308' };

  const isMyTurn = () => {
    if (state.winner !== null) return false;
    if (mode === 'pass_and_play') return true;
    if (mode === 'vs_bot') {
      return state.currentTurn === 0;
    }
    // Online mode: check if currentPlayer is player matching currentTurn
    const myIndex = players.findIndex(p => p.id === currentPlayer.id);
    return myIndex === state.currentTurn;
  };

  const handleColumnClick = (col: number) => {
    if (!isMyTurn() || state.grid[0][col] !== null || state.winner !== null) {
      return;
    }
    sounds.playDrop();
    onMove(col);
  };

  const isCellWinning = (r: number, c: number) => {
    if (!state.winningCells) return false;
    return state.winningCells.some(([wr, wc]) => wr === r && wc === c);
  };

  const currentTurnPlayer = state.currentTurn === 0 ? p0 : p1;

  return (
    <div className="flex flex-col items-center justify-center max-w-xl mx-auto w-full px-2 py-4 space-y-5">
      {/* Turn & Status Header */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        {/* Player 1 Card */}
        <div
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all ${
            state.currentTurn === 0 && state.winner === null
              ? 'bg-rose-500/15 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
              : 'border-transparent text-slate-400'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center text-white text-base shadow-lg shadow-rose-500/30">
            {p0.avatar}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <span>{p0.name}</span>
              {mode === 'online' && players[0]?.id === currentPlayer.id && (
                <span className="text-[10px] text-slate-400">(You)</span>
              )}
            </div>
            <div className="text-[11px] text-rose-400 font-semibold">Red Chips</div>
          </div>
        </div>

        {/* Center Versus / Turn indicator */}
        <div className="text-center px-2">
          {state.winner === null ? (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Turn</div>
              <div className="text-sm font-black text-indigo-300 flex items-center justify-center gap-1">
                <span>{currentTurnPlayer.avatar}</span>
                <span className="truncate max-w-[100px]">{currentTurnPlayer.name}</span>
              </div>
            </div>
          ) : state.winner === 'draw' ? (
            <div className="text-xs font-bold text-amber-400">Match Drawn!</div>
          ) : (
            <div className="text-xs font-bold text-emerald-400">Winner Declared!</div>
          )}
        </div>

        {/* Player 2 Card */}
        <div
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all ${
            state.currentTurn === 1 && state.winner === null
              ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
              : 'border-transparent text-slate-400'
          }`}
        >
          <div className="text-right">
            <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
              <span>{p1.name}</span>
              {mode === 'online' && players[1]?.id === currentPlayer.id && (
                <span className="text-[10px] text-slate-400">(You)</span>
              )}
              {p1.isBot && <span className="text-[10px] text-amber-400 font-mono">(Bot)</span>}
            </div>
            <div className="text-[11px] text-amber-400 font-semibold">Yellow Chips</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 text-base shadow-lg shadow-amber-400/30">
            {p1.avatar}
          </div>
        </div>
      </div>

      {/* Action Prompt */}
      {isMyTurn() && state.winner === null && (
        <div className="text-xs font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-3 py-1 rounded-full animate-pulse">
          Click any column to drop your chip! 👇
        </div>
      )}

      {/* Main Board Container */}
      <div className="relative bg-blue-700 p-4 sm:p-5 rounded-3xl shadow-2xl border-4 border-blue-600">
        {/* Column Hover Indicator Top Bar */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2 px-1">
          {Array.from({ length: 7 }).map((_, col) => {
            const isFull = state.grid[0][col] !== null;
            const isHover = hoverCol === col && isMyTurn() && !isFull && state.winner === null;
            return (
              <div
                key={col}
                className="h-6 flex items-center justify-center cursor-pointer"
                onClick={() => handleColumnClick(col)}
                onMouseEnter={() => setHoverCol(col)}
                onMouseLeave={() => setHoverCol(null)}
              >
                {isHover && (
                  <div
                    className={`w-5 h-5 rounded-full animate-bounce shadow-md ${
                      state.currentTurn === 0 ? 'bg-rose-500' : 'bg-amber-400'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* The 6x7 Grid */}
        <div className="grid grid-rows-6 gap-2 sm:gap-3 bg-blue-800 p-2 sm:p-3 rounded-2xl border-2 border-blue-900 shadow-inner">
          {state.grid.map((row, r) => (
            <div key={r} className="grid grid-cols-7 gap-2 sm:gap-3">
              {row.map((cell, c) => {
                const isWinning = isCellWinning(r, c);
                const isLastMove = state.lastMove?.row === r && state.lastMove?.col === c;

                return (
                  <button
                    key={c}
                    type="button"
                    disabled={!isMyTurn() || state.grid[0][c] !== null || state.winner !== null}
                    onClick={() => handleColumnClick(c)}
                    onMouseEnter={() => setHoverCol(c)}
                    onMouseLeave={() => setHoverCol(null)}
                    className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-slate-900/95 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-inner overflow-hidden focus:outline-none"
                  >
                    {cell !== null ? (
                      <div
                        className={`w-full h-full rounded-full transition-all duration-300 flex items-center justify-center ${
                          cell === 0
                            ? 'bg-gradient-to-tr from-rose-600 via-rose-500 to-red-400 shadow-md shadow-rose-600/40'
                            : 'bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-md shadow-amber-500/40'
                        } ${isWinning ? 'ring-4 ring-white animate-pulse' : ''} ${
                          isLastMove ? 'scale-95 ring-2 ring-indigo-300' : ''
                        }`}
                      >
                        {/* Chip Inner Groove */}
                        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 border-white/30 flex items-center justify-center">
                          {isWinning && <span className="text-xs">⭐</span>}
                        </div>
                      </div>
                    ) : (
                      // Empty cell
                      <div className="w-full h-full rounded-full bg-slate-950/80 shadow-inner" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Board Feet Stands */}
        <div className="flex justify-between -mb-7 px-4">
          <div className="w-8 h-4 bg-blue-900 rounded-b-lg shadow-lg"></div>
          <div className="w-8 h-4 bg-blue-900 rounded-b-lg shadow-lg"></div>
        </div>
      </div>
    </div>
  );
};
