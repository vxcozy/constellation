/**
 * Pure animation utility functions.
 *
 * Extracted from components for testability. These compute animation
 * values at a given time without any React/Three.js dependencies.
 */

// ─── Edge animation ─────────────────────────────────────────────────────────

/**
 * Compute the target opacity for an edge based on its state.
 */
export function edgeOpacityGoal(
  isHighlighted: boolean,
  dimmed: boolean,
  t: number
): number {
  if (isHighlighted) {
    return 0.45 + Math.sin(t * 2.5) * 0.15;
  }
  if (dimmed) {
    return 0.02;
  }
  return 0.1;
}

/**
 * Lerp the current opacity toward the goal by a factor.
 */
export function lerpOpacity(
  current: number,
  goal: number,
  factor: number = 0.08
): number {
  return current + (goal - current) * factor;
}

// ─── Node animation ─────────────────────────────────────────────────────────

/**
 * Compute pulse scale for a node.
 */
export function nodePulseScale(
  t: number,
  idHash: number,
  isHighlighted: boolean,
  localHovered: boolean
): number {
  if (isHighlighted || localHovered) return 1.8;
  const pulseSpeed = 1.2 + (idHash % 10) * 0.08;
  return 1 + Math.sin(t * pulseSpeed) * 0.12;
}

/**
 * Compute drift offset for a node.
 */
export function nodeDrift(
  t: number,
  idHash: number,
  nodeType: string
): { x: number; y: number; z: number } {
  const driftScale = nodeType === "center" ? 0 : 0.15;
  return {
    x: Math.sin(t * 0.3 + idHash) * driftScale,
    y: Math.cos(t * 0.2 + idHash * 0.7) * driftScale * 0.5,
    z: Math.sin(t * 0.25 + idHash * 1.3) * driftScale,
  };
}

/**
 * Compute the pulse speed for a given node.
 */
export function pulseSpeed(idHash: number): number {
  return 1.2 + (idHash % 10) * 0.08;
}

/**
 * Compute inner glow scale.
 */
export function glowScale(
  t: number,
  speed: number,
  isHighlighted: boolean,
  localHovered: boolean
): number {
  if (isHighlighted || localHovered) return 3.5;
  return 1.8 + Math.sin(t * speed) * 0.4;
}

/**
 * Compute inner glow opacity.
 */
export function glowOpacity(
  t: number,
  speed: number,
  isHighlighted: boolean,
  localHovered: boolean
): number {
  if (isHighlighted || localHovered) return 0.3;
  return 0.08 + Math.sin(t * speed) * 0.04;
}

/**
 * Compute outer glow halo scale.
 */
export function outerGlowScale(
  t: number,
  speed: number,
  isHighlighted: boolean,
  localHovered: boolean
): number {
  if (isHighlighted || localHovered) return 6.0;
  return 3.2 + Math.sin(t * speed * 0.5) * 0.6;
}

/**
 * Compute outer glow halo opacity.
 */
export function outerGlowOpacity(
  t: number,
  speed: number,
  isHighlighted: boolean,
  localHovered: boolean
): number {
  if (isHighlighted || localHovered) return 0.12;
  return 0.03 + Math.sin(t * speed * 0.5) * 0.015;
}

// ─── Node appearance ────────────────────────────────────────────────────────

/**
 * Determine if a node should be dimmed.
 */
export function isNodeDimmed(
  hoveredNode: unknown,
  isHighlighted: boolean,
  isConnected: boolean
): boolean {
  return hoveredNode !== null && !isHighlighted && !isConnected;
}

/**
 * Compute node opacity (core sphere).
 */
export function nodeOpacity(dimmed: boolean): number {
  return dimmed ? 0.08 : 1;
}

/**
 * Compute label opacity.
 */
export function labelOpacity(
  dimmed: boolean,
  isHighlighted: boolean,
  localHovered: boolean
): number {
  if (dimmed) return 0.05;
  if (isHighlighted || localHovered) return 1;
  return 0.65;
}

/**
 * Get node color based on type.
 */
export function nodeColor(type: string): string {
  if (type === "center") return "#ffffff";
  if (type === "studio") return "#cccccc";
  if (type === "studio-project") return "#999999";
  return "#dddddd";
}

/**
 * Compute per-node idHash from the ID string.
 */
export function computeIdHash(id: string): number {
  return id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

// ─── Scene animation ────────────────────────────────────────────────────────

/**
 * Compute ambient drift rotation for the scene group.
 */
export function sceneDriftRotation(t: number): { x: number; y: number } {
  return {
    y: Math.sin(t * 0.05) * 0.15,
    x: Math.cos(t * 0.03) * 0.05,
  };
}

// ─── Particles ──────────────────────────────────────────────────────────────

/**
 * Generate particle data using a seeded PRNG.
 */
export function generateParticles(
  count: number,
  seed: number = 12345
): Array<{
  position: { x: number; y: number; z: number };
  speed: number;
  offset: number;
}> {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      position: {
        x: (rand() - 0.5) * 40,
        y: (rand() - 0.5) * 25,
        z: (rand() - 0.5) * 40,
      },
      speed: 0.002 + rand() * 0.005,
      offset: rand() * Math.PI * 2,
    });
  }
  return particles;
}

/**
 * Compute a particle's animated position at time t.
 */
export function particlePosition(
  p: { position: { x: number; y: number; z: number }; speed: number; offset: number },
  t: number
): { x: number; y: number; z: number } {
  return {
    x: p.position.x + Math.sin(t * p.speed + p.offset) * 0.5,
    y: p.position.y + Math.cos(t * p.speed * 0.7 + p.offset) * 0.3,
    z: p.position.z + Math.sin(t * p.speed * 0.5 + p.offset) * 0.4,
  };
}

/**
 * Compute a particle's scale at time t.
 */
export function particleScale(t: number, offset: number): number {
  return 0.015 + Math.sin(t * 0.8 + offset) * 0.008;
}
