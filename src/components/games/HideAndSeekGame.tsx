import React, { useState } from 'react';
import { HideSeekState, HidingSpot, Player, PlayMode } from '../../types/game';
import { sounds } from '../../services/sound';
import { Eye, EyeOff, Search, Sparkles, Volume2, Shield, Award, Ghost } from 'lucide-react';

interface HideAndSeekProps {
  state: HideSeekState;
  players: Player[];
  currentPlayer: Player;
  mode: PlayMode;
  onPickSpot: (spotId: string) => void;
  onSearchSpot: (spotId: string) => void;
  onEndRound: () => void;
}

export const HideAndSeekGame: React.FC<HideAndSeekProps> = ({
  state,
  players,
  currentPlayer,
  mode,
  onPickSpot,
  onSearchSpot,
  onEndRound,
}) => {
  const [selectedSpotForHide, setSelectedSpotForHide] = useState<string | null>(null);

  const seekerPlayer = players[state.seekerIndex] || { name: 'Seeker', avatar: '🔦' };
  const myPlayerIndex = mode === 'pass_and_play' ? 0 : players.findIndex(p => p.id === currentPlayer.id);
  const isSeeker = myPlayerIndex === state.seekerIndex;

  const handleSpotClick = (spot: HidingSpot) => {
    if (state.phase === 'hiding') {
      if (isSeeker) return; // seeker waits while others hide
      sounds.playClick();
      setSelectedSpotForHide(spot.id);
      onPickSpot(spot.id);
    } else if (state.phase === 'seeking') {
      if (!isSeeker && mode !== 'pass_and_play') return;
      if (spot.isSearched) return;
      sounds.playFlashlight();
      onSearchSpot(spot.id);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-2 py-4 space-y-6 animate-in fade-in">
      {/* Header Info Banner */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-3xl shadow">
            {state.phase === 'hiding' ? '🤫' : '🔦'}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Haunted Manor • Round {state.round} of {state.maxRounds}
            </div>
            <h3 className="text-lg font-black text-white">
              {state.phase === 'hiding' ? 'Hiding Phase: Pick Your Secret Spot!' : `${seekerPlayer.name} is Searching!`}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {state.phase === 'hiding'
                ? 'Hiders have 10 seconds to vanish into the manor furniture'
                : `Seeker has ${state.searchesLeft} flashlight inspections remaining`}
            </p>
          </div>
        </div>

        {/* Seeker Badge */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">The Seeker</span>
          <span className="text-sm font-bold text-amber-400 flex items-center justify-end gap-1">
            <span>{seekerPlayer.avatar}</span>
            <span>{seekerPlayer.name}</span>
          </span>
        </div>
      </div>

      {/* Players Roster Status */}
      <div className="w-full flex items-center justify-center gap-3 flex-wrap">
        {players.map((p, idx) => {
          const isThisSeeker = idx === state.seekerIndex;
          const isFound = state.foundPlayers.includes(idx);

          return (
            <div
              key={p.id || idx}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-semibold ${
                isThisSeeker
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : isFound
                  ? 'bg-rose-950/60 border-rose-800 text-rose-400 line-through opacity-70'
                  : 'bg-slate-900 border-slate-800 text-emerald-400'
              }`}
            >
              <span>{p.avatar}</span>
              <span>{p.name}</span>
              {isThisSeeker ? (
                <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded font-mono">SEEKER</span>
              ) : isFound ? (
                <span className="text-[10px] bg-rose-900/60 px-1.5 py-0.5 rounded font-mono text-rose-300">
                  FOUND 👻
                </span>
              ) : (
                <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded font-mono text-emerald-300">
                  HIDDEN
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Manor Hiding Spots Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {state.spots.map(spot => {
          const isChosenByMe = selectedSpotForHide === spot.id || state.playerHidingSpots[myPlayerIndex] === spot.id;
          const isSearched = spot.isSearched;

          // Check if any players were found in this spot
          const playersHiddenHere = Object.entries(state.playerHidingSpots)
            .filter(([pIdx, sId]) => sId === spot.id)
            .map(([pIdx]) => Number(pIdx));

          const wasAnyoneFoundHere = isSearched && playersHiddenHere.length > 0;

          return (
            <button
              key={spot.id}
              onClick={() => handleSpotClick(spot)}
              disabled={isSearched && state.phase === 'seeking'}
              className={`relative p-5 rounded-3xl border-2 flex flex-col items-center justify-between text-center min-h-[140px] transition-all transform ${
                isSearched
                  ? wasAnyoneFoundHere
                    ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/40 text-white shadow-xl'
                    : 'bg-slate-950/50 border-slate-800 text-slate-500 opacity-60'
                  : isChosenByMe && state.phase === 'hiding'
                  ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/40 text-white scale-103'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850 hover:scale-102 cursor-pointer'
              }`}
            >
              {/* Room name */}
              <span className="text-[10px] uppercase font-bold text-slate-400">{spot.room}</span>

              {/* Icon */}
              <div className="text-4xl my-2">
                {isSearched && wasAnyoneFoundHere ? '👻' : spot.icon}
              </div>

              {/* Spot Name */}
              <div>
                <div className="font-bold text-white text-xs sm:text-sm">{spot.name}</div>
                {isSearched && wasAnyoneFoundHere && (
                  <div className="text-[10px] text-rose-400 font-bold animate-pulse mt-0.5">
                    HIDER CAUGHT!
                  </div>
                )}
                {isSearched && !wasAnyoneFoundHere && (
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Empty Spot</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Event Log & Instructions */}
      {state.lastEventText && (
        <div className="text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-600/40 px-4 py-2 rounded-2xl animate-pulse">
          {state.lastEventText}
        </div>
      )}
    </div>
  );
};
