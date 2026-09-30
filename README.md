# QuantumLab AI — AI-Powered Interactive Quantum Computing Platform
> **Smart India Hackathon (SIH 26140)** • Aligned with the **National Quantum Mission (NQM)**

---

## 🌌 Overview

**QuantumLab AI** is an AI-native web platform designed for interactive quantum computing education, programming, simulation, visualization, and intelligent tutoring. It bridges the gap between abstract quantum theory and practical software development by uniting:

$$\text{\textbf{Learn}} \longrightarrow \text{\textbf{Build}} \longrightarrow \text{\textbf{Code}} \longrightarrow \text{\textbf{Simulate}} \longrightarrow \text{\textbf{Visualize}} \longrightarrow \text{\textbf{Understand}} \longrightarrow \text{\textbf{Practice}}$$

Built with a **premium, minimal Apple/Linear-inspired monochrome aesthetic**, QuantumLab AI provides students, university instructors, and researchers with an uncluttered, high-fidelity quantum IDE.

---

## ✨ Key Features

### 1. 🎛️ Quantum Circuit Lab
* **Interactive Drag & Drop Wires:** Place single-qubit and multi-qubit gates ($H$, $X$, $Y$, $Z$, $S$, $T$, $R_x$, $R_y$, $R_z$, $\text{CNOT}$, $CZ$, $\text{SWAP}$, and $M$).
* **Time-Travel Circuit Evolution:** Step forward and backward through the circuit timeline to observe step-by-step statevector transformations.
* **Dynamic Register Sizing:** Expand from 1 to 5 qubits with automated tensor product matrix expansion.

### 2. 🌐 Multi-Layered Visualization Suite
* **3D Architectural Bloch Sphere:** Real-time WebGL/Three.js geometric representation of single-qubit density projections, polar angles ($\theta, \phi$), and mixed-state collapse detection.
* **Global Q-Sphere & Phase Discs:** Visualizes multi-qubit amplitudes with rotating phase needles and entanglement concurrence metrics.
* **Measurement Shot Distribution:** Histogram sampling against theoretical Born-rule probabilities.
* **Exact Dirac Statevector:** Complete complex matrix decomposition ($|\psi\rangle = \sum c_i |i\rangle$).

### 3. 🤖 Context-Aware AI Quantum Tutor
* **Live Quantum-AST Injection:** The AI assistant directly inspects the current circuit depth, gate placements, and statevector amplitudes.
* **One-Click Analysis Actions:**
  * `[ Explain Circuit ]` — Step-by-step physical breakdown of each unitary operation.
  * `[ Mathematical Formulation ]` — Formulates state equations and density matrices.
  * `[ Auto-Optimize ]` — Identifies and eliminates redundant self-inverse gates (e.g. $H \cdot H = I$).
  * `[ What-If? ]` — Analyzes state differences when gates or noise channels are toggled.
* **Real-time Circuit Linter:** Flags uncoupled multi-qubit gates and dangling operations.

### 4. 💻 Bi-Directional Quantum Code Lab
* **Multi-Framework Transpilation:** Real-time bi-directional code generation for **Qiskit**, **OpenQASM 3.0**, and **Cirq**.
* **Code-to-Circuit Sync:** Edit Python/Qiskit code and immediately parse it back into interactive visual wires.

### 5. 📡 NISQ Noise Simulation Engine
* Configurable decoherence channels:
  * Pauli Bit-Flip ($p_x$)
  * Phase Dephasing ($p_z$)
  * Isotropic Depolarizing channel ($p_{\text{depol}}$)
  * Detector Readout Errors ($p_{\text{meas}}$)

### 6. 🛡️ 3-Qubit Quantum Error Correction (QEC) Sandbox
* Interactive Bit-Flip Repetition Code with stabilizer syndrome parity measurements ($s_0 = q_0 \oplus q_1, s_1 = q_1 \oplus q_2$) and autonomous recovery without destroying superposition.

### 7. 🎓 Educational Tracks & Verified Problem Lab
* **Curriculum Lessons:** Self-paced modules from Qubit Fundamentals to Bell Entanglement and Fault-Tolerance.
* **Automated Challenge Verifier:** Tests user circuits against target unitary states and awards XP.

### 8. 🎮 Quantum Intuition Arcade
* **Bloch Golf:** Rotate state vectors to target poles using minimal unitary strokes.
* **Bell CHSH Inequality Game:** Tune detector angles to experimentally violate Bell's inequality and reach Tsirelson's bound ($S = 2\sqrt{2} \approx 2.828$).

### 9. ☁️ Hardware Integration
* **NISQ QPU Topology:** Physical qubit coupling map for IBM Falcon 5Q with automated SWAP gate routing diagnostics.
* **Cloud QPU Bridge:** Direct interface to IBM Quantum Cloud systems.

---

## 🛠️ Technology Stack

* **Frontend:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS (Custom monochrome design tokens)
* **3D Visualizations:** Three.js (Architectural wireframe Bloch Spheres)
* **Icons:** Lucide React
* **Effects:** Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/UNESCORTED/SIH-140.git
   cd SIH-140
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 👥 Smart India Hackathon 2026
* **Problem Statement:** SIH 26140
* **Platform:** QuantumLab AI
