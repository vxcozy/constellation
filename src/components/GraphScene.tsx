"use client";

import { useMemo, useCallback, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import GraphNode from "./GraphNode";
import GraphEdge from "./GraphEdge";
import { computeLayout, getEdgesWithPositions } from "@/lib/layout";
import { edges } from "@/data/graph";
import type { PositionedNode } from "@/lib/layout";

interface GraphSceneProps {
  onHover: (node: PositionedNode | null) => void;
  onNodeClick: (node: PositionedNode) => void;
  hoveredNode: PositionedNode | null;
  theme: "dark" | "light";
}

export default function GraphScene({
  onHover,
  onNodeClick,
  hoveredNode,
  theme,
}: GraphSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  const positionedNodes = useMemo(() => computeLayout(), []);
  const positionedEdges = useMemo(
    () => getEdgesWithPositions(positionedNodes),
    [positionedNodes]
  );

  // Neural web — ambient organic strands concentrated within inner node region
  const neuralBounds = useMemo(() => {
    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    positionedNodes.forEach((n) => {
      min.min(n.position);
      max.max(n.position);
    });
    // Shrink bounds inward by 30% to concentrate strands around the core
    const center = new THREE.Vector3().addVectors(min, max).multiplyScalar(0.5);
    const shrink = 0.3;
    min.lerp(center, shrink);
    max.lerp(center, shrink);
    return { min, max, center };
  }, [positionedNodes]);

  const connectedIds = useMemo(() => {
    if (!hoveredNode) return new Set<string>();
    const ids = new Set<string>();
    ids.add(hoveredNode.id);

    edges.forEach((e) => {
      if (e.source === hoveredNode.id) ids.add(e.target);
      if (e.target === hoveredNode.id) ids.add(e.source);
    });

    let current = hoveredNode.id;
    while (current !== "cozy") {
      const parentEdge = edges.find((e) => e.target === current);
      if (!parentEdge) break;
      ids.add(parentEdge.source);
      current = parentEdge.source;
    }

    return ids;
  }, [hoveredNode]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.05) * 0.08;
    groupRef.current.rotation.x = Math.cos(t * 0.03) * 0.03;
  });

  const handleHover = useCallback(
    (node: PositionedNode | null) => {
      onHover(node);
    },
    [onHover]
  );

  const particleColor = theme === "dark" ? "#ffffff" : "#000000";

  return (
    <group ref={groupRef}>
      {/* Neural web — ambient organic strands */}
      <NeuralWeb bounds={neuralBounds} theme={theme} strandCount={35} />

      {positionedEdges.map((edge) => {
        if (!edge) return null;
        const isEdgeHighlighted =
          hoveredNode !== null &&
          connectedIds.has(edge.source) &&
          connectedIds.has(edge.target);
        const isDimmed = hoveredNode !== null && !isEdgeHighlighted;

        return (
          <GraphEdge
            key={`${edge.source}-${edge.target}`}
            sourcePos={edge.sourcePos}
            targetPos={edge.targetPos}
            isHighlighted={isEdgeHighlighted}
            dimmed={isDimmed}
            theme={theme}
          />
        );
      })}

      {positionedNodes.map((node) => (
        <GraphNode
          key={node.id}
          node={node}
          onHover={handleHover}
          onNodeClick={onNodeClick}
          isHighlighted={hoveredNode?.id === node.id}
          isConnected={connectedIds.has(node.id)}
          hoveredNode={hoveredNode}
          theme={theme}
        />
      ))}

      <CoreParticles count={1300} color={particleColor} theme={theme} />
      <Particles count={1000} color={particleColor} />
    </group>
  );
}

// ─── Dense core particles ───────────────────────────────────────────────────

function CoreParticles({
  count,
  color,
  theme,
}: {
  count: number;
  color: string;
  theme: "dark" | "light";
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    let seed = 77777;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const temp = [];
    for (let i = 0; i < count; i++) {
      const r = (rand() + rand() + rand()) / 3;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const radius = r * 10;
      temp.push({
        position: new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta) * 0.6,
          radius * Math.cos(phi)
        ),
        speed: 0.008 + rand() * 0.015,
        offset: rand() * Math.PI * 2,
        drift: 0.3 + rand() * 0.8,
      });
    }
    return temp;
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const dummy = new THREE.Object3D();

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position.x + Math.sin(t * p.speed + p.offset) * p.drift,
        p.position.y +
          Math.cos(t * p.speed * 1.3 + p.offset) * p.drift * 0.4,
        p.position.z +
          Math.sin(t * p.speed * 0.8 + p.offset * 1.7) * p.drift
      );
      const flicker = 0.012 + Math.sin(t * 2.5 + p.offset) * 0.006;
      dummy.scale.setScalar(flicker);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={theme === "dark" ? 0.1 : 0.15}
        depthWrite={false}
        blending={theme === "dark" ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </instancedMesh>
  );
}

// ─── Ambient floating particles ──────────────────────────────────────────────

function Particles({
  count,
  color,
}: {
  count: number;
  color: string;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const particles = useMemo(() => {
    let seed = 12345;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: new THREE.Vector3(
          (rand() - 0.5) * 40,
          (rand() - 0.5) * 25,
          (rand() - 0.5) * 40
        ),
        speed: 0.002 + rand() * 0.005,
        offset: rand() * Math.PI * 2,
      });
    }
    return temp;
  }, [count]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const dummy = new THREE.Object3D();

    particles.forEach((p, i) => {
      dummy.position.set(
        p.position.x + Math.sin(t * p.speed + p.offset) * 0.5,
        p.position.y + Math.cos(t * p.speed * 0.7 + p.offset) * 0.3,
        p.position.z + Math.sin(t * p.speed * 0.5 + p.offset) * 0.4
      );
      dummy.scale.setScalar(0.015 + Math.sin(t * 0.8 + p.offset) * 0.008);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.06} />
    </instancedMesh>
  );
}

// ─── Neural web — ambient organic strands filling the node region ────────────

interface NeuralWebProps {
  bounds: { min: THREE.Vector3; max: THREE.Vector3; center: THREE.Vector3 };
  theme: "dark" | "light";
  strandCount: number;
}

const STRAND_SEGMENTS = 20;

function NeuralWeb({ bounds, theme, strandCount }: NeuralWebProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isDark = theme === "dark";

  const strands = useMemo(() => {
    let seed = 31337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const { min, max } = bounds;
    const size = new THREE.Vector3().subVectors(max, min);

    return Array.from({ length: strandCount }, () => {
      // Random start point within the bounding region
      const start = new THREE.Vector3(
        min.x + rand() * size.x,
        min.y + rand() * size.y,
        min.z + rand() * size.z
      );
      // Random end point — biased toward staying within bounds
      const end = new THREE.Vector3(
        min.x + rand() * size.x,
        min.y + rand() * size.y,
        min.z + rand() * size.z
      );
      // Two control points for a cubic bezier — organic wandering path
      const spread = size.length() * 0.2;
      const ctrl1 = new THREE.Vector3(
        (start.x + end.x) * 0.33 + (rand() - 0.5) * spread,
        (start.y + end.y) * 0.33 + (rand() - 0.5) * spread * 0.6,
        (start.z + end.z) * 0.33 + (rand() - 0.5) * spread
      );
      const ctrl2 = new THREE.Vector3(
        (start.x + end.x) * 0.66 + (rand() - 0.5) * spread,
        (start.y + end.y) * 0.66 + (rand() - 0.5) * spread * 0.6,
        (start.z + end.z) * 0.66 + (rand() - 0.5) * spread
      );

      const curve = new THREE.CubicBezierCurve3(start, ctrl1, ctrl2, end);
      const points = curve.getPoints(STRAND_SEGMENTS);
      const geo = new THREE.BufferGeometry().setFromPoints(points);

      return {
        geometry: geo,
        phase: rand() * Math.PI * 2,
        speed: 0.2 + rand() * 0.6,
        baseOpacity: 0.01 + rand() * 0.025,
      };
    });
  }, [bounds, strandCount]);

  // Plasma pulse — each strand breathes independently
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      if (i >= strands.length) return;
      const s = strands[i];
      const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
      const pulse = Math.sin(t * s.speed + s.phase) * 0.5 + 0.5;
      const peak = isDark ? 0.06 : 0.04;
      mat.opacity = s.baseOpacity + pulse * peak;
    });
  });

  const color = isDark ? "#ffffff" : "#000000";

  // Build THREE.Line objects imperatively to avoid JSX <line> / SVG conflict
  const lineObjects = useMemo(() => {
    return strands.map((s) => {
      const mat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: s.baseOpacity,
        depthWrite: false,
        blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      return new THREE.Line(s.geometry, mat);
    });
  }, [strands, color, isDark]);

  return (
    <group ref={groupRef}>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
}
