import * as THREE from "three";
import { nodes, edges, type GraphNode } from "@/data/graph";

export interface PositionedNode extends GraphNode {
  position: THREE.Vector3;
}

// ---------------------------------------------------------------------------
// Seeded PRNG for deterministic layout
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ---------------------------------------------------------------------------
// Fibonacci sphere – nice even distribution of points
// ---------------------------------------------------------------------------

function fibSphere(
  n: number,
  radius: number,
  center: THREE.Vector3,
  rand: () => number,
  yJitter: number = 0
): THREE.Vector3[] {
  const phi = (1 + Math.sqrt(5)) / 2;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const theta = (2 * Math.PI * i) / phi;
    const y = 1 - (2 * i + 1) / n;
    const r = Math.sqrt(1 - y * y);
    pts.push(
      new THREE.Vector3(
        center.x + radius * r * Math.cos(theta),
        center.y + radius * y + (rand() - 0.5) * yJitter,
        center.z + radius * r * Math.sin(theta)
      )
    );
  }
  return pts;
}

// ---------------------------------------------------------------------------
// Main layout computation
// ---------------------------------------------------------------------------

export function computeLayout(): PositionedNode[] {
  const rand = seededRandom(42);
  const nodeMap = new Map<string, PositionedNode>();

  // Place center at origin
  const center = nodes.find((n) => n.type === "center")!;
  const centerPos = new THREE.Vector3(0, 0, 0);
  nodeMap.set(center.id, { ...center, position: centerPos });

  // Group center children into tiers by edge distance
  const BASE_RADIUS = 2.8;
  const SUB_RADIUS = 1.5;
  const centerEdges = edges.filter((e) => e.source === "cozy");

  const tierMap = new Map<number, typeof centerEdges>();
  centerEdges.forEach((edge) => {
    const d = edge.distance;
    if (!tierMap.has(d)) tierMap.set(d, []);
    tierMap.get(d)!.push(edge);
  });

  // Place each tier on its own fibonacci sphere
  for (const [distance, tierEdges] of tierMap) {
    const radius = BASE_RADIUS * distance;
    const yJitter = distance < 2 ? 0.5 : 0.8;
    const positions = fibSphere(
      tierEdges.length,
      radius,
      centerPos,
      rand,
      yJitter
    );

    tierEdges.forEach((edge, i) => {
      const node = nodes.find((n) => n.id === edge.target)!;
      const pos = positions[i];
      nodeMap.set(node.id, { ...node, position: pos });

      // Place sub-projects in a ring around the parent
      const subEdges = edges.filter((e) => e.source === node.id);
      subEdges.forEach((subEdge, j) => {
        const subNode = nodes.find((n) => n.id === subEdge.target)!;
        const subAngle =
          (2 * Math.PI * j) / subEdges.length + rand() * 0.3;
        const subPos = new THREE.Vector3(
          pos.x + Math.cos(subAngle) * SUB_RADIUS,
          pos.y + (rand() - 0.5) * 0.6,
          pos.z + Math.sin(subAngle) * SUB_RADIUS
        );
        nodeMap.set(subNode.id, { ...subNode, position: subPos });
      });
    });
  }

  return Array.from(nodeMap.values());
}

// ---------------------------------------------------------------------------
// Resolve edge positions
// ---------------------------------------------------------------------------

export function getEdgesWithPositions(positionedNodes: PositionedNode[]) {
  const nodeMap = new Map<string, PositionedNode>();
  positionedNodes.forEach((n) => nodeMap.set(n.id, n));

  return edges
    .map((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (!source || !target) return null;
      return {
        ...edge,
        sourcePos: source.position,
        targetPos: target.position,
        sourceNode: source,
        targetNode: target,
      };
    })
    .filter(Boolean);
}
