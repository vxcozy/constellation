/**
 * Tests for the layout computation module.
 *
 * We use the real Three.js Vector3 here (not the mock) because layout.ts
 * depends on Vector3 math for correctness. The mock is only used for
 * React component tests.
 */

// Use real three for math correctness
jest.mock("three", () => {
  const actual = jest.requireActual("three");
  return actual;
});

import { computeLayout, getEdgesWithPositions, type PositionedNode } from "../layout";
import { nodes, edges } from "@/data/graph";

describe("Layout Module", () => {
  let positionedNodes: PositionedNode[];

  beforeAll(() => {
    positionedNodes = computeLayout();
  });

  describe("computeLayout", () => {
    it("should return an array of positioned nodes", () => {
      expect(Array.isArray(positionedNodes)).toBe(true);
      expect(positionedNodes.length).toBeGreaterThan(0);
    });

    it("should position every node from the graph data", () => {
      // Every node in the data should appear in the layout
      const positionedIds = new Set(positionedNodes.map((n) => n.id));
      nodes.forEach((n) => {
        expect(positionedIds.has(n.id)).toBe(true);
      });
    });

    it("should have the same count as the graph data nodes", () => {
      expect(positionedNodes.length).toBe(nodes.length);
    });

    it("should place the center node at the origin", () => {
      const center = positionedNodes.find((n) => n.type === "center")!;
      expect(center).toBeDefined();
      expect(center.position.x).toBe(0);
      expect(center.position.y).toBe(0);
      expect(center.position.z).toBe(0);
    });

    it("every positioned node should have a valid Vector3 position", () => {
      positionedNodes.forEach((node) => {
        expect(node.position).toBeDefined();
        expect(typeof node.position.x).toBe("number");
        expect(typeof node.position.y).toBe("number");
        expect(typeof node.position.z).toBe("number");
        expect(Number.isFinite(node.position.x)).toBe(true);
        expect(Number.isFinite(node.position.y)).toBe(true);
        expect(Number.isFinite(node.position.z)).toBe(true);
      });
    });

    it("project nodes should be on the inner ring (~radius 5)", () => {
      const projects = positionedNodes.filter((n) => n.type === "project");
      projects.forEach((p) => {
        const dist = p.position.length();
        // Inner ring radius is 5, with some jitter
        expect(dist).toBeGreaterThan(3);
        expect(dist).toBeLessThan(8);
      });
    });

    it("studio nodes should be on the outer ring (~radius 11)", () => {
      const studios = positionedNodes.filter((n) => n.type === "studio");
      studios.forEach((s) => {
        const dist = s.position.length();
        // Outer ring radius is 11, with some jitter
        expect(dist).toBeGreaterThan(8);
        expect(dist).toBeLessThan(15);
      });
    });

    it("studio-project nodes should be near their parent studio", () => {
      const studioMap = new Map(
        positionedNodes
          .filter((n) => n.type === "studio")
          .map((n) => [n.id, n])
      );

      const studioProjects = positionedNodes.filter(
        (n) => n.type === "studio-project"
      );

      studioProjects.forEach((sp) => {
        const parent = studioMap.get(sp.parentId!);
        expect(parent).toBeDefined();
        if (parent) {
          const dist = sp.position.distanceTo(parent.position);
          // Sub-ring radius is 2.8, with jitter
          expect(dist).toBeGreaterThan(1);
          expect(dist).toBeLessThan(5);
        }
      });
    });

    it("should produce deterministic results (seeded PRNG)", () => {
      const layout1 = computeLayout();
      const layout2 = computeLayout();

      layout1.forEach((node, i) => {
        expect(node.position.x).toBeCloseTo(layout2[i].position.x, 10);
        expect(node.position.y).toBeCloseTo(layout2[i].position.y, 10);
        expect(node.position.z).toBeCloseTo(layout2[i].position.z, 10);
      });
    });

    it("no two nodes should occupy the exact same position", () => {
      for (let i = 0; i < positionedNodes.length; i++) {
        for (let j = i + 1; j < positionedNodes.length; j++) {
          const a = positionedNodes[i];
          const b = positionedNodes[j];
          const dist = a.position.distanceTo(b.position);
          expect(dist).toBeGreaterThan(0.01);
        }
      }
    });

    it("should preserve all original node properties", () => {
      positionedNodes.forEach((pn) => {
        const original = nodes.find((n) => n.id === pn.id)!;
        expect(pn.label).toBe(original.label);
        expect(pn.type).toBe(original.type);
        expect(pn.description).toBe(original.description);
        expect(pn.role).toBe(original.role);
        expect(pn.github).toBe(original.github);
        expect(pn.url).toBe(original.url);
        expect(pn.parentId).toBe(original.parentId);
      });
    });
  });

  describe("getEdgesWithPositions", () => {
    it("should return resolved edges with positions", () => {
      const resolved = getEdgesWithPositions(positionedNodes);
      expect(Array.isArray(resolved)).toBe(true);
      expect(resolved.length).toBeGreaterThan(0);
    });

    it("should resolve all edges from the graph data", () => {
      const resolved = getEdgesWithPositions(positionedNodes);
      expect(resolved.length).toBe(edges.length);
    });

    it("each resolved edge should have sourcePos and targetPos", () => {
      const resolved = getEdgesWithPositions(positionedNodes);
      resolved.forEach((edge) => {
        expect(edge).not.toBeNull();
        if (edge) {
          expect(edge.sourcePos).toBeDefined();
          expect(edge.targetPos).toBeDefined();
          expect(typeof edge.sourcePos.x).toBe("number");
          expect(typeof edge.sourcePos.y).toBe("number");
          expect(typeof edge.sourcePos.z).toBe("number");
          expect(typeof edge.targetPos.x).toBe("number");
          expect(typeof edge.targetPos.y).toBe("number");
          expect(typeof edge.targetPos.z).toBe("number");
        }
      });
    });

    it("should preserve original edge data (source, target, distance)", () => {
      const resolved = getEdgesWithPositions(positionedNodes);
      resolved.forEach((edge) => {
        if (edge) {
          expect(typeof edge.source).toBe("string");
          expect(typeof edge.target).toBe("string");
          expect(typeof edge.distance).toBe("number");
        }
      });
    });

    it("source and target positions should match the positioned nodes", () => {
      const resolved = getEdgesWithPositions(positionedNodes);
      const nodeMap = new Map(positionedNodes.map((n) => [n.id, n]));

      resolved.forEach((edge) => {
        if (edge) {
          const sourceNode = nodeMap.get(edge.source)!;
          const targetNode = nodeMap.get(edge.target)!;
          expect(edge.sourcePos.x).toBe(sourceNode.position.x);
          expect(edge.sourcePos.y).toBe(sourceNode.position.y);
          expect(edge.sourcePos.z).toBe(sourceNode.position.z);
          expect(edge.targetPos.x).toBe(targetNode.position.x);
          expect(edge.targetPos.y).toBe(targetNode.position.y);
          expect(edge.targetPos.z).toBe(targetNode.position.z);
        }
      });
    });

    it("should return null entries for edges with missing nodes", () => {
      // Create a subset of nodes (missing some) and verify nulls are filtered
      const partialNodes = positionedNodes.filter(
        (n) => n.type === "center" || n.type === "project"
      );
      const resolved = getEdgesWithPositions(partialNodes);
      // Some edges (studio ones) should be filtered out
      const validEdges = resolved.filter(Boolean);
      expect(validEdges.length).toBeLessThan(edges.length);
    });

    it("should handle empty node list gracefully", () => {
      const resolved = getEdgesWithPositions([]);
      const validEdges = resolved.filter(Boolean);
      expect(validEdges).toHaveLength(0);
    });
  });

  describe("PositionedNode type", () => {
    it("should extend GraphNode with position field", () => {
      const node = positionedNodes[0];
      expect(node.id).toBeDefined();
      expect(node.label).toBeDefined();
      expect(node.type).toBeDefined();
      expect(node.position).toBeDefined();
    });
  });
});
