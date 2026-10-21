import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  QrCode,
  Send,
  MessageCircle,
  ExternalLink,
  Sparkles,
  Users,
} from 'lucide-react';
import { Room } from '../types/game';
import { sounds } from '../services/sound';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  onShareToGlobalChat?: (roomCode: string, gameName: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  room,
  onShareToGlobalChat,
}) => {
  const [copied, setCopied] = useState(false);
  const [sharedToGlobal, setSharedToGlobal] = useState(false);
  const [showQR, setShowQR] = useState(true);

  if (!isOpen || !room) return null;

  const roomUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}?room=${room.code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    sounds.playCorrect();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    sounds.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my ${room.name} on PlayParty!`,
          text: `Come play ${room.selectedGame.toUpperCase()} with me! Click the link or use room code ${room.code}:`,
          url: roomUrl,
        });
      } catch (err) {
        // Fallback to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleBroadcastToGlobal = () => {
    if (onShareToGlobalChat) {
      sounds.playClick();
      onShareToGlobalChat(room.code, room.selectedGame);
      setSharedToGlobal(true);
      setTimeout(() => setSharedToGlobal(false), 3000);
    }
  };

  // Pure SVG QR code placeholder / matrix generator
  // Generates reliable visual scannable pattern or fallback
  const qrSvgUrl = `https://YouCanplay.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    roomUrl
  )}&bgcolor=0f172a&color=ffffff&margin=1`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden space-y-6">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Invite Friends Anywhere</h3>
              <p className="text-xs text-slate-400">Send this link to anyone to play instantly</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room Code Callout */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">5-Letter Room Code</div>
            <div className="text-2xl font-black font-mono tracking-widest text-indigo-300">
              {room.code}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Game</span>
            <span className="text-xs font-bold text-white uppercase">{room.selectedGame}</span>
          </div>
        </div>

        {/* Direct Link Copy Box */}
        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 font-semibold block">Instant Play Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={roomUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 truncate focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* QR Code Container */}
        {showQR && (
          <div className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl flex flex-col items-center text-center space-y-2">
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 shadow-md">
              <img
                src={qrSvgUrl}
                alt={`Scan to join room ${room.code}`}
                className="w-40 h-40 rounded-lg object-contain"
                loading="lazy"
                onError={e => {
                  // Fallback if image proxy unavailable
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>Point phone camera at code to open &amp; play</span>
            </div>
          </div>
        )}

        {/* Action Buttons: Native Share + Broadcast to Global Lounge */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleNativeShare}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-transform active:scale-98"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via WhatsApp / Discord / Messages</span>
          </button>

          {onShareToGlobalChat && (
            <button
              onClick={handleBroadcastToGlobal}
              disabled={sharedToGlobal}
              className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                sharedToGlobal
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {sharedToGlobal ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Shared to Global Lounge!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>📢 Broadcast Invite to Global Chat</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
