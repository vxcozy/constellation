/**
 * GraphScene component tests.
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

type FrameCallback = (state: { clock: { getElapsedTime: () => number } }) => void;
let frameCallbacks: FrameCallback[] = [];

jest.mock("@react-three/fiber", () => ({
  useFrame: (cb: FrameCallback) => { frameCallbacks.push(cb); },
  extend: jest.fn(),
}));

jest.mock("@react-three/drei", () => ({
  Billboard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock("three", () => {
  class V3 {
    x: number; y: number; z: number;
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    clone() { return new V3(this.x, this.y, this.z); }
    set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; }
    length() { return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2); }
    distanceTo(v: V3) { return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2 + (this.z - v.z) ** 2); }
  }
  class Obj3D {
    position = new V3(); rotation = { x: 0, y: 0, z: 0 };
    scale = { x: 1, y: 1, z: 1, setScalar(s: number) { this.x = s; this.y = s; this.z = s; } };
    matrix = {}; updateMatrix() {}
  }
  return {
    Vector3: V3, Object3D: Obj3D, Group: class { rotation = { x: 0, y: 0, z: 0 }; position = new V3(); },
    BufferGeometry: class { setFromPoints() { return this; } },
    LineBasicMaterial: class { opacity = 0.1; constructor(_p?: Record<string, unknown>) {} },
    Line: class {}, Mesh: class { material = { opacity: 1 }; },
    InstancedMesh: class { instanceMatrix = { needsUpdate: false }; setMatrixAt() {} },
    MeshBasicMaterial: class { opacity = 1; }, AdditiveBlending: 2,
  };
});

jest.mock("../GraphNode", () => {
  return function MockNode({ node }: { node: { id: string; label: string } }) {
    return <div data-testid={`node-${node.id}`}>{node.label}</div>;
  };
});

jest.mock("../GraphEdge", () => {
  return function MockEdge({ isHighlighted, dimmed }: { sourcePos: unknown; targetPos: unknown; isHighlighted: boolean; dimmed: boolean }) {
    return <div data-testid="graph-edge" data-highlighted={isHighlighted} data-dimmed={dimmed} />;
  };
});

import GraphScene from "../GraphScene";
import { nodes, edges } from "@/data/graph";
import type { PositionedNode } from "@/lib/layout";
const THREE = jest.requireMock("three");

describe("GraphScene", () => {
  const defaults = { onHover: jest.fn(), hoveredNode: null as PositionedNode | null };

  beforeEach(() => { frameCallbacks = []; jest.clearAllMocks(); });

  it("renders without crashing", () => {
    expect(render(<GraphScene {...defaults} />).container).toBeTruthy();
  });

  it("renders every node from graph data", () => {
    render(<GraphScene {...defaults} />);
    nodes.forEach((n) => expect(screen.getByTestId(`node-${n.id}`)).toBeInTheDocument());
  });

  it("renders all edges", () => {
    render(<GraphScene {...defaults} />);
    expect(screen.getAllByTestId("graph-edge")).toHaveLength(edges.length);
  });

  it("no edges highlighted when nothing hovered", () => {
    render(<GraphScene {...defaults} />);
    screen.getAllByTestId("graph-edge").forEach((el) => {
      expect(el.getAttribute("data-highlighted")).toBe("false");
    });
  });

  it("highlights edges connected to hovered node", () => {
    const hovered: PositionedNode = { id: "cozy", label: "Cozy", type: "center", position: new THREE.Vector3(0,0,0) };
    render(<GraphScene {...defaults} hoveredNode={hovered} />);
    const edgeEls = screen.getAllByTestId("graph-edge");
    const highlighted = edgeEls.filter((el) => el.getAttribute("data-highlighted") === "true");
    const cozyEdgeCount = edges.filter((e) => e.source === "cozy" || e.target === "cozy").length;
    expect(highlighted.length).toBe(cozyEdgeCount);
  });

  it("registers useFrame callbacks for drift and particles", () => {
    render(<GraphScene {...defaults} />);
    expect(frameCallbacks.length).toBeGreaterThanOrEqual(2);
  });

  it("should register useFrame callbacks for animation", () => {
    render(<GraphScene {...defaults} />);
    // GraphScene registers at least 2 useFrame callbacks:
    // one for the group drift rotation, one for the Particles component
    expect(frameCallbacks.length).toBeGreaterThanOrEqual(2);
  });
});
