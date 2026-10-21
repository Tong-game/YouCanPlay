import React, { useState } from 'react';
import { UnoState, UnoCard, UnoColor, Player, PlayMode } from '../../types/game';
import { sounds } from '../../services/sound';
import { Sparkles, AlertCircle, ArrowRight, Layers, Flame, Check } from 'lucide-react';

interface UnoGameProps {
  state: UnoState;
  players: Player[];
  currentPlayer: Player;
  mode: PlayMode;
  onPlayCard: (cardId: string, chosenColor?: 'red' | 'blue' | 'green' | 'yellow') => void;
  onDrawCard: () => void;
  onCallUno: () => void;
}

const COLOR_MAP: Record<UnoColor, { bg: string; border: string; text: string }> = {
  red: { bg: 'bg-rose-600', border: 'border-rose-400', text: 'text-white' },
  blue: { bg: 'bg-blue-600', border: 'border-blue-400', text: 'text-white' },
  green: { bg: 'bg-emerald-600', border: 'border-emerald-400', text: 'text-white' },
  yellow: { bg: 'bg-amber-500', border: 'border-amber-300', text: 'text-slate-950' },
  wild: { bg: 'bg-gradient-to-tr from-rose-500 via-amber-400 to-blue-500', border: 'border-purple-400', text: 'text-white' },
};

export const UnoGame: React.FC<UnoGameProps> = ({
  state,
  players,
  currentPlayer,
  mode,
  onPlayCard,
  onDrawCard,
  onCallUno,
}) => {
  const [selectedWildCard, setSelectedWildCard] = useState<UnoCard | null>(null);

  const activeTurnPlayer = players[state.currentTurn] || { name: 'Player', avatar: '🃏' };
  const topCard = state.discardPile[state.discardPile.length - 1] || {
    id: 'c-0',
    color: 'red',
    value: '7',
    symbol: '7',
    type: 'number',
  };

  const isMyTurn = () => {
    if (state.winner !== null) return false;
    if (mode === 'pass_and_play') return true;
    if (mode === 'vs_bot') return state.currentTurn === 0;
    const myIndex = players.findIndex(p => p.id === currentPlayer.id);
    return myIndex === state.currentTurn;
  };

  const myHandIndex = mode === 'pass_and_play' ? state.currentTurn : 0;
  const myHand = state.hands[myHandIndex] || [];

  const isCardPlayable = (card: UnoCard): boolean => {
    if (!isMyTurn() || state.winner !== null) return false;
    if (card.color === 'wild') return true;
    if (card.color === state.currentColor) return true;
    if (card.value === topCard.value) return true;
    return false;
  };

  const handleCardClick = (card: UnoCard) => {
    if (!isCardPlayable(card)) {
      sounds.playWrong();
      return;
    }

    if (card.color === 'wild') {
      setSelectedWildCard(card);
    } else {
      sounds.playCardDraw();
      onPlayCard(card.id);
    }
  };

  const handleColorChoice = (color: 'red' | 'blue' | 'green' | 'yellow') => {
    if (!selectedWildCard) return;
    sounds.playCardDraw();
    onPlayCard(selectedWildCard.id, color);
    setSelectedWildCard(null);
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-2 py-4 space-y-6 animate-in fade-in">
      {/* Top Players Hands Overview */}
      <div className="w-full flex items-center justify-center gap-3 flex-wrap">
        {players.map((p, idx) => {
          const cardCount = state.hands[idx]?.length || 0;
          const isTurn = state.currentTurn === idx && state.winner === null;
          const hasUno = cardCount === 1;

          return (
            <div
              key={p.id || idx}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl border transition-all ${
                isTurn
                  ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/40 text-white scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-xl">{p.avatar}</div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{p.name}</span>
                  {p.isBot && <span className="text-[10px] text-amber-400 font-mono">(Bot)</span>}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{cardCount} Cards</span>
                  {hasUno && (
                    <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.2 rounded-full font-black animate-bounce">
                      UNO!
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Center Table: Draw Pile & Discard Pile */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl flex items-center justify-around relative">
        {/* Active Color Ring Indicator */}
        <div className="absolute top-3 left-4 flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Active Color:</span>
          <div
            className={`w-4 h-4 rounded-full shadow-md animate-pulse ${
              state.currentColor === 'red'
                ? 'bg-rose-500'
                : state.currentColor === 'blue'
                ? 'bg-blue-500'
                : state.currentColor === 'green'
                ? 'bg-emerald-500'
                : 'bg-amber-400'
            }`}
          />
        </div>

        {/* Turn Direction Badge */}
        <div className="absolute top-3 right-4 text-xs font-mono text-slate-400">
          Order: {state.direction === 1 ? 'Clockwise ↻' : 'Counter ↺'}
        </div>

        {/* Draw Pile */}
        <div className="flex flex-col items-center space-y-2 mt-4">
          <button
            disabled={!isMyTurn()}
            onClick={() => {
              sounds.playCardDraw();
              onDrawCard();
            }}
            className="w-20 h-28 sm:w-24 sm:h-36 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border-2 border-slate-700 flex flex-col items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 cursor-pointer"
          >
            <div className="w-12 h-16 sm:w-16 sm:h-24 rounded-xl border border-dashed border-slate-600 flex items-center justify-center text-xs font-black uppercase tracking-wider text-slate-400">
              Draw
            </div>
          </button>
          <span className="text-[11px] text-slate-400 font-mono">Deck</span>
        </div>

        {/* Discard Pile (Top Card) */}
        <div className="flex flex-col items-center space-y-2 mt-4">
          <div
            className={`w-20 h-28 sm:w-24 sm:h-36 rounded-2xl border-4 flex flex-col items-center justify-between p-2 shadow-2xl text-white transition-all transform rotate-2 ${
              COLOR_MAP[topCard.color]?.bg || 'bg-rose-600'
            } ${COLOR_MAP[topCard.color]?.border || 'border-rose-400'}`}
          >
            <span className="text-xs font-black self-start">{topCard.symbol}</span>
            <span className="text-3xl sm:text-4xl font-black drop-shadow">{topCard.symbol}</span>
            <span className="text-xs font-black self-end transform rotate-180">{topCard.symbol}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Current Card</span>
        </div>
      </div>

      {/* Action Notification Banner */}
      {state.lastActionText && (
        <div className="text-xs font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-4 py-1.5 rounded-full">
          {state.lastActionText}
        </div>
      )}

      {/* Player Hand Cards Carousel */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between px-2">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <span>Your Hand ({myHand.length} cards)</span>
            {isMyTurn() && <span className="text-emerald-400 font-black animate-pulse">• YOUR TURN</span>}
          </div>

          {/* UNO Button */}
          <button
            onClick={() => {
              sounds.playWin();
              onCallUno();
            }}
            className="px-4 py-1.5 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
          >
            Call UNO! 📢
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 px-2 scrollbar-none">
          {myHand.map(card => {
            const playable = isCardPlayable(card);
            const styling = COLOR_MAP[card.color];

            return (
              <button
                key={card.id}
                disabled={!playable}
                onClick={() => handleCardClick(card)}
                className={`flex-shrink-0 w-16 h-24 sm:w-20 sm:h-32 rounded-2xl border-2 flex flex-col items-center justify-between p-2 shadow-lg transition-all transform ${
                  styling.bg
                } ${styling.border} ${
                  playable
                    ? 'hover:-translate-y-3 cursor-pointer ring-4 ring-white/60 shadow-xl'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <span className={`text-[11px] font-black self-start ${styling.text}`}>
                  {card.symbol}
                </span>
                <span className={`text-2xl sm:text-3xl font-black drop-shadow ${styling.text}`}>
                  {card.symbol}
                </span>
                <span className={`text-[11px] font-black self-end transform rotate-180 ${styling.text}`}>
                  {card.symbol}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wild Color Selection Modal */}
      {selectedWildCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-5 max-w-xs w-full shadow-2xl">
            <h3 className="text-lg font-black text-white">Choose Next Color</h3>
            <p className="text-xs text-slate-400">Pick the color for the next player to follow</p>

            <div className="grid grid-cols-2 gap-3">
              {(['red', 'blue', 'green', 'yellow'] as const).map(color => (
                <button
                  key={color}
                  onClick={() => handleColorChoice(color)}
                  className={`py-4 rounded-2xl font-black text-sm uppercase text-white shadow-lg transition-transform active:scale-95 ${
                    color === 'red'
                      ? 'bg-rose-600 hover:bg-rose-500'
                      : color === 'blue'
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : color === 'green'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
