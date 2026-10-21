import React, { useState } from 'react';
import { BattleshipState, Player, PlayMode, Ship, ShipType } from '../../types/game';
import { sounds } from '../../services/sound';
import { Shield, Crosshair, RotateCw, Shuffle, CheckCircle, Flame, Eye, EyeOff } from 'lucide-react';

interface BattleshipProps {
  state: BattleshipState;
  players: Player[];
  currentPlayer: Player;
  mode: PlayMode;
  onAction: (action: any) => void;
}

const SHIPS_CONFIG: { type: ShipType; name: string; size: number }[] = [
  { type: 'carrier', name: 'Carrier', size: 5 },
  { type: 'battleship', name: 'Battleship', size: 4 },
  { type: 'cruiser', name: 'Cruiser', size: 3 },
  { type: 'submarine', name: 'Submarine', size: 3 },
  { type: 'destroyer', name: 'Destroyer', size: 2 },
];

export const Battleship: React.FC<BattleshipProps> = ({
  state,
  players,
  currentPlayer,
  mode,
  onAction,
}) => {
  const [selectedShipIndex, setSelectedShipIndex] = useState<number>(0);
  const [orientation, setOrientation] = useState<'H' | 'V'>('H');
  const [localShips, setLocalShips] = useState<Ship[]>([]);
  const [isPrivacyCovered, setIsPrivacyCovered] = useState<boolean>(false);

  // Determine which board corresponds to the active user
  const myPlayerIndex =
    mode === 'pass_and_play'
      ? state.currentTurn
      : players.findIndex(p => p.id === currentPlayer.id) === 1
      ? 1
      : 0;

  const opponentIndex = myPlayerIndex === 0 ? 1 : 0;
  const myBoard = state.boards[myPlayerIndex];
  const oppBoard = state.boards[opponentIndex];

  // Helper to generate valid random placements for 5 ships
  const generateRandomShips = (): Ship[] => {
    const ships: Ship[] = [];
    const occupied = new Set<string>();

    for (const config of SHIPS_CONFIG) {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const isH = Math.random() > 0.5;
        const maxR = isH ? 10 : 10 - config.size;
        const maxC = isH ? 10 - config.size : 10;
        const r = Math.floor(Math.random() * maxR);
        const c = Math.floor(Math.random() * maxC);

        const positions: { r: number; c: number }[] = [];
        let collision = false;
        for (let i = 0; i < config.size; i++) {
          const pr = isH ? r : r + i;
          const pc = isH ? c + i : c;
          if (occupied.has(`${pr},${pc}`)) {
            collision = true;
            break;
          }
          positions.push({ r: pr, c: pc });
        }

        if (!collision) {
          positions.forEach(pos => occupied.add(`${pos.r},${pos.c}`));
          ships.push({
            id: `${config.type}-${Date.now()}-${attempts}`,
            type: config.type,
            name: config.name,
            size: config.size,
            positions,
            hits: 0,
            sunk: false,
          });
          placed = true;
        }
      }
    }
    return ships;
  };

  const handleRandomize = () => {
    sounds.playClick();
    const randomized = generateRandomShips();
    setLocalShips(randomized);
  };

  const handleConfirmPlacement = () => {
    if (localShips.length < SHIPS_CONFIG.length) {
      // Auto-generate if incomplete
      const complete = generateRandomShips();
      setLocalShips(complete);
      onAction({ subType: 'place_ships', ships: complete });
    } else {
      onAction({ subType: 'place_ships', ships: localShips });
    }
    sounds.playCorrect();

    if (mode === 'pass_and_play') {
      setIsPrivacyCovered(true);
    }
  };

  const handleAttack = (r: number, c: number) => {
    if (state.phase !== 'battle' || state.winner !== null) return;
    if (mode === 'online' && state.currentTurn !== myPlayerIndex) return;
    if (mode === 'vs_bot' && state.currentTurn !== 0) return;

    // Check if cell already hit or miss
    const cell = oppBoard.grid[r][c];
    if (cell === 'hit' || cell === 'miss') return;

    // Sound effect
    if (cell === 'ship') {
      sounds.playHit();
    } else {
      sounds.playMiss();
    }

    onAction({ subType: 'attack', r, c });

    if (mode === 'pass_and_play') {
      // Trigger pass screen
      setTimeout(() => {
        setIsPrivacyCovered(true);
      }, 700);
    }
  };

  const isMyTurn = () => {
    if (state.phase !== 'battle' || state.winner !== null) return false;
    if (mode === 'pass_and_play') return true;
    if (mode === 'vs_bot') return state.currentTurn === 0;
    return state.currentTurn === myPlayerIndex;
  };

  // Privacy veil for Pass & Play
  if (isPrivacyCovered && mode === 'pass_and_play' && state.winner === null) {
    const nextPlayer = players[state.currentTurn] || { name: `Player ${state.currentTurn + 1}`, avatar: '🎖️' };
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6 animate-in fade-in">
        <div className="w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center mx-auto text-4xl">
          <EyeOff className="w-10 h-10 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">Secret Admiral Turn!</h3>
          <p className="text-slate-400 text-sm mt-2">
            Please hand the device to <span className="text-white font-bold">{nextPlayer.name}</span>. No peeking at enemy fleets!
          </p>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            setIsPrivacyCovered(false);
          }}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
        >
          <Eye className="w-5 h-5" />
          I am {nextPlayer.name}, Ready!
        </button>
      </div>
    );
  }

  // --- PLACEMENT PHASE ---
  if (state.phase === 'placement') {
    const placedAll = myBoard.placedAll;

    return (
      <div className="max-w-4xl mx-auto w-full px-2 py-4 space-y-6">
        {/* Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500 flex items-center justify-center text-indigo-400 font-bold">
              ⚓
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Deploy Your Naval Fleet</h2>
              <p className="text-xs text-slate-400">Position 5 warships or use 1-click Auto Deploy.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Auto Deploy
            </button>
            <button
              onClick={handleConfirmPlacement}
              disabled={placedAll}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {placedAll ? 'Waiting Opponent...' : 'Confirm Fleet'}
            </button>
          </div>
        </div>

        {/* Fleet Grid Preview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col items-center">
          <div className="grid grid-cols-10 gap-1 sm:gap-1.5 p-3 bg-slate-950 rounded-xl border border-slate-800">
            {Array.from({ length: 10 }).map((_, r) =>
              Array.from({ length: 10 }).map((_, c) => {
                const isShip = localShips.some(s => s.positions.some(p => p.r === r && p.c === c));
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-md border flex items-center justify-center text-xs font-mono transition-colors ${
                      isShip
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {isShip && '🚢'}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {SHIPS_CONFIG.map(sc => {
              const placed = localShips.some(s => s.type === sc.type);
              return (
                <div
                  key={sc.type}
                  className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                    placed ? 'bg-indigo-950/60 border-indigo-600 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  <span className="font-bold">{sc.name}</span>
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono">{sc.size} cells</span>
                  {placed && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- BATTLE COMBAT PHASE ---
  const currentShooter = players[state.currentTurn] || { name: `Player ${state.currentTurn + 1}`, avatar: '🎯' };

  return (
    <div className="max-w-5xl mx-auto w-full px-2 py-4 space-y-5">
      {/* Turn Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
            <Crosshair className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Combat Status</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{currentShooter.avatar}</span>
              <span>{currentShooter.name}'s Turn to Fire!</span>
              {isMyTurn() && <span className="text-xs text-emerald-400 font-bold">(Your Turn)</span>}
            </div>
          </div>
        </div>

        {/* Last Attack Callout */}
        {state.lastAttack && (
          <div className="hidden sm:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono">Last Shot:</span>
            <span
              className={`font-bold ${
                state.lastAttack.result === 'hit'
                  ? 'text-amber-400'
                  : state.lastAttack.result === 'sunk'
                  ? 'text-rose-400 animate-pulse'
                  : 'text-slate-500'
              }`}
            >
              {state.lastAttack.result === 'sunk'
                ? `SUNK ${state.lastAttack.shipName}!`
                : state.lastAttack.result.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Two Grids: Enemy Waters (Target) & My Fleet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Attack Grid (Enemy Waters) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Target Enemy Waters</h3>
            </div>
            <span className="text-[11px] text-slate-400">Click cell to launch torpedo</span>
          </div>

          <div className="grid grid-cols-10 gap-1 p-2 bg-slate-950 rounded-xl border border-rose-900/30">
            {Array.from({ length: 10 }).map((_, r) =>
              Array.from({ length: 10 }).map((_, c) => {
                const cell = oppBoard.grid[r][c];
                const isHit = cell === 'hit';
                const isMiss = cell === 'miss';

                return (
                  <button
                    key={`attack-${r}-${c}`}
                    disabled={!isMyTurn() || isHit || isMiss}
                    onClick={() => handleAttack(r, c)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center font-bold text-xs transition-all ${
                      isHit
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse'
                        : isMiss
                        ? 'bg-sky-950 text-sky-400 border border-sky-800/40'
                        : isMyTurn()
                        ? 'bg-slate-900 border border-slate-800 hover:border-rose-500 hover:bg-rose-950/30 cursor-crosshair'
                        : 'bg-slate-900 border border-slate-800 cursor-not-allowed opacity-75'
                    }`}
                  >
                    {isHit ? '💥' : isMiss ? '•' : ''}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* My Fleet Status (Defense Grid) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">My Fleet Defense Grid</h3>
            </div>
            <span className="text-[11px] text-slate-400">Incoming enemy fire</span>
          </div>

          <div className="grid grid-cols-10 gap-1 p-2 bg-slate-950 rounded-xl border border-slate-800">
            {Array.from({ length: 10 }).map((_, r) =>
              Array.from({ length: 10 }).map((_, c) => {
                const isMyShip = myBoard.ships.some(s => s.positions.some(p => p.r === r && p.c === c));
                const attack = myBoard.attacksReceived.find(a => a.r === r && a.c === c);

                return (
                  <div
                    key={`def-${r}-${c}`}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center font-bold text-xs border ${
                      attack?.result === 'hit' || attack?.result === 'sunk'
                        ? 'bg-rose-700 border-rose-500 text-white shadow'
                        : attack?.result === 'miss'
                        ? 'bg-slate-800 border-slate-700 text-sky-400'
                        : isMyShip
                        ? 'bg-indigo-700/80 border-indigo-500 text-indigo-200'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {attack?.result === 'hit' || attack?.result === 'sunk'
                      ? '🔥'
                      : attack?.result === 'miss'
                      ? '•'
                      : isMyShip
                      ? '🚢'
                      : ''}
                  </div>
                );
              })
            )}
          </div>

          {/* Ships Health Roster */}
          <div className="w-full mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {oppBoard.ships.map(ship => (
              <div
                key={ship.id}
                className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                  ship.sunk ? 'bg-rose-950/40 border-rose-800 text-rose-300' : 'bg-slate-800/80 border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-semibold">{ship.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {ship.sunk ? 'DESTROYED' : `${ship.size - ship.hits}/${ship.size} HP`}
                  </div>
                </div>
                {ship.sunk && <Flame className="w-4 h-4 text-rose-500 animate-bounce" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
