export type GateType = 
  | 'H' 
  | 'X' 
  | 'Y' 
  | 'Z' 
  | 'S' 
  | 'T' 
  | 'RX' 
  | 'RY' 
  | 'RZ' 
  | 'CX' 
  | 'CZ' 
  | 'SWAP' 
  | 'M';

export interface GatePlacement {
  id: string;
  gate: GateType;
  qubit: number; // target qubit index (0-indexed)
  controlQubit?: number; // for CX, CZ, SWAP
  targetQubit?: number; // for SWAP
  step: number; // circuit depth column (0-indexed)
  param?: number; // rotation angle in radians (for RX, RY, RZ)
}

export interface Complex {
  re: number;
  im: number;
}

export interface StatevectorItem {
  basis: string; // e.g. "00", "01"
  amplitude: Complex;
  probability: number;
  phase: number; // in radians (-PI to PI)
}

export interface BlochVector {
  qubit: number;
  x: number;
  y: number;
  z: number;
  theta: number; // polar angle
  phi: number; // azimuthal angle
  purity: number; // length of vector r <= 1 (r < 1 implies entanglement)
  isEntangled: boolean;
}

export interface NoiseConfig {
  enabled: boolean;
  bitFlip: number; // probability of X error
  phaseFlip: number; // probability of Z error
  depolarizing: number; // probability of depolarizing
  readoutError: number; // measurement flip probability
}

export interface CircuitState {
  numQubits: number;
  gates: GatePlacement[];
  noise: NoiseConfig;
  shots: number;
  activeStep: number; // for Time-Travel Scrubber (-1 = end of circuit)
}

export interface StepSlice {
  step: number;
  activeGateId?: string;
  statevector: StatevectorItem[];
  probabilities: Record<string, number>;
  blochVectors: BlochVector[];
  concurrence: number;
}

export interface SimulationResult {
  statevector: StatevectorItem[];
  probabilities: Record<string, number>;
  measurements: Record<string, number>;
  blochVectors: BlochVector[];
  concurrence: number; // 0.0 to 1.0
  isEntangled: boolean;
  circuitDepth: number;
  gateCount: number;
  cnotCount: number;
  tCount: number;
  slices: StepSlice[]; // timeline snapshots for time travel
}

export interface LinterIssue {
  id: string;
  type: 'redundancy' | 'depth' | 'ordering' | 'qubit_bounds';
  severity: 'warning' | 'info' | 'error';
  message: string;
  gateIds: string[];
  suggestedFix?: string;
  autoFixAction?: string;
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  description: string;
  targetState: string; // e.g. "Bell State (|00> + |11>)/√2"
  maxGates?: number;
  numQubits: number;
  xp: number;
  hints: string[];
  verifier: (result: SimulationResult, gates: GatePlacement[]) => { passed: boolean; message: string };
}
