import React, { useState, useEffect } from 'react';
import {
  Trophy,
  X,
  Medal,
  Smartphone,
  Bot,
  Filter,
  Trash2,
  Calendar,
  Sparkles,
  Flame,
  Award,
  Crown,
  Zap,
} from 'lucide-react';
import { GameId } from '../types/game';
import { LeaderboardEntry, LeaderboardStats, leaderboardService } from '../services/leaderboard';
import { GAME_CATALOG } from './Lobby';
import { sounds } from '../services/sound';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGameFilter?: GameId | 'all';
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  defaultGameFilter = 'all',
}) => {
  const [selectedGame, setSelectedGame] = useState<GameId | 'all'>(defaultGameFilter);
  const [selectedMode, setSelectedMode] = useState<'all' | 'pass_and_play' | 'vs_bot'>('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, selectedGame, selectedMode]);

  const loadData = () => {
    const gameFilter = selectedGame === 'all' ? undefined : selectedGame;
    const modeFilter = selectedMode === 'all' ? undefined : selectedMode;
    const data = leaderboardService.getLeaderboard(gameFilter, modeFilter, 100);
    setEntries(data);
    setStats(leaderboardService.getStatsSummary());
  };

  const handleClear = () => {
    sounds.playWrong();
    leaderboardService.clearLeaderboard();
    setShowConfirmClear(false);
    loadData();
  };

  const handleResetDefaults = () => {
    sounds.playCorrect();
    leaderboardService.resetToDefaults();
    loadData();
  };

  if (!isOpen) return null;

  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  const getGameInfo = (gameId: GameId) => {
    return GAME_CATALOG.find(g => g.id === gameId) || GAME_CATALOG[0];
  };

  const formatDate = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 2) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Offline Leaderboard</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60">
                  Local Storage
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Top records achieved in Couch Pass &amp; Play and Single Player Vs AI Bot
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Summary Bar */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 text-xs">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Games</div>
                <div className="text-base font-black text-white">{stats.totalGames}</div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">High Score</div>
                <div className="text-base font-black text-amber-400 font-mono">{stats.highestScore} pts</div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Pass &amp; Play</div>
                <div className="text-base font-black text-purple-300">{stats.passPlayCount} records</div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Vs AI Bot</div>
                <div className="text-base font-black text-emerald-300">{stats.botWinsCount} records</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Row */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          {/* Game Selector Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-full">
            <button
              onClick={() => {
                setSelectedGame('all');
                sounds.playClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedGame === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Games
            </button>
            {GAME_CATALOG.map(g => (
              <button
                key={g.id}
                onClick={() => {
                  setSelectedGame(g.id);
                  sounds.playClick();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedGame === g.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <g.icon className="w-3.5 h-3.5" />
                <span>{g.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Mode Selector Radio Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setSelectedMode('all');
                sounds.playClick();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedMode === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Modes
            </button>
            <button
              onClick={() => {
                setSelectedMode('pass_and_play');
                sounds.playClick();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedMode === 'pass_and_play' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>Pass &amp; Play</span>
            </button>
            <button
              onClick={() => {
                setSelectedMode('vs_bot');
                sounds.playClick();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedMode === 'vs_bot' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3 h-3" />
              <span>Vs AI</span>
            </button>
          </div>
        </div>

        {/* Scrollable Leaderboard Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {entries.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-3xl mx-auto text-slate-600">
                🎯
              </div>
              <h3 className="text-lg font-bold text-white">No Scores Recorded Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Finish a match in Pass &amp; Play or Vs AI Bot to see your record and high score immortalized on the local leaderboard!
              </p>
              <button
                onClick={handleResetDefaults}
                className="mt-2 text-xs text-indigo-400 hover:underline inline-block font-semibold"
              >
                Load Starter Demo Scores
              </button>
            </div>
          ) : (
            <>
              {/* Podium View for Top 3 */}
              {topThree.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {/* #2 Silver (left or 2nd) */}
                  {topThree[1] && (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-4 flex flex-col items-center text-center relative order-2 sm:order-1 sm:mt-4 shadow-lg">
                      <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-black text-sm flex items-center justify-center absolute -top-3 shadow-md">
                        2
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-slate-400 flex items-center justify-center text-3xl shadow-md mt-2">
                        {topThree[1].playerAvatar}
                      </div>
                      <div className="font-bold text-white text-sm mt-2">{topThree[1].playerName}</div>
                      <div className="text-xl font-black text-slate-200 font-mono">{topThree[1].score} pts</div>
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap justify-center">
                        <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                          {getGameInfo(topThree[1].gameId).name.split(' ')[0]}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          {topThree[1].mode === 'pass_and_play' ? <Smartphone className="w-2.5 h-2.5" /> : <Bot className="w-2.5 h-2.5" />}
                          {topThree[1].mode === 'pass_and_play' ? 'Pass' : 'Bot'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* #1 Gold (Center, prominent) */}
                  {topThree[0] && (
                    <div className="bg-gradient-to-b from-amber-950/40 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-5 flex flex-col items-center text-center relative order-1 sm:order-2 shadow-xl shadow-amber-500/10">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center absolute -top-4 shadow-lg shadow-amber-400/40">
                        👑
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-lg mt-1">
                        {topThree[0].playerAvatar}
                      </div>
                      <div className="font-black text-white text-base mt-2 flex items-center gap-1.5">
                        <span>{topThree[0].playerName}</span>
                        <Award className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                        {topThree[0].score} pts
                      </div>
                      {topThree[0].details && (
                        <div className="text-[11px] text-amber-200/80 font-medium mt-1">
                          {topThree[0].details}
                        </div>
                      )}
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap justify-center">
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                          {getGameInfo(topThree[0].gameId).name}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          {topThree[0].mode === 'pass_and_play' ? <Smartphone className="w-3 h-3 text-purple-400" /> : <Bot className="w-3 h-3 text-emerald-400" />}
                          {topThree[0].mode === 'pass_and_play' ? 'Pass & Play' : `Vs ${topThree[0].botDifficulty || 'Bot'}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* #3 Bronze (right or 3rd) */}
                  {topThree[2] && (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-4 flex flex-col items-center text-center relative order-3 sm:mt-6 shadow-lg">
                      <div className="w-8 h-8 rounded-full bg-amber-800 text-white font-black text-sm flex items-center justify-center absolute -top-3 shadow-md">
                        3
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-amber-800 flex items-center justify-center text-3xl shadow-md mt-2">
                        {topThree[2].playerAvatar}
                      </div>
                      <div className="font-bold text-white text-sm mt-2">{topThree[2].playerName}</div>
                      <div className="text-xl font-black text-amber-500 font-mono">{topThree[2].score} pts</div>
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap justify-center">
                        <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                          {getGameInfo(topThree[2].gameId).name.split(' ')[0]}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          {topThree[2].mode === 'pass_and_play' ? <Smartphone className="w-2.5 h-2.5" /> : <Bot className="w-2.5 h-2.5" />}
                          {topThree[2].mode === 'pass_and_play' ? 'Pass' : 'Bot'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ranks 4+ Table */}
              {remaining.length > 0 && (
                <div className="bg-slate-950/70 border border-slate-800 rounded-3xl overflow-hidden shadow-inner">
                  <div className="px-5 py-3 border-b border-slate-800/80 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Rankings #4+</span>
                    <span>Score &amp; Date</span>
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {remaining.map((entry, idx) => {
                      const rank = idx + 4;
                      const gameInfo = getGameInfo(entry.gameId);

                      return (
                        <div
                          key={entry.id}
                          className="px-5 py-3 flex items-center justify-between hover:bg-slate-900/50 transition-colors text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-slate-500 w-6 text-center text-xs">
                              #{rank}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-lg shadow-sm">
                              {entry.playerAvatar}
                            </div>
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                <span>{entry.playerName}</span>
                                {entry.isBot && <span className="text-[10px] text-amber-400 font-mono">(Bot)</span>}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>{gameInfo.name}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  {entry.mode === 'pass_and_play' ? (
                                    <Smartphone className="w-3 h-3 text-purple-400" />
                                  ) : (
                                    <Bot className="w-3 h-3 text-emerald-400" />
                                  )}
                                  {entry.mode === 'pass_and_play' ? 'Pass & Play' : `Vs Bot`}
                                </span>
                                {entry.details && (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-500">{entry.details}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-mono font-black text-white text-base">
                              {entry.score} pts
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {formatDate(entry.date)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Clear Options */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Saved locally in your browser storage • Persists offline
          </div>

          <div className="flex items-center gap-2">
            {!showConfirmClear ? (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-slate-400 hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Scores
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-950/50 border border-rose-800 px-3 py-1.5 rounded-xl">
                <span className="text-rose-300 font-semibold text-xs">Reset all?</span>
                <button
                  onClick={handleClear}
                  className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded font-bold"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="text-slate-400 hover:text-white px-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
