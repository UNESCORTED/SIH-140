import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';

export const QECSandbox: React.FC = () => {
  const [corruptedQubit, setCorruptedQubit] = useState<number | null>(null);
  const [isCorrected, setIsCorrected] = useState(false);
  const [stepState, setStepState] = useState<'clean' | 'corrupted' | 'syndrome_measured' | 'restored'>('clean');

  const handleInjectNoise = (qubitIndex: number) => {
    setCorruptedQubit(qubitIndex);
    setIsCorrected(false);
    setStepState('corrupted');
  };

  const handleAutoCorrect = () => {
    setIsCorrected(true);
    setStepState('restored');
  };

  const handleReset = () => {
    setCorruptedQubit(null);
    setIsCorrected(false);
    setStepState('clean');
  };

  let s0 = 0;
  let s1 = 0;
  if (corruptedQubit === 0) {
    s0 = 1;
    s1 = 0;
  } else if (corruptedQubit === 1) {
    s0 = 1;
    s1 = 1;
  } else if (corruptedQubit === 2) {
    s0 = 0;
    s1 = 1;
  }

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm max-w-5xl mx-auto w-full font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#181818] border border-white/[0.08] flex items-center justify-center text-white">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">3-Qubit Quantum Error Correction (QEC) Sandbox</h3>
            <p className="text-xs text-neutral-400">
              Bit-flip repetition code with syndrome stabilizer measurement and autonomous recovery
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs bg-[#141414] hover:bg-[#1e1e1e] text-neutral-300 hover:text-white px-3.5 py-2 rounded-xl border border-white/[0.08] font-mono transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={13} />
          <span>Reset Sandbox</span>
        </button>
      </div>

      {/* Workflow Steps Guide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#121212] p-4 rounded-xl border border-white/[0.06] flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">1. Encoding</span>
          <p className="text-xs text-white font-mono font-medium">|ψ⟩ = α|0⟩ + β|1⟩</p>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            CNOT gates entangle 1 logical qubit into 3 physical qubits: α|000⟩ + β|111⟩
          </p>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col gap-1.5 transition-all ${stepState === 'corrupted' ? 'bg-[#181818] border-white' : 'bg-[#121212] border-white/[0.06]'}`}>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">2. Error Channel</span>
          <p className="text-xs text-white font-mono font-medium">
            {corruptedQubit !== null ? `Bit-Flip on q[${corruptedQubit}]` : 'Status: No error yet'}
          </p>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Simulates physical decoherence flipping a qubit during memory hold
          </p>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col gap-1.5 transition-all ${corruptedQubit !== null ? 'bg-[#181818] border-white' : 'bg-[#121212] border-white/[0.06]'}`}>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">3. Syndrome Parity</span>
          <p className="text-xs text-white font-mono font-medium">
            Syndrome [s0, s1] = [{s0}, {s1}]
          </p>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Measures parity without collapsing the quantum superposition state
          </p>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col gap-1.5 transition-all ${stepState === 'restored' ? 'bg-[#181818] border-white' : 'bg-[#121212] border-white/[0.06]'}`}>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">4. Recovery</span>
          <p className="text-xs text-white font-mono font-medium">
            Fidelity: {isCorrected || corruptedQubit === null ? '100% (Restored)' : '0% (Corrupted)'}
          </p>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Applies X correction gate to restore original state intact
          </p>
        </div>
      </div>

      {/* Interactive Controls & Diagram */}
      <div className="bg-[#101010] p-5 rounded-2xl border border-white/[0.08] flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-mono text-neutral-400">Inject Single-Qubit Bit-Flip:</span>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => handleInjectNoise(idx)}
                className="px-3.5 py-1.5 bg-[#181818] hover:bg-[#252525] text-neutral-200 hover:text-white border border-white/[0.08] text-xs rounded-lg font-mono transition-colors"
              >
                Flip Qubit q[{idx}]
              </button>
            ))}
          </div>
        </div>

        {/* 3 Physical Qubit States Visualizer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((qIdx) => {
            const isFlipped = corruptedQubit === qIdx && !isCorrected;
            return (
              <div
                key={qIdx}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  isFlipped
                    ? 'bg-[#1a1a1a] border-white text-white'
                    : 'bg-[#141414] border-white/[0.06] text-neutral-300'
                }`}
              >
                <span className="text-xs font-mono text-neutral-400">Physical Qubit q[{qIdx}]</span>
                <span className="text-lg font-mono font-bold">
                  {isFlipped ? '|1⟩ (Corrupted)' : isCorrected ? '|0⟩ (Restored)' : '|0⟩ (Protected)'}
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  {isFlipped ? 'Bit-Flip Detected' : 'Stabilized'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Trigger */}
        {corruptedQubit !== null && !isCorrected && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#141414] border border-white/[0.12]">
            <div className="font-mono text-xs">
              <p className="text-white font-medium">
                Syndrome Parity Checks: q0⊕q1 = {s0}, q1⊕q2 = {s1}
              </p>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Fault isolated to physical qubit: <span className="text-white font-bold">q[{corruptedQubit}]</span>
              </p>
            </div>

            <button
              onClick={handleAutoCorrect}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-semibold font-mono transition-colors shadow shrink-0"
            >
              <Zap size={14} />
              <span>Apply X Correction Gate</span>
            </button>
          </div>
        )}

        {isCorrected && (
          <div className="flex items-center gap-2.5 text-xs font-mono text-white bg-[#141414] border border-white/[0.15] p-3.5 rounded-xl">
            <CheckCircle2 size={16} className="text-white shrink-0" />
            <span>Quantum Error Corrected. The syndrome detected the flipped qubit and restored the logical state without destroying superposition.</span>
          </div>
        )}
      </div>
    </div>
  );
};
