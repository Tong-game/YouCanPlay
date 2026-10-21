import React, { useState, useEffect, useRef } from 'react';
import { WordBombState, Player, PlayMode } from '../../types/game';
import { sounds } from '../../services/sound';
import { Flame, Bomb, Heart, AlertCircle, Check, ArrowRight } from 'lucide-react';

interface WordBombProps {
  state: WordBombState;
  players: Player[];
  currentPlayer: Player;
  mode: PlayMode;
  onSubmitWord: (word: string) => void;
}

export const WordBomb: React.FC<WordBombProps> = ({
  state,
  players,
  currentPlayer,
  mode,
  onSubmitWord,
}) => {
  const [inputWord, setInputWord] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const activePlayer = players[state.currentTurn] || { name: 'Player', avatar: '💣' };
  const isMyTurn = () => {
    if (state.winner !== null) return false;
    if (mode === 'pass_and_play') return true;
    if (mode === 'vs_bot') return state.currentTurn === 0;
    const myIndex = players.findIndex(p => p.id === currentPlayer.id);
    return myIndex === state.currentTurn;
  };

  // Sound effect on ticks
  useEffect(() => {
    if (state.winner === null && state.bombTimer > 0) {
      sounds.playTick(state.bombTimer <= 4);
    }
  }, [state.bombTimer]);

  // Focus input when it becomes user's turn
  useEffect(() => {
    if (isMyTurn()) {
      inputRef.current?.focus();
    }
  }, [state.currentTurn]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWord.trim() || !isMyTurn()) return;
    onSubmitWord(inputWord.trim());
    setInputWord('');
  };

  const isUrgent = state.bombTimer <= 4;

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full px-2 py-6 space-y-6">
      {/* Player Roster & Lives Bar */}
      <div className="w-full flex items-center justify-center gap-3 flex-wrap">
        {players.map((p, idx) => {
          const lives = state.playerLives[idx] ?? 0;
          const isTurn = state.currentTurn === idx && state.winner === null;
          const isDead = lives <= 0;

          return (
            <div
              key={p.id || idx}
              className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all ${
                isTurn
                  ? 'bg-rose-500/20 border-rose-500 ring-2 ring-rose-500/40 text-rose-300 scale-105'
                  : isDead
                  ? 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-60'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="text-xl">{p.avatar}</div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>{p.name}</span>
                  {p.isBot && <span className="text-[10px] text-amber-400 font-mono">(Bot)</span>}
                </div>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {Array.from({ length: 3 }).map((_, lIdx) => (
                    <span key={lIdx} className="text-xs">
                      {lIdx < lives ? '❤️' : '🖤'}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* The Giant Ticking Bomb */}
      <div className="relative flex flex-col items-center my-4">
        {/* Animated Spark fuse */}
        <div className="relative -mb-3 flex items-center justify-center">
          <div className="w-1.5 h-6 bg-amber-700 rounded-t"></div>
          <Flame
            className={`absolute -top-3 w-6 h-6 text-amber-400 animate-ping ${
              isUrgent ? 'text-rose-500 scale-150' : ''
            }`}
          />
        </div>

        {/* Bomb Sphere */}
        <div
          className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center text-center p-4 shadow-2xl transition-all duration-300 ${
            isUrgent
              ? 'bg-gradient-to-tr from-rose-950 via-rose-900 to-red-600 animate-bounce ring-8 ring-rose-500/40 shadow-rose-600/50'
              : 'bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border-4 border-indigo-700/60 shadow-indigo-900/40'
          }`}
        >
          {/* Bomb Highlight reflection */}
          <div className="absolute top-4 left-8 w-10 h-6 bg-white/10 rounded-full blur-xs pointer-events-none" />

          {/* Syllable Prompt */}
          <div className="text-xs uppercase tracking-widest text-indigo-300 font-bold mb-1">
            Word Must Contain:
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white tracking-widest font-mono drop-shadow">
            {state.prompt.toUpperCase()}
          </div>

          {/* Remaining Timer Countdown */}
          <div
            className={`mt-2 font-mono text-xl sm:text-2xl font-black flex items-center gap-1 ${
              isUrgent ? 'text-rose-300 animate-pulse' : 'text-amber-400'
            }`}
          >
            <span>{state.bombTimer}</span>
            <span className="text-xs uppercase">sec</span>
          </div>
        </div>
      </div>

      {/* Active Player Turn Prompt */}
      <div className="text-center">
        <div className="text-xs text-slate-400 font-medium">Bomb is in the hands of:</div>
        <div className="text-lg font-black text-white flex items-center justify-center gap-2 mt-0.5">
          <span>{activePlayer.avatar}</span>
          <span>{activePlayer.name}</span>
          {isMyTurn() && <span className="text-xs font-bold bg-indigo-600 px-2 py-0.5 rounded-full">YOU</span>}
        </div>
      </div>

      {/* Word Input Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex gap-2">
        <input
          ref={inputRef}
          type="text"
          disabled={!isMyTurn()}
          value={inputWord}
          onChange={e => setInputWord(e.target.value)}
          placeholder={
            isMyTurn() ? `Type word with "${state.prompt.toUpperCase()}"...` : `Waiting for ${activePlayer.name}...`
          }
          className={`flex-1 bg-slate-900 border rounded-2xl px-4 py-3 text-base text-white placeholder-slate-500 font-mono focus:outline-none transition-all ${
            isMyTurn()
              ? 'border-indigo-500 ring-2 ring-indigo-500/30'
              : 'border-slate-800 opacity-60 cursor-not-allowed'
          }`}
          autoComplete="off"
          autoFocus
        />
        <button
          type="submit"
          disabled={!isMyTurn() || !inputWord.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-5 rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg shadow-indigo-600/30"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>

      {/* Last Word Feedback Toast */}
      {state.lastWordSubmitted && (
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold animate-in fade-in ${
            state.lastWordSubmitted.valid
              ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
              : 'bg-rose-950/60 border-rose-600/50 text-rose-300'
          }`}
        >
          {state.lastWordSubmitted.valid ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>"{state.lastWordSubmitted.word}" was accepted! Passed bomb!</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>
                "{state.lastWordSubmitted.word}" rejected: {state.lastWordSubmitted.reason}
              </span>
            </>
          )}
        </div>
      )}

      {/* Used Words Tally Preview */}
      {state.usedWords.length > 0 && (
        <div className="text-center text-xs text-slate-500">
          Used words: {state.usedWords.slice(-5).join(', ')}
        </div>
      )}
    </div>
  );
};
