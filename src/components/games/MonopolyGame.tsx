import React, { useState } from 'react';
import { MonopolyState, MonopolyTile, Player, PlayMode } from '../../types/game';
import { sounds } from '../../services/sound';
import { Building2, Dices, Coins, AlertCircle, Sparkles, Home, Shield, DollarSign } from 'lucide-react';

interface MonopolyGameProps {
  state: MonopolyState;
  players: Player[];
  currentPlayer: Player;
  mode: PlayMode;
  onRollDice: () => void;
  onBuyProperty: () => void;
  onEndTurn: () => void;
}

const PLAYER_TOKENS = ['🚗', '🎩', '🐶', '🚀'];

const DICE_SYMBOLS = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export const MonopolyGame: React.FC<MonopolyGameProps> = ({
  state,
  players,
  currentPlayer,
  mode,
  onRollDice,
  onBuyProperty,
  onEndTurn,
}) => {
  const [isRolling, setIsRolling] = useState(false);

  const activeTurnPlayer = players[state.currentTurn] || { name: 'Player', avatar: '🎩' };
  const playerPos = state.playerPositions[state.currentTurn] || 0;
  const currentTile = state.tiles[playerPos] || state.tiles[0];

  const isMyTurn = () => {
    if (state.winner !== null) return false;
    if (mode === 'pass_and_play') return true;
    if (mode === 'vs_bot') return state.currentTurn === 0;
    const myIndex = players.findIndex(p => p.id === currentPlayer.id);
    return myIndex === state.currentTurn;
  };

  const handleRoll = () => {
    if (!isMyTurn() || state.phase !== 'roll' || isRolling) return;
    setIsRolling(true);
    sounds.playDiceRoll();

    setTimeout(() => {
      setIsRolling(false);
      onRollDice();
    }, 700);
  };

  const canBuyCurrentTile =
    state.phase === 'action' &&
    currentTile.type === 'property' &&
    currentTile.owner === undefined &&
    currentTile.price !== undefined &&
    state.playerCash[state.currentTurn] >= currentTile.price;

  return (
    <div className="flex flex-col items-center justify-center max-w-5xl mx-auto w-full px-2 py-4 space-y-6 animate-in fade-in">
      {/* Players Financial Standing Header */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
        {players.map((p, idx) => {
          const cash = state.playerCash[idx] ?? 0;
          const isTurn = state.currentTurn === idx && state.winner === null;
          const token = PLAYER_TOKENS[idx % PLAYER_TOKENS.length];
          const isBankrupt = cash <= 0;

          return (
            <div
              key={p.id || idx}
              className={`p-3 rounded-2xl border transition-all ${
                isTurn
                  ? 'bg-emerald-600/20 border-emerald-500 ring-2 ring-emerald-500/40 text-white'
                  : isBankrupt
                  ? 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-60'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5 truncate">
                  <span>{token}</span>
                  <span>{p.name}</span>
                </span>
                {isTurn && <span className="text-[10px] text-emerald-400 font-bold">TURN</span>}
              </div>
              <div className="mt-1 font-mono font-black text-emerald-400 text-lg">
                ${cash}
              </div>
            </div>
          );
        })}
      </div>

      {/* The 16-Tile Monopoly Board */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative">
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
          {state.tiles.map((tile, idx) => {
            const playersOnTile = state.playerPositions
              .map((pos, pIdx) => ({ pos, pIdx }))
              .filter(x => x.pos === idx);

            const isCurrentTile = playerPos === idx;
            const ownerPlayer = tile.owner !== undefined ? players[tile.owner] : null;

            return (
              <div
                key={tile.id}
                className={`relative min-h-[75px] sm:min-h-[90px] rounded-2xl border p-2 flex flex-col justify-between transition-all ${
                  isCurrentTile
                    ? 'ring-2 ring-indigo-400 shadow-lg scale-102 bg-slate-950'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                {/* Tile Color Header if property */}
                {tile.type === 'property' && (
                  <div
                    className="w-full h-2 rounded-full mb-1"
                    style={{ backgroundColor: tile.color || '#6366f1' }}
                  />
                )}

                <div>
                  <div className="font-bold text-white text-[11px] sm:text-xs leading-tight line-clamp-1">
                    {tile.name}
                  </div>
                  {tile.price && (
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">${tile.price}</div>
                  )}
                </div>

                {/* Owner indicator */}
                {ownerPlayer && (
                  <div className="text-[10px] text-indigo-400 font-semibold truncate">
                    Owned by {ownerPlayer.name}
                  </div>
                )}

                {/* Tokens On Tile */}
                <div className="flex items-center gap-1 mt-1">
                  {playersOnTile.map(pt => (
                    <span key={pt.pIdx} className="text-base sm:text-lg animate-bounce">
                      {PLAYER_TOKENS[pt.pIdx % PLAYER_TOKENS.length]}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Controls: Dice, Purchase, End Turn */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-xl flex flex-col items-center space-y-4 text-center">
        {/* Dice Visual */}
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl bg-slate-100 text-slate-950 text-4xl flex items-center justify-center font-bold shadow-lg ${
              isRolling ? 'animate-spin' : ''
            }`}
          >
            {DICE_SYMBOLS[(state.lastDice[0] - 1) % 6] || '⚂'}
          </div>
          <div
            className={`w-14 h-14 rounded-2xl bg-slate-100 text-slate-950 text-4xl flex items-center justify-center font-bold shadow-lg ${
              isRolling ? 'animate-spin' : ''
            }`}
          >
            {DICE_SYMBOLS[(state.lastDice[1] - 1) % 6] || '⚃'}
          </div>
        </div>

        {/* Current Turn Notification */}
        <div>
          <div className="text-xs text-slate-400 font-semibold uppercase">Current Turn</div>
          <div className="text-base font-bold text-white mt-0.5">
            {activeTurnPlayer.name} landed on <span className="text-indigo-400">{currentTile.name}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          {state.phase === 'roll' ? (
            <button
              disabled={!isMyTurn() || isRolling}
              onClick={handleRoll}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Dices className="w-5 h-5" />
              <span>Roll Dice ({activeTurnPlayer.name})</span>
            </button>
          ) : (
            <>
              {canBuyCurrentTile && (
                <button
                  onClick={() => {
                    sounds.playCorrect();
                    onBuyProperty();
                  }}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Buy (${currentTile.price})</span>
                </button>
              )}

              <button
                onClick={() => {
                  sounds.playClick();
                  onEndTurn();
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700"
              >
                End Turn →
              </button>
            </>
          )}
        </div>

        {/* Game Log Stream */}
        {state.log.length > 0 && (
          <div className="w-full pt-3 border-t border-slate-800 text-xs text-slate-400 text-left space-y-1 max-h-20 overflow-y-auto">
            {state.log.slice(-3).map((l, idx) => (
              <div key={idx} className="truncate">• {l}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
