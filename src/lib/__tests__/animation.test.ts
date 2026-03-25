import {
  edgeOpacityGoal,
  lerpOpacity,
  nodePulseScale,
  nodeDrift,
  pulseSpeed,
  glowScale,
  glowOpacity,
  outerGlowScale,
  outerGlowOpacity,
  isNodeDimmed,
  nodeOpacity,
  labelOpacity,
  nodeColor,
  computeIdHash,
  sceneDriftRotation,
  generateParticles,
  particlePosition,
  particleScale,
} from "../animation";

describe("Animation Utilities", () => {
  // ── Edge animation ──────────────────────────────────────────────────────

  describe("edgeOpacityGoal", () => {
    it("should return ~0.45 range when highlighted", () => {
      const val = edgeOpacityGoal(true, false, 0);
      expect(val).toBeCloseTo(0.45, 1); // sin(0) = 0
    });

    it("should oscillate around 0.45 when highlighted", () => {
      const val = edgeOpacityGoal(true, false, Math.PI / 5); // sin(pi/2) = 1
      expect(val).toBeGreaterThan(0.3);
      expect(val).toBeLessThan(0.65);
    });

    it("should return 0.02 when dimmed", () => {
      expect(edgeOpacityGoal(false, true, 0)).toBe(0.02);
      expect(edgeOpacityGoal(false, true, 10)).toBe(0.02);
    });

    it("should return 0.1 when normal (not highlighted, not dimmed)", () => {
      expect(edgeOpacityGoal(false, false, 0)).toBe(0.1);
      expect(edgeOpacityGoal(false, false, 100)).toBe(0.1);
    });

    it("highlighted takes precedence over dimmed", () => {
      const val = edgeOpacityGoal(true, true, 0);
      expect(val).toBeCloseTo(0.45, 1);
    });
  });

  describe("lerpOpacity", () => {
    it("should interpolate toward goal", () => {
      const result = lerpOpacity(0, 1, 0.5);
      expect(result).toBe(0.5);
    });

    it("should stay at goal when already there", () => {
      expect(lerpOpacity(0.5, 0.5, 0.08)).toBe(0.5);
    });

    it("should default to factor 0.08", () => {
      const result = lerpOpacity(0, 1);
      expect(result).toBeCloseTo(0.08, 5);
    });

    it("should converge over many steps", () => {
      let current = 0;
      for (let i = 0; i < 100; i++) {
        current = lerpOpacity(current, 1, 0.08);
      }
      expect(current).toBeCloseTo(1, 2);
    });
  });

  // ── Node animation ──────────────────────────────────────────────────────

  describe("nodePulseScale", () => {
    it("should return 1.8 when highlighted", () => {
      expect(nodePulseScale(0, 100, true, false)).toBe(1.8);
    });

    it("should return 1.8 when locally hovered", () => {
      expect(nodePulseScale(0, 100, false, true)).toBe(1.8);
    });

    it("should return ~1.0 at t=0 when not highlighted", () => {
      expect(nodePulseScale(0, 0, false, false)).toBeCloseTo(1.0, 1);
    });

    it("should oscillate between ~0.88 and ~1.12", () => {
      const values: number[] = [];
      for (let t = 0; t < 10; t += 0.1) {
        values.push(nodePulseScale(t, 42, false, false));
      }
      const min = Math.min(...values);
      const max = Math.max(...values);
      expect(min).toBeGreaterThan(0.85);
      expect(max).toBeLessThan(1.15);
    });
  });

  describe("nodeDrift", () => {
    it("should return zero drift for center type", () => {
      const drift = nodeDrift(1, 100, "center");
      expect(drift.x).toBeCloseTo(0, 10);
      expect(drift.y).toBeCloseTo(0, 10);
      expect(drift.z).toBeCloseTo(0, 10);
    });

    it("should return non-zero drift for project type", () => {
      const drift = nodeDrift(1, 100, "project");
      // At least one axis should be non-zero
      const magnitude = Math.sqrt(
        drift.x ** 2 + drift.y ** 2 + drift.z ** 2
      );
      expect(magnitude).toBeGreaterThan(0);
    });

    it("should return non-zero drift for studio type", () => {
      const drift = nodeDrift(1, 50, "studio");
      const magnitude = Math.sqrt(
        drift.x ** 2 + drift.y ** 2 + drift.z ** 2
      );
      expect(magnitude).toBeGreaterThan(0);
    });

    it("should return non-zero drift for studio-project type", () => {
      const drift = nodeDrift(1, 50, "studio-project");
      const magnitude = Math.sqrt(
        drift.x ** 2 + drift.y ** 2 + drift.z ** 2
      );
      expect(magnitude).toBeGreaterThan(0);
    });

    it("should vary with time", () => {
      const d1 = nodeDrift(0, 42, "project");
      const d2 = nodeDrift(5, 42, "project");
      expect(d1.x).not.toBeCloseTo(d2.x, 3);
    });

    it("should vary with idHash", () => {
      const d1 = nodeDrift(1, 0, "project");
      const d2 = nodeDrift(1, 100, "project");
      expect(d1.x).not.toBeCloseTo(d2.x, 3);
    });
  });

  describe("pulseSpeed", () => {
    it("should return base 1.2 for hash 0", () => {
      expect(pulseSpeed(0)).toBe(1.2);
    });

    it("should increase with hash modulo", () => {
      expect(pulseSpeed(5)).toBe(1.2 + 5 * 0.08);
    });

    it("should wrap around modulo 10", () => {
      expect(pulseSpeed(10)).toBe(1.2); // 10 % 10 = 0
      expect(pulseSpeed(15)).toBe(1.2 + 5 * 0.08); // 15 % 10 = 5
    });
  });

  describe("glowScale", () => {
    it("should return 3.5 when highlighted", () => {
      expect(glowScale(0, 1.2, true, false)).toBe(3.5);
    });

    it("should return 3.5 when locally hovered", () => {
      expect(glowScale(0, 1.2, false, true)).toBe(3.5);
    });

    it("should oscillate around 1.8 when normal", () => {
      const val = glowScale(0, 1.2, false, false);
      expect(val).toBeCloseTo(1.8, 1);
    });
  });

  describe("glowOpacity", () => {
    it("should return 0.3 when highlighted", () => {
      expect(glowOpacity(0, 1.2, true, false)).toBe(0.3);
    });

    it("should return 0.3 when locally hovered", () => {
      expect(glowOpacity(0, 1.2, false, true)).toBe(0.3);
    });

    it("should return ~0.08 when normal at t=0", () => {
      expect(glowOpacity(0, 1.2, false, false)).toBeCloseTo(0.08, 2);
    });
  });

  describe("outerGlowScale", () => {
    it("should return 6.0 when highlighted", () => {
      expect(outerGlowScale(0, 1.2, true, false)).toBe(6.0);
    });

    it("should return 6.0 when locally hovered", () => {
      expect(outerGlowScale(0, 1.2, false, true)).toBe(6.0);
    });

    it("should oscillate around 3.2 when normal", () => {
      const val = outerGlowScale(0, 1.2, false, false);
      expect(val).toBeCloseTo(3.2, 1);
    });
  });

  describe("outerGlowOpacity", () => {
    it("should return 0.12 when highlighted", () => {
      expect(outerGlowOpacity(0, 1.2, true, false)).toBe(0.12);
    });

    it("should return 0.12 when locally hovered", () => {
      expect(outerGlowOpacity(0, 1.2, false, true)).toBe(0.12);
    });

    it("should return ~0.03 when normal at t=0", () => {
      expect(outerGlowOpacity(0, 1.2, false, false)).toBeCloseTo(0.03, 2);
    });
  });

  // ── Node appearance ─────────────────────────────────────────────────────

  describe("isNodeDimmed", () => {
    it("should return true when hovered node exists and not highlighted or connected", () => {
      expect(isNodeDimmed({ id: "other" }, false, false)).toBe(true);
    });

    it("should return false when no node is hovered", () => {
      expect(isNodeDimmed(null, false, false)).toBe(false);
    });

    it("should return false when highlighted", () => {
      expect(isNodeDimmed({ id: "other" }, true, false)).toBe(false);
    });

    it("should return false when connected", () => {
      expect(isNodeDimmed({ id: "other" }, false, true)).toBe(false);
    });

    it("should return false when both highlighted and connected", () => {
      expect(isNodeDimmed({ id: "other" }, true, true)).toBe(false);
    });
  });

  describe("nodeOpacity", () => {
    it("should return 0.08 when dimmed", () => {
      expect(nodeOpacity(true)).toBe(0.08);
    });

    it("should return 1 when not dimmed", () => {
      expect(nodeOpacity(false)).toBe(1);
    });
  });

  describe("labelOpacity", () => {
    it("should return 0.05 when dimmed", () => {
      expect(labelOpacity(true, false, false)).toBe(0.05);
    });

    it("should return 1 when highlighted", () => {
      expect(labelOpacity(false, true, false)).toBe(1);
    });

    it("should return 1 when locally hovered", () => {
      expect(labelOpacity(false, false, true)).toBe(1);
    });

    it("should return 0.65 for normal state", () => {
      expect(labelOpacity(false, false, false)).toBe(0.65);
    });

    it("dimmed takes precedence over highlighted", () => {
      expect(labelOpacity(true, true, true)).toBe(0.05);
    });
  });

  describe("nodeColor", () => {
    it("should return white for center", () => {
      expect(nodeColor("center")).toBe("#ffffff");
    });

    it("should return #cccccc for studio", () => {
      expect(nodeColor("studio")).toBe("#cccccc");
    });

    it("should return #999999 for studio-project", () => {
      expect(nodeColor("studio-project")).toBe("#999999");
    });

    it("should return #dddddd for project", () => {
      expect(nodeColor("project")).toBe("#dddddd");
    });

    it("should return #dddddd for unknown types", () => {
      expect(nodeColor("other")).toBe("#dddddd");
    });
  });

  describe("computeIdHash", () => {
    it("should return 0 for empty string", () => {
      expect(computeIdHash("")).toBe(0);
    });

    it("should return consistent values", () => {
      expect(computeIdHash("cozy")).toBe(computeIdHash("cozy"));
    });

    it("should differ for different IDs", () => {
      expect(computeIdHash("cozy")).not.toBe(computeIdHash("shawars"));
    });

    it("should sum char codes", () => {
      // 'a' = 97
      expect(computeIdHash("a")).toBe(97);
      // 'ab' = 97 + 98 = 195
      expect(computeIdHash("ab")).toBe(195);
    });
  });

  // ── Scene animation ─────────────────────────────────────────────────────

  describe("sceneDriftRotation", () => {
    it("should return zero rotation at t=0", () => {
      const rot = sceneDriftRotation(0);
      expect(rot.y).toBe(0); // sin(0) = 0
      expect(rot.x).toBeCloseTo(0.05, 5); // cos(0) = 1 → 1 * 0.05
    });

    it("should vary with time", () => {
      const r1 = sceneDriftRotation(0);
      const r2 = sceneDriftRotation(10);
      expect(r1.y).not.toBeCloseTo(r2.y, 3);
    });

    it("should stay within bounds", () => {
      for (let t = 0; t < 100; t += 1) {
        const rot = sceneDriftRotation(t);
        expect(Math.abs(rot.y)).toBeLessThanOrEqual(0.15);
        expect(Math.abs(rot.x)).toBeLessThanOrEqual(0.05);
      }
    });
  });

  // ── Particles ───────────────────────────────────────────────────────────

  describe("generateParticles", () => {
    it("should generate the requested count of particles", () => {
      const particles = generateParticles(10);
      expect(particles).toHaveLength(10);
    });

    it("should generate 0 particles when count is 0", () => {
      expect(generateParticles(0)).toHaveLength(0);
    });

    it("each particle should have position, speed, and offset", () => {
      const particles = generateParticles(5);
      particles.forEach((p) => {
        expect(typeof p.position.x).toBe("number");
        expect(typeof p.position.y).toBe("number");
        expect(typeof p.position.z).toBe("number");
        expect(typeof p.speed).toBe("number");
        expect(typeof p.offset).toBe("number");
      });
    });

    it("positions should be within expected bounds", () => {
      const particles = generateParticles(100);
      particles.forEach((p) => {
        expect(p.position.x).toBeGreaterThanOrEqual(-20);
        expect(p.position.x).toBeLessThanOrEqual(20);
        expect(p.position.y).toBeGreaterThanOrEqual(-12.5);
        expect(p.position.y).toBeLessThanOrEqual(12.5);
        expect(p.position.z).toBeGreaterThanOrEqual(-20);
        expect(p.position.z).toBeLessThanOrEqual(20);
      });
    });

    it("speed should be positive", () => {
      const particles = generateParticles(50);
      particles.forEach((p) => {
        expect(p.speed).toBeGreaterThan(0);
        expect(p.speed).toBeLessThanOrEqual(0.007);
      });
    });

    it("offset should be between 0 and 2*PI", () => {
      const particles = generateParticles(50);
      particles.forEach((p) => {
        expect(p.offset).toBeGreaterThanOrEqual(0);
        expect(p.offset).toBeLessThanOrEqual(Math.PI * 2);
      });
    });

    it("should be deterministic with same seed", () => {
      const a = generateParticles(10, 42);
      const b = generateParticles(10, 42);
      a.forEach((p, i) => {
        expect(p.position.x).toBe(b[i].position.x);
        expect(p.position.y).toBe(b[i].position.y);
        expect(p.position.z).toBe(b[i].position.z);
        expect(p.speed).toBe(b[i].speed);
        expect(p.offset).toBe(b[i].offset);
      });
    });

    it("should differ with different seeds", () => {
      const a = generateParticles(10, 42);
      const b = generateParticles(10, 99);
      // At least one particle should differ
      const differs = a.some(
        (p, i) =>
          p.position.x !== b[i].position.x
      );
      expect(differs).toBe(true);
    });
  });

  describe("particlePosition", () => {
    it("should return position near the base position at t=0", () => {
      const p = {
        position: { x: 5, y: 3, z: -2 },
        speed: 0.003,
        offset: 0,
      };
      const pos = particlePosition(p, 0);
      // At t=0: sin(0) = 0, cos(0) = 1
      expect(pos.x).toBeCloseTo(5, 0);
      expect(pos.y).toBeCloseTo(3.3, 0); // cos(0) * 0.3 = 0.3
      expect(pos.z).toBeCloseTo(-2, 0);
    });

    it("should animate with time", () => {
      const p = {
        position: { x: 0, y: 0, z: 0 },
        speed: 0.005,
        offset: 1,
      };
      const pos0 = particlePosition(p, 0);
      const pos1 = particlePosition(p, 100);
      // Should differ
      expect(pos0.x).not.toBeCloseTo(pos1.x, 3);
    });
  });

  describe("particleScale", () => {
    it("should return ~0.015 at t=0, offset=0", () => {
      // sin(0) = 0 → 0.015 + 0 = 0.015
      expect(particleScale(0, 0)).toBeCloseTo(0.015, 3);
    });

    it("should oscillate between ~0.007 and ~0.023", () => {
      const values: number[] = [];
      for (let t = 0; t < 20; t += 0.1) {
        values.push(particleScale(t, 0));
      }
      const min = Math.min(...values);
      const max = Math.max(...values);
      expect(min).toBeGreaterThanOrEqual(0.006);
      expect(max).toBeLessThanOrEqual(0.024);
    });
  });
});
