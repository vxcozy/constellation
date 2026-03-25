"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import * as THREE from "three";
import type { PositionedNode } from "@/lib/layout";

interface GraphNodeProps {
  node: PositionedNode;
  onHover: (node: PositionedNode | null) => void;
  onNodeClick: (node: PositionedNode) => void;
  isHighlighted: boolean;
  isConnected: boolean;
  hoveredNode: PositionedNode | null;
  theme: "dark" | "light";
}

export const NODE_SIZES: Record<string, number> = {
  center: 0.3,
  project: 0.08,
  studio: 0.15,
  "studio-project": 0.06,
};

export const LABEL_SIZES: Record<string, number> = {
  center: 0.14,
  project: 0.14,
  studio: 0.14,
  "studio-project": 0.14,
};

export default function GraphNode({
  node,
  onHover,
  onNodeClick,
  isHighlighted,
  isConnected,
  hoveredNode,
  theme,
}: GraphNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const [localHovered, setLocalHovered] = useState(false);
  const baseSize = NODE_SIZES[node.type] ?? 0.1;
  const labelSize = LABEL_SIZES[node.type] ?? 0.2;

  // Stable per-node seed for animation offset
  const idHash = useMemo(
    () => node.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0),
    [node.id]
  );

  // Drift offset for subtle node movement
  const driftRef = useRef(new THREE.Vector3());
  const basePosition = useMemo(() => node.position.clone(), [node.position]);

  // Pulse + drift animation
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Pulse scale — center node pulses slower and stronger
    const pulseSpeed =
      node.type === "center" ? 0.8 : 1.2 + (idHash % 10) * 0.08;
    const pulseAmp = node.type === "center" ? 0.3 : 0.18;
    const pulse = 1 + Math.sin(t * pulseSpeed) * pulseAmp;
    const scale = isHighlighted || localHovered ? 1.8 : pulse;
    meshRef.current.scale.setScalar(scale);

    // Subtle drift
    const driftScale = node.type === "center" ? 0 : 0.08;
    driftRef.current.set(
      Math.sin(t * 0.3 + idHash) * driftScale,
      Math.cos(t * 0.2 + idHash * 0.7) * driftScale * 0.5,
      Math.sin(t * 0.25 + idHash * 1.3) * driftScale
    );

    const parent = meshRef.current.parent;
    if (parent) {
      parent.position.set(
        basePosition.x + driftRef.current.x,
        basePosition.y + driftRef.current.y,
        basePosition.z + driftRef.current.z
      );
    }

    // Inner glow — sits just outside the core for a soft blend
    if (glowRef.current) {
      const glowScale =
        isHighlighted || localHovered
          ? 2.4
          : 1.6 + Math.sin(t * pulseSpeed) * 0.35;
      glowRef.current.scale.setScalar(glowScale);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity =
        isHighlighted || localHovered
          ? 0.18
          : 0.06 + Math.sin(t * pulseSpeed) * 0.03;
    }

    // Outer glow halo — wide soft falloff
    if (outerGlowRef.current) {
      const outerScale =
        isHighlighted || localHovered
          ? 4.5
          : 2.8 + Math.sin(t * pulseSpeed * 0.5) * 0.5;
      outerGlowRef.current.scale.setScalar(outerScale);
      const mat = outerGlowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity =
        isHighlighted || localHovered
          ? 0.08
          : 0.025 + Math.sin(t * pulseSpeed * 0.5) * 0.012;
    }
  });

  // Dim non-connected nodes when something is hovered
  const dimmed = hoveredNode !== null && !isHighlighted && !isConnected;
  const opacity = dimmed ? 0.05 : 0.55;

  // Labels hidden by default, visible on hover/connection
  const labelOpacity =
    isHighlighted || localHovered
      ? 1.0
      : isConnected && hoveredNode !== null
        ? 0.6
        : 0.0;

  const isDark = theme === "dark";
  const color = useMemo(() => {
    if (isDark) {
      if (node.type === "center") return "#ffffff";
      if (node.type === "studio") return "#cccccc";
      if (node.type === "studio-project") return "#999999";
      return "#dddddd";
    } else {
      if (node.type === "center") return "#000000";
      if (node.type === "studio") return "#333333";
      if (node.type === "studio-project") return "#666666";
      return "#222222";
    }
  }, [node.type, isDark]);

  return (
    <group position={node.position}>
      {/* Outer glow halo */}
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[baseSize, 12, 12]} />
        <meshBasicMaterial
          color={isDark ? "#ffffff" : "#000000"}
          transparent
          opacity={0.03}
          depthWrite={false}
          blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>

      {/* Inner glow ring */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[baseSize, 16, 16]} />
        <meshBasicMaterial
          color={isDark ? "#ffffff" : "#000000"}
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </mesh>

      {/* Core sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setLocalHovered(true);
          onHover(node);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setLocalHovered(false);
          onHover(null);
          document.body.style.cursor = "default";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onNodeClick(node);
        }}
      >
        <sphereGeometry args={[baseSize, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </mesh>

      {/* Label — billboard text always facing camera */}
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          position={[0, baseSize * 2.5 + 0.18, 0]}
          fontSize={labelSize}
          color={isDark ? "#ffffff" : "#000000"}
          anchorX="center"
          anchorY="bottom"
          fillOpacity={labelOpacity}
          outlineWidth={0}
          letterSpacing={0.12}
        >
          {node.label.toUpperCase()}
        </Text>
      </Billboard>
    </group>
  );
}
