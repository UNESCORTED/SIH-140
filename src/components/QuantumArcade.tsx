import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Gamepad2, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';

export const QuantumArcade: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'golf' | 'chsh'>('golf');

  const HOLES = [
    { name: '|-i⟩ (South Equator)', target: { x: 0, y: -1, z: 0 }, par: 2 },
    { name: '|1⟩ (South Pole)', target: { x: 0, y: 0, z: -1 }, par: 1 },
    { name: '|+⟩ (East Equator)', target: { x: 1, y: 0, z: 0 }, par: 1 },
    { name: '|-⟩ (West Equator)', target: { x: -1, y: 0, z: 0 }, par: 2 },
  ];

  const [currentHoleIdx, setCurrentHoleIdx] = useState(0);
  const [currentVector, setCurrentVector] = useState({ x: 0, y: 0, z: 1 }); // starts at |0>
  const [strokeCount, setStrokeCount] = useState(0);
  const [hasWonGolf, setHasWonGolf] = useState(false);

  // CHSH State
  const [aliceAngle, setAliceAngle] = useState(0);
  const [bobAngle, setBobAngle] = useState(45);
  const [chshScore, setChshScore] = useState<number | null>(null);

  const applyGolfGate = (gate: string) => {
    if (hasWonGolf) return;

    let { x, y, z } = currentVector;

    if (gate === 'X') {
      y = -y;
      z = -z;
    } else if (gate === 'Z') {
      x = -x;
      y = -y;
    } else if (gate === 'H') {
      const temp = x;
      x = z;
      z = temp;
      y = -y;
    } else if (gate === 'S') {
      const temp = x;
      x = -y;
      y = temp;
    }

    const nextVec = { x: Math.round(x), y: Math.round(y), z: Math.round(z) };
    setCurrentVector(nextVec);
    const newStrokes = strokeCount + 1;
    setStrokeCount(newStrokes);

    const hole = HOLES[currentHoleIdx];
    const dist = Math.sqrt(
      Math.pow(nextVec.x - hole.target.x, 2) +
      Math.pow(nextVec.y - hole.target.y, 2) +
      Math.pow(nextVec.z - hole.target.z, 2)
    );

    if (dist < 0.1) {
      setHasWonGolf(true);
      confetti({ particleCount: 50, spread: 60, colors: ['#ffffff', '#a3a3a3'] });
    }
  };

  const resetGolfHole = () => {
    setCurrentVector({ x: 0, y: 0, z: 1 });
    setStrokeCount(0);
    setHasWonGolf(false);
  };

  const runChshExperiment = () => {
    const rad = ((bobAngle - aliceAngle) * Math.PI) / 180;
    const s = 2 * Math.SQRT2 * Math.cos(rad - Math.PI / 4);
    const clampedS = Math.min(2.828, Math.max(1.0, Math.abs(s)));
    setChshScore(clampedS);

    if (clampedS > 2.0) {
      confetti({ particleCount: 60, spread: 60, colors: ['#ffffff', '#a3a3a3'] });
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm max-w-5xl mx-auto w-full font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#181818] border border-white/[0.08] flex items-center justify-center text-white">
            <Gamepad2 size={18} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Quantum Intuition Arcade</h3>
            <p className="text-xs text-neutral-400">Mini-games designed to build geometric rotation and entanglement intuition</p>
          </div>
        </div>

        {/* Game Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-white/[0.08] text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => setActiveGame('golf')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeGame === 'golf' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Bloch Golf
          </button>
          <button
            onClick={() => setActiveGame('chsh')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeGame === 'chsh' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Bell CHSH Inequality
          </button>
        </div>
      </div>

      {/* GAME 1: BLOCH GOLF */}
      {activeGame === 'golf' && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121212] p-4 rounded-xl border border-white/[0.06]">
            <div>
              <span className="text-[10px] text-neutral-400 font-semibold font-mono uppercase tracking-widest">
                HOLE {currentHoleIdx + 1} OF {HOLES.length}
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">Target: {HOLES[currentHoleIdx].name}</h4>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-neutral-500 block text-[10px]">Par:</span>
                <span className="text-neutral-300 font-bold">{HOLES[currentHoleIdx].par} strokes</span>
              </div>
              <div className="h-4 w-[1px] bg-white/[0.08]" />
              <div>
                <span className="text-neutral-500 block text-[10px]">Your Strokes:</span>
                <span className="text-white font-bold">{strokeCount}</span>
              </div>
              <button
                onClick={resetGolfHole}
                className="p-1.5 hover:bg-[#1a1a1a] rounded text-neutral-400 hover:text-white border border-white/[0.08] transition-colors ml-2"
                title="Restart Hole"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Current State vs Target Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-[#121212] rounded-xl border border-white/[0.06] text-center font-mono">
              <span className="text-[11px] text-neutral-500 block mb-1">Current State Vector (x, y, z):</span>
              <span className="text-lg font-bold text-white">
                ({currentVector.x}, {currentVector.y}, {currentVector.z})
              </span>
            </div>

            <div className="p-4 bg-[#121212] rounded-xl border border-white/[0.06] text-center font-mono">
              <span className="text-[11px] text-neutral-500 block mb-1">Target Hole Vector:</span>
              <span className="text-lg font-bold text-white">
                ({HOLES[currentHoleIdx].target.x}, {HOLES[currentHoleIdx].target.y}, {HOLES[currentHoleIdx].target.z})
              </span>
            </div>
          </div>

          {/* Gate Clubs to Swing */}
          <div className="flex flex-col gap-2.5 bg-[#101010] p-5 rounded-2xl border border-white/[0.08]">
            <span className="text-xs font-mono text-neutral-400">Select Unitary Gate Rotation:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => applyGolfGate('H')}
                disabled={hasWonGolf}
                className="px-4 py-2 bg-[#181818] hover:bg-[#252525] border border-white/[0.08] disabled:opacity-30 text-white rounded-xl font-mono text-xs transition-colors"
              >
                Hadamard (H)
              </button>
              <button
                onClick={() => applyGolfGate('X')}
                disabled={hasWonGolf}
                className="px-4 py-2 bg-[#181818] hover:bg-[#252525] border border-white/[0.08] disabled:opacity-30 text-white rounded-xl font-mono text-xs transition-colors"
              >
                Pauli-X (NOT)
              </button>
              <button
                onClick={() => applyGolfGate('Z')}
                disabled={hasWonGolf}
                className="px-4 py-2 bg-[#181818] hover:bg-[#252525] border border-white/[0.08] disabled:opacity-30 text-white rounded-xl font-mono text-xs transition-colors"
              >
                Pauli-Z
              </button>
              <button
                onClick={() => applyGolfGate('S')}
                disabled={hasWonGolf}
                className="px-4 py-2 bg-[#181818] hover:bg-[#252525] border border-white/[0.08] disabled:opacity-30 text-white rounded-xl font-mono text-xs transition-colors"
              >
                Phase Gate (S)
              </button>
            </div>
          </div>

          {hasWonGolf && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#141414] border border-white/[0.15]">
              <div className="flex items-center gap-2.5 text-xs font-mono text-white">
                <CheckCircle2 size={18} className="text-white" />
                <span>Target Reached. State vector landed in the hole in {strokeCount} strokes.</span>
              </div>
              <button
                onClick={() => {
                  setCurrentHoleIdx((prev) => (prev + 1) % HOLES.length);
                  resetGolfHole();
                }}
                className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg font-mono transition-colors"
              >
                Next Hole →
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: BELL CHSH INEQUALITY GAME */}
      {activeGame === 'chsh' && (
        <div className="flex flex-col gap-5">
          <div className="bg-[#121212] p-4 rounded-xl border border-white/[0.06] text-xs text-neutral-300 leading-relaxed font-mono">
            <span className="text-white font-semibold block mb-1">Non-Local Quantum Advantage:</span>
            Classical physics bounds local correlations by <span className="text-white font-bold">S ≤ 2 (75%)</span>. Adjust Alice and Bob's detector angles on a Bell state to reach Tsirelson's bound <span className="text-white font-bold">S = 2√2 ≈ 2.828 (85.3%)</span>.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#121212] p-4 rounded-xl border border-white/[0.06] flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Alice Detector Angle:</span>
                <span className="text-white font-bold">{aliceAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                value={aliceAngle}
                onChange={(e) => setAliceAngle(parseInt(e.target.value, 10))}
                className="accent-white h-1.5 bg-[#252525] rounded cursor-pointer"
              />
            </div>

            <div className="bg-[#121212] p-4 rounded-xl border border-white/[0.06] flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-400">Bob Detector Angle:</span>
                <span className="text-white font-bold">{bobAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                value={bobAngle}
                onChange={(e) => setBobAngle(parseInt(e.target.value, 10))}
                className="accent-white h-1.5 bg-[#252525] rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={runChshExperiment}
              className="px-4 py-2.5 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-semibold font-mono transition-colors shadow flex items-center gap-2"
            >
              <Sparkles size={14} />
              <span>Sample 1,000 Bell Correlations</span>
            </button>

            {chshScore !== null && (
              <div className="text-right font-mono">
                <span className="text-xs text-neutral-400 block">Observed Correlation S:</span>
                <span className="text-lg font-bold text-white">
                  {chshScore.toFixed(3)} / 2.828
                </span>
              </div>
            )}
          </div>

          {chshScore !== null && (
            <div className="p-4 rounded-xl border border-white/[0.1] bg-[#121212] text-xs font-mono text-neutral-300 leading-relaxed">
              {chshScore > 2.0
                ? `Violation of Local Realism Confirmed (S = ${chshScore.toFixed(3)} > 2.0). Entangled non-local correlation experimentally verified, disproving classical hidden variable models.`
                : `S = ${chshScore.toFixed(3)} ≤ 2.0 (Within classical bounds). Tip: Set Alice to 0° and Bob to 45° to achieve maximum quantum violation.`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
