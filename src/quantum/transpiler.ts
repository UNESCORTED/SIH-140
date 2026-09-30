import { GatePlacement, GateType, LinterIssue } from '../types/quantum';

// Circuit -> Qiskit Python Code
export function circuitToQiskit(numQubits: number, gates: GatePlacement[]): string {
  const sorted = [...gates].sort((a, b) => a.step - b.step);
  let code = `from qiskit import QuantumCircuit, Aer, execute\nimport matplotlib.pyplot as plt\n\n# Initialize ${numQubits}-qubit quantum circuit\nqc = QuantumCircuit(${numQubits}, ${numQubits})\n\n`;

  for (const g of sorted) {
    const q = g.qubit;
    const ctrl = g.controlQubit ?? Math.max(0, q - 1);
    const param = g.param !== undefined ? g.param.toFixed(3) : '1.571';

    switch (g.gate) {
      case 'H':
        code += `qc.h(${q})\n`;
        break;
      case 'X':
        code += `qc.x(${q})\n`;
        break;
      case 'Y':
        code += `qc.y(${q})\n`;
        break;
      case 'Z':
        code += `qc.z(${q})\n`;
        break;
      case 'S':
        code += `qc.s(${q})\n`;
        break;
      case 'T':
        code += `qc.t(${q})\n`;
        break;
      case 'RX':
        code += `qc.rx(${param}, ${q})\n`;
        break;
      case 'RY':
        code += `qc.ry(${param}, ${q})\n`;
        break;
      case 'RZ':
        code += `qc.rz(${param}, ${q})\n`;
        break;
      case 'CX':
        code += `qc.cx(${ctrl}, ${q})\n`;
        break;
      case 'CZ':
        code += `qc.cz(${ctrl}, ${q})\n`;
        break;
      case 'SWAP':
        code += `qc.swap(${ctrl}, ${q})\n`;
        break;
      case 'M':
        code += `qc.measure(${q}, ${q})\n`;
        break;
    }
  }

  code += `\n# Simulate using Qiskit Aer Statevector Simulator\nbackend = Aer.get_backend('statevector_simulator')\njob = execute(qc, backend)\nresult = job.result()\nstatevector = result.get_statevector()\nprint("Final Statevector:", statevector)\n`;

  return code;
}

// Circuit -> OpenQASM 3.0
export function circuitToOpenQASM(numQubits: number, gates: GatePlacement[]): string {
  const sorted = [...gates].sort((a, b) => a.step - b.step);
  let qasm = `OPENQASM 3.0;\ninclude "stdgates.inc";\n\nqubit[${numQubits}] q;\nbit[${numQubits}] c;\n\n`;

  for (const g of sorted) {
    const q = g.qubit;
    const ctrl = g.controlQubit ?? Math.max(0, q - 1);
    const param = g.param !== undefined ? g.param.toFixed(3) : '1.571';

    switch (g.gate) {
      case 'H':
        qasm += `h q[${q}];\n`;
        break;
      case 'X':
        qasm += `x q[${q}];\n`;
        break;
      case 'Y':
        qasm += `y q[${q}];\n`;
        break;
      case 'Z':
        qasm += `z q[${q}];\n`;
        break;
      case 'S':
        qasm += `s q[${q}];\n`;
        break;
      case 'T':
        qasm += `t q[${q}];\n`;
        break;
      case 'RX':
        qasm += `rx(${param}) q[${q}];\n`;
        break;
      case 'RY':
        qasm += `ry(${param}) q[${q}];\n`;
        break;
      case 'RZ':
        qasm += `rz(${param}) q[${q}];\n`;
        break;
      case 'CX':
        qasm += `cx q[${ctrl}], q[${q}];\n`;
        break;
      case 'CZ':
        qasm += `cz q[${ctrl}], q[${q}];\n`;
        break;
      case 'SWAP':
        qasm += `swap q[${ctrl}], q[${q}];\n`;
        break;
      case 'M':
        qasm += `c[${q}] = measure q[${q}];\n`;
        break;
    }
  }

  return qasm;
}

// Circuit -> Cirq Python Code
export function circuitToCirq(numQubits: number, gates: GatePlacement[]): string {
  const sorted = [...gates].sort((a, b) => a.step - b.step);
  let code = `import cirq\n\n# Initialize ${numQubits} qubits\nqubits = [cirq.LineQubit(i) for i in range(${numQubits})]\ncircuit = cirq.Circuit()\n\n`;

  for (const g of sorted) {
    const q = `qubits[${g.qubit}]`;
    const ctrl = `qubits[${g.controlQubit ?? Math.max(0, g.qubit - 1)}]`;

    switch (g.gate) {
      case 'H':
        code += `circuit.append(cirq.H(${q}))\n`;
        break;
      case 'X':
        code += `circuit.append(cirq.X(${q}))\n`;
        break;
      case 'Y':
        code += `circuit.append(cirq.Y(${q}))\n`;
        break;
      case 'Z':
        code += `circuit.append(cirq.Z(${q}))\n`;
        break;
      case 'S':
        code += `circuit.append(cirq.S(${q}))\n`;
        break;
      case 'T':
        code += `circuit.append(cirq.T(${q}))\n`;
        break;
      case 'CX':
        code += `circuit.append(cirq.CNOT(${ctrl}, ${q}))\n`;
        break;
      case 'CZ':
        code += `circuit.append(cirq.CZ(${ctrl}, ${q}))\n`;
        break;
      case 'SWAP':
        code += `circuit.append(cirq.SWAP(${ctrl}, ${q}))\n`;
        break;
      case 'M':
        code += `circuit.append(cirq.measure(${q}))\n`;
        break;
    }
  }

  code += `\nprint("Cirq Circuit Diagram:\\n", circuit)\nsim = cirq.Simulator()\nresult = sim.simulate(circuit)\nprint("Statevector:", result.final_state_vector)\n`;

  return code;
}

// Qiskit Python Code -> Circuit AST parser (for live bi-directional sync!)
export function qiskitToCircuit(code: string, currentNumQubits: number): { numQubits: number; gates: GatePlacement[] } {
  const lines = code.split('\n');
  let numQubits = currentNumQubits;
  const gates: GatePlacement[] = [];
  const stepTracker: number[] = new Array(8).fill(0); // track column per wire

  for (const rawLine of lines) {
    const line = rawLine.trim();

    // Check for QuantumCircuit(numQubits)
    const qcMatch = line.match(/QuantumCircuit\((\d+)/);
    if (qcMatch) {
      numQubits = Math.max(1, Math.min(6, parseInt(qcMatch[1], 10)));
    }

    // Match 1-qubit gates: qc.h(0), qc.x(1), qc.s(2), etc.
    const oneQubitMatch = line.match(/qc\.(h|x|y|z|s|t|measure)\((\d+)/i);
    if (oneQubitMatch) {
      const gName = oneQubitMatch[1].toUpperCase();
      const q = parseInt(oneQubitMatch[2], 10);
      if (q < numQubits) {
        const step = stepTracker[q];
        stepTracker[q]++;
        gates.push({
          id: `gate_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          gate: (gName === 'MEASURE' ? 'M' : gName) as GateType,
          qubit: q,
          step,
        });
      }
    }

    // Match rotations: qc.rx(1.57, 0)
    const rotMatch = line.match(/qc\.(rx|ry|rz)\(([^,]+),\s*(\d+)\)/i);
    if (rotMatch) {
      const gName = rotMatch[1].toUpperCase() as GateType;
      const paramVal = parseFloat(rotMatch[2]) || Math.PI / 2;
      const q = parseInt(rotMatch[3], 10);
      if (q < numQubits) {
        const step = stepTracker[q];
        stepTracker[q]++;
        gates.push({
          id: `gate_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          gate: gName,
          qubit: q,
          step,
          param: paramVal,
        });
      }
    }

    // Match 2-qubit gates: qc.cx(0, 1), qc.cz(0, 1), qc.swap(0, 1)
    const twoQubitMatch = line.match(/qc\.(cx|cz|swap)\((\d+),\s*(\d+)\)/i);
    if (twoQubitMatch) {
      const gName = twoQubitMatch[1].toUpperCase() as GateType;
      const ctrl = parseInt(twoQubitMatch[2], 10);
      const tgt = parseInt(twoQubitMatch[3], 10);

      if (ctrl < numQubits && tgt < numQubits && ctrl !== tgt) {
        const nextStep = Math.max(stepTracker[ctrl], stepTracker[tgt]);
        stepTracker[ctrl] = nextStep + 1;
        stepTracker[tgt] = nextStep + 1;

        gates.push({
          id: `gate_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          gate: gName,
          qubit: tgt,
          controlQubit: ctrl,
          step: nextStep,
        });
      }
    }
  }

  return { numQubits, gates };
}

// AI Quantum Circuit Linter & Optimizer
export function lintCircuit(gates: GatePlacement[], numQubits: number): LinterIssue[] {
  const issues: LinterIssue[] = [];

  // Group gates by qubit wire sorted by step
  const wireGates: Record<number, GatePlacement[]> = {};
  for (let q = 0; q < numQubits; q++) {
    wireGates[q] = [];
  }

  for (const g of gates) {
    if (g.qubit >= numQubits || (g.controlQubit !== undefined && g.controlQubit >= numQubits)) {
      issues.push({
        id: `err_bounds_${g.id}`,
        type: 'qubit_bounds',
        severity: 'error',
        message: `Gate ${g.gate} references qubit index outside active register (q${g.qubit} >= ${numQubits})`,
        gateIds: [g.id],
        suggestedFix: `Adjust qubit index to < ${numQubits} or expand circuit register.`,
      });
      continue;
    }
    wireGates[g.qubit].push(g);
  }

  // Check self-inverse redundancies (H-H, X-X, Z-Z)
  for (let q = 0; q < numQubits; q++) {
    const list = wireGates[q].sort((a, b) => a.step - b.step);
    for (let i = 0; i < list.length - 1; i++) {
      const curr = list[i];
      const next = list[i + 1];

      // Self-inverse 1-qubit gates
      if (
        (curr.gate === 'H' && next.gate === 'H') ||
        (curr.gate === 'X' && next.gate === 'X') ||
        (curr.gate === 'Y' && next.gate === 'Y') ||
        (curr.gate === 'Z' && next.gate === 'Z')
      ) {
        issues.push({
          id: `red_${curr.id}_${next.id}`,
          type: 'redundancy',
          severity: 'warning',
          message: `Redundant consecutive ${curr.gate} gates on q${q} (${curr.gate}·${curr.gate} = Identity). They cancel each other out.`,
          gateIds: [curr.id, next.id],
          suggestedFix: `Remove both ${curr.gate} gates to decrease circuit depth by 2.`,
          autoFixAction: 'remove_pair',
        });
      }

      // Gate placed after measurement
      if (curr.gate === 'M') {
        issues.push({
          id: `order_${next.id}`,
          type: 'ordering',
          severity: 'warning',
          message: `Gate ${next.gate} placed after Measurement on q${q}. Operations after terminal measurement do not affect outcome statistics.`,
          gateIds: [next.id],
          suggestedFix: `Move ${next.gate} before measurement or delete it.`,
        });
      }
    }
  }

  return issues;
}

// Auto-Optimizer: removes redundant self-inverses and compacts depth
export function optimizeCircuit(gates: GatePlacement[]): { optimizedGates: GatePlacement[]; savedGates: number } {
  const toRemove = new Set<string>();

  // Check consecutive self-inverses per wire
  const byQubit: Record<number, GatePlacement[]> = {};
  for (const g of gates) {
    byQubit[g.qubit] = byQubit[g.qubit] || [];
    byQubit[g.qubit].push(g);
  }

  for (const q in byQubit) {
    const list = byQubit[q].sort((a, b) => a.step - b.step);
    for (let i = 0; i < list.length - 1; i++) {
      const a = list[i];
      const b = list[i + 1];
      if (
        !toRemove.has(a.id) &&
        !toRemove.has(b.id) &&
        a.gate === b.gate &&
        ['H', 'X', 'Y', 'Z'].includes(a.gate) &&
        Math.abs(a.step - b.step) <= 1
      ) {
        toRemove.add(a.id);
        toRemove.add(b.id);
      }
    }
  }

  const filtered = gates.filter((g) => !toRemove.has(g.id));

  // Re-compact step columns
  const sorted = [...filtered].sort((a, b) => a.step - b.step);
  const stepMap: Record<number, number> = {};
  let currentStep = 0;
  for (const g of sorted) {
    if (stepMap[g.step] === undefined) {
      stepMap[g.step] = currentStep++;
    }
  }

  const compacted = sorted.map((g) => ({
    ...g,
    step: stepMap[g.step] ?? g.step,
  }));

  return {
    optimizedGates: compacted,
    savedGates: toRemove.size,
  };
}

// NISQ Chip Topology & Transpilation Visualizer
export interface HardwareTopology {
  name: string;
  numQubits: number;
  couplingMap: Array<[number, number]>; // adjacent physical qubit connections
}

export const IBM_FALCON_5Q: HardwareTopology = {
  name: 'IBM Falcon (5-Qubit Heavy-Hex / T-Topology)',
  numQubits: 5,
  couplingMap: [
    [0, 1],
    [1, 2],
    [2, 3],
    [1, 4],
  ],
};

// Check if two qubits are directly connected on the hardware topology
export function isCoupled(topology: HardwareTopology, q1: number, q2: number): boolean {
  return topology.couplingMap.some(
    ([a, b]) => (a === q1 && b === q2) || (a === q2 && b === q1)
  );
}

// Compute transpilation SWAP overhead for non-connected gates
export function computeTopologyOverhead(
  gates: GatePlacement[],
  topology: HardwareTopology = IBM_FALCON_5Q
): { uncoupledGates: GatePlacement[]; requiredSwaps: number; depthPenalty: number } {
  const uncoupled: GatePlacement[] = [];
  let requiredSwaps = 0;

  for (const g of gates) {
    if (g.gate === 'CX' || g.gate === 'CZ' || g.gate === 'SWAP') {
      const ctrl = g.controlQubit ?? Math.max(0, g.qubit - 1);
      const tgt = g.qubit;

      if (!isCoupled(topology, ctrl, tgt)) {
        uncoupled.push(g);
        // Distance heuristic: number of intermediate hops
        const dist = Math.abs(ctrl - tgt);
        requiredSwaps += (dist - 1) * 2;
      }
    }
  }

  return {
    uncoupledGates: uncoupled,
    requiredSwaps,
    depthPenalty: requiredSwaps * 3, // Each SWAP adds ~3 CNOT depth
  };
}
