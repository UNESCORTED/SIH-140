import React, { useState, useMemo } from 'react';
import { CircuitState, GatePlacement, NoiseConfig } from './types/quantum';
import { simulateCircuit } from './quantum/matrix';
import { CircuitLab } from './components/CircuitLab';
import { CodeLab } from './components/CodeLab';
import { VisualizationTabs } from './components/VisualizationTabs';
import { ContextAITutor } from './components/ContextAITutor';
import { NoiseSimulator } from './components/NoiseSimulator';
import { QECSandbox } from './components/QECSandbox';
import { QuantumArcade } from './components/QuantumArcade';
import { ChallengesLab } from './components/ChallengesLab';
import { LearnCourses } from './components/LearnCourses';
import { NISQTopologyModal } from './components/NISQTopologyModal';
import { CloudBridgeModal } from './components/CloudBridgeModal';
import { InstructorDashboard } from './components/InstructorDashboard';
import {
  Atom,
  Search,
  Bell,
  User,
  ChevronDown,
  Layers,
  Cloud,
  ShieldCheck,
  Gamepad2,
  GraduationCap,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'learn' | 'challenges' | 'arcade' | 'qec' | 'instructor'>('workspace');
  const [showTopologyModal, setShowTopologyModal] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [highlightGateId, setHighlightGateId] = useState<string | undefined>(undefined);
  const [userXP, setUserXP] = useState(150);

  // Core quantum state (defaults to Bell State)
  const [circuit, setCircuit] = useState<CircuitState>({
    numQubits: 2,
    gates: [
      { id: 'init_h', gate: 'H', qubit: 0, step: 0 },
      { id: 'init_cx', gate: 'CX', qubit: 1, controlQubit: 0, step: 1 },
    ],
    noise: {
      enabled: false,
      bitFlip: 0.05,
      phaseFlip: 0.03,
      depolarizing: 0.02,
      readoutError: 0.04,
    },
    shots: 1024,
    activeStep: -1,
  });

  // Real-time matrix simulation
  const simulation = useMemo(() => {
    return simulateCircuit(
      circuit.numQubits,
      circuit.gates,
      circuit.noise,
      circuit.shots,
      circuit.activeStep
    );
  }, [circuit.numQubits, circuit.gates, circuit.noise, circuit.shots, circuit.activeStep]);

  const handleCodeSync = (numQubits: number, gates: GatePlacement[]) => {
    setCircuit((prev) => ({
      ...prev,
      numQubits,
      gates,
      activeStep: -1,
    }));
  };

  const handleApplyOptimization = (optimizedGates: GatePlacement[]) => {
    setCircuit((prev) => ({
      ...prev,
      gates: optimizedGates,
      activeStep: -1,
    }));
  };

  const handleLoadLessonCircuit = (numQubits: number, gates: GatePlacement[]) => {
    setCircuit((prev) => ({
      ...prev,
      numQubits,
      gates,
      activeStep: -1,
    }));
    setActiveTab('workspace');
  };

  return (
    <div className="min-h-screen bg-[#000000] text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black">
      {/* 1. Global Navigation Bar (Apple / Linear minimal aesthetic) */}
      <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md border-b border-white/[0.08] px-6 py-3.5 flex items-center justify-between gap-4">
        {/* LEFT: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-black font-bold">
            <Atom size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">
                QuantumLab AI
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-neutral-400 border border-white/[0.08]">
                SIH 26140
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-normal">
              AI-native quantum learning & simulation
            </p>
          </div>
        </div>

        {/* CENTER: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#101010] p-1 rounded-lg border border-white/[0.08] text-xs font-mono">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'workspace'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Workspace
          </button>

          <button
            onClick={() => setActiveTab('learn')}
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'learn'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Learn
          </button>

          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-3.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'challenges'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Challenges
          </button>

          {/* Tools Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowToolsDropdown(!showToolsDropdown)}
              className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                ['qec', 'arcade', 'instructor'].includes(activeTab)
                  ? 'bg-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Research & Labs</span>
              <ChevronDown size={13} />
            </button>

            {showToolsDropdown && (
              <div
                className="absolute left-0 mt-2 w-52 bg-[#0e0e0e] border border-white/[0.1] rounded-xl shadow-2xl py-1.5 z-50 flex flex-col font-sans text-xs"
                onClick={() => setShowToolsDropdown(false)}
              >
                <button
                  onClick={() => setActiveTab('qec')}
                  className="px-3.5 py-2 text-left hover:bg-white/[0.06] text-neutral-300 hover:text-white flex items-center gap-2"
                >
                  <ShieldCheck size={14} className="text-neutral-400" />
                  <span>QEC Sandbox</span>
                </button>
                <button
                  onClick={() => setActiveTab('arcade')}
                  className="px-3.5 py-2 text-left hover:bg-white/[0.06] text-neutral-300 hover:text-white flex items-center gap-2"
                >
                  <Gamepad2 size={14} className="text-neutral-400" />
                  <span>Quantum Arcade</span>
                </button>
                <button
                  onClick={() => setActiveTab('instructor')}
                  className="px-3.5 py-2 text-left hover:bg-white/[0.06] text-neutral-300 hover:text-white flex items-center gap-2"
                >
                  <GraduationCap size={14} className="text-neutral-400" />
                  <span>Instructor LMS</span>
                </button>
                <div className="h-[1px] bg-white/[0.08] my-1" />
                <button
                  onClick={() => setShowTopologyModal(true)}
                  className="px-3.5 py-2 text-left hover:bg-white/[0.06] text-neutral-300 hover:text-white flex items-center gap-2"
                >
                  <Layers size={14} className="text-neutral-400" />
                  <span>NISQ QPU Topology</span>
                </button>
                <button
                  onClick={() => setShowCloudModal(true)}
                  className="px-3.5 py-2 text-left hover:bg-white/[0.06] text-neutral-300 hover:text-white flex items-center gap-2"
                >
                  <Cloud size={14} className="text-neutral-400" />
                  <span>IBM Quantum Bridge</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* RIGHT: Search, Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Hardware Modals */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setShowTopologyModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[#121212] hover:bg-[#1a1a1a] text-neutral-300 hover:text-white border border-white/[0.08] transition-colors flex items-center gap-1.5"
            >
              <Layers size={13} className="text-neutral-400" />
              <span>NISQ</span>
            </button>
            <button
              onClick={() => setShowCloudModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-[#121212] hover:bg-[#1a1a1a] text-neutral-300 hover:text-white border border-white/[0.08] transition-colors flex items-center gap-1.5"
            >
              <Cloud size={13} className="text-neutral-400" />
              <span>IBM Bridge</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-white/[0.08] hidden sm:block" />

          {/* Profile pill */}
          <div className="flex items-center gap-2 bg-[#121212] px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-mono">
            <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center font-bold text-[10px]">
              Q
            </div>
            <span className="text-neutral-300 hidden sm:inline">NQM Scholar</span>
            <span className="text-white font-bold ml-1">{userXP} XP</span>
          </div>
        </div>
      </header>

      {/* 2. Minimal Live Statistics Bar */}
      <div className="bg-[#050505] border-b border-white/[0.08] px-6 py-2.5 flex flex-wrap items-center justify-between text-xs font-mono text-neutral-400 gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Depth</span>
            <span className="text-white font-semibold">
              {simulation.circuitDepth.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Gates</span>
            <span className="text-white font-semibold">
              {simulation.gateCount.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">2-Qubit Gates</span>
            <span className="text-white font-semibold">
              {simulation.cnotCount.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Entanglement</span>
            <span className="text-white font-semibold">
              {(simulation.concurrence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-neutral-300">Sub-10ms Matrix Engine</span>
          </div>
          <span>•</span>
          <span className="text-neutral-400">
            {circuit.noise.enabled ? 'NISQ Noise Injected' : 'Pure Statevector'}
          </span>
        </div>
      </div>

      {/* 3. Main Workspace / Multi-Track Content View */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* VIEW A: UNIFIED WORKSPACE */}
        {activeTab === 'workspace' && (
          <div className="flex flex-col gap-6">
            {/* LEVEL 1: Quantum Circuit Lab (Primary Workspace Focal Point) */}
            <CircuitLab
              circuit={circuit}
              onCircuitChange={setCircuit}
              highlightGateId={highlightGateId}
              onOpenTopology={() => setShowTopologyModal(true)}
            />

            {/* LEVEL 2: Tabbed Supporting Analysis (Bloch Sphere | Q-Sphere | Probabilities | Statevector) */}
            <VisualizationTabs
              numQubits={circuit.numQubits}
              blochVectors={simulation.blochVectors}
              statevector={simulation.statevector}
              probabilities={simulation.probabilities}
              measurements={simulation.measurements}
              concurrence={simulation.concurrence}
              totalShots={circuit.shots}
            />

            {/* LEVEL 3: Secondary Information - Code Lab & Context-Aware AI Tutor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CodeLab circuit={circuit} onCodeSync={handleCodeSync} />
              <ContextAITutor
                circuit={circuit}
                simulation={simulation}
                onApplyOptimization={handleApplyOptimization}
                onHighlightGate={setHighlightGateId}
              />
            </div>

            {/* Collapsible Noise Engine Drawer */}
            <NoiseSimulator
              noise={circuit.noise}
              onNoiseChange={(noise: NoiseConfig) => setCircuit({ ...circuit, noise })}
              shots={circuit.shots}
              onShotsChange={(shots: number) => setCircuit({ ...circuit, shots })}
            />
          </div>
        )}

        {/* VIEW B: LEARN COURSES */}
        {activeTab === 'learn' && (
          <LearnCourses onLoadLessonCircuit={handleLoadLessonCircuit} />
        )}

        {/* VIEW C: CHALLENGES */}
        {activeTab === 'challenges' && (
          <ChallengesLab
            simulation={simulation}
            circuit={circuit}
            onLoadChallengeCircuit={(numQ) => setCircuit({ ...circuit, numQubits: numQ, gates: [] })}
            userXP={userXP}
            onAddXP={(xp) => setUserXP((prev) => prev + xp)}
          />
        )}

        {/* VIEW D: ARCADE */}
        {activeTab === 'arcade' && <QuantumArcade />}

        {/* VIEW E: QEC SANDBOX */}
        {activeTab === 'qec' && <QECSandbox />}

        {/* VIEW F: INSTRUCTOR PORTAL */}
        {activeTab === 'instructor' && <InstructorDashboard />}
      </main>

      {/* 4. Modals */}
      {showTopologyModal && (
        <NISQTopologyModal circuit={circuit} onClose={() => setShowTopologyModal(false)} />
      )}

      {showCloudModal && (
        <CloudBridgeModal circuit={circuit} onClose={() => setShowCloudModal(false)} />
      )}

      {/* 5. Minimal Footer */}
      <footer className="border-t border-white/[0.08] bg-[#050505] px-6 py-4 text-center text-xs text-neutral-500 font-mono">
        QuantumLab AI • Built for Smart India Hackathon (SIH 26140) • Aligned with the National Quantum Mission (NQM)
      </footer>
    </div>
  );
}

export default App;
