import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Globe,
  Lock,
  Gamepad2,
  Users,
  Flame,
  ArrowRight,
  Smile,
  Sparkles,
} from 'lucide-react';
import { ChatMessage, GlobalChatMessage, Player } from '../types/game';
import { sounds } from '../services/sound';

interface RoomChatProps {
  chat: ChatMessage[];
  globalChat: GlobalChatMessage[];
  currentPlayer: Player;
  onSendChat: (text: string) => void;
  onSendGlobalChat: (text: string) => void;
  onSendReaction: (emoji: string) => void;
  onJoinRoomFromChat?: (roomCode: string) => void;
  hasActiveRoom?: boolean;
  onlineCount?: number;
}

const REACTION_EMOJIS = [
  { emoji: '🎉', label: 'Party' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💀', label: 'Ded' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '🏆', label: 'Trophy' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '👀', label: 'Eyes' },
];

export const RoomChat: React.FC<RoomChatProps> = ({
  chat,
  globalChat,
  currentPlayer,
  onSendChat,
  onSendGlobalChat,
  onSendReaction,
  onJoinRoomFromChat,
  hasActiveRoom = false,
  onlineCount = 1,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'global' | 'room'>(hasActiveRoom ? 'room' : 'global');
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto switch tab if room changes
  useEffect(() => {
    if (hasActiveRoom) {
      setActiveTab('room');
    }
  }, [hasActiveRoom]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setUnreadCount(prev => prev + 1);
    }
  }, [chat.length, globalChat.length, isOpen, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (activeTab === 'global') {
      onSendGlobalChat(inputText.trim());
    } else {
      onSendChat(inputText.trim());
    }

    setInputText('');
    sounds.playClick();
  };

  const handleReaction = (emoji: string) => {
    onSendReaction(emoji);
    sounds.playClick();
  };

  const currentMessages = activeTab === 'global' ? globalChat : chat;

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        {/* Quick Reactions Bar */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full px-2 py-1.5 flex items-center gap-1 shadow-xl">
          {REACTION_EMOJIS.slice(0, 4).map(item => (
            <button
              key={item.emoji}
              onClick={() => handleReaction(item.emoji)}
              className="text-lg hover:scale-130 transition-transform p-1 hover:bg-slate-800 rounded-full active:scale-95"
              title={item.label}
            >
              {item.emoji}
            </button>
          ))}
        </div>

        {/* Chat Toggle Button with Online Count Pill */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            sounds.playClick();
          }}
          className="relative bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-3.5 rounded-full shadow-lg shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
          title="Open Global Lounge & Room Chat"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Slide-over Drawer / Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-3 sm:right-5 z-50 w-[92vw] sm:w-[400px] h-[500px] bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6">
          {/* Header with Tabs */}
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            {/* Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setActiveTab('global');
                  sounds.playClick();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'global'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-indigo-300" />
                <span>Global Lounge</span>
              </button>

              <button
                onClick={() => {
                  if (hasActiveRoom) {
                    setActiveTab('room');
                    sounds.playClick();
                  }
                }}
                disabled={!hasActiveRoom}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  !hasActiveRoom
                    ? 'opacity-40 cursor-not-allowed text-slate-500'
                    : activeTab === 'room'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Room Chat</span>
              </button>
            </div>

            {/* Online indicator & Close button */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{onlineCount} Online</span>
              </span>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Reaction Bar in Chat */}
          <div className="px-3 py-1.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between gap-1">
            {REACTION_EMOJIS.map(item => (
              <button
                key={item.emoji}
                onClick={() => handleReaction(item.emoji)}
                className="text-base p-1 hover:bg-slate-800 rounded-lg transition-transform hover:scale-125"
                title={item.label}
              >
                {item.emoji}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentMessages.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-16 space-y-2">
                <div className="text-3xl">💬</div>
                <div className="font-semibold text-slate-400">
                  {activeTab === 'global' ? 'Welcome to the Global Lounge!' : 'No messages in room yet.'}
                </div>
                <p className="max-w-[200px] mx-auto text-[11px]">
                  {activeTab === 'global'
                    ? 'Say hello to players from around the world!'
                    : 'Chat with everyone in your match!'}
                </p>
              </div>
            ) : (
              currentMessages.map((msg: any) => {
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-1.5">
                      <span className="inline-block text-[11px] bg-slate-800/80 border border-slate-700/60 text-indigo-300 px-3 py-1 rounded-full shadow-sm">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isMe = msg.senderId === currentPlayer.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
                      <span>{msg.avatar}</span>
                      <span className="font-semibold text-slate-300">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-600">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                        isMe
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none'
                      }`}
                    >
                      {msg.text}

                      {/* Clickable Room Invite Card */}
                      {msg.roomInvite && (
                        <div className="mt-2 p-2.5 bg-slate-950/80 border border-indigo-500/50 rounded-xl text-left text-xs space-y-1.5 shadow-md">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-amber-400 flex items-center gap-1">
                              <Gamepad2 className="w-3.5 h-3.5" />
                              Match Invite: {msg.roomInvite.gameName}
                            </span>
                            <span className="font-mono font-bold text-indigo-300">
                              #{msg.roomInvite.roomCode}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              sounds.playClick();
                              if (onJoinRoomFromChat) {
                                onJoinRoomFromChat(msg.roomInvite.roomCode);
                                setIsOpen(false);
                              }
                            }}
                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow"
                          >
                            <span>Join Match</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950/70 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={
                activeTab === 'global'
                  ? 'Message anyone in Global Lounge...'
                  : 'Message room players...'
              }
              maxLength={200}
              className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center transition-all shadow-md shadow-indigo-600/30"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
