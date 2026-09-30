import React, { useState } from 'react';
import { GatePlacement } from '../types/quantum';
import { ArrowRight, Play, BookOpen, CheckCircle, Sparkles } from 'lucide-react';

interface LearnCoursesProps {
  onLoadLessonCircuit: (numQubits: number, gates: GatePlacement[]) => void;
}

interface Lesson {
  id: string;
  title: string;
  tag: string;
  summary: string;
  math: string;
  explanation: string[];
  sampleGates: GatePlacement[];
  numQubits: number;
}

export const LearnCourses: React.FC<LearnCoursesProps> = ({ onLoadLessonCircuit }) => {
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  const LESSONS: Lesson[] = [
    {
      id: 'l_qubits',
      title: '1. What is a Qubit? (The Quantum Bit)',
      tag: 'Fundamentals',
      summary: 'Unlike classical bits (0 or 1), a qubit exists in a continuous linear superposition of |0⟩ and |1⟩.',
      math: '|ψ⟩ = α|0⟩ + β|1⟩,  where |α|² + |β|² = 1',
      explanation: [
        'A classical bit is like a coin lying flat on a table (either Heads or Tails).',
        'A qubit is like a coin spinning continuously in the air: it has a probability of landing on either state until measured.',
        'Geometrically, any pure single-qubit state can be represented as a point on the surface of a 3D unit sphere known as the Bloch Sphere.',
      ],
      numQubits: 1,
      sampleGates: [{ id: 'l1_1', gate: 'H', qubit: 0, step: 0 }],
    },
    {
      id: 'l_superposition',
      title: '2. Superposition & The Hadamard Gate',
      tag: 'Quantum Gates',
      summary: 'The Hadamard (H) gate maps basis states into equal superpositions with coherent phase.',
      math: 'H|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩,  H|1⟩ = (|0⟩ - |1⟩)/√2 = |-⟩',
      explanation: [
        'Applying H to |0⟩ rotates the state vector from the North Pole (Z-axis) down to the equator (+X axis).',
        'Upon measurement in the computational Z-basis, the probability of obtaining 0 is |1/√2|² = 50%, and 1 is 50%.',
        'Crucially, superposition maintains phase information, enabling destructive and constructive quantum interference.',
      ],
      numQubits: 1,
      sampleGates: [{ id: 'l2_1', gate: 'H', qubit: 0, step: 0 }],
    },
    {
      id: 'l_entanglement',
      title: '3. Quantum Entanglement & Bell States',
      tag: 'Entanglement',
      summary: 'Entanglement creates non-local correlations between qubits that cannot be factored classically.',
      math: '|Φ+⟩ = (|00⟩ + |11⟩)/√2  (Maximal Entanglement)',
      explanation: [
        'When two qubits are entangled, the state of one qubit cannot be described independently of the other.',
        'If Alice measures her qubit and finds 0, Bob will instantly measure 0 with 100% certainty, regardless of distance.',
        'Built using an H gate followed by a Controlled-NOT (CNOT) gate: H creates superposition on q0, and CNOT entangles q1 conditionally.',
      ],
      numQubits: 2,
      sampleGates: [
        { id: 'l3_1', gate: 'H', qubit: 0, step: 0 },
        { id: 'l3_2', gate: 'CX', qubit: 1, controlQubit: 0, step: 1 },
      ],
    },
    {
      id: 'l_measurement',
      title: '4. Wavefunction Collapse & Measurement',
      tag: 'Measurement',
      summary: 'Quantum measurement forces a fragile superposition state to collapse into a definite classical bit.',
      math: 'P(0) = |⟨0|ψ⟩|²,  P(1) = |⟨1|ψ⟩|²',
      explanation: [
        'Before measurement, a quantum system evolves deterministically and reversibly via unitary matrices.',
        'Measurement is a non-unitary, irreversible operation. Once measured, the wavefunction collapses completely.',
        'Any gates placed after a terminal measurement wire have zero effect on the measured statistics.',
      ],
      numQubits: 1,
      sampleGates: [
        { id: 'l4_1', gate: 'H', qubit: 0, step: 0 },
        { id: 'l4_2', gate: 'M', qubit: 0, step: 1 },
      ],
    },
    {
      id: 'l_qec',
      title: '5. Quantum Error Correction (QEC)',
      tag: 'Fault-Tolerance',
      summary: 'Real quantum hardware suffers from decoherence. QEC protects quantum data using redundant physical qubits.',
      math: '|0_L⟩ = |000⟩,  |1_L⟩ = |111⟩ (3-Qubit Repetition Code)',
      explanation: [
        'In classical computing, bit-flips are corrected by copying bits (0 → 000). But the No-Cloning Theorem forbids copying arbitrary quantum states.',
        'Instead, QEC entangles multiple physical qubits into a single logical qubit, allowing syndrome parity measurements without collapsing the superposition.',
        'Stabilizer measurements isolate which physical qubit suffered an error, triggering an autonomous correction pulse.',
      ],
      numQubits: 3,
      sampleGates: [
        { id: 'l5_1', gate: 'H', qubit: 0, step: 0 },
        { id: 'l5_2', gate: 'CX', qubit: 1, controlQubit: 0, step: 1 },
        { id: 'l5_3', gate: 'CX', qubit: 2, controlQubit: 0, step: 2 },
      ],
    },
  ];

  const current = LESSONS[activeLessonIdx];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full py-4">
      {/* 1. Editorial Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block mb-1">
            Curriculum & Foundations
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
            Good morning, Learner
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Interactive, self-paced quantum computing modules. Every concept is directly linked to live circuit simulations.
          </p>
        </div>

        {/* Minimal Progress Indicator */}
        <div className="flex flex-col items-end gap-1.5 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Track Progress:</span>
            <span className="text-white font-semibold">{activeLessonIdx + 1} of {LESSONS.length}</span>
          </div>
          <div className="w-36 h-1.5 bg-[#181818] rounded-full overflow-hidden border border-white/[0.08]">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${((activeLessonIdx + 1) / LESSONS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Track Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/[0.06]">
        {LESSONS.map((l, idx) => (
          <button
            key={l.id}
            onClick={() => setActiveLessonIdx(idx)}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeLessonIdx === idx
                ? 'bg-white text-black border-white font-semibold shadow-sm'
                : 'bg-[#101010] text-neutral-400 border-white/[0.06] hover:text-white hover:border-white/[0.15]'
            }`}
          >
            <span>{l.title}</span>
          </button>
        ))}
      </div>

      {/* 3. Main Editorial Lesson Card */}
      <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        {/* Lesson Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 border border-white/[0.08] inline-block mb-2">
              {current.tag}
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {current.title}
            </h3>
            <p className="text-sm text-neutral-300 mt-1 leading-relaxed">
              {current.summary}
            </p>
          </div>

          <button
            onClick={() => onLoadLessonCircuit(current.numQubits, current.sampleGates)}
            className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-4 py-2.5 rounded-xl font-medium text-xs transition-colors shrink-0 shadow font-mono"
          >
            <Play size={14} fill="currentColor" />
            <span>Open in Circuit Lab</span>
          </button>
        </div>

        {/* Mathematical Definition Box */}
        <div className="bg-[#121212] border border-white/[0.08] rounded-xl p-4 font-mono text-sm text-white">
          <span className="text-neutral-500 block text-xs mb-1">// Mathematical Formulation:</span>
          <div className="text-sm text-neutral-100 font-semibold">{current.math}</div>
        </div>

        {/* Core Concepts Section */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-mono font-medium text-neutral-400 uppercase tracking-wider">
            Key Insights & Mechanics
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {current.explanation.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#101010] border border-white/[0.06] rounded-xl p-4 text-xs sm:text-sm text-neutral-300 leading-relaxed flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-white text-[11px] font-mono shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>{item}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Pagination */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.08] mt-2">
          <button
            disabled={activeLessonIdx === 0}
            onClick={() => setActiveLessonIdx((prev) => Math.max(0, prev - 1))}
            className="text-xs font-mono px-4 py-2 rounded-lg bg-[#141414] text-neutral-300 border border-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1e1e1e]"
          >
            ← Previous Lesson
          </button>

          <button
            disabled={activeLessonIdx === LESSONS.length - 1}
            onClick={() => setActiveLessonIdx((prev) => Math.min(LESSONS.length - 1, prev + 1))}
            className="text-xs font-mono px-4 py-2 rounded-lg bg-white text-black font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-200"
          >
            Next Lesson →
          </button>
        </div>
      </div>
    </div>
  );
};
