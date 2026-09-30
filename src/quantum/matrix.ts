import { Complex, GatePlacement, SimulationResult, StatevectorItem, BlochVector, StepSlice, NoiseConfig } from '../types/quantum';

// Complex number utilities
export const C = {
  create: (re: number, im = 0): Complex => ({ re, im }),
  add: (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im }),
  sub: (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im }),
  mul: (a: Complex, b: Complex): Complex => ({
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  }),
  scale: (a: Complex, s: number): Complex => ({ re: a.re * s, im: a.im * s }),
  conj: (a: Complex): Complex => ({ re: a.re, im: -a.im }),
  abs2: (a: Complex): number => a.re * a.re + a.im * a.im,
  abs: (a: Complex): number => Math.sqrt(a.re * a.re + a.im * a.im),
  phase: (a: Complex): number => Math.atan2(a.im, a.re),
};

const INV_SQRT2 = 1 / Math.SQRT2;

// 2x2 Gate matrices
export const SINGLE_QUBIT_MATRICES: Record<string, (param?: number) => Complex[][]> = {
  I: () => [
    [C.create(1), C.create(0)],
    [C.create(0), C.create(1)],
  ],
  X: () => [
    [C.create(0), C.create(1)],
    [C.create(1), C.create(0)],
  ],
  Y: () => [
    [C.create(0), C.create(0, -1)],
    [C.create(0, 1), C.create(0)],
  ],
  Z: () => [
    [C.create(1), C.create(0)],
    [C.create(0), C.create(-1)],
  ],
  H: () => [
    [C.create(INV_SQRT2), C.create(INV_SQRT2)],
    [C.create(INV_SQRT2), C.create(-INV_SQRT2)],
  ],
  S: () => [
    [C.create(1), C.create(0)],
    [C.create(0), C.create(0, 1)],
  ],
  T: () => [
    [C.create(1), C.create(0)],
    [C.create(0), C.create(INV_SQRT2, INV_SQRT2)],
  ],
  RX: (theta = Math.PI / 2) => [
    [C.create(Math.cos(theta / 2)), C.create(0, -Math.sin(theta / 2))],
    [C.create(0, -Math.sin(theta / 2)), C.create(Math.cos(theta / 2))],
  ],
  RY: (theta = Math.PI / 2) => [
    [C.create(Math.cos(theta / 2)), C.create(-Math.sin(theta / 2))],
    [C.create(Math.sin(theta / 2)), C.create(Math.cos(theta / 2))],
  ],
  RZ: (theta = Math.PI / 2) => [
    [C.create(Math.cos(-theta / 2), Math.sin(-theta / 2)), C.create(0)],
    [C.create(0), C.create(Math.cos(theta / 2), Math.sin(theta / 2))],
  ],
};

// Apply 1-qubit gate directly to statevector
export function applySingleQubitGate(
  state: Complex[],
  numQubits: number,
  targetQubit: number,
  matrix: Complex[][]
): Complex[] {
  const size = 1 << numQubits;
  const nextState: Complex[] = new Array(size).fill(0).map(() => C.create(0, 0));
  const bitMask = 1 << (numQubits - 1 - targetQubit);

  for (let i = 0; i < size; i++) {
    if ((i & bitMask) === 0) {
      const i0 = i;
      const i1 = i | bitMask;

      const a = state[i0];
      const b = state[i1];

      // [m00 m01] [a]
      // [m10 m11] [b]
      const nextA = C.add(C.mul(matrix[0][0], a), C.mul(matrix[0][1], b));
      const nextB = C.add(C.mul(matrix[1][0], a), C.mul(matrix[1][1], b));

      nextState[i0] = nextA;
      nextState[i1] = nextB;
    }
  }

  return nextState;
}

// Apply 2-qubit gate (CX, CZ, SWAP)
export function applyTwoQubitGate(
  state: Complex[],
  numQubits: number,
  controlQubit: number,
  targetQubit: number,
  gateType: 'CX' | 'CZ' | 'SWAP'
): Complex[] {
  const size = 1 << numQubits;
  const nextState = [...state];
  const ctrlMask = 1 << (numQubits - 1 - controlQubit);
  const tgtMask = 1 << (numQubits - 1 - targetQubit);

  for (let i = 0; i < size; i++) {
    if (gateType === 'CX') {
      if ((i & ctrlMask) !== 0 && (i & tgtMask) === 0) {
        const flipped = i ^ tgtMask;
        const temp = nextState[i];
        nextState[i] = nextState[flipped];
        nextState[flipped] = temp;
      }
    } else if (gateType === 'CZ') {
      if ((i & ctrlMask) !== 0 && (i & tgtMask) !== 0) {
        nextState[i] = C.scale(nextState[i], -1);
      }
    } else if (gateType === 'SWAP') {
      const bitC = (i & ctrlMask) !== 0;
      const bitT = (i & tgtMask) !== 0;
      if (bitC !== bitT && (i & ctrlMask) === 0) {
        const swapped = (i ^ ctrlMask) ^ tgtMask;
        const temp = nextState[i];
        nextState[i] = nextState[swapped];
        nextState[swapped] = temp;
      }
    }
  }

  return nextState;
}

// Compute single-qubit density matrix and Bloch vector
export function computeBlochVector(state: Complex[], numQubits: number, targetQubit: number): BlochVector {
  const size = 1 << numQubits;
  const bitMask = 1 << (numQubits - 1 - targetQubit);

  let rho00 = 0;
  let rho11 = 0;
  let rho01 = C.create(0, 0);

  for (let i = 0; i < size; i++) {
    if ((i & bitMask) === 0) {
      const i0 = i;
      const i1 = i | bitMask;

      const a = state[i0];
      const b = state[i1];

      rho00 += C.abs2(a);
      rho11 += C.abs2(b);
      // a * conj(b)
      rho01 = C.add(rho01, C.mul(a, C.conj(b)));
    }
  }

  const x = 2 * rho01.re;
  const y = 2 * rho01.im;
  const z = rho00 - rho11;

  const r = Math.min(1.0, Math.sqrt(x * x + y * y + z * z));
  const isEntangled = r < 0.95;

  let theta = 0;
  let phi = 0;

  if (r > 0.001) {
    const clampedZ = Math.max(-1, Math.min(1, z / r));
    theta = Math.acos(clampedZ);
    phi = Math.atan2(y, x);
    if (phi < 0) phi += 2 * Math.PI;
  }

  return {
    qubit: targetQubit,
    x,
    y,
    z,
    theta,
    phi,
    purity: r,
    isEntangled,
  };
}

// Compute Concurrence for 2-qubit systems: C = 2 * |a00*a11 - a01*a10|
export function computeConcurrence(state: Complex[], numQubits: number): number {
  if (numQubits === 2 && state.length >= 4) {
    const a00 = state[0];
    const a01 = state[1];
    const a10 = state[2];
    const a11 = state[3];

    // a00*a11 - a01*a10
    const term1 = C.mul(a00, a11);
    const term2 = C.mul(a01, a10);
    const diff = C.sub(term1, term2);

    const c = 2 * C.abs(diff);
    return Math.min(1.0, Math.max(0.0, c));
  }

  // Generalized multi-qubit entanglement heuristic based on average mixedness of subsystems
  let sumPurity = 0;
  for (let q = 0; q < numQubits; q++) {
    const bv = computeBlochVector(state, numQubits, q);
    sumPurity += bv.purity;
  }
  const avgPurity = sumPurity / numQubits;
  return Math.min(1.0, Math.max(0.0, (1 - avgPurity) * 2));
}

// Noise injection function
export function applyNoiseToProbabilities(
  idealProbabilities: Record<string, number>,
  noise: NoiseConfig,
  shots: number,
  numQubits: number
): Record<string, number> {
  const result: Record<string, number> = {};
  const basisStates = Object.keys(idealProbabilities);

  // Initialize counts
  for (const b of basisStates) {
    result[b] = 0;
  }

  // Cumulative distribution for sampling
  const cdf: Array<{ basis: string; p: number }> = [];
  let cum = 0;
  for (const b of basisStates) {
    cum += idealProbabilities[b];
    cdf.push({ basis: b, p: cum });
  }

  for (let s = 0; s < shots; s++) {
    const rand = Math.random();
    let sampledBasis = basisStates[0];
    for (const item of cdf) {
      if (rand <= item.p) {
        sampledBasis = item.basis;
        break;
      }
    }

    if (noise.enabled) {
      let bits = sampledBasis.split('');
      for (let bitIdx = 0; bitIdx < bits.length; bitIdx++) {
        // Bit-flip noise
        if (Math.random() < noise.bitFlip) {
          bits[bitIdx] = bits[bitIdx] === '0' ? '1' : '0';
        }
        // Depolarizing noise
        if (Math.random() < noise.depolarizing) {
          bits[bitIdx] = Math.random() < 0.5 ? '0' : '1';
        }
        // Readout measurement error
        if (Math.random() < noise.readoutError) {
          bits[bitIdx] = bits[bitIdx] === '0' ? '1' : '0';
        }
      }
      sampledBasis = bits.join('');
    }

    result[sampledBasis] = (result[sampledBasis] || 0) + 1;
  }

  return result;
}

// Full quantum circuit simulation with time-travel timeline tracking
export function simulateCircuit(
  numQubits: number,
  gates: GatePlacement[],
  noise: NoiseConfig,
  shots = 1024,
  activeStep = -1
): SimulationResult {
  const size = 1 << numQubits;
  let currentState: Complex[] = new Array(size).fill(0).map((_, i) => (i === 0 ? C.create(1, 0) : C.create(0, 0)));

  // Group and sort gates by step
  const sortedGates = [...gates].sort((a, b) => a.step - b.step);
  const maxStep = sortedGates.length > 0 ? Math.max(...sortedGates.map((g) => g.step)) : 0;
  const executionLimitStep = activeStep >= 0 ? activeStep : maxStep + 1;

  const slices: StepSlice[] = [];

  // Snapshot t=0 (initial state |00...0>)
  const snapshotSlice = (stepIndex: number, gateId?: string): StepSlice => {
    const svItems: StatevectorItem[] = [];
    const probs: Record<string, number> = {};

    for (let i = 0; i < size; i++) {
      const basis = i.toString(2).padStart(numQubits, '0');
      const amp = currentState[i];
      const prob = C.abs2(amp);
      const phase = C.phase(amp);

      svItems.push({ basis, amplitude: amp, probability: prob, phase });
      probs[basis] = prob;
    }

    const blochs: BlochVector[] = [];
    for (let q = 0; q < numQubits; q++) {
      blochs.push(computeBlochVector(currentState, numQubits, q));
    }

    const conc = computeConcurrence(currentState, numQubits);

    return {
      step: stepIndex,
      activeGateId: gateId,
      statevector: svItems,
      probabilities: probs,
      blochVectors: blochs,
      concurrence: conc,
    };
  };

  slices.push(snapshotSlice(0));

  // Gate metrics
  let cnotCount = 0;
  let tCount = 0;

  for (const g of sortedGates) {
    if (g.gate === 'CX' || g.gate === 'CZ' || g.gate === 'SWAP') {
      cnotCount++;
    }
    if (g.gate === 'T') {
      tCount++;
    }

    // If activeStep is set and this gate is beyond it, stop execution
    if (g.step > executionLimitStep) {
      continue;
    }

    // Apply the gate
    if (g.gate in SINGLE_QUBIT_MATRICES) {
      const matGen = SINGLE_QUBIT_MATRICES[g.gate];
      const mat = matGen(g.param);
      currentState = applySingleQubitGate(currentState, numQubits, g.qubit, mat);
    } else if (g.gate === 'CX' || g.gate === 'CZ' || g.gate === 'SWAP') {
      const ctrl = g.controlQubit ?? Math.max(0, g.qubit - 1);
      currentState = applyTwoQubitGate(currentState, numQubits, ctrl, g.qubit, g.gate);
    } else if (g.gate === 'M') {
      // Measurement is simulated at the end via sampling
    }

    slices.push(snapshotSlice(g.step + 1, g.id));
  }

  const finalSlice = slices[slices.length - 1];
  const measurements = applyNoiseToProbabilities(finalSlice.probabilities, noise, shots, numQubits);

  return {
    statevector: finalSlice.statevector,
    probabilities: finalSlice.probabilities,
    measurements,
    blochVectors: finalSlice.blochVectors,
    concurrence: finalSlice.concurrence,
    isEntangled: finalSlice.concurrence > 0.05,
    circuitDepth: maxStep + 1,
    gateCount: gates.length,
    cnotCount,
    tCount,
    slices,
  };
}
