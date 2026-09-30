import React, { useState, useEffect } from 'react';
import { CircuitState } from '../types/quantum';
import { circuitToQiskit, circuitToOpenQASM, circuitToCirq, qiskitToCircuit } from '../quantum/transpiler';
import { Copy, Check, Download, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';

interface CodeLabProps {
  circuit: CircuitState;
  onCodeSync: (numQubits: number, gates: any[]) => void;
}

export const CodeLab: React.FC<CodeLabProps> = ({ circuit, onCodeSync }) => {
  const [framework, setFramework] = useState<'qiskit' | 'qasm' | 'cirq'>('qiskit');
  const [editableCode, setEditableCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Sync code whenever circuit updates
  useEffect(() => {
    if (framework === 'qiskit') {
      setEditableCode(circuitToQiskit(circuit.numQubits, circuit.gates));
    } else if (framework === 'qasm') {
      setEditableCode(circuitToOpenQASM(circuit.numQubits, circuit.gates));
    } else {
      setEditableCode(circuitToCirq(circuit.numQubits, circuit.gates));
    }
  }, [circuit.gates, circuit.numQubits, framework]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSync = () => {
    if (framework !== 'qiskit') {
      setSyncStatus('Bi-directional parsing is optimized for Qiskit syntax.');
      return;
    }
    try {
      const parsed = qiskitToCircuit(editableCode, circuit.numQubits);
      onCodeSync(parsed.numQubits, parsed.gates);
      setSyncStatus(`Synced: ${parsed.gates.length} gates parsed on ${parsed.numQubits} qubits.`);
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (err: any) {
      setSyncStatus(`Parse error: ${err.message || 'Invalid syntax'}`);
    }
  };

  const downloadFile = () => {
    const ext = framework === 'qasm' ? 'qasm' : 'py';
    const blob = new Blob([editableCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum_circuit.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-5 shadow-sm flex flex-col gap-4">
      {/* 1. Header with Framework Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#161616] border border-white/[0.08] flex items-center justify-center text-white">
            <Terminal size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white tracking-tight">Quantum Code Lab</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Synced with circuit</span>
              </div>
            </div>
            <p className="text-xs text-neutral-400">Bi-directional transpilation & code execution</p>
          </div>
        </div>

        {/* Framework Tabs */}
        <div className="flex items-center gap-1 bg-[#141414] p-1 rounded-lg border border-white/[0.08] text-xs font-mono">
          <button
            onClick={() => setFramework('qiskit')}
            className={`px-3 py-1 rounded transition-colors ${
              framework === 'qiskit' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Qiskit
          </button>
          <button
            onClick={() => setFramework('qasm')}
            className={`px-3 py-1 rounded transition-colors ${
              framework === 'qasm' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            OpenQASM 3.0
          </button>
          <button
            onClick={() => setFramework('cirq')}
            className={`px-3 py-1 rounded transition-colors ${
              framework === 'cirq' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Cirq
          </button>
        </div>
      </div>

      {/* 2. Secondary Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {framework === 'qiskit' && (
            <button
              onClick={handleManualSync}
              className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors font-mono"
            >
              <RefreshCw size={13} />
              <span>Sync to Wires</span>
            </button>
          )}

          <button
            onClick={downloadFile}
            className="flex items-center gap-1.5 bg-[#141414] hover:bg-[#1e1e1e] text-neutral-300 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-white/[0.08] transition-colors font-mono"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 bg-[#141414] hover:bg-[#1e1e1e] text-neutral-300 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-white/[0.08] transition-colors font-mono"
        >
          {copied ? <Check size={13} className="text-white" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {syncStatus && (
        <div className="text-xs p-2.5 rounded-lg bg-[#141414] border border-white/[0.12] text-neutral-200 font-mono flex items-center gap-2">
          <CheckCircle2 size={13} className="text-neutral-400" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* 3. Monochrome Code Editor */}
      <div className="relative font-mono text-xs bg-[#050505] rounded-xl border border-white/[0.08] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06] bg-[#0c0c0c] text-[10px] text-neutral-500">
          <span>{framework === 'qasm' ? 'circuit.qasm' : 'circuit.py'}</span>
          <span>UTF-8 • Ready to execute</span>
        </div>
        <textarea
          value={editableCode}
          onChange={(e) => setEditableCode(e.target.value)}
          spellCheck={false}
          rows={11}
          className="w-full bg-transparent p-4 text-neutral-200 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-neutral-800"
        />
      </div>
    </div>
  );
};
