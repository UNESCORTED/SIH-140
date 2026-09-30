import React from 'react';
import { StatevectorItem } from '../types/quantum';

interface PhaseDiscsProps {
  statevector: StatevectorItem[];
  probabilities: Record<string, number>;
  measurements: Record<string, number>;
  concurrence: number;
  totalShots?: number;
}

export const PhaseDiscs: React.FC<PhaseDiscsProps> = ({
  statevector,
  probabilities,
  measurements,
  concurrence,
  totalShots = 1024,
}) => {
  // Convert phase in radians to color hue (HSL)
  const getPhaseColor = (phase: number) => {
    // phase is from -PI to PI -> map to 0..360
    let deg = (phase * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return `hsl(${deg}, 85%, 60%)`;
  };

  const isEntangled = concurrence > 0.05;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-4">
      {/* 1. Header with Entanglement Concurrence Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="text-lg">⭕</span> Global State & Phase Discs (Q-Sphere)
          </h3>
          <p className="text-xs text-slate-400">
            Multi-qubit amplitudes with quantum phase rotation dials (resolves Bloch sphere mixed-state collapse)
          </p>
        </div>

        {/* Live Entanglement Meter */}
        <div className="flex items-center gap-3 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-mono">Entanglement Concurrence</span>
            <span
              className={`text-xs font-bold font-mono ${
                isEntangled ? 'text-purple-400' : 'text-slate-400'
              }`}
            >
              {(concurrence * 100).toFixed(1)}% {concurrence >= 0.95 ? '(Maximal Bell State)' : isEntangled ? '(Entangled)' : '(Separable)'}
            </span>
          </div>

          <div className="w-24 h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                concurrence > 0.5 ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 glow-purple' : 'bg-slate-500'
              }`}
              style={{ width: `${Math.max(4, concurrence * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Global Phase Discs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3">
        {statevector.map((item) => {
          const prob = item.probability;
          const probPct = (prob * 100).toFixed(1);
          const phaseDeg = ((item.phase * 180) / Math.PI).toFixed(0);
          const color = getPhaseColor(item.phase);
          const sizePx = Math.max(16, Math.sqrt(prob) * 56); // radius proportional to amplitude

          return (
            <div
              key={item.basis}
              className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                prob > 0.01
                  ? 'bg-slate-950/80 border-slate-700 hover:border-cyan-500/60 shadow-md'
                  : 'bg-slate-950/30 border-slate-900 opacity-40'
              }`}
            >
              {/* Basis state label */}
              <span className="text-xs font-mono font-bold text-cyan-300 mb-2">
                |{item.basis}⟩
              </span>

              {/* Disc representation */}
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                {/* Background phase guide circle */}
                <div className="absolute inset-1 rounded-full border border-dashed border-slate-800" />

                {/* Magnitude disc */}
                <div
                  className="rounded-full transition-all duration-300 relative flex items-center justify-center shadow-lg"
                  style={{
                    width: `${sizePx}px`,
                    height: `${sizePx}px`,
                    backgroundColor: color,
                    opacity: prob > 0.001 ? 0.85 : 0.1,
                  }}
                >
                  {/* Phase clock pointer line */}
                  {prob > 0.01 && (
                    <div
                      className="absolute w-1/2 h-0.5 bg-slate-950 origin-left"
                      style={{
                        transform: `rotate(${phaseDeg}deg)`,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Numerical readout */}
              <div className="mt-2 text-center text-mono">
                <span className="text-xs font-bold text-white block">{probPct}%</span>
                <span className="text-[10px] text-slate-400 block" style={{ color: prob > 0.01 ? color : undefined }}>
                  ∠ {phaseDeg}°
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {item.amplitude.re >= 0 ? '+' : ''}
                  {item.amplitude.re.toFixed(2)}
                  {item.amplitude.im >= 0 ? '+' : ''}
                  {item.amplitude.im.toFixed(2)}i
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Measurement Probability Bar Chart */}
      <div className="mt-2 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            📊 Measurement Shot Distribution ({totalShots} shots sampled)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Blue: Simulated Counts | Purple Bar: Theoretical Prob
          </span>
        </div>

        <div className="space-y-2">
          {Object.entries(probabilities)
            .filter(([_, p]) => p > 0.001 || (measurements[_] || 0) > 0)
            .map(([basis, prob]) => {
              const count = measurements[basis] || 0;
              const measuredPct = ((count / totalShots) * 100).toFixed(1);
              const theoreticalPct = (prob * 100).toFixed(1);

              return (
                <div key={basis} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-12 text-cyan-400 font-bold">|{basis}⟩</span>
                  <div className="flex-1 h-5 bg-slate-950 rounded-md overflow-hidden p-0.5 flex flex-col justify-center border border-slate-800 relative">
                    {/* Simulated shots bar */}
                    <div
                      className="h-full bg-cyan-600/80 rounded transition-all duration-300"
                      style={{ width: `${measuredPct}%` }}
                    />
                    {/* Theoretical marker line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-purple-400 shadow-sm"
                      style={{ left: `${theoreticalPct}%` }}
                      title={`Theoretical: ${theoreticalPct}%`}
                    />
                  </div>
                  <div className="w-24 text-right text-[11px]">
                    <span className="text-white font-bold">{count}</span>
                    <span className="text-slate-400 text-[10px] ml-1">({measuredPct}%)</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
