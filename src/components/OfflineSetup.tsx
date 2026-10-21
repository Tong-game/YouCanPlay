import React, { useState } from 'react';
import { GameId, PlayMode, Player, BotDifficulty } from '../types/game';
import { GAME_CATALOG } from './Lobby';
import { sounds } from '../services/sound';
import { Smartphone, Bot, Play, UserPlus, Trash2, Sparkles, ShieldAlert, Cpu, Trophy } from 'lucide-react';

interface OfflineSetupProps {
  mode: 'pass_and_play' | 'vs_bot';
  onStartOfflineGame: (gameId: GameId, localPlayers: Player[]) => void;
  onOpenLeaderboard?: () => void;
}

const DEFAULT_PASS_PLAYERS: Player[] = [
  { id: 'local-1', name: 'Player 1', avatar: '🦁', color: '#6366f1', score: 0 },
  { id: 'local-2', name: 'Player 2', avatar: '🦊', color: '#ec4899', score: 0 },
];

export const OfflineSetup: React.FC<OfflineSetupProps> = ({
  mode,
  onStartOfflineGame,
  onOpenLeaderboard,
}) => {
  const [selectedGame, setSelectedGame] = useState<GameId>('connect4');
  const [localPlayers, setLocalPlayers] = useState<Player[]>(DEFAULT_PASS_PLAYERS);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');

  const activeCatalog = GAME_CATALOG.find(g => g.id === selectedGame) || GAME_CATALOG[0];

  const handleAddPlayer = () => {
    if (localPlayers.length >= 4) return;
    sounds.playClick();
    const emojis = ['🐼', '🚀', '🐱', '🦄', '⚡', '🔥'];
    const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
    const nextIdx = localPlayers.length + 1;
    setLocalPlayers([
      ...localPlayers,
      {
        id: `local-${Date.now()}`,
        name: `Player ${nextIdx}`,
        avatar: emojis[localPlayers.length % emojis.length],
        color: colors[localPlayers.length % colors.length],
        score: 0,
      },
    ]);
  };

  const handleRemovePlayer = (idx: number) => {
    if (localPlayers.length <= 2) return;
    sounds.playClick();
    const updated = [...localPlayers];
    updated.splice(idx, 1);
    setLocalPlayers(updated);
  };

  const handleUpdatePlayerName = (idx: number, name: string) => {
    const updated = [...localPlayers];
    updated[idx].name = name;
    setLocalPlayers(updated);
  };

  const handleStartGame = () => {
    sounds.playClick();
    if (mode === 'vs_bot') {
      const humanPlayer: Player = {
        ...localPlayers[0],
        id: 'human-player',
        name: localPlayers[0]?.name || 'You',
        score: 0,
      };
      const botPlayer: Player = {
        id: 'bot-player',
        name: `CyberBot (${botDifficulty.toUpperCase()})`,
        avatar: '🤖',
        color: '#10b981',
        score: 0,
        isBot: true,
        botDifficulty,
      };
      onStartOfflineGame(selectedGame, [humanPlayer, botPlayer]);
    } else {
      // Pass & Play mode
      onStartOfflineGame(selectedGame, localPlayers);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
          {mode === 'pass_and_play' ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Pass & Play Couch Multiplayer</span>
            </>
          ) : (
            <>
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>Single Player vs Smart AI Bot</span>
            </>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {mode === 'pass_and_play' ? 'Couch Party (Same Screen)' : 'Train Offline Against Smart AI'}
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          {mode === 'pass_and_play'
            ? 'Take turns passing your phone or laptop between friends. No internet needed!'
            : 'Play anytime offline against a computer AI tuned to your desired skill level.'}
        </p>
      </div>

      {/* Game Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">1. Choose Game</h3>
          {onOpenLeaderboard && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenLeaderboard();
              }}
              className="text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>View High Scores</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {GAME_CATALOG.map(game => {
            const isSelected = selectedGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => {
                  setSelectedGame(game.id);
                  sounds.playClick();
                }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl bg-gradient-to-tr ${game.gradient} text-white`}>
                    <game.icon className="w-4 h-4" />
                  </div>
                  {isSelected && <span className="text-xs font-bold text-indigo-400">SELECTED</span>}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{game.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{game.tagline}</p>
                </div>
                <div className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md self-start">
                  {game.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode-Specific Configuration */}
      {mode === 'pass_and_play' ? (
        /* Pass & Play Players List */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">2. Local Players Setup</h3>
              <p className="text-xs text-slate-400">Customize names and avatars for each friend taking turns</p>
            </div>
            {localPlayers.length < 4 && (
              <button
                onClick={handleAddPlayer}
                className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/50 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Player
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {localPlayers.map((p, idx) => (
              <div
                key={p.id || idx}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.avatar}
                  </div>
                  <div>
                    <input
                      type="text"
                      maxLength={14}
                      value={p.name}
                      onChange={e => handleUpdatePlayerName(idx, e.target.value)}
                      className="bg-transparent text-white font-bold text-sm focus:outline-none border-b border-transparent focus:border-indigo-500"
                    />
                    <div className="text-[10px] text-slate-500 font-mono">Seat #{idx + 1}</div>
                  </div>
                </div>

                {localPlayers.length > 2 && (
                  <button
                    onClick={() => handleRemovePlayer(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Vs AI Bot Difficulty Selector */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">2. Select AI Bot Difficulty</h3>
            <p className="text-xs text-slate-400">Adjust the intelligence of your bot opponent</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'easy', name: 'Easy Bot', desc: 'Casual, plays randomly and makes fun mistakes' },
              { id: 'medium', name: 'Medium Bot', desc: 'Balanced, blocks obvious threats and plays smart' },
              { id: 'master', name: 'Master AI', desc: 'Minimax heuristic, calculated moves, tough to beat!' },
            ].map(diff => {
              const isSelected = botDifficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  onClick={() => {
                    setBotDifficulty(diff.id as BotDifficulty);
                    sounds.playClick();
                  }}
                  className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                    isSelected
                      ? 'bg-emerald-600/20 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{diff.name}</span>
                    <Cpu className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </div>
                  <p className="text-xs text-slate-400">{diff.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Launch Match Button */}
      <div className="text-center pt-2">
        <button
          onClick={handleStartGame}
          className="px-10 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-base rounded-2xl shadow-xl shadow-indigo-600/30 transition-transform active:scale-95 flex items-center justify-center gap-2 mx-auto"
        >
          <Play className="w-5 h-5" />
          Start {activeCatalog.name}!
        </button>
      </div>
    </div>
  );
};
