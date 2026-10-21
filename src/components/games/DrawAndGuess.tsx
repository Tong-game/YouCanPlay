import React, { useRef, useState, useEffect } from 'react';
import { DrawGuessState, Player, PlayMode, DrawStroke } from '../../types/game';
import { sounds } from '../../services/sound';
import {
  Paintbrush,
  Eraser,
  RotateCcw,
  Trash2,
  Clock,
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface DrawAndGuessProps {
  state: DrawGuessState;
  players: Player[];
  currentPlayer: Player;
  mode: PlayMode;
  onAction: (action: any) => void;
}

const COLORS = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#78350f',
];

const BRUSH_SIZES = [3, 6, 12];

export const DrawAndGuess: React.FC<DrawAndGuessProps> = ({
  state,
  players,
  currentPlayer,
  mode,
  onAction,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(6);
  const [isEraser, setIsEraser] = useState(false);
  const [guessInput, setGuessInput] = useState('');
  const [revealedOfflineSecret, setRevealedOfflineSecret] = useState(false);

  const drawerIndex = state.currentDrawer;
  const drawerPlayer = players[drawerIndex] || { name: 'Drawer', avatar: '🎨' };

  const isMeDrawer = () => {
    if (mode === 'pass_and_play') return true;
    const myIndex = players.findIndex(p => p.id === currentPlayer.id);
    return myIndex === drawerIndex;
  };

  const hasGuessedCorrectly = state.guessedPlayers.includes(currentPlayer.id);

  // Render strokes on canvas whenever strokes change or canvas mounts
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    state.strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.isEraser ? '#ffffff' : stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [state.strokes]);

  // Handle pointer down / move / up
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMeDrawer() || state.status !== 'drawing') return;
    setIsDrawing(true);
    const pt = getCanvasCoords(e);
    setCurrentStroke([pt]);
  };

  const drawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isMeDrawer() || state.status !== 'drawing') return;
    const pt = getCanvasCoords(e);
    const updated = [...currentStroke, pt];
    setCurrentStroke(updated);

    // Live stroke rendering
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (updated.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = isEraser ? '#ffffff' : brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const prev = updated[updated.length - 2];
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    if (!isDrawing || !isMeDrawer()) return;
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      const stroke: DrawStroke = {
        color: brushColor,
        size: brushSize,
        points: currentStroke,
        isEraser,
      };
      onAction({ subType: 'draw_stroke', stroke });
    }
    setCurrentStroke([]);
  };

  const handleClear = () => {
    sounds.playClick();
    onAction({ subType: 'clear_canvas' });
  };

  const handleUndo = () => {
    sounds.playClick();
    onAction({ subType: 'undo_stroke' });
  };

  const handlePickWord = (word: string) => {
    sounds.playClick();
    onAction({ subType: 'choose_word', word });
  };

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;
    onAction({ subType: 'guess_word', guess: guessInput.trim() });
    setGuessInput('');
    sounds.playClick();
  };

  // Status: Choosing Word
  if (state.status === 'choosing') {
    return (
      <div className="max-w-md mx-auto my-10 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-6 shadow-2xl animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-3xl mx-auto">
          ✏️
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            {isMeDrawer() ? 'Choose a Secret Word to Draw!' : `${drawerPlayer.name} is picking a word...`}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Round {state.round} of {state.totalRounds}</p>
        </div>

        {isMeDrawer() && state.wordOptions && (
          <div className="space-y-2">
            {state.wordOptions.map(w => (
              <button
                key={w}
                onClick={() => handlePickWord(w)}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all shadow-md active:scale-98"
              >
                {w}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full px-2 py-4 space-y-4">
      {/* Top Banner: Round, Word / Hint, Timer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{drawerPlayer.avatar}</div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">
              Round {state.round}/{state.totalRounds} • Drawing: {drawerPlayer.name}
            </div>
            {/* Word Display */}
            {isMeDrawer() ? (
              <div className="text-lg font-black text-amber-400 flex items-center gap-2">
                <span>WORD: {state.secretWord}</span>
                <span className="text-xs font-normal text-slate-400">(Draw this!)</span>
              </div>
            ) : (
              <div className="text-lg font-mono font-bold tracking-widest text-indigo-300">
                {state.hint}
              </div>
            )}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="font-mono text-base font-bold text-white">{state.roundTimer}s</span>
        </div>
      </div>

      {/* Main Play Area: Canvas + Live Guess Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Drawing Canvas Area (3 cols) */}
        <div className="lg:col-span-3 flex flex-col items-center bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl">
          {/* Canvas Element */}
          <div className="w-full relative touch-none bg-white rounded-xl overflow-hidden shadow-inner border border-slate-300">
            <canvas
              ref={canvasRef}
              width={700}
              height={440}
              onMouseDown={startDrawing}
              onMouseMove={drawMove}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={drawMove}
              onTouchEnd={endDrawing}
              className={`w-full h-auto aspect-[700/440] ${
                isMeDrawer() ? 'cursor-crosshair' : 'cursor-default'
              }`}
            />
          </div>

          {/* Drawer Toolbar */}
          {isMeDrawer() && (
            <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 border-t border-slate-800">
              {/* Colors */}
              <div className="flex items-center gap-1.5">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setBrushColor(c);
                      setIsEraser(false);
                      sounds.playClick();
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border border-slate-700 transition-transform hover:scale-110 ${
                      brushColor === c && !isEraser ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900' : ''
                    }`}
                  />
                ))}
              </div>

              {/* Sizes */}
              <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
                {BRUSH_SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setBrushSize(s);
                      sounds.playClick();
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      brushSize === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <div
                      className="rounded-full bg-current"
                      style={{ width: s, height: s }}
                    />
                  </button>
                ))}
              </div>

              {/* Tools: Eraser, Undo, Clear */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsEraser(!isEraser);
                    sounds.playClick();
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                    isEraser ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Eraser className="w-4 h-4" />
                </button>

                <button
                  onClick={handleUndo}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
                  title="Undo stroke"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleClear}
                  className="p-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 rounded-xl transition-colors"
                  title="Clear canvas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Guesses & Score Stream (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[400px] lg:h-auto shadow-xl">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Guesses Feed</span>
            <span className="text-[11px] text-indigo-400">{state.guessedPlayers.length} Solved</span>
          </div>

          {/* Guesses List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {state.guesses.map(g => (
              <div
                key={g.id}
                className={`p-2 rounded-xl text-xs ${
                  g.isCorrect
                    ? 'bg-emerald-950/60 border border-emerald-600 text-emerald-300 font-bold'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-400 text-[10px]">{g.playerName}</div>
                <div>{g.text}</div>
              </div>
            ))}
          </div>

          {/* Guess Input for Guessers */}
          {!isMeDrawer() && (
            <form onSubmit={handleGuessSubmit} className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                disabled={hasGuessedCorrectly}
                value={guessInput}
                onChange={e => setGuessInput(e.target.value)}
                placeholder={hasGuessedCorrectly ? 'You guessed it! 🎉' : 'Type your guess...'}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={hasGuessedCorrectly || !guessInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-3 py-2 rounded-xl text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
