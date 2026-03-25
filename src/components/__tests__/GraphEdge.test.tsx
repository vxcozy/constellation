/**
 * GraphEdge component tests.
 */

import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";

type FrameCallback = (state: {
  clock: { getElapsedTime: () => number };
}) => void;
let frameCallbacks: FrameCallback[] = [];

jest.mock("@react-three/fiber", () => ({
  useFrame: (cb: FrameCallback) => {
    frameCallbacks.push(cb);
  },
  extend: jest.fn(),
}));

jest.mock("three", () => {
  class MockVector3 {
    x: number; y: number; z: number;
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  }
  class MockBufferGeometry { setFromPoints() { return this; } }
  class MockLineBasicMaterial {
    color = "#fff"; transparent = true; opacity = 0.1; depthWrite = false;
    constructor(_p?: Record<string, unknown>) {}
  }
  class MockLine {}
  return {
    Vector3: MockVector3,
    BufferGeometry: MockBufferGeometry,
    LineBasicMaterial: MockLineBasicMaterial,
    Line: MockLine,
    AdditiveBlending: 2,
  };
});

import GraphEdge from "../GraphEdge";
const THREE = jest.requireMock("three");
function vec(x: number, y: number, z: number) { return new THREE.Vector3(x, y, z); }

describe("GraphEdge", () => {
  beforeEach(() => { frameCallbacks = []; });

  it("should render without crashing", () => {
    const { container } = render(
      <GraphEdge sourcePos={vec(0,0,0)} targetPos={vec(1,1,1)} isHighlighted={false} dimmed={false} />
    );
    expect(container).toBeTruthy();
  });

  it("should register a useFrame callback", () => {
    render(<GraphEdge sourcePos={vec(0,0,0)} targetPos={vec(1,1,1)} isHighlighted={false} dimmed={false} />);
    expect(frameCallbacks).toHaveLength(1);
  });

  it("should register exactly one useFrame callback", () => {
    render(<GraphEdge sourcePos={vec(0,0,0)} targetPos={vec(1,1,1)} isHighlighted={false} dimmed={false} />);
    expect(frameCallbacks).toHaveLength(1);
  });

  it("should render with highlighted state", () => {
    const { container } = render(
      <GraphEdge sourcePos={vec(0,0,0)} targetPos={vec(1,1,1)} isHighlighted={true} dimmed={false} />
    );
    expect(container).toBeTruthy();
  });

  it("should render with dimmed state", () => {
    const { container } = render(
      <GraphEdge sourcePos={vec(0,0,0)} targetPos={vec(1,1,1)} isHighlighted={false} dimmed={true} />
    );
    expect(container).toBeTruthy();
  });

  it("should handle different vector positions", () => {
    const { container } = render(
      <GraphEdge sourcePos={vec(-10,5,3)} targetPos={vec(10,-5,-3)} isHighlighted={false} dimmed={false} />
    );
    expect(container).toBeTruthy();
  });
});
