import React, { useState } from 'react';
import { StatevectorItem, BlochVector } from '../types/quantum';
import { BlochSphere3D } from './BlochSphere3D';
import { Circle, BarChart3, Binary, Compass } from 'lucide-react';

interface VisualizationTabsProps {
  numQubits: number;
  blochVectors: BlochVector[];
  statevector: StatevectorItem[];
  probabilities: Record<string, number>;
  measurements: Record<string, number>;
  concurrence: number;
  totalShots?: number;
}

export const VisualizationTabs: React.FC<VisualizationTabsProps> = ({
  numQubits,
  blochVectors,
  statevector,
  probabilities,
  measurements,
  concurrence,
  totalShots = 1024,
}) => {
  const [activeTab, setActiveTab] = useState<'bloch' | 'qsphere' | 'measurements' | 'statevector'>('bloch');

  const isEntangled = concurrence > 0.05;

  // Format Dirac Bra-Ket string
  const diracString = statevector
    .filter((s) => s.probability > 0.0001)
    .map((s, idx) => {
      const ampMag = Math.sqrt(s.probability).toFixed(3);
      const prefix = idx > 0 ? ' + ' : '';
      return `${prefix}${ampMag}|${s.basis}⟩`;
    })
    .join('');

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-5 shadow-sm flex flex-col gap-4">
      {/* 1. Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-white/[0.08] text-xs font-mono">
            <button
              onClick={() => setActiveTab('bloch')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 font-medium ${
                activeTab === 'bloch'
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Compass size={14} />
              <span>Bloch Sphere</span>
            </button>

            <button
              onClick={() => setActiveTab('qsphere')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 font-medium ${
                activeTab === 'qsphere'
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Circle size={14} />
              <span>Q-Sphere</span>
            </button>

            <button
              onClick={() => setActiveTab('measurements')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 font-medium ${
                activeTab === 'measurements'
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart3 size={14} />
              <span>Probabilities</span>
            </button>

            <button
              onClick={() => setActiveTab('statevector')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 font-medium ${
                activeTab === 'statevector'
                  ? 'bg-white text-black shadow-sm font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Binary size={14} />
              <span>Statevector</span>
            </button>
          </div>
        </div>

        {/* Live Entanglement Status */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 bg-[#121212] px-3 py-1.5 rounded-lg border border-white/[0.06]">
            <span className="text-neutral-500">Concurrence:</span>
            <span className="text-white font-medium">
              {(concurrence * 100).toFixed(1)}%
            </span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">
              {concurrence >= 0.95 ? 'Maximal Bell State' : isEntangled ? 'Entangled' : 'Separable'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TAB 1: 3D BLOCH SPHERES */}
      {activeTab === 'bloch' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Individual single-qubit Bloch vector projections for active register ({numQubits} qubits)</span>
            <span className="text-neutral-500">Click & drag to rotate sphere</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blochVectors.slice(0, numQubits).map((bv, idx) => (
              <BlochSphere3D key={idx} vector={bv} qubitIndex={idx} />
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB 2: Q-SPHERE / PHASE DISCS */}
      {activeTab === 'qsphere' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-400 font-mono gap-2">
            <span>Global multi-qubit amplitudes $|c_i|$ and quantum phase rotation angles $\phi$</span>
            <span className="text-neutral-500">Needle indicates phase $\phi \in [-\pi, \pi]$</span>
          </div>

          {/* Entanglement Concurrence Bar */}
          <div className="bg-[#121212] border border-white/[0.06] rounded-xl p-3 flex items-center justify-between gap-4 font-mono text-xs">
            <span className="text-neutral-400">Quantum Entanglement Metric:</span>
            <div className="flex-1 max-w-md flex items-center gap-3">
              <div className="flex-1 h-2 bg-[#222222] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300 rounded-full"
                  style={{ width: `${Math.max(2, concurrence * 100)}%` }}
                />
              </div>
              <span className="text-white font-medium min-w-[45px] text-right">
                {(concurrence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Amplitude Discs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-3">
            {statevector.map((item) => {
              const prob = item.probability;
              const probPct = (prob * 100).toFixed(1);
              const phaseDeg = ((item.phase * 180) / Math.PI).toFixed(0);
              const sizePx = Math.max(12, Math.sqrt(prob) * 58);

              return (
                <div
                  key={item.basis}
                  className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
                    prob > 0.01
                      ? 'bg-[#121212] border-white/[0.12] hover:border-white/[0.25]'
                      : 'bg-[#0d0d0d] border-white/[0.04] opacity-30'
                  }`}
                >
                  {/* Basis label */}
                  <span className="text-xs font-mono font-medium text-white mb-2">
                    |{item.basis}⟩
                  </span>

                  {/* Disc graphic */}
                  <div className="w-16 h-16 rounded-full bg-[#181818] border border-white/[0.08] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-1 rounded-full border border-dashed border-white/[0.08]" />

                    {/* Magnitude disc */}
                    <div
                      className="rounded-full transition-all duration-300 relative flex items-center justify-center bg-white"
                      style={{
                        width: `${sizePx}px`,
                        height: `${sizePx}px`,
                        opacity: prob > 0.001 ? 0.9 : 0.15,
                      }}
                    >
                      {/* Phase needle pointer */}
                      {prob > 0.01 && (
                        <div
                          className="absolute w-1/2 h-[1.5px] bg-black origin-left"
                          style={{
                            transform: `rotate(${phaseDeg}deg)`,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Readout */}
                  <div className="mt-2 text-center font-mono">
                    <span className="text-xs font-medium text-white block">{probPct}%</span>
                    <span className="text-[10px] text-neutral-400 block">∠ {phaseDeg}°</span>
                    <span className="text-[9px] text-neutral-500 block">
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
        </div>
      )}

      {/* 4. TAB 3: MEASUREMENT PROBABILITIES */}
      {activeTab === 'measurements' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Simulated sampling distribution ({totalShots} shots sampled in Z-basis)</span>
            <span className="text-neutral-500">Pure State & NISQ Noise Injected</span>
          </div>

          <div className="flex flex-col gap-2.5 bg-[#101010] p-4 rounded-xl border border-white/[0.06]">
            {Object.entries(probabilities)
              .filter(([_, p]) => p > 0.001 || (measurements[_] || 0) > 0)
              .map(([basis, prob]) => {
                const count = measurements[basis] || 0;
                const measuredPct = ((count / totalShots) * 100).toFixed(1);
                const theoreticalPct = (prob * 100).toFixed(1);

                return (
                  <div key={basis} className="flex flex-col gap-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">|{basis}⟩</span>
                        <span className="text-[11px] text-neutral-400">
                          {count} shots ({measuredPct}%)
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Theoretical: {theoreticalPct}%
                      </div>
                    </div>

                    {/* Bar visualization */}
                    <div className="w-full h-3 bg-[#1e1e1e] rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(2, parseFloat(measuredPct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 5. TAB 4: EXACT STATEVECTOR */}
      {activeTab === 'statevector' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>Exact complex mathematical statevector $|\psi\rangle$</span>
            <span className="text-neutral-500">Normalized: $\sum |c_i|^2 = 1.000$</span>
          </div>

          {/* Dirac Bra-Ket representation */}
          <div className="bg-[#121212] p-3.5 rounded-xl border border-white/[0.08] font-mono text-xs text-white">
            <span className="text-neutral-400 block text-[11px] mb-1">// Dirac Notation:</span>
            <div className="text-sm font-semibold tracking-wide text-neutral-100">
              |ψ⟩ = {diracString || '|0...0⟩'}
            </div>
          </div>

          {/* Full Table */}
          <div className="bg-[#101010] rounded-xl border border-white/[0.08] overflow-hidden">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#161616] text-neutral-400 text-[11px]">
                  <th className="py-2.5 px-4 font-medium">Basis State |x⟩</th>
                  <th className="py-2.5 px-4 font-medium">Real (Re)</th>
                  <th className="py-2.5 px-4 font-medium">Imag (Im)</th>
                  <th className="py-2.5 px-4 font-medium">Phase (deg)</th>
                  <th className="py-2.5 px-4 font-medium text-right">Probability |c_i|²</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {statevector.map((s) => (
                  <tr
                    key={s.basis}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      s.probability > 0.001 ? 'text-white' : 'text-neutral-500'
                    }`}
                  >
                    <td className="py-2 px-4 font-medium">|{s.basis}⟩</td>
                    <td className="py-2 px-4">{s.amplitude.re.toFixed(4)}</td>
                    <td className="py-2 px-4">{s.amplitude.im.toFixed(4)}</td>
                    <td className="py-2 px-4">{((s.phase * 180) / Math.PI).toFixed(1)}°</td>
                    <td className="py-2 px-4 text-right font-medium">
                      {(s.probability * 100).toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
