import React from 'react';
import { CircuitState } from '../types/quantum';
import { IBM_FALCON_5Q, computeTopologyOverhead } from '../quantum/transpiler';
import { X, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NISQTopologyModalProps {
  circuit: CircuitState;
  onClose: () => void;
}

export const NISQTopologyModal: React.FC<NISQTopologyModalProps> = ({ circuit, onClose }) => {
  const overhead = computeTopologyOverhead(circuit.gates, IBM_FALCON_5Q);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e0e0e] border border-white/[0.1] rounded-2xl w-full max-w-xl p-6 shadow-2xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg bg-[#181818] hover:bg-[#252525] text-neutral-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.08]">
          <div className="w-8 h-8 rounded-lg bg-[#181818] border border-white/[0.08] flex items-center justify-center text-white">
            <Layers size={16} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight font-sans">
              NISQ QPU Topology & Routing
            </h3>
            <p className="text-xs text-neutral-400">Physical qubit coupling architecture: {IBM_FALCON_5Q.name}</p>
          </div>
        </div>

        {/* Chip Coupling Diagram Visualizer */}
        <div className="bg-[#050505] p-5 rounded-xl border border-white/[0.06] flex flex-col items-center gap-4">
          <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
            Physical Coupling Graph:
          </span>

          {/* Simple T-shape physical layout */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-neutral-500">Q[4]</span>
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-white/[0.2] flex items-center justify-center font-bold text-white">
                Q4
              </div>
            </div>

            <div className="w-6 h-[1px] bg-white/[0.2]" />

            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-neutral-400">Q[1] (Central)</span>
              <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-bold shadow-md">
                Q1
              </div>
            </div>

            <div className="w-6 h-[1px] bg-white/[0.2]" />

            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-neutral-500">Q[2]</span>
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-white/[0.2] flex items-center justify-center font-bold text-white">
                Q2
              </div>
            </div>

            <div className="w-6 h-[1px] bg-white/[0.2]" />

            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-neutral-500">Q[3]</span>
              <div className="w-10 h-10 rounded-full bg-[#181818] border border-white/[0.2] flex items-center justify-center font-bold text-white">
                Q3
              </div>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 text-center max-w-md font-mono leading-relaxed">
            Coupling lines represent physical microwave resonator buses. Native CNOT gates are supported across connected pairs: (0-1), (1-2), (2-3), (1-4).
          </p>
        </div>

        {/* Transpilation Telemetry */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#121212] rounded-xl border border-white/[0.06] text-center font-mono">
            <span className="text-[11px] text-neutral-500 block">Required SWAP Operations:</span>
            <span className="text-base font-bold text-white">
              {overhead.requiredSwaps} SWAPs
            </span>
          </div>

          <div className="p-3 bg-[#121212] rounded-xl border border-white/[0.06] text-center font-mono">
            <span className="text-[11px] text-neutral-500 block">Transpiled Depth Overhead:</span>
            <span className="text-base font-bold text-white">
              +{overhead.depthPenalty} Depth
            </span>
          </div>
        </div>

        {/* Transpiler Diagnostics */}
        {overhead.uncoupledGates.length > 0 ? (
          <div className="p-3 rounded-xl bg-[#121212] border border-white/[0.1] text-xs text-neutral-300 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-neutral-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5 text-white">Physical Routing Overhead:</span>
              Your circuit contains {overhead.uncoupledGates.length} multi-qubit gate(s) between disconnected physical qubits. Intermediate SWAP gates must be scheduled by the transpiler.
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[#121212] border border-white/[0.1] text-xs text-neutral-300 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-white shrink-0" />
            <span>All multi-qubit operations in your circuit are 100% natively routable with 0 SWAP overhead.</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-semibold font-mono transition-colors shadow"
        >
          Close Inspector
        </button>
      </div>
    </div>
  );
};
