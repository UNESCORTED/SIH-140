import React, { useState } from 'react';
import { NoiseConfig } from '../types/quantum';
import { ChevronDown, ChevronUp, Sliders } from 'lucide-react';

interface NoiseSimulatorProps {
  noise: NoiseConfig;
  onNoiseChange: (updated: NoiseConfig) => void;
  shots: number;
  onShotsChange: (shots: number) => void;
}

export const NoiseSimulator: React.FC<NoiseSimulatorProps> = ({
  noise,
  onNoiseChange,
  shots,
  onShotsChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-4 shadow-sm flex flex-col gap-3 font-mono">
      {/* Header bar / Accordion trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#141414] border border-white/[0.08] flex items-center justify-center text-white">
            <Sliders size={14} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight font-sans">
                NISQ Noise Simulator & Sampling
              </h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded border ${
                  noise.enabled
                    ? 'bg-white text-black border-white font-medium'
                    : 'bg-[#141414] text-neutral-400 border-white/[0.08]'
                }`}
              >
                {noise.enabled ? 'Noise Active' : 'Ideal Statevector'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-sans">
              Decoherence channels, Pauli error models, and measurement readout errors
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Shots Selector */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 bg-[#121212] px-2.5 py-1.5 rounded-lg border border-white/[0.08]">
            <span className="text-neutral-500">Shots:</span>
            <select
              value={shots}
              onChange={(e) => onShotsChange(parseInt(e.target.value, 10))}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="512" className="bg-[#121212]">512</option>
              <option value="1024" className="bg-[#121212]">1024</option>
              <option value="4096" className="bg-[#121212]">4096</option>
              <option value="8192" className="bg-[#121212]">8192</option>
            </select>
          </div>

          {/* Toggle Noise */}
          <button
            onClick={() => onNoiseChange({ ...noise, enabled: !noise.enabled })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              noise.enabled
                ? 'bg-white text-black'
                : 'bg-[#141414] hover:bg-[#1e1e1e] text-neutral-300 border border-white/[0.08]'
            }`}
          >
            {noise.enabled ? 'Disable Noise' : 'Enable Noise'}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#1e1e1e] text-neutral-400 hover:text-white border border-white/[0.08] transition-colors"
            title={isExpanded ? 'Collapse parameters' : 'Expand parameters'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable Parameters Drawer */}
      {isExpanded && (
        <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-3">
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 ${noise.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            {/* Bit-Flip */}
            <div className="bg-[#121212] p-3 rounded-lg border border-white/[0.06] flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Bit-Flip (px)</span>
                <span className="text-white font-semibold">{(noise.bitFlip * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.25"
                step="0.01"
                value={noise.bitFlip}
                onChange={(e) => onNoiseChange({ ...noise, bitFlip: parseFloat(e.target.value) })}
                className="accent-white h-1.5 bg-[#222222] rounded cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 font-sans">Unwanted Pauli-X inversion</span>
            </div>

            {/* Phase-Flip */}
            <div className="bg-[#121212] p-3 rounded-lg border border-white/[0.06] flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Phase-Flip (pz)</span>
                <span className="text-white font-semibold">{(noise.phaseFlip * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.25"
                step="0.01"
                value={noise.phaseFlip}
                onChange={(e) => onNoiseChange({ ...noise, phaseFlip: parseFloat(e.target.value) })}
                className="accent-white h-1.5 bg-[#222222] rounded cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 font-sans">Pauli-Z phase dephasing</span>
            </div>

            {/* Depolarizing */}
            <div className="bg-[#121212] p-3 rounded-lg border border-white/[0.06] flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Depolarizing (p_depol)</span>
                <span className="text-white font-semibold">{(noise.depolarizing * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.20"
                step="0.01"
                value={noise.depolarizing}
                onChange={(e) => onNoiseChange({ ...noise, depolarizing: parseFloat(e.target.value) })}
                className="accent-white h-1.5 bg-[#222222] rounded cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 font-sans">Uniform isotropic Pauli channel</span>
            </div>

            {/* Readout Error */}
            <div className="bg-[#121212] p-3 rounded-lg border border-white/[0.06] flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Readout (p_meas)</span>
                <span className="text-white font-semibold">{(noise.readoutError * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.20"
                step="0.01"
                value={noise.readoutError}
                onChange={(e) => onNoiseChange({ ...noise, readoutError: parseFloat(e.target.value) })}
                className="accent-white h-1.5 bg-[#222222] rounded cursor-pointer"
              />
              <span className="text-[10px] text-neutral-500 font-sans">Measurement detector distortion</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
