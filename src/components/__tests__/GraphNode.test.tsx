/**
 * GraphNode component tests.
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
  Billboard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="billboard">{children}</div>
  ),
  Text: ({ children, ...props }: { children: React.ReactNode; fillOpacity?: number; fontSize?: number; [k: string]: unknown }) => (
    <span data-testid="node-label" data-fill-opacity={props.fillOpacity} data-font-size={props.fontSize}>
      {children}
    </span>
  ),
}));

jest.mock("three", () => ({
  Vector3: class {
    x: number; y: number; z: number;
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    clone() { return new (jest.requireMock("three").Vector3)(this.x, this.y, this.z); }
    set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; }
  },
  Mesh: class {},
  MeshBasicMaterial: class { opacity = 1; },
  AdditiveBlending: 2,
}));

import GraphNode, { NODE_SIZES, LABEL_SIZES } from "../GraphNode";
import type { PositionedNode } from "@/lib/layout";
const V = jest.requireMock("three").Vector3;

function makeNode(overrides: Partial<PositionedNode> = {}): PositionedNode {
  return { id: "test-node", label: "Test Node", type: "project", position: new V(1,2,3), ...overrides };
}

const base = { onHover: jest.fn(), isHighlighted: false, isConnected: false, hoveredNode: null as PositionedNode | null };

describe("GraphNode", () => {
  beforeEach(() => { frameCallbacks = []; jest.clearAllMocks(); });

  // ── Constants ────
  describe("NODE_SIZES", () => {
    it("center=0.2, project=0.1, studio=0.12, studio-project=0.07", () => {
      expect(NODE_SIZES.center).toBe(0.2);
      expect(NODE_SIZES.project).toBe(0.1);
      expect(NODE_SIZES.studio).toBe(0.12);
      expect(NODE_SIZES["studio-project"]).toBe(0.07);
    });
  });

  describe("LABEL_SIZES", () => {
    it("center=0.38, project=0.22, studio=0.25, studio-project=0.18", () => {
      expect(LABEL_SIZES.center).toBe(0.38);
      expect(LABEL_SIZES.project).toBe(0.22);
      expect(LABEL_SIZES.studio).toBe(0.25);
      expect(LABEL_SIZES["studio-project"]).toBe(0.18);
    });
  });

  // ── Rendering ────
  describe("rendering", () => {
    it("should render without crashing", () => {
      const { container } = render(<GraphNode node={makeNode()} {...base} />);
      expect(container).toBeTruthy();
    });

    it("should render the label text", () => {
      render(<GraphNode node={makeNode({ label: "ShaWars" })} {...base} />);
      expect(screen.getByText("ShaWars")).toBeInTheDocument();
    });

    it("should render a billboard", () => {
      render(<GraphNode node={makeNode()} {...base} />);
      expect(screen.getByTestId("billboard")).toBeInTheDocument();
    });

    it("should register a useFrame callback for animation", () => {
      render(<GraphNode node={makeNode()} {...base} />);
      expect(frameCallbacks.length).toBe(1);
    });

    it("should register a useFrame callback for animation", () => {
      render(<GraphNode node={makeNode()} {...base} />);
      expect(frameCallbacks.length).toBe(1);
    });
  });

  // ── Dimming ────
  describe("dimming", () => {
    it("label opacity 0.65 when no node hovered", () => {
      render(<GraphNode node={makeNode()} {...base} hoveredNode={null} />);
      expect(screen.getByTestId("node-label").getAttribute("data-fill-opacity")).toBe("0.65");
    });

    it("label opacity 0.05 when dimmed", () => {
      render(<GraphNode node={makeNode()} {...base} hoveredNode={makeNode({ id: "other" })} isHighlighted={false} isConnected={false} />);
      expect(screen.getByTestId("node-label").getAttribute("data-fill-opacity")).toBe("0.05");
    });

    it("label opacity 1 when highlighted", () => {
      const n = makeNode();
      render(<GraphNode node={n} {...base} hoveredNode={n} isHighlighted={true} isConnected={true} />);
      expect(screen.getByTestId("node-label").getAttribute("data-fill-opacity")).toBe("1");
    });

    it("label opacity 0.65 when connected but not highlighted", () => {
      render(<GraphNode node={makeNode()} {...base} hoveredNode={makeNode({ id: "other" })} isHighlighted={false} isConnected={true} />);
      expect(screen.getByTestId("node-label").getAttribute("data-fill-opacity")).toBe("0.65");
    });
  });

  // ── Node types ────
  describe("node types", () => {
    it("renders each type correctly", () => {
      (["center", "project", "studio", "studio-project"] as const).forEach((type) => {
        const { unmount } = render(<GraphNode node={makeNode({ type })} {...base} />);
        expect(screen.getByText("Test Node")).toBeInTheDocument();
        unmount();
      });
    });
  });

  // ── Label sizing ────
  describe("label font size", () => {
    it("matches each type", () => {
      const map = { center: "0.38", project: "0.22", studio: "0.25", "studio-project": "0.18" } as const;
      (Object.entries(map) as [string, string][]).forEach(([type, size]) => {
        const { unmount } = render(<GraphNode node={makeNode({ type: type as PositionedNode["type"] })} {...base} />);
        expect(screen.getByTestId("node-label").getAttribute("data-font-size")).toBe(size);
        unmount();
      });
    });
  });
});
