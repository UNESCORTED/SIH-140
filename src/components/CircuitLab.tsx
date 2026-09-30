import React, { useState, useEffect } from 'react';
import { GatePlacement, GateType, CircuitState } from '../types/quantum';
import { ChevronLeft, ChevronRight, Play, Pause, Trash2, Plus, Minus, RotateCcw } from 'lucide-react';

interface CircuitLabProps {
  circuit: CircuitState;
  onCircuitChange: (updated: CircuitState) => void;
  highlightGateId?: string;
  onOpenTopology?: () => void;
}

const MONO_GATES: Array<{ type: GateType; label: string; tooltip: string }> = [
  { type: 'H', label: 'H', tooltip: 'Hadamard (Superposition)' },
  { type: 'X', label: 'X', tooltip: 'Pauli-X (NOT / Bit Flip)' },
  { type: 'Y', label: 'Y', tooltip: 'Pauli-Y (Bit+Phase Flip)' },
  { type: 'Z', label: 'Z', tooltip: 'Pauli-Z (Phase Flip)' },
  { type: 'S', label: 'S', tooltip: 'Phase Gate (π/2 Z-rotation)' },
  { type: 'T', label: 'T', tooltip: 'T Gate (π/4 Z-rotation)' },
  { type: 'RX', label: 'Rx', tooltip: 'X-Rotation (π/2)' },
  { type: 'RY', label: 'Ry', tooltip: 'Y-Rotation (π/2)' },
  { type: 'RZ', label: 'Rz', tooltip: 'Z-Rotation (π/2)' },
  { type: 'CX', label: 'CNOT', tooltip: 'Controlled-NOT (Entanglement)' },
  { type: 'CZ', label: 'CZ', tooltip: 'Controlled-Z' },
  { type: 'SWAP', label: 'SWAP', tooltip: 'Swap Qubits' },
  { type: 'M', label: 'M', tooltip: 'Measurement (Z-basis)' },
];

export const CircuitLab: React.FC<CircuitLabProps> = ({
  circuit,
  onCircuitChange,
  highlightGateId,
  onOpenTopology,
}) => {
  const [selectedGateType, setSelectedGateType] = useState<GateType>('H');
  const [isPlaying, setIsPlaying] = useState(false);
  const [controlQubitSelection, setControlQubitSelection] = useState<number | null>(null);

  const numCols = Math.max(8, ...circuit.gates.map((g) => g.step + 3));
  const maxCircuitDepth = circuit.gates.length > 0 ? Math.max(...circuit.gates.map((g) => g.step)) + 1 : 0;
  const currentScrubStep = circuit.activeStep >= 0 ? circuit.activeStep : maxCircuitDepth;

  // Auto-play loop for time travel
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        const maxStep = Math.max(0, ...circuit.gates.map((g) => g.step));
        onCircuitChange({
          ...circuit,
          activeStep: circuit.activeStep >= maxStep ? 0 : circuit.activeStep + 1,
        });
      }, 950);
    }
    return () => clearInterval(timer);
  }, [isPlaying, circuit, onCircuitChange]);

  const handleCellClick = (q: number, step: number) => {
    // Check if cell already has a gate
    const existing = circuit.gates.find((g) => g.qubit === q && g.step === step);
    if (existing) {
      onCircuitChange({
        ...circuit,
        gates: circuit.gates.filter((g) => g.id !== existing.id),
      });
      return;
    }

    // 2-Qubit gates
    if (selectedGateType === 'CX' || selectedGateType === 'CZ' || selectedGateType === 'SWAP') {
      if (controlQubitSelection === null) {
        setControlQubitSelection(q);
      } else {
        if (controlQubitSelection !== q) {
          const newGate: GatePlacement = {
            id: `g_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            gate: selectedGateType,
            qubit: q,
            controlQubit: controlQubitSelection,
            step,
          };
          onCircuitChange({
            ...circuit,
            gates: [...circuit.gates, newGate],
          });
        }
        setControlQubitSelection(null);
      }
      return;
    }

    // 1-Qubit gate
    const newGate: GatePlacement = {
      id: `g_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      gate: selectedGateType,
      qubit: q,
      step,
      param: selectedGateType.startsWith('R') ? Math.PI / 2 : undefined,
    };

    onCircuitChange({
      ...circuit,
      gates: [...circuit.gates, newGate],
    });
  };

  const loadPreset = (presetName: string) => {
    let newGates: GatePlacement[] = [];
    let numQ = circuit.numQubits;

    if (presetName === 'bell') {
      numQ = 2;
      newGates = [
        { id: 'b_1', gate: 'H', qubit: 0, step: 0 },
        { id: 'b_2', gate: 'CX', qubit: 1, controlQubit: 0, step: 1 },
      ];
    } else if (presetName === 'ghz') {
      numQ = 3;
      newGates = [
        { id: 'g_1', gate: 'H', qubit: 0, step: 0 },
        { id: 'g_2', gate: 'CX', qubit: 1, controlQubit: 0, step: 1 },
        { id: 'g_3', gate: 'CX', qubit: 2, controlQubit: 1, step: 2 },
      ];
    } else if (presetName === 'teleport') {
      numQ = 3;
      newGates = [
        { id: 't_prep', gate: 'H', qubit: 0, step: 0 },
        { id: 't_ent1', gate: 'H', qubit: 1, step: 1 },
        { id: 't_ent2', gate: 'CX', qubit: 2, controlQubit: 1, step: 2 },
        { id: 't_alice1', gate: 'CX', qubit: 1, controlQubit: 0, step: 3 },
        { id: 't_alice2', gate: 'H', qubit: 0, step: 4 },
      ];
    } else if (presetName === 'superposition') {
      numQ = 1;
      newGates = [{ id: 's_1', gate: 'H', qubit: 0, step: 0 }];
    }

    onCircuitChange({
      ...circuit,
      numQubits: numQ,
      gates: newGates,
      activeStep: -1,
    });
  };

  // Generate linear step summary for the timeline
  const stepSequence = Array.from({ length: maxCircuitDepth }).map((_, stepIdx) => {
    const gatesAtStep = circuit.gates.filter((g) => g.step === stepIdx);
    if (gatesAtStep.length === 0) return 'Idle';
    return gatesAtStep.map((g) => g.gate).join('+');
  });

  return (
    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-6 flex flex-col gap-6">
      {/* 1. Header & Minimal Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
            Quantum Circuit Lab
            <span className="text-[11px] font-mono text-neutral-500 font-normal">
              {circuit.numQubits} Qubits • {circuit.gates.length} Gates
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Click to place gates or drag across wires
          </p>
        </div>

        {/* Actions: Presets, Qubit counter, Clear */}
        <div className="flex items-center gap-3">
          {/* Preset Selector */}
          <select
            onChange={(e) => loadPreset(e.target.value)}
            defaultValue=""
            className="bg-[#121212] hover:bg-[#1A1A1A] border border-white/[0.08] text-xs text-neutral-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-white/30 transition font-medium cursor-pointer"
          >
            <option value="" disabled>Load Preset...</option>
            <option value="bell">Bell State (|Φ+⟩)</option>
            <option value="superposition">Superposition (|+⟩)</option>
            <option value="ghz">3-Qubit GHZ State</option>
            <option value="teleport">Quantum Teleportation</option>
          </select>

          {/* Qubit Counter */}
          <div className="flex items-center gap-1.5 bg-[#121212] border border-white/[0.08] px-2.5 py-1 rounded-lg text-xs font-mono text-neutral-300">
            <span className="text-neutral-500 mr-0.5 text-[11px]">Qubits</span>
            <button
              onClick={() => onCircuitChange({ ...circuit, numQubits: Math.max(1, circuit.numQubits - 1) })}
              disabled={circuit.numQubits <= 1}
              className="p-1 hover:text-white text-neutral-400 disabled:opacity-30 transition"
              title="Remove Qubit wire"
            >
              <Minus size={12} />
            </button>
            <span className="w-4 text-center font-semibold text-white">{circuit.numQubits}</span>
            <button
              onClick={() => onCircuitChange({ ...circuit, numQubits: Math.min(5, circuit.numQubits + 1) })}
              disabled={circuit.numQubits >= 5}
              className="p-1 hover:text-white text-neutral-400 disabled:opacity-30 transition"
              title="Add Qubit wire"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Clear Button */}
          <button
            onClick={() => onCircuitChange({ ...circuit, gates: [], activeStep: -1 })}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 border border-white/[0.08] hover:border-white/20 rounded-lg bg-[#121212] transition"
            title="Clear all gates"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 2. Minimal Monochrome Gate Palette */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {MONO_GATES.map((g) => {
          const isSelected = selectedGateType === g.type;
          return (
            <button
              key={g.type}
              onClick={() => {
                setSelectedGateType(g.type);
                setControlQubitSelection(null);
              }}
              className={`h-8 px-3 rounded-lg text-xs font-mono font-medium transition flex items-center justify-center border ${
                isSelected
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-[#121212] text-neutral-300 border-white/[0.08] hover:border-white/25 hover:text-white'
              }`}
              title={g.tooltip}
            >
              {g.label}
            </button>
          );
        })}

        {controlQubitSelection !== null && (
          <span className="text-[11px] font-mono text-neutral-400 bg-neutral-900 border border-white/10 px-2.5 py-1 rounded-lg ml-2 animate-pulse">
            Control: q[{controlQubitSelection}] selected. Select target wire.
          </span>
        )}
      </div>

      {/* 3. Subtle Time-Travel Scrubber */}
      <div className="bg-[#070707] border border-white/[0.06] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-neutral-300">
            Circuit Evolution
          </span>

          <div className="flex items-center gap-1 text-neutral-400">
            <button
              onClick={() => onCircuitChange({ ...circuit, activeStep: Math.max(0, currentScrubStep - 1) })}
              className="p-1 hover:text-white transition"
              title="Step Backward"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 hover:text-white text-neutral-300 transition"
              title={isPlaying ? 'Pause' : 'Play Timeline'}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              onClick={() => onCircuitChange({ ...circuit, activeStep: Math.min(maxCircuitDepth, currentScrubStep + 1) })}
              className="p-1 hover:text-white transition"
              title="Step Forward"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <span className="text-xs font-mono text-neutral-400">
            Step <span className="text-white font-semibold">{currentScrubStep}</span> / {maxCircuitDepth}
          </span>
        </div>

        {/* Minimal Breadcrumb Steps */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono text-neutral-400 max-w-full">
          <span
            onClick={() => onCircuitChange({ ...circuit, activeStep: 0 })}
            className={`cursor-pointer px-2 py-0.5 rounded transition ${
              currentScrubStep === 0 ? 'bg-white text-black font-semibold' : 'hover:text-white'
            }`}
          >
            |0⟩
          </span>

          {stepSequence.map((stepName, sIdx) => {
            const isActive = currentScrubStep === sIdx + 1;
            return (
              <React.Fragment key={sIdx}>
                <span className="text-neutral-600">→</span>
                <span
                  onClick={() => onCircuitChange({ ...circuit, activeStep: sIdx + 1 })}
                  className={`cursor-pointer px-2 py-0.5 rounded transition ${
                    isActive ? 'bg-white text-black font-semibold' : 'hover:text-white'
                  }`}
                >
                  {stepName}
                </span>
              </React.Fragment>
            );
          })}

          <button
            onClick={() => onCircuitChange({ ...circuit, activeStep: -1 })}
            className={`px-2 py-0.5 rounded ml-1 transition ${
              circuit.activeStep === -1 || circuit.activeStep >= maxCircuitDepth
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title="Final State"
          >
            Final
          </button>
        </div>
      </div>

      {/* 4. The Circuit Canvas (Focal Point) */}
      <div className="overflow-x-auto bg-[#050505] rounded-xl p-6 border border-white/[0.08] relative">
        <div className="min-w-[600px] flex flex-col gap-8 py-2">
          {Array.from({ length: circuit.numQubits }).map((_, qIndex) => {
            return (
              <div key={qIndex} className="flex items-center relative">
                {/* Qubit Label */}
                <div className="w-16 flex items-center justify-between text-xs font-mono text-neutral-400 pr-4 select-none">
                  <span className="font-semibold text-neutral-200">q[{qIndex}]</span>
                  <span className="text-neutral-600">|0⟩</span>
                </div>

                {/* Wire Hairline */}
                <div className="absolute left-16 right-0 h-[1px] bg-white/[0.12] pointer-events-none" />

                {/* Gate Slots */}
                <div className="flex items-center gap-4 ml-2 flex-1 relative z-10">
                  {Array.from({ length: numCols }).map((_, colIndex) => {
                    const gate = circuit.gates.find((g) => g.qubit === qIndex && g.step === colIndex);
                    const isControl = circuit.gates.find((g) => g.controlQubit === qIndex && g.step === colIndex);
                    const isStepActive = circuit.activeStep >= 0 && circuit.activeStep === colIndex;
                    const isHighlight = gate && gate.id === highlightGateId;

                    return (
                      <div
                        key={colIndex}
                        onClick={() => handleCellClick(qIndex, colIndex)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition relative ${
                          isStepActive ? 'bg-white/[0.04] ring-1 ring-white/30' : ''
                        } ${
                          gate
                            ? isHighlight
                              ? 'ring-2 ring-white scale-105'
                              : 'hover:border-white/40'
                            : 'hover:bg-white/[0.03] border border-dashed border-transparent hover:border-white/10'
                        }`}
                        title={gate ? `Remove ${gate.gate}` : `Place ${selectedGateType}`}
                      >
                        {/* 1-Qubit or Target Gate */}
                        {gate && (
                          <div
                            className={`w-8 h-8 rounded-md flex flex-col items-center justify-center font-mono font-bold text-xs shadow-sm border transition ${
                              isHighlight
                                ? 'bg-white text-black border-white'
                                : 'bg-[#141414] text-white border-white/20 hover:border-white/50'
                            }`}
                          >
                            <span>{gate.gate}</span>
                            {gate.param !== undefined && (
                              <span className="text-[7.5px] text-neutral-400 font-normal">π/2</span>
                            )}
                          </div>
                        )}

                        {/* Control Dot for CNOT/CZ */}
                        {isControl && (
                          <div className="w-3 h-3 rounded-full bg-white ring-2 ring-black flex items-center justify-center shadow">
                            <div className="w-1 h-1 rounded-full bg-black" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
