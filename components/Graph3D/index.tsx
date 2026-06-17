"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Text } from "@react-three/drei";
import * as THREE from "three";
import { evaluateExpression } from "@/lib/math";

interface Graph3DProps {
  expression: string;
  params?: Record<string, number>;
}

function Surface({ expression, params }: Graph3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(20, 20, 80, 80);
    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = evaluateExpression(expression, x, { ...params, y }) ?? 0;

      positions.setZ(i, z);

      // Color based on height: indigo → purple → pink gradient
      const normalizedZ = Math.max(-5, Math.min(5, z)) / 5; // -1 to 1
      const t = (normalizedZ + 1) / 2; // 0 to 1

      // Indigo (99,102,241) to Purple (168,85,247) to Pink (236,72,153)
      if (t < 0.5) {
        const s = t * 2;
        colors[i * 3] = 0.39 + s * 0.29; // R: 99→168
        colors[i * 3 + 1] = 0.4 - s * 0.17; // G: 102→85
        colors[i * 3 + 2] = 0.95 - s * 0.04; // B: 241→247
      } else {
        const s = (t - 0.5) * 2;
        colors[i * 3] = 0.66 + s * 0.32; // R: 168→236
        colors[i * 3 + 1] = 0.33 + s * 0.01; // G: 85→72
        colors[i * 3 + 2] = 0.97 - s * 0.28; // B: 247→153
      }
    }

    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [expression, params]);

  useFrame((_, delta) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshPhongMaterial
        vertexColors
        side={THREE.DoubleSide}
        shininess={30}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function AxisLabels() {
  const axisLength = 11;
  return (
    <group>
      {/* X axis line */}
      <mesh position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([-axisLength, 0, 0, axisLength, 0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3b3b4f" />
      </mesh>
      {/* Y axis line */}
      <mesh position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, -axisLength, 0, 0, axisLength, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3b3b4f" />
      </mesh>
      {/* Z axis line */}
      <mesh position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, -axisLength, 0, 0, axisLength]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3b3b4f" />
      </mesh>
    </group>
  );
}

function Scene({ expression, params }: Graph3DProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} />
      <directionalLight position={[-5, 10, -5]} intensity={0.3} />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#a78bfa" />

      <Surface expression={expression} params={params} />
      <AxisLabels />

      <Grid
        args={[20, 20]}
        position={[0, 0, 0]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1e1e2e"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#3b3b4f"
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid={false}
      />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  );
}

export default function Graph3D({ expression, params = {} }: Graph3DProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [12, 10, 12], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "#111118" }}
      >
        <Scene expression={expression} params={params} />
      </Canvas>

      {/* Expression overlay */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-bg-secondary/80 backdrop-blur-sm border border-axis">
        <span className="text-xs font-mono text-text-muted">z = </span>
        <span className="text-xs font-mono text-accent">{expression}</span>
      </div>

      {/* Controls hint */}
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-bg-secondary/80 backdrop-blur-sm border border-axis">
        <span className="text-[10px] font-mono text-text-muted">
          Drag to rotate • Scroll to zoom • Right-click to pan
        </span>
      </div>
    </div>
  );
}
