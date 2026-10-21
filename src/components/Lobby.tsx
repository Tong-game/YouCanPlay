import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Play,
  CheckCircle,
  Clock,
  Sparkles,
  Gamepad2,
  Share2,
  Crown,
  Grid,
  Crosshair,
  Bomb,
  Palette,
  Hash,
  Shield,
  Layers,
  Building2,
  Ghost,
} from 'lucide-react';
import { Room, GameId, Player } from '../types/game';
import { sounds } from '../services/sound';

interface LobbyProps {
  room: Room | null;
  currentPlayer: Player;
  onCreateRoom: (gameId: GameId, roomName?: string) => void;
  onJoinRoom: (code: string) => void;
  onSelectGame: (gameId: GameId) => void;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onOpenShareModal?: () => void;
}

export const GAME_CATALOG: {
  id: GameId;
  name: string;
  tagline: string;
  icon: any;
  minPlayers: number;
  maxPlayers: number;
  badge: string;
  gradient: string;
}[] = [
  {
    id: 'connect4',
    name: 'Four-in-a-Row Turbo',
    tagline: 'Gravity drops, vertical strategy, connect 4 chips to win!',
    icon: Grid,
    minPlayers: 2,
    maxPlayers: 2,
    badge: '1v1 Tactical',
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'chess',
    name: 'Grandmaster Chess',
    tagline: 'Classic 8x8 battlefield strategy with pawns, knights & checkmates!',
    icon: Crown,
    minPlayers: 2,
    maxPlayers: 2,
    badge: 'Classic 1v1',
    gradient: 'from-amber-600 to-stone-800',
  },
  {
    id: 'uno',
    name: 'Color Clash Uno',
    tagline: 'Fast-paced card madness! Match colors, drop +2s, skips & reverse cards!',
    icon: Layers,
    minPlayers: 2,
    maxPlayers: 4,
    badge: 'Card Hit • 2-4 Players',
    gradient: 'from-rose-600 via-amber-500 to-blue-600',
  },
  {
    id: 'monopoly',
    name: 'Tycoon Monopoly',
    tagline: 'Roll dice, acquire prime real estate, collect rents and dominate the board!',
    icon: Building2,
    minPlayers: 2,
    maxPlayers: 4,
    badge: 'Board Tycoon • 2-4 Players',
    gradient: 'from-emerald-600 to-teal-800',
  },
  {
    id: 'hide_seek',
    name: 'Haunted Hide & Seek',
    tagline: 'Creep through manor rooms, hide behind objects, or hunt as the seeker!',
    icon: Ghost,
    minPlayers: 2,
    maxPlayers: 6,
    badge: 'Party Stealth • 2-6 Players',
    gradient: 'from-purple-700 to-slate-900',
  },
  {
    id: 'word_bomb',
    name: 'Word Bomb Blitz',
    tagline: 'Type words matching the prompt before the ticking bomb explodes!',
    icon: Bomb,
    minPlayers: 2,
    maxPlayers: 8,
    badge: 'Party Hit • 2-8 Players',
    gradient: 'from-rose-600 to-red-700',
  },
  {
    id: 'draw_guess',
    name: 'Pixel Draw & Guess',
    tagline: 'Draw secret words while friends rush to guess in live chat!',
    icon: Palette,
    minPlayers: 2,
    maxPlayers: 8,
    badge: 'Party Creative',
    gradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 'battleship',
    name: 'Tactical Battleship',
    tagline: 'Deploy your fleet in secret, fire radar torpedoes, sink the armada!',
    icon: Crosshair,
    minPlayers: 2,
    maxPlayers: 2,
    badge: 'Naval Combat',
    gradient: 'from-cyan-600 to-blue-700',
  },
  {
    id: 'tictactoe',
    name: 'Neon Tic-Tac-Toe',
    tagline: 'Fast-paced neon grid clash with instant rematches.',
    icon: Hash,
    minPlayers: 2,
    maxPlayers: 2,
    badge: 'Quick Clash',
    gradient: 'from-emerald-600 to-teal-700',
  },
];

export const Lobby: React.FC<LobbyProps> = ({
  room,
  currentPlayer,
  onCreateRoom,
  onJoinRoom,
  onSelectGame,
  onToggleReady,
  onStartGame,
  onLeaveRoom,
  onOpenShareModal,
}) => {
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [selectedGameCatalog, setSelectedGameCatalog] = useState<GameId>('connect4');

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setPublicRooms(data.rooms || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (!room) {
      fetchRooms();
      const interval = setInterval(fetchRooms, 4000);
      return () => clearInterval(interval);
    }
  }, [room]);

  const handleCopyLink = () => {
    if (!room) return;
    const shareUrl = `${window.location.origin}?room=${room.code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    sounds.playCorrect();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const isHost = room ? room.hostId === currentPlayer.id : false;
  const myPlayerInRoom = room?.players.find(p => p.id === currentPlayer.id);
  const isReady = myPlayerInRoom?.isReady ?? false;
  const canStart = isHost && room && room.players.length >= 2;

  // If NOT in a room yet, show Create / Join / Public Rooms browser
  if (!room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Instant Online Multiplayer with Friends
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Host a Game Room or Join Your Friends
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Play Four-in-a-Row, Draw & Guess, Battleship, and Word Bomb in real-time across any phone, tablet, or PC!
          </p>
        </div>

        {/* Create / Join Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Room Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm uppercase tracking-wider mb-1">
                <Crown className="w-4 h-4" />
                Host a New Room
              </div>
              <h3 className="text-xl font-bold text-white">Create Party Room</h3>
              <p className="text-xs text-slate-400 mt-1">
                Select your preferred initial game. You can switch games anytime in the lobby!
              </p>

              {/* Game selection radio buttons */}
              <div className="grid grid-cols-1 gap-2 mt-4">
                {GAME_CATALOG.map(game => (
                  <button
                    key={game.id}
                    onClick={() => {
                      setSelectedGameCatalog(game.id);
                      sounds.playClick();
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                      selectedGameCatalog === game.id
                        ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-tr ${game.gradient} text-white`}>
                        <game.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{game.name}</div>
                        <div className="text-[11px] text-slate-400">{game.badge}</div>
                      </div>
                    </div>
                    {selectedGameCatalog === game.id && (
                      <CheckCircle className="w-4 h-4 text-indigo-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onCreateRoom(selectedGameCatalog);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-transform active:scale-98 flex items-center justify-center gap-2 text-sm"
            >
              <Play className="w-4 h-4" />
              Create & Get Invite Code
            </button>
          </div>

          {/* Join Room Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm uppercase tracking-wider mb-1">
                <Users className="w-4 h-4" />
                Friend Invite
              </div>
              <h3 className="text-xl font-bold text-white">Join Existing Room</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter the 5-letter room code shared by your friend to jump straight into their lobby.
              </p>

              <div className="mt-6 space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  value={joinCodeInput}
                  onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. PARTY"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl p-4 text-center text-2xl font-black font-mono tracking-widest text-indigo-300 placeholder-slate-600 uppercase focus:outline-none"
                />
                <button
                  disabled={!joinCodeInput.trim()}
                  onClick={() => {
                    sounds.playClick();
                    onJoinRoom(joinCodeInput.trim());
                  }}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition-transform active:scale-98 text-sm"
                >
                  Join Room Now
                </button>
              </div>

              {/* Public active rooms preview */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-3">
                  <span>Open Rooms ({publicRooms.length})</span>
                  <button onClick={fetchRooms} className="text-indigo-400 hover:underline">
                    Refresh
                  </button>
                </div>
                {publicRooms.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-600 bg-slate-950/40 rounded-xl border border-slate-800/60">
                    No open rooms found right now. Create one and invite friends!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {publicRooms.map(r => (
                      <div
                        key={r.code}
                        className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs"
                      >
                        <div>
                          <span className="font-bold text-white">{r.name}</span>
                          <span className="text-slate-400 ml-2 font-mono">({r.playerCount}/{r.maxPlayers})</span>
                        </div>
                        <button
                          onClick={() => {
                            sounds.playClick();
                            onJoinRoom(r.code);
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                        >
                          Join {r.code}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ROOM LOBBY SCREEN (when inside room) ---
  const activeCatalog = GAME_CATALOG.find(g => g.id === room.selectedGame) || GAME_CATALOG[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in">
      {/* Room Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="text-center md:text-left">
          <div className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
            Game Room Lobby
          </div>
          <h2 className="text-2xl font-black text-white mt-1">{room.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Waiting for players to ready up... ({room.players.length}/{room.maxPlayers} joined)
          </p>
        </div>

        {/* Room Code & Share / QR Button */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Room Code</div>
            <div className="text-2xl font-black font-mono tracking-widest text-indigo-300">
              {room.code}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (onOpenShareModal) {
                  sounds.playClick();
                  onOpenShareModal();
                } else {
                  handleCopyLink();
                }
              }}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-transform active:scale-95"
              title="Share Link & QR Code"
            >
              <Share2 className="w-4 h-4" />
              <span>Invite Link &amp; QR</span>
            </button>

            <button
              onClick={handleCopyLink}
              className={`p-2 rounded-xl border transition-all ${
                copiedLink
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Copy room link"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Players Roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Connected Players ({room.players.length})</h3>
          </div>
          <span className="text-xs text-slate-400">
            {room.players.length < 2 ? 'Need at least 2 players to start' : 'Ready to play!'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {room.players.map((p, idx) => (
            <div
              key={p.id || idx}
              className={`p-4 rounded-2xl border flex flex-col items-center text-center space-y-2 relative transition-all ${
                p.id === currentPlayer.id
                  ? 'bg-indigo-950/40 border-indigo-600/80 ring-2 ring-indigo-500/20'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              {p.isHost && (
                <span className="absolute top-2 right-2 text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" /> Host
                </span>
              )}

              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md"
                style={{ backgroundColor: p.color }}
              >
                {p.avatar}
              </div>

              <div>
                <div className="font-bold text-white text-sm truncate max-w-[140px]">
                  {p.name} {p.id === currentPlayer.id && '(You)'}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">{p.score} points</div>
              </div>

              <div>
                {p.isReady ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Waiting
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Selector for Host */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Select Game for Room</h3>
          </div>
          {!isHost && <span className="text-xs text-slate-400">Host selects the game</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {GAME_CATALOG.map(game => {
            const isSelected = room.selectedGame === game.id;
            return (
              <button
                key={game.id}
                disabled={!isHost}
                onClick={() => {
                  if (isHost) {
                    sounds.playClick();
                    onSelectGame(game.id);
                  }
                }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30'
                    : isHost
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700 cursor-pointer'
                    : 'bg-slate-950/40 border-slate-800/80 cursor-default opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${game.gradient} text-white`}>
                    <game.icon className="w-5 h-5" />
                  </div>
                  {isSelected && <span className="text-xs font-bold text-indigo-400">ACTIVE</span>}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{game.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{game.tagline}</p>
                </div>
                <div className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md self-start">
                  {game.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lobby Controls Bottom Bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={() => {
            sounds.playClick();
            onLeaveRoom();
          }}
          className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-colors border border-slate-700"
        >
          Leave Room
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onToggleReady();
            }}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-md ${
              isReady
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {isReady ? '✓ Ready' : 'Ready Up'}
          </button>

          {isHost && (
            <button
              disabled={!canStart}
              onClick={() => {
                sounds.playClick();
                onStartGame();
              }}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-40 text-white font-black text-sm rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Play className="w-4 h-4" />
              Launch Match!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
