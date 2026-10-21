import React, { useState } from 'react';
import { Volume2, VolumeX, Users, Wifi, Bot, Smartphone, Edit3, Sparkles, Trophy, MessageSquare } from 'lucide-react';
import { PlayMode, Player } from '../types/game';
import { sounds } from '../services/sound';

interface NavbarProps {
  mode: PlayMode;
  onSelectMode: (mode: PlayMode) => void;
  currentPlayer: Player;
  onUpdatePlayer: (updated: Partial<Player>) => void;
  activeRoomCode?: string | null;
  onLeaveRoom?: () => void;
  onlineCount?: number;
  onOpenLeaderboard?: () => void;
  onOpenChat?: () => void;
}

const AVATARS = ['😎', '🦊', '🚀', '👾', '👑', '🐱', '🐼', '🦄', '🔥', '⚡', '🍕', '🎮'];
const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onSelectMode,
  currentPlayer,
  onUpdatePlayer,
  activeRoomCode,
  onLeaveRoom,
  onlineCount,
  onOpenLeaderboard,
  onOpenChat,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempName, setTempName] = useState(currentPlayer.name);
  const [tempAvatar, setTempAvatar] = useState(currentPlayer.avatar);
  const [tempColor, setTempColor] = useState(currentPlayer.color);

  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playClick();
  };

  const handleSaveProfile = () => {
    onUpdatePlayer({
      name: tempName.trim() || 'Player',
      avatar: tempAvatar,
      color: tempColor,
    });
    setShowProfileModal(false);
    sounds.playClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => onSelectMode(mode)}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              PlayParty
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300">
              Online & Offline
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
          <button
            onClick={() => {
              sounds.playClick();
              onSelectMode('online');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'online'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Online Rooms</span>
            <span className="md:hidden">Online</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectMode('pass_and_play');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'pass_and_play'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Pass & Play</span>
            <span className="md:hidden">Pass</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onSelectMode('vs_bot');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'vs_bot'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Vs AI Bot</span>
            <span className="md:hidden">Vs Bot</span>
          </button>
        </div>

        {/* Right Tools: Room info, Sound, Profile */}
        <div className="flex items-center gap-2">
          {activeRoomCode && mode === 'online' && (
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400 font-mono">Room:</span>
              <span className="font-bold text-indigo-300 font-mono tracking-wider">{activeRoomCode}</span>
            </div>
          )}

          {/* Global Online Count Badge */}
          {onlineCount !== undefined && onlineCount > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{onlineCount} Online</span>
            </div>
          )}

          {/* Global Lounge Chat Trigger */}
          {onOpenChat && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenChat();
              }}
              title="Open Global Lounge & Chat"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 transition-colors text-xs font-semibold shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Lounge</span>
            </button>
          )}

          {/* Offline Leaderboard Button */}
          {onOpenLeaderboard && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenLeaderboard();
              }}
              title="View Offline Leaderboard"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition-colors text-xs font-semibold shadow-sm"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Player Profile Quick Edit Button */}
          <button
            onClick={() => {
              setTempName(currentPlayer.name);
              setTempAvatar(currentPlayer.avatar);
              setTempColor(currentPlayer.color);
              setShowProfileModal(true);
            }}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-colors"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-sm"
              style={{ backgroundColor: currentPlayer.color }}
            >
              {currentPlayer.avatar}
            </div>
            <span className="text-xs font-medium max-w-[80px] truncate hidden sm:inline">{currentPlayer.name}</span>
            <Edit3 className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Customize Your Player
            </h3>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Nickname</label>
              <input
                type="text"
                maxLength={16}
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Enter player name"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Pick Avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setTempAvatar(emoji)}
                    className={`h-10 rounded-xl text-lg flex items-center justify-center transition-transform hover:scale-110 ${
                      tempAvatar === emoji ? 'bg-indigo-600/40 border-2 border-indigo-500' : 'bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Badge Color</label>
              <div className="flex items-center gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setTempColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                      tempColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold shadow-lg shadow-indigo-600/30"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
