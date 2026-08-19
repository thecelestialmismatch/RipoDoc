'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, OrbitControls, Sparkles, Stars } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import type { Group, Mesh } from 'three';

export type ProofScenario = 'qbr' | 'security' | 'executive';
export type ProofNode = 'claim' | 'source' | 'scope' | 'reader' | 'receipt';

type Palette = { readonly accent: string; readonly accent2: string; readonly glow: string; readonly label: string };

const PALETTES: Record<ProofScenario, Palette> = {
  qbr: { accent: '#7c9cff', accent2: '#54e3b6', glow: '#f6c177', label: 'QBR PERFORMANCE' },
  security: { accent: '#ff7a92', accent2: '#f6c177', glow: '#8fc9ff', label: 'SECURITY POSTURE' },
  executive: { accent: '#b596ff', accent2: '#68d9ff', glow: '#ffd37c', label: 'EXECUTIVE DECISION' },
};

const NODES: readonly { readonly id: ProofNode; readonly label: string; readonly position: readonly [number, number, number] }[] = [
  { id: 'claim', label: 'Claim', position: [0, 0.25, 0] },
  { id: 'source', label: 'Source', position: [-2.4, 1.15, -0.3] },
  { id: 'scope', label: 'Scope', position: [2.25, 1.15, 0.2] },
  { id: 'reader', label: 'Reader', position: [-2.1, -1.45, 0.5] },
  { id: 'receipt', label: 'Receipt', position: [2.35, -1.28, -0.35] },
] as const;

export function ProofTopology3D({ scenario, activeNode, onNodeChange, compact = false }: { readonly scenario: ProofScenario; readonly activeNode: ProofNode; readonly onNodeChange: (node: ProofNode) => void; readonly compact?: boolean }) {
  return <div className={`proof-topology ${compact ? 'proof-topology-compact' : ''}`} aria-label={`Live three-dimensional ${PALETTES[scenario].label.toLowerCase()} proof topology`}>
    <Canvas dpr={[1, 1.6]} camera={{ fov: compact ? 48 : 43, position: [0, 0.2, compact ? 9.5 : 8.4] }} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#0b101a']} />
      <fog attach="fog" args={['#0b101a', 7, 16]} />
      <ambientLight intensity={0.85} />
      <pointLight position={[4, 4, 5]} intensity={16} color={PALETTES[scenario].accent} />
      <pointLight position={[-4, -3, 3]} intensity={11} color={PALETTES[scenario].accent2} />
      <TopologyScene scenario={scenario} activeNode={activeNode} onNodeChange={onNodeChange} compact={compact} />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI * 0.35} maxPolarAngle={Math.PI * 0.66} autoRotate autoRotateSpeed={0.28} />
    </Canvas>
    <div className="proof-topology-watermark" aria-hidden="true"><span>LIVE / FIXTURE</span><span>{PALETTES[scenario].label}</span></div>
  </div>;
}

function TopologyScene({ scenario, activeNode, onNodeChange, compact }: { readonly scenario: ProofScenario; readonly activeNode: ProofNode; readonly onNodeChange: (node: ProofNode) => void; readonly compact: boolean }) {
  const group = useRef<Group>(null);
  const palette = PALETTES[scenario];
  const lines = useMemo(() => NODES.filter((node) => node.id !== 'claim').map((node) => [[0, 0.25, 0], node.position] as const), []);
  useFrame((state) => { if (group.current) { group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.045; } });
  return <group ref={group} scale={compact ? 0.82 : 1}>
    <Stars radius={18} depth={20} count={compact ? 220 : 460} factor={2.5} saturation={0} fade speed={0.22} />
    <Sparkles count={compact ? 52 : 105} scale={[8, 5.5, 3]} size={1.7} speed={0.25} color={palette.accent2} opacity={0.55} />
    {lines.map((points, index) => <Line key={index} points={points} color={palette.accent} transparent opacity={0.42} lineWidth={1.1} dashed dashScale={1.8} dashSize={0.25} gapSize={0.17} />)}
    <Float speed={1.3} rotationIntensity={0.2} floatIntensity={0.3}><CoreClaim active={activeNode === 'claim'} palette={palette} onSelect={() => onNodeChange('claim')} /></Float>
    {NODES.filter((node) => node.id !== 'claim').map((node, index) => <OrbitNode key={node.id} index={index} node={node} active={activeNode === node.id} palette={palette} onSelect={() => onNodeChange(node.id)} />)}
  </group>;
}

function CoreClaim({ active, palette, onSelect }: { readonly active: boolean; readonly palette: Palette; readonly onSelect: () => void }) {
  const mesh = useRef<Mesh>(null);
  useFrame((state) => { if (mesh.current) { mesh.current.rotation.x = state.clock.elapsedTime * 0.18; mesh.current.rotation.y = state.clock.elapsedTime * 0.3; } });
  return <group><mesh ref={mesh} onClick={(event) => { event.stopPropagation(); onSelect(); }} scale={active ? 1.13 : 1}><octahedronGeometry args={[1.08, 2]} /><meshStandardMaterial color={active ? palette.glow : palette.accent} emissive={palette.accent} emissiveIntensity={active ? 1.1 : 0.48} roughness={0.22} metalness={0.72} /></mesh><mesh scale={1.45}><sphereGeometry args={[1, 32, 32]} /><meshBasicMaterial color={palette.accent} transparent opacity={0.06} /></mesh></group>;
}

function OrbitNode({ node, index, active, palette, onSelect }: { readonly node: typeof NODES[number]; readonly index: number; readonly active: boolean; readonly palette: Palette; readonly onSelect: () => void }) {
  const group = useRef<Group>(null);
  useFrame((state) => { if (group.current) { group.current.position.y = node.position[1] + Math.sin(state.clock.elapsedTime * 0.85 + index) * 0.1; group.current.rotation.z = state.clock.elapsedTime * 0.2 * (index % 2 ? -1 : 1); } });
  return <group ref={group} position={node.position}><Float speed={1.15 + index * 0.13} rotationIntensity={0.28} floatIntensity={0.2}><mesh onClick={(event) => { event.stopPropagation(); onSelect(); }} scale={active ? 1.16 : 1}><boxGeometry args={[0.96, 0.96, 0.32]} /><meshStandardMaterial color={active ? palette.glow : '#1c2738'} emissive={active ? palette.accent2 : palette.accent} emissiveIntensity={active ? 1 : 0.28} roughness={0.23} metalness={0.75} /></mesh></Float><mesh position={[0, 0, -0.23]}><circleGeometry args={[0.82, 32]} /><meshBasicMaterial color={palette.accent2} transparent opacity={active ? 0.45 : 0.14} /></mesh></group>;
}
