"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Points, Line } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";
import type { Group, Points as ThreePoints } from "three";

const NODE_COUNT = 80;
const SPHERE_RADIUS = 2.0;

// Fibonacci sphere: evenly distributes points on a sphere surface.
function spherePositions(count: number, radius: number): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < count; i++) {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / count);
    const phi = (2 * Math.PI * i) / goldenRatio;
    positions.push(
      new THREE.Vector3(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta),
      ),
    );
  }
  return positions;
}

function NetworkSphere({ isDark }: { isDark: boolean }) {
  const group = useRef<Group>(null);

  const { nodePositions, links } = useMemo(() => {
    const positions = spherePositions(NODE_COUNT, SPHERE_RADIUS);
    const links: [THREE.Vector3, THREE.Vector3][] = [];
    // connect each node to its 2 nearest neighbours via brute-force check
    for (let i = 0; i < positions.length; i++) {
      const distances = positions
        .map((p, idx) => ({ idx, d: p.distanceTo(positions[i]) }))
        .filter((x) => x.idx !== i)
        .sort((a, b) => a.d - b.d);
      distances.slice(0, 2).forEach((n) => {
        // de-dupe (only add when n.idx > i)
        if (n.idx > i) {
          links.push([positions[i], positions[n.idx]]);
        }
      });
    }
    return { nodePositions: positions, links };
  }, []);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.15;
      group.current.rotation.x += delta * 0.05;
    }
  });

  const lineColor = isDark ? "#818cf8" : "#6366f1";
  const lineOpacity = isDark ? 0.38 : 0.45;
  const pointColor = isDark ? "#6366f1" : "#4f46e5";

  return (
    <group ref={group}>
      {links.map(([a, b], i) => (
        <Line
          key={`link-${i}`}
          points={[a, b]}
          color={lineColor}
          lineWidth={0.9}
          transparent
          opacity={lineOpacity}
        />
      ))}
      <Points positions={new Float32Array(nodePositions.flatMap((p) => [p.x, p.y, p.z]))} frustumCulled={false}>
        <pointsMaterial
          color={pointColor}
          size={isDark ? 0.09 : 0.1}
          sizeAttenuation
          transparent
          opacity={isDark ? 0.9 : 0.85}
        />
      </Points>
    </group>
  );
}

function SpherePoints({ isDark }: { isDark: boolean }) {
  const ref = useRef<ThreePoints>(null);
  const points = useMemo(() => spherePositions(NODE_COUNT, SPHERE_RADIUS), []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2;
      ref.current.rotation.z += delta * 0.05;
    }
  });

  const pointColor = isDark ? "#a78bfa" : "#818cf8";

  return (
    <Points ref={ref} positions={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))} frustumCulled={false}>
      <pointsMaterial
        color={pointColor}
        size={isDark ? 0.05 : 0.055}
        sizeAttenuation
        transparent
        opacity={isDark ? 0.5 : 0.5}
      />
    </Points>
  );
}

export default function ThreedVisual() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted
    ? (resolvedTheme ?? theme) === "dark"
    : typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false;

  return (
    <div className="pointer-events-auto relative mx-auto aspect-square w-full max-w-[680px]">
      <Canvas camera={{ position: [0, 0, 6.2], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <ambientLight intensity={isDark ? 1.2 : 1.3} />
        <pointLight position={[10, 10, 10]} intensity={isDark ? 1 : 1.1} color={isDark ? "#818cf8" : "#6366f1"} />
        <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.6}>
          <NetworkSphere isDark={isDark} />
          <SpherePoints isDark={isDark} />
        </Float>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(2 * Math.PI) / 3}
        />
      </Canvas>
    </div>
  );
}
