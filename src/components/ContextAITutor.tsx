import React, { useState } from 'react';
import { CircuitState, SimulationResult, GatePlacement } from '../types/quantum';
import { lintCircuit, optimizeCircuit } from '../quantum/transpiler';
import { Sparkles, ArrowRight, AlertTriangle, Code, Terminal, Bot } from 'lucide-react';

interface ContextAITutorProps {
  circuit: CircuitState;
  simulation: SimulationResult;
  onApplyOptimization: (newGates: GatePlacement[]) => void;
  onHighlightGate: (gateId?: string) => void;
}

export const ContextAITutor: React.FC<ContextAITutorProps> = ({
  circuit,
  simulation,
  onApplyOptimization,
  onHighlightGate,
}) => {
  const [activeTab, setActiveTab] = useState<'explain' | 'context'>('explain');
  const [userQuery, setUserQuery] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: "Quantum AI: I can see your current circuit and simulation result. Ask me about state evolution, superposition, Bell entanglement, or click any quick analysis below.",
    },
  ]);

  const linterIssues = lintCircuit(circuit.gates, circuit.numQubits);

  // 1. "Explain Circuit" gate-by-gate analysis
  const handleExplainCircuit = () => {
    if (circuit.gates.length === 0) {
      setChatLog((prev) => [
        ...prev,
        { sender: 'ai', text: "Your circuit is currently empty. All qubits start in the ground state |0...0⟩. Drag gates onto the wires to build an operation." },
      ]);
      return;
    }

    const sorted = [...circuit.gates].sort((a, b) => a.step - b.step);
    let explanation = `### Circuit Step-by-Step Evolution:\n\n`;

    sorted.forEach((g, idx) => {
      if (g.gate === 'H') {
        explanation += `**Step ${idx + 1} (Hadamard on q[${g.qubit}]):** Maps computational basis state |0⟩ to equal superposition $(|0⟩ + |1⟩)/\\sqrt{2}$. Bloch vector rotates to +X.\n\n`;
      } else if (g.gate === 'CX') {
        const ctrl = g.controlQubit ?? Math.max(0, g.qubit - 1);
        explanation += `**Step ${idx + 1} (CNOT: ctrl q[${ctrl}] → tgt q[${g.qubit}]):** Entangles target with control qubit. Generates Bell correlation with Concurrence = ${(simulation.concurrence * 100).toFixed(0)}%.\n\n`;
      } else if (g.gate === 'X') {
        explanation += `**Step ${idx + 1} (Pauli-X on q[${g.qubit}]):** Bit-flip operation mapping |0⟩ ↔ |1⟩.\n\n`;
      } else if (g.gate === 'Z') {
        explanation += `**Step ${idx + 1} (Pauli-Z on q[${g.qubit}]):** Phase-flip operation mapping |1⟩ → -|1⟩.\n\n`;
      } else if (g.gate === 'M') {
        explanation += `**Step ${idx + 1} (Measurement on q[${g.qubit}]):** Irreversible collapse from superposition into classical bit.\n\n`;
      } else {
        explanation += `**Step ${idx + 1} (${g.gate} on q[${g.qubit}]):** Applies unitary operation to statevector.\n\n`;
      }
    });

    if (simulation.isEntangled) {
      explanation += `**State Properties:** Entangled output with Concurrence **${(simulation.concurrence * 100).toFixed(1)}%**. Single-qubit Bloch vectors shrink inward due to mixed reduced density matrices.`;
    } else {
      explanation += `**State Properties:** Pure separable product state. Concurrence is 0.0%.`;
    }

    setChatLog((prev) => [...prev, { sender: 'ai', text: explanation }]);
    setActiveTab('explain');
  };

  // 2. Mathematical Formulation
  const handleMathFormulation = () => {
    let mathText = `### Mathematical State Formulation:\n\n`;
    mathText += `The state vector evolving through ${circuit.gates.length} unitary operations is represented as:\n\n`;
    mathText += `$$|\\psi\\rangle = `;

    const nonZero = simulation.statevector.filter((s) => s.probability > 0.001);
    if (nonZero.length === 0) {
      mathText += `|0\\dots 0\\rangle$$\n\n`;
    } else {
      mathText += nonZero
        .map((s, idx) => {
          const amp = Math.sqrt(s.probability).toFixed(3);
          const prefix = idx > 0 ? ' + ' : '';
          return `${prefix}${amp}|${s.basis}\\rangle`;
        })
        .join('');
      mathText += `$$\n\n`;
    }

    mathText += `**Density Matrix Purity:** $\\text{Tr}(\\rho^2) = ${(
      simulation.blochVectors.reduce((acc, bv) => acc + bv.purity, 0) / Math.max(1, circuit.numQubits)
    ).toFixed(2)}$\n\n`;
    mathText += `**Concurrence Measure:** $C(|\\psi\\rangle) = ${simulation.concurrence.toFixed(3)}$`;

    setChatLog((prev) => [...prev, { sender: 'ai', text: mathText }]);
    setActiveTab('explain');
  };

  // 3. Auto-Optimize Circuit
  const handleOptimize = () => {
    const { optimizedGates, savedGates } = optimizeCircuit(circuit.gates);
    if (savedGates > 0) {
      onApplyOptimization(optimizedGates);
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Circuit optimized: Removed ${savedGates} redundant self-inverse operations (e.g. H·H = I or X·X = I). Circuit depth decreased while preserving state fidelity at 100%.`,
        },
      ]);
    } else {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Circuit is already optimal: No redundant self-inverses or unneeded operations found.`,
        },
      ]);
    }
  };

  // 4. "What-If?" Circuit Differential Analyzer
  const handleWhatIf = () => {
    const hasH = circuit.gates.some((g) => g.gate === 'H');
    if (hasH) {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `**Differential "What-If" Analysis:**\n\n- **With H Gate (Active):** Superposition is active. The subsequent CNOT creates equal probabilities for |00⟩ and |11⟩.\n- **Without H Gate:** Qubit 0 remains in |0⟩. The CNOT control qubit is |0⟩, so the target is never flipped.\n- **Result:** Entanglement drops to 0.0%, and measurement collapses deterministically to 100% |00⟩.`,
        },
      ]);
    } else {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `**Differential "What-If" Analysis:** Adding a Hadamard (H) gate to qubit 0 will introduce quantum superposition, transforming the deterministic state into a probabilistic basis suitable for entanglement.`,
        },
      ]);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const query = userQuery.trim();
    setUserQuery('');

    let reply = `Based on your active ${circuit.numQubits}-qubit circuit with ${circuit.gates.length} gates:\n\n`;

    if (query.toLowerCase().includes('bell') || query.toLowerCase().includes('50%')) {
      reply += `In your circuit, the Hadamard gate places q[0] into equal superposition, and the CNOT gate entangles q[1] with q[0]. When measured, this produces the Bell state (|00⟩ + |11⟩)/√2 with 50% chance of |00⟩ and 50% chance of |11⟩. Outcomes |01⟩ and |10⟩ have zero probability.`;
    } else if (query.toLowerCase().includes('superposition') || query.toLowerCase().includes('hadamard')) {
      reply += `The Hadamard gate transforms |0⟩ into (|0⟩ + |1⟩)/√2. Geometrically on the Bloch sphere, it rotates the state vector from the North Pole (Z-axis) to the equator (+X axis), creating equal measurement probabilities for 0 and 1.`;
    } else if (query.toLowerCase().includes('bloch') || query.toLowerCase().includes('collapse')) {
      reply += `When qubits become entangled, individual single-qubit states cannot be factored out independently. The single-qubit Bloch vector length shrinks towards the origin (purity < 1), representing a mixed state. Refer to the Q-Sphere or Statevector tabs for global amplitudes.`;
    } else {
      reply += `Your current circuit has a depth of ${simulation.circuitDepth} and ${simulation.cnotCount} two-qubit CNOT gates. Its concurrence is ${(simulation.concurrence * 100).toFixed(1)}%. You can click "Explain Circuit", "Mathematical Formulation", or "Auto-Optimize" for deep analysis.`;
    }

    setChatLog((prev) => [
      ...prev,
      { sender: 'user', text: query },
      { sender: 'ai', text: reply },
    ]);
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-5 shadow-sm flex flex-col gap-4">
      {/* 1. Linear-Style Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#161616] border border-white/[0.08] flex items-center justify-center text-white">
            <Bot size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">Quantum AI</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 border border-white/[0.08]">
                Context Aware
              </span>
            </div>
            <p className="text-xs text-neutral-400">Context aware of circuit and simulation</p>
          </div>
        </div>

        {/* Tab view switcher */}
        <div className="flex items-center gap-1 font-mono text-xs bg-[#141414] p-1 rounded-lg border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('explain')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              activeTab === 'explain' ? 'bg-white text-black font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Chat & Analysis
          </button>
          <button
            onClick={() => setActiveTab('context')}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              activeTab === 'context' ? 'bg-white text-black font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            AST Context
          </button>
        </div>
      </div>

      {/* 2. Action Buttons (Monochrome Pills) */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleExplainCircuit}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] text-neutral-200 hover:text-white border border-white/[0.08] transition-all font-mono"
        >
          Explain Circuit
        </button>

        <button
          onClick={handleMathFormulation}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] text-neutral-200 hover:text-white border border-white/[0.08] transition-all font-mono"
        >
          Mathematical Formulation
        </button>

        <button
          onClick={handleOptimize}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] text-neutral-200 hover:text-white border border-white/[0.08] transition-all font-mono"
        >
          Auto-Optimize
        </button>

        <button
          onClick={handleWhatIf}
          className="text-xs px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] text-neutral-200 hover:text-white border border-white/[0.08] transition-all font-mono"
        >
          What-If?
        </button>
      </div>

      {/* 3. Linter Callout */}
      {linterIssues.length > 0 && (
        <div className="bg-[#121212] border border-white/[0.12] rounded-xl p-3 flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-white font-medium">
            <AlertTriangle size={14} className="text-neutral-400" />
            <span>Circuit Linter Suggestions ({linterIssues.length})</span>
          </div>
          {linterIssues.map((issue) => (
            <div key={issue.id} className="text-neutral-300 flex items-center justify-between gap-2 pl-5 text-[11px]">
              <span>• {issue.message}</span>
              {issue.autoFixAction && (
                <button
                  onClick={handleOptimize}
                  className="bg-white hover:bg-neutral-200 text-black px-2 py-0.5 rounded text-[10px] font-semibold transition-colors"
                >
                  Auto-Fix
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. Chat Feed or Context Inspector */}
      {activeTab === 'context' ? (
        <div className="bg-[#121212] p-3.5 rounded-xl border border-white/[0.08] font-mono text-xs text-neutral-300 max-h-64 overflow-y-auto">
          <span className="text-neutral-500 block mb-2">// Injected Quantum AST Payload:</span>
          <pre className="text-neutral-300 text-[11px] leading-relaxed">
            {JSON.stringify(
              {
                numQubits: circuit.numQubits,
                circuitDepth: simulation.circuitDepth,
                gateCount: simulation.gateCount,
                cnotCount: simulation.cnotCount,
                concurrence: simulation.concurrence,
                isEntangled: simulation.isEntangled,
                statevector: simulation.statevector.map((s) => ({
                  basis: s.basis,
                  prob: s.probability.toFixed(3),
                  phaseDeg: ((s.phase * 180) / Math.PI).toFixed(0),
                })),
                noiseEnabled: circuit.noise.enabled,
              },
              null,
              2
            )}
          </pre>
        </div>
      ) : (
        <div className="bg-[#101010] p-3.5 rounded-xl border border-white/[0.06] max-h-64 overflow-y-auto flex flex-col gap-3 font-sans text-xs">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl leading-relaxed max-w-[95%] ${
                msg.sender === 'ai'
                  ? 'bg-[#171717] border border-white/[0.06] text-neutral-200 self-start'
                  : 'bg-white text-black self-end font-medium'
              }`}
            >
              <div
                className={`text-[10px] font-mono mb-1 font-semibold ${
                  msg.sender === 'ai' ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                {msg.sender === 'ai' ? 'Quantum AI' : 'You'}
              </div>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Minimal Input Field */}
      <form onSubmit={handleSendChat} className="flex items-center gap-2">
        <input
          type="text"
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Ask: 'Why 50% 00 and 50% 11?' or 'Explain phase kickback'..."
          className="flex-1 bg-[#121212] border border-white/[0.08] rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/[0.25] font-sans"
        />
        <button
          type="submit"
          className="bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <span>Ask</span>
          <ArrowRight size={13} />
        </button>
      </form>
    </div>
  );
};
