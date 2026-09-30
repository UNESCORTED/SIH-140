import React from 'react';
import { Users, GraduationCap, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';

export const InstructorDashboard: React.FC = () => {
  const CONCEPT_METRICS = [
    { name: 'Quantum Basics & Qubits', mastery: 94, status: 'Mastered' },
    { name: 'Single-Qubit Gates (X, Y, Z, H)', mastery: 88, status: 'Mastered' },
    { name: 'Superposition & Interference', mastery: 78, status: 'Proficient' },
    { name: 'Entanglement & Bell States', mastery: 42, status: 'Review Needed' },
    { name: 'Quantum Error Correction (QEC)', mastery: 31, status: 'Bottleneck' },
  ];

  const RECENT_SUBMISSIONS = [
    { student: 'Aarav Sharma', challenge: 'Bell State Creation', fidelity: '1.00', status: 'Passed', time: '10 mins ago' },
    { student: 'Ananya Rao', challenge: '3-Qubit GHZ State', fidelity: '0.98', status: 'Passed', time: '24 mins ago' },
    { student: 'Rohan Verma', challenge: 'Superposition State', fidelity: '0.62', status: 'Needs Review', time: '1 hour ago' },
    { student: 'Priya Patel', challenge: 'Bell State Creation', fidelity: '0.99', status: 'Passed', time: '2 hours ago' },
  ];

  return (
    <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm max-w-5xl mx-auto w-full font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#181818] border border-white/[0.08] flex items-center justify-center text-white">
            <GraduationCap size={18} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">University Instructor Portal</h3>
            <p className="text-xs text-neutral-400">Class-wide learning analytics, auto-grading ledger, and curriculum bottleneck detection</p>
          </div>
        </div>

        <span className="text-xs font-mono text-neutral-300 bg-[#141414] px-3 py-1.5 rounded-lg border border-white/[0.08] font-medium self-start sm:self-auto">
          IIT Madras • Quantum Engineering 401
        </span>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#121212] p-4 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block font-mono">Enrolled Students</span>
            <span className="text-2xl font-bold font-mono text-white mt-0.5 block">1,240</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-neutral-300 border border-white/[0.06]">
            <Users size={16} />
          </div>
        </div>

        <div className="bg-[#121212] p-4 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block font-mono">Avg Course Completion</span>
            <span className="text-2xl font-bold font-mono text-white mt-0.5 block">68.4%</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-neutral-300 border border-white/[0.06]">
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="bg-[#121212] p-4 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 block font-mono">Review Flagged</span>
            <span className="text-2xl font-bold font-mono text-white mt-0.5 block">42</span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] flex items-center justify-center text-neutral-300 border border-white/[0.06]">
            <AlertCircle size={16} />
          </div>
        </div>
      </div>

      {/* Concept Bottleneck Heatmap */}
      <div className="bg-[#101010] p-5 rounded-2xl border border-white/[0.08] flex flex-col gap-4 font-mono">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white font-medium uppercase tracking-wider flex items-center gap-2">
            <BarChart3 size={14} className="text-neutral-400" />
            Class-Wide Concept Mastery Matrix
          </span>
          <span className="text-neutral-400 text-[11px]">
            2 Bottlenecks Isolated
          </span>
        </div>

        <div className="space-y-3.5">
          {CONCEPT_METRICS.map((c) => (
            <div key={c.name} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-300">{c.name}</span>
                <span className="text-white font-medium">
                  {c.mastery}% ({c.status})
                </span>
              </div>
              <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden p-0.5 border border-white/[0.04]">
                <div
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${c.mastery}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Auto-Evaluated Student Submissions */}
      <div className="bg-[#101010] p-5 rounded-2xl border border-white/[0.08] flex flex-col gap-4">
        <h4 className="text-xs font-mono font-medium text-white uppercase tracking-wider">
          Recent Auto-Graded Circuit Submissions
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-neutral-500 text-[11px]">
                <th className="pb-2.5 font-medium">STUDENT</th>
                <th className="pb-2.5 font-medium">CHALLENGE</th>
                <th className="pb-2.5 font-medium">STATE FIDELITY</th>
                <th className="pb-2.5 font-medium">STATUS</th>
                <th className="pb-2.5 font-medium text-right">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {RECENT_SUBMISSIONS.map((s, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 font-semibold text-white">{s.student}</td>
                  <td className="py-3 text-neutral-300">{s.challenge}</td>
                  <td className="py-3 text-white font-medium">{s.fidelity}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        s.status === 'Passed'
                          ? 'bg-white text-black border-white font-semibold'
                          : 'bg-[#181818] text-neutral-400 border-white/[0.08]'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 text-neutral-500 text-[11px] text-right">{s.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
