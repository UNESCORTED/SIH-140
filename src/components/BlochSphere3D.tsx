import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BlochVector } from '../types/quantum';

interface BlochSphere3DProps {
  vector: BlochVector;
  qubitIndex: number;
  interactive?: boolean;
}

export const BlochSphere3D: React.FC<BlochSphere3DProps> = ({ vector, qubitIndex }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const arrowRef = useRef<THREE.ArrowHelper | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 260;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(2.8, 1.8, 2.8);
    camera.lookAt(0, 0, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // 5. Architectural Sphere Wireframe (Minimalist monochrome)
    const sphereRadius = 1.0;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 24, 24);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x333333,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    // Subtle equatorial circle
    const equatorGeo = new THREE.RingGeometry(0.99, sphereRadius, 48);
    const equatorMat = new THREE.MeshBasicMaterial({
      color: 0x555555,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const equatorMesh = new THREE.Mesh(equatorGeo, equatorMat);
    equatorMesh.rotation.x = Math.PI / 2;
    scene.add(equatorMesh);

    // 6. Coordinate Axes (Thin, minimalist)
    const axesGroup = new THREE.Group();

    // Z-axis (Vertical: |0> at top, |1> at bottom)
    const zMat = new THREE.LineBasicMaterial({ color: 0x737373, transparent: true, opacity: 0.6 });
    const zGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.25, 0),
      new THREE.Vector3(0, 1.25, 0),
    ]);
    axesGroup.add(new THREE.Line(zGeo, zMat));

    // X-axis (Horizontal)
    const xMat = new THREE.LineBasicMaterial({ color: 0x525252, transparent: true, opacity: 0.6 });
    const xGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.25, 0, 0),
      new THREE.Vector3(1.25, 0, 0),
    ]);
    axesGroup.add(new THREE.Line(xGeo, xMat));

    // Y-axis (Depth)
    const yMat = new THREE.LineBasicMaterial({ color: 0x525252, transparent: true, opacity: 0.6 });
    const yGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -1.25),
      new THREE.Vector3(0, 0, 1.25),
    ]);
    axesGroup.add(new THREE.Line(yGeo, yMat));

    scene.add(axesGroup);

    // 7. State Arrow Helper (Crisp white vector)
    const dir = new THREE.Vector3(vector.x, vector.z, -vector.y).normalize();
    const length = Math.max(0.08, vector.purity);
    const arrowColor = vector.isEntangled ? 0xa3a3a3 : 0xffffff;

    const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), length, arrowColor, 0.16, 0.08);
    scene.add(arrow);
    arrowRef.current = arrow;

    // Small origin sphere
    const originGeo = new THREE.SphereGeometry(0.03, 16, 16);
    const originMat = new THREE.MeshBasicMaterial({ color: 0xa3a3a3 });
    scene.add(new THREE.Mesh(originGeo, originMat));

    // 8. Orbit rotation via drag
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let thetaCam = Math.PI / 4;
    let phiCam = Math.PI / 4;
    const radiusCam = 3.6;

    const updateCamera = () => {
      camera.position.x = radiusCam * Math.sin(phiCam) * Math.sin(thetaCam);
      camera.position.y = radiusCam * Math.cos(phiCam);
      camera.position.z = radiusCam * Math.sin(phiCam) * Math.cos(thetaCam);
      camera.lookAt(0, 0, 0);
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      thetaCam += deltaX * 0.01;
      phiCam = Math.max(0.1, Math.min(Math.PI - 0.1, phiCam - deltaY * 0.01));
      updateCamera();
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 9. Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
    };
  }, []);

  // Update vector direction & length when props change
  useEffect(() => {
    if (!arrowRef.current || !sceneRef.current) return;
    const dir = new THREE.Vector3(vector.x, vector.z, -vector.y).normalize();
    const length = Math.max(0.08, vector.purity);
    const arrowColor = vector.isEntangled ? 0xa3a3a3 : 0xffffff;

    arrowRef.current.setDirection(dir);
    arrowRef.current.setLength(length, 0.16, 0.08);
    arrowRef.current.setColor(arrowColor);
  }, [vector]);

  // Derived probabilities from Bloch vector z-projection: P(0) = (1 + z)/2, P(1) = (1 - z)/2
  const p0 = Math.max(0, Math.min(1, (1 + vector.z) / 2));
  const p1 = Math.max(0, Math.min(1, (1 - vector.z) / 2));

  // Alpha and Beta calculation for state string
  const alphaStr = Math.sqrt(p0).toFixed(2);
  const betaStr = Math.sqrt(p1).toFixed(2);

  return (
    <div className="flex flex-col bg-[#0e0e0e] border border-white/[0.08] rounded-xl p-4 shadow-sm relative">
      {/* Header */}
      <div className="flex items-center justify-between w-full mb-2 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
          <span className="text-xs font-mono font-medium text-white tracking-wide">
            Qubit q[{qubitIndex}]
          </span>
        </div>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            vector.isEntangled
              ? 'bg-neutral-900 text-neutral-400 border-neutral-700'
              : 'bg-white text-black border-white font-medium'
          }`}
        >
          {vector.isEntangled ? 'Mixed (Entangled)' : 'Pure State'}
        </span>
      </div>

      {/* 3D WebGL Canvas container */}
      <div
        ref={mountRef}
        className="w-full h-52 cursor-grab active:cursor-grabbing relative flex items-center justify-center my-1"
      >
        {/* Minimal coordinate labels overlaid */}
        <span className="absolute top-1 text-[10px] font-mono text-neutral-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/[0.05] pointer-events-none">
          |0⟩ (+Z)
        </span>
        <span className="absolute bottom-1 text-[10px] font-mono text-neutral-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/[0.05] pointer-events-none">
          |1⟩ (-Z)
        </span>
        <span className="absolute right-2 text-[10px] font-mono text-neutral-500 bg-black/60 px-1 py-0.5 rounded pointer-events-none">
          |+⟩ (+X)
        </span>
        <span className="absolute left-2 text-[10px] font-mono text-neutral-500 bg-black/60 px-1 py-0.5 rounded pointer-events-none">
          |+i⟩ (+Y)
        </span>
      </div>

      {/* Clean mathematical formula underneath */}
      <div className="w-full pt-3 pb-1 border-t border-white/[0.06] flex flex-col gap-2">
        <div className="text-center font-mono text-xs text-white">
          <span className="text-neutral-400">|ψ⟩ = </span>
          <span>{alphaStr}|0⟩ + {betaStr}|1⟩</span>
        </div>

        <div className="flex items-center justify-around text-[11px] font-mono text-neutral-400 pt-1 border-t border-white/[0.04]">
          <div>
            <span className="text-neutral-500 mr-1.5">P(0):</span>
            <span className="text-neutral-200 font-medium">{(p0 * 100).toFixed(1)}%</span>
          </div>
          <div className="h-3 w-[1px] bg-white/[0.08]" />
          <div>
            <span className="text-neutral-500 mr-1.5">P(1):</span>
            <span className="text-neutral-200 font-medium">{(p1 * 100).toFixed(1)}%</span>
          </div>
          <div className="h-3 w-[1px] bg-white/[0.08]" />
          <div>
            <span className="text-neutral-500 mr-1.5">Purity |r|:</span>
            <span className="text-neutral-200 font-medium">{(vector.purity * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Polar coordinates */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-neutral-500 pt-0.5">
          <span>θ = {((vector.theta * 180) / Math.PI).toFixed(0)}°</span>
          <span>•</span>
          <span>φ = {((vector.phi * 180) / Math.PI).toFixed(0)}°</span>
        </div>
      </div>

      {vector.isEntangled && (
        <div className="mt-2 text-[10px] text-neutral-400 bg-neutral-900/80 border border-neutral-800 p-2 rounded text-center leading-relaxed">
          Vector collapsed to center (|r| = {vector.purity.toFixed(2)}): Qubit is entangled in a multi-qubit state. Inspect <b>Q-Sphere</b> tab for global correlations.
        </div>
      )}
    </div>
  );
};
