import React, { useState } from 'react';
import { ChessState, ChessPiece, PieceType, PieceColor, Player, PlayMode } from '../../types/game';
import { sounds } from '../../services/sound';
import { Shield, Sparkles, AlertCircle, Award } from 'lucide-react';

interface ChessGameProps {
  state: ChessState;
  players: Player[];
  currentPlayer: Player;
  mode: PlayMode;
  onMove: (from: [number, number], to: [number, number]) => void;
}

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙',
  },
  b: {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟',
  },
};

export const ChessGame: React.FC<ChessGameProps> = ({
  state,
  players,
  currentPlayer,
  mode,
  onMove,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);

  const whitePlayer = players[0] || { name: 'White', avatar: '♔', color: '#f8fafc' };
  const blackPlayer = players[1] || { name: 'Black', avatar: '♚', color: '#1e293b' };

  const isMyTurn = () => {
    if (state.winner !== null) return false;
    if (mode === 'pass_and_play') return true;
    if (mode === 'vs_bot') return state.currentTurn === 'w';
    const myIndex = players.findIndex(p => p.id === currentPlayer.id);
    return (state.currentTurn === 'w' && myIndex === 0) || (state.currentTurn === 'b' && myIndex === 1);
  };

  // Compute standard legal moves for a piece on square [r, c]
  const getLegalMoves = (r: number, c: number): [number, number][] => {
    const piece = state.board[r][c];
    if (!piece || piece.color !== state.currentTurn) return [];

    const moves: [number, number][] = [];
    const color = piece.color;
    const oppColor = color === 'w' ? 'b' : 'w';

    const inBounds = (nr: number, nc: number) => nr >= 0 && nr < 8 && nc >= 0 && nc < 8;

    const addMoveIfValid = (nr: number, nc: number): boolean => {
      if (!inBounds(nr, nc)) return false;
      const target = state.board[nr][nc];
      if (!target) {
        moves.push([nr, nc]);
        return true;
      }
      if (target.color === oppColor) {
        moves.push([nr, nc]);
        return false;
      }
      return false;
    };

    switch (piece.type) {
      case 'p': {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;

        // 1 step forward
        if (inBounds(r + dir, c) && !state.board[r + dir][c]) {
          moves.push([r + dir, c]);
          // 2 steps forward from start
          if (r === startRow && inBounds(r + 2 * dir, c) && !state.board[r + 2 * dir][c]) {
            moves.push([r + 2 * dir, c]);
          }
        }
        // Diagonal captures
        for (const dc of [-1, 1]) {
          const nr = r + dir;
          const nc = c + dc;
          if (inBounds(nr, nc) && state.board[nr][nc]?.color === oppColor) {
            moves.push([nr, nc]);
          }
        }
        break;
      }
      case 'n': {
        const knightOffsets = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1],
        ];
        for (const [dr, dc] of knightOffsets) {
          addMoveIfValid(r + dr, c + dc);
        }
        break;
      }
      case 'b': {
        const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dr, dc] of diagonals) {
          for (let step = 1; step < 8; step++) {
            if (!addMoveIfValid(r + dr * step, c + dc * step)) break;
          }
        }
        break;
      }
      case 'r': {
        const orthogonals = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of orthogonals) {
          for (let step = 1; step < 8; step++) {
            if (!addMoveIfValid(r + dr * step, c + dc * step)) break;
          }
        }
        break;
      }
      case 'q': {
        const directions = [
          [-1, -1], [-1, 1], [1, -1], [1, 1],
          [-1, 0], [1, 0], [0, -1], [0, 1],
        ];
        for (const [dr, dc] of directions) {
          for (let step = 1; step < 8; step++) {
            if (!addMoveIfValid(r + dr * step, c + dc * step)) break;
          }
        }
        break;
      }
      case 'k': {
        const kingOffsets = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1],
        ];
        for (const [dr, dc] of kingOffsets) {
          addMoveIfValid(r + dr, c + dc);
        }
        break;
      }
    }

    return moves;
  };

  const currentLegalMoves = selectedSquare ? getLegalMoves(selectedSquare[0], selectedSquare[1]) : [];

  const handleSquareClick = (r: number, c: number) => {
    if (!isMyTurn() || state.winner !== null) return;

    if (selectedSquare) {
      const [sr, sc] = selectedSquare;
      const isLegal = currentLegalMoves.some(([mr, mc]) => mr === r && mc === c);

      if (isLegal) {
        sounds.playChessMove();
        onMove([sr, sc], [r, c]);
        setSelectedSquare(null);
        return;
      }
    }

    // Select piece
    const piece = state.board[r][c];
    if (piece && piece.color === state.currentTurn) {
      sounds.playClick();
      setSelectedSquare([r, c]);
    } else {
      setSelectedSquare(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-2 py-4 space-y-5 animate-in fade-in">
      {/* Turn Header */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between shadow-xl">
        {/* White Player */}
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-2xl border transition-all ${
            state.currentTurn === 'w' && state.winner === null
              ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/30'
              : 'border-transparent text-slate-400'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center text-2xl shadow">
            ♔
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <span>{whitePlayer.name}</span>
              {mode === 'vs_bot' && <span className="text-[10px] text-indigo-400 font-mono">(You)</span>}
            </div>
            <div className="text-[11px] text-slate-300 font-semibold">White Army</div>
          </div>
        </div>

        {/* Status Callout */}
        <div className="text-center">
          {state.winner ? (
            <div className="text-sm font-black text-amber-400 flex items-center gap-1 justify-center">
              <Award className="w-4 h-4" />
              <span>{state.winner === 'w' ? whitePlayer.name : blackPlayer.name} Wins!</span>
            </div>
          ) : (
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Turn</div>
              <div className="text-xs font-black text-indigo-300">
                {state.currentTurn === 'w' ? `${whitePlayer.name}'s Turn` : `${blackPlayer.name}'s Turn`}
              </div>
            </div>
          )}
        </div>

        {/* Black Player */}
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-2xl border transition-all ${
            state.currentTurn === 'b' && state.winner === null
              ? 'bg-purple-600/20 border-purple-500 text-purple-200 ring-2 ring-purple-500/30'
              : 'border-transparent text-slate-400'
          }`}
        >
          <div className="text-right">
            <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
              <span>{blackPlayer.name}</span>
              {blackPlayer.isBot && <span className="text-[10px] text-amber-400 font-mono">(Bot)</span>}
            </div>
            <div className="text-[11px] text-purple-400 font-semibold">Black Army</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 text-white flex items-center justify-center text-2xl shadow">
            ♚
          </div>
        </div>
      </div>

      {/* Captured Trays */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 px-2">
        <div className="flex items-center gap-1">
          <span>Captured:</span>
          {state.capturedBlack.map((p, idx) => (
            <span key={idx} className="text-sm">{PIECE_SYMBOLS.b[p]}</span>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span>Captured:</span>
          {state.capturedWhite.map((p, idx) => (
            <span key={idx} className="text-sm">{PIECE_SYMBOLS.w[p]}</span>
          ))}
        </div>
      </div>

      {/* 8x8 Chessboard */}
      <div className="relative bg-amber-950/80 p-3 sm:p-4 rounded-3xl border-4 border-amber-900 shadow-2xl">
        <div className="grid grid-cols-8 grid-rows-8 border-2 border-amber-950 rounded-xl overflow-hidden shadow-inner">
          {state.board.map((row, r) =>
            row.map((piece, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSelected = selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c;
              const isTargetMove = currentLegalMoves.some(([mr, mc]) => mr === r && mc === c);
              const isLastMove =
                (state.lastMove?.from[0] === r && state.lastMove?.from[1] === c) ||
                (state.lastMove?.to[0] === r && state.lastMove?.to[1] === c);

              return (
                <button
                  key={`${r}-${c}`}
                  disabled={!isMyTurn() || state.winner !== null}
                  onClick={() => handleSquareClick(r, c)}
                  className={`w-9 h-9 sm:w-14 sm:h-14 flex items-center justify-center text-3xl sm:text-4xl select-none relative transition-all focus:outline-none ${
                    isDark ? 'bg-amber-800/80' : 'bg-amber-100/90'
                  } ${isSelected ? 'ring-4 ring-indigo-500 z-10' : ''} ${
                    isLastMove ? 'bg-yellow-400/40' : ''
                  }`}
                >
                  {/* Legal move dot / capture indicator */}
                  {isTargetMove && (
                    <div
                      className={`absolute rounded-full pointer-events-none z-10 ${
                        piece
                          ? 'w-7 h-7 sm:w-11 sm:h-11 border-4 border-rose-500 animate-pulse'
                          : 'w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500/90 shadow'
                      }`}
                    />
                  )}

                  {/* Piece Symbol */}
                  {piece && (
                    <span
                      className={`drop-shadow filter ${
                        piece.color === 'w'
                          ? 'text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]'
                          : 'text-slate-950'
                      }`}
                    >
                      {PIECE_SYMBOLS[piece.color][piece.type]}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
