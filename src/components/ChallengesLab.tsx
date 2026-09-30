import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CircuitState, SimulationResult } from '../types/quantum';
import { Trophy, CheckCircle2, XCircle, ArrowRight, HelpCircle, Star, Award, Play } from 'lucide-react';

interface ChallengesLabProps {
  simulation: SimulationResult;
  circuit: CircuitState;
  onLoadChallengeCircuit: (numQubits: number) => void;
  userXP: number;
  onAddXP: (xp: number) => void;
}

interface ChallengeDef {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  numQubits: number;
  description: string;
  targetDescription: string;
  xp: number;
  hints: string[];
  verifier: (sim: SimulationResult, circ: CircuitState) => { passed: boolean; reason: string };
}

export const ChallengesLab: React.FC<ChallengesLabProps> = ({
  simulation,
  circuit,
  onLoadChallengeCircuit,
  userXP,
  onAddXP,
}) => {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedChallengeIdx, setSelectedChallengeIdx] = useState(0);
  const [activeHintIdx, setActiveHintIdx] = useState<number | null>(null);
  const [evalResult, setEvalResult] = useState<{ passed: boolean; reason: string } | null>(null);

  const CHALLENGES: ChallengeDef[] = [
    {
      id: 'c_superposition',
      title: '1. Equal Superposition State (|+⟩)',
      difficulty: 'Beginner',
      numQubits: 1,
      description: 'Rotate a single qubit from the initial |0⟩ ground state into an equal superposition |+⟩ where measuring in the computational basis yields 50% |0⟩ and 50% |1⟩.',
      targetDescription: 'State: (|0⟩ + |1⟩)/√2 (Probabilities: 50% |0⟩, 50% |1⟩)',
      xp: 50,
      hints: [
        'Think about which single-qubit gate creates equal superposition from |0⟩.',
        'Apply a Hadamard (H) gate to qubit 0.',
      ],
      verifier: (sim, circ) => {
        if (circ.numQubits !== 1) return { passed: false, reason: 'Circuit should use exactly 1 qubit.' };
        const p0 = sim.probabilities['0'] || 0;
        const p1 = sim.probabilities['1'] || 0;
        if (Math.abs(p0 - 0.5) < 0.05 && Math.abs(p1 - 0.5) < 0.05) {
          return { passed: true, reason: 'Perfect equal superposition state achieved! Fidelity = 1.00.' };
        }
        return { passed: false, reason: `Current probabilities: |0⟩=${(p0 * 100).toFixed(0)}%, |1⟩=${(p1 * 100).toFixed(0)}%. Target is 50%/50%.` };
      },
    },
    {
      id: 'c_bell',
      title: '2. Create the Bell State (|Φ+⟩)',
      difficulty: 'Beginner',
      numQubits: 2,
      description: 'Build the maximally entangled 2-qubit Bell state (|00⟩ + |11⟩)/√2. The qubits must be correlated so that measuring one immediately determines the other with 100% concurrence.',
      targetDescription: 'State: (|00⟩ + |11⟩)/√2 with Concurrence = 100%',
      xp: 100,
      hints: [
        'Start by putting qubit 0 into superposition with an H gate.',
        'Then entangle qubit 1 by using a CNOT gate with control on q[0] and target on q[1].',
      ],
      verifier: (sim, circ) => {
        if (circ.numQubits !== 2) return { passed: false, reason: 'Circuit must have 2 qubits.' };
        const p00 = sim.probabilities['00'] || 0;
        const p11 = sim.probabilities['11'] || 0;
        if (p00 > 0.45 && p11 > 0.45 && sim.concurrence > 0.9) {
          return { passed: true, reason: 'Bell State (|Φ+⟩) generated successfully! Concurrence is 100%.' };
        }
        return { passed: false, reason: `Entanglement concurrence is ${(sim.concurrence * 100).toFixed(0)}% (Target: 100%). Check that you used H on q0 followed by CX(0, 1).` };
      },
    },
    {
      id: 'c_ghz',
      title: '3. 3-Qubit GHZ Entangled State',
      difficulty: 'Intermediate',
      numQubits: 3,
      description: 'Construct the tripartite entangled Greenberger-Horne-Zeilinger (GHZ) state (|000⟩ + |111⟩)/√2 across 3 qubits.',
      targetDescription: 'State: (|000⟩ + |111⟩)/√2 (50% |000⟩, 50% |111⟩)',
      xp: 150,
      hints: [
        'First create a Bell state on qubits 0 and 1.',
        'Then apply a second CNOT from qubit 1 to qubit 2 to extend entanglement to the third qubit.',
      ],
      verifier: (sim, circ) => {
        if (circ.numQubits < 3) return { passed: false, reason: 'Circuit requires at least 3 qubits.' };
        const p000 = sim.probabilities['000'] || 0;
        const p111 = sim.probabilities['111'] || 0;
        if (p000 > 0.45 && p111 > 0.45) {
          return { passed: true, reason: 'Tripartite GHZ Entangled state confirmed! Multi-qubit non-locality proved.' };
        }
        return { passed: false, reason: `Probabilities do not match (|000⟩=${(p000 * 100).toFixed(0)}%, |111⟩=${(p111 * 100).toFixed(0)}%).` };
      },
    },
    {
      id: 'c_bitflip_not',
      title: '4. Pauli Bit Flip & Phase Inversion',
      difficulty: 'Intermediate',
      numQubits: 1,
      description: 'Prepare the state |-⟩ = (|0⟩ - |1⟩)/√2 on qubit 0 with a negative phase on the |1⟩ amplitude.',
      targetDescription: 'State: |-⟩ with Phase = 180° (π) on |1⟩',
      xp: 100,
      hints: [
        'Can you apply an X gate to get |1⟩, then an H gate?',
        'Alternatively: H gate followed by a Z gate produces |-⟩.',
      ],
      verifier: (sim, circ) => {
        const p0 = sim.probabilities['0'] || 0;
        const p1 = sim.probabilities['1'] || 0;
        const item1 = sim.statevector.find((s) => s.basis === '1');
        const phaseDeg = item1 ? (item1.phase * 180) / Math.PI : 0;
        const hasNegativePhase = Math.abs(Math.abs(phaseDeg) - 180) < 15;

        if (p0 > 0.45 && p1 > 0.45 && hasNegativePhase) {
          return { passed: true, reason: 'State |-⟩ successfully constructed with correct π phase inversion!' };
        }
        return { passed: false, reason: `State is not |-⟩. Ensure equal 50/50 probability with a relative π phase.` };
      },
    },
  ];

  const currentCh = CHALLENGES[selectedChallengeIdx];

  const handleEvaluate = () => {
    const res = currentCh.verifier(simulation, circuit);
    setEvalResult(res);

    if (res.passed && !completedIds.includes(currentCh.id)) {
      setCompletedIds([...completedIds, currentCh.id]);
      onAddXP(currentCh.xp);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#a3a3a3', '#525252'],
      });
    }
  };

  const getDifficultyBadge = (diff: ChallengeDef['difficulty']) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-white/[0.04] text-neutral-400 border-white/[0.08]';
      case 'Intermediate':
        return 'bg-white/[0.08] text-neutral-300 border-white/[0.12]';
      case 'Advanced':
        return 'bg-white text-black border-white font-semibold';
      default:
        return 'bg-white/[0.04] text-neutral-400 border-white/[0.08]';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full py-4">
      {/* 1. Header with XP Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block mb-1">
            Verification & Challenges
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Quantum Problem Lab
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Automated matrix-level verification against target unitary states and fidelity metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#0e0e0e] border border-white/[0.08] px-4 py-2 rounded-xl font-mono text-xs">
          <Trophy size={16} className="text-white" />
          <div className="flex flex-col">
            <span className="text-neutral-500 text-[10px]">TOTAL XP EARNED</span>
            <span className="text-white font-bold">{userXP} XP</span>
          </div>
          <div className="h-6 w-[1px] bg-white/[0.08] ml-2" />
          <div className="flex flex-col ml-2">
            <span className="text-neutral-500 text-[10px]">COMPLETED</span>
            <span className="text-white font-bold">
              {completedIds.length} / {CHALLENGES.length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Challenge Selector List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {CHALLENGES.map((ch, idx) => {
          const isDone = completedIds.includes(ch.id);
          const isSelected = selectedChallengeIdx === idx;

          return (
            <button
              key={ch.id}
              onClick={() => {
                setSelectedChallengeIdx(idx);
                setEvalResult(null);
                setActiveHintIdx(null);
              }}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                isSelected
                  ? 'bg-[#141414] border-white shadow-sm'
                  : 'bg-[#0a0a0a] border-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getDifficultyBadge(ch.difficulty)}`}>
                  {ch.difficulty}
                </span>
                {isDone ? (
                  <CheckCircle2 size={15} className="text-white" />
                ) : (
                  <span className="text-[10px] font-mono text-neutral-500">+{ch.xp} XP</span>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white font-sans">{ch.title}</h4>
                <span className="text-[11px] font-mono text-neutral-500 mt-1 block">
                  {ch.numQubits} Qubit{ch.numQubits > 1 ? 's' : ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Active Challenge Detailed Workspace Card */}
      <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-mono px-2 py-0.5 rounded border ${getDifficultyBadge(currentCh.difficulty)}`}>
                {currentCh.difficulty}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                Reward: +{currentCh.xp} XP
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
              {currentCh.title}
            </h3>
            <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
              {currentCh.description}
            </p>
          </div>

          <button
            onClick={() => onLoadChallengeCircuit(currentCh.numQubits)}
            className="flex items-center gap-2 bg-[#141414] hover:bg-[#1e1e1e] text-neutral-200 hover:text-white px-4 py-2.5 rounded-xl border border-white/[0.08] font-mono text-xs transition-colors shrink-0"
          >
            <Play size={13} fill="currentColor" />
            <span>Reset Wires ({currentCh.numQubits}Q)</span>
          </button>
        </div>

        {/* Target State Requirement Box */}
        <div className="bg-[#121212] border border-white/[0.08] rounded-xl p-4 font-mono text-xs flex flex-col gap-1.5">
          <span className="text-neutral-500 block text-[11px]">// Target State Verification Criterion:</span>
          <div className="text-white font-semibold text-sm">{currentCh.targetDescription}</div>
        </div>

        {/* Verification Result Callout */}
        {evalResult && (
          <div
            className={`p-4 rounded-xl border font-mono text-xs flex items-start gap-3 ${
              evalResult.passed
                ? 'bg-[#141414] border-white text-white'
                : 'bg-[#121212] border-white/[0.15] text-neutral-300'
            }`}
          >
            {evalResult.passed ? (
              <CheckCircle2 size={18} className="text-white shrink-0 mt-0.5" />
            ) : (
              <XCircle size={18} className="text-neutral-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <span className="font-bold block mb-1 font-sans text-sm">
                {evalResult.passed ? 'Challenge Solved Successfully!' : 'Target Not Yet Reached'}
              </span>
              <p className="text-xs leading-relaxed">{evalResult.reason}</p>
            </div>
          </div>
        )}

        {/* Hint Accordion */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setActiveHintIdx(activeHintIdx === null ? 0 : null)}
            className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1.5 self-start"
          >
            <HelpCircle size={14} />
            <span>{activeHintIdx !== null ? 'Hide Hints' : 'Need a hint?'}</span>
          </button>

          {activeHintIdx !== null && (
            <div className="bg-[#121212] border border-white/[0.06] rounded-xl p-4 text-xs font-mono text-neutral-300 flex flex-col gap-2">
              {currentCh.hints.map((h, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-neutral-500 font-bold">Hint {i + 1}:</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
          <span className="text-xs font-mono text-neutral-500">
            Build the circuit in the Workspace, then click Verify Solution.
          </span>

          <button
            onClick={handleEvaluate}
            className="bg-white hover:bg-neutral-200 text-black font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow font-mono flex items-center gap-2"
          >
            <span>Verify Solution</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
