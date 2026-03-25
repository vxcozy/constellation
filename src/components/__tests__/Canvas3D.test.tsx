/**
 * Canvas3D tests.
 *
 * Canvas3D is the top-level 3D wrapper. We mock the Three.js/R3F layer
 * and test the DOM shell (corner mark, hints, tooltip integration).
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";

// Mock R3F Canvas and dependencies before importing component
jest.mock("@react-three/fiber", () => ({
  Canvas: ({ children, ...props }: { children: React.ReactNode; [k: string]: unknown }) => (
    <div data-testid="r3f-canvas" style={props.style as React.CSSProperties}>
      {children}
    </div>
  ),
  useFrame: jest.fn(),
  useThree: jest.fn(() => ({
    gl: { domElement: document.createElement("canvas") },
  })),
  extend: jest.fn(),
}));

jest.mock("@react-three/drei", () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Billboard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock("../GraphScene", () => {
  return function MockGraphScene() {
    return <div data-testid="graph-scene" />;
  };
});

jest.mock("../Tooltip", () => {
  return function MockTooltip({ node, mouse }: { node: unknown; mouse: { x: number; y: number } }) {
    return (
      <div
        data-testid="tooltip"
        data-has-node={String(node !== null)}
        data-mouse-x={String(mouse.x)}
        data-mouse-y={String(mouse.y)}
      />
    );
  };
});

import Canvas3D from "../Canvas3D";

describe("Canvas3D", () => {
  it("should render without crashing", () => {
    render(<Canvas3D />);
    expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument();
  });

  it("should display the corner identity mark with 'Cozy'", () => {
    render(<Canvas3D />);
    expect(screen.getByText("Cozy")).toBeInTheDocument();
  });

  it("should display the subtitle", () => {
    render(<Canvas3D />);
    expect(
      screen.getByText("Design / Engineering / Product")
    ).toBeInTheDocument();
  });

  it("should display the interaction hint", () => {
    render(<Canvas3D />);
    expect(
      screen.getByText("Drag to rotate · Scroll to zoom · Hover to explore")
    ).toBeInTheDocument();
  });

  it("should render the R3F Canvas", () => {
    render(<Canvas3D />);
    expect(screen.getByTestId("r3f-canvas")).toBeInTheDocument();
  });

  it("should render the GraphScene inside the canvas", () => {
    render(<Canvas3D />);
    expect(screen.getByTestId("graph-scene")).toBeInTheDocument();
  });

  it("should render OrbitControls", () => {
    render(<Canvas3D />);
    expect(screen.getByTestId("orbit-controls")).toBeInTheDocument();
  });

  it("should render the Tooltip component", () => {
    render(<Canvas3D />);
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("should initialize tooltip with no node", () => {
    render(<Canvas3D />);
    const tooltip = screen.getByTestId("tooltip");
    expect(tooltip.getAttribute("data-has-node")).toBe("false");
  });

  it("should track mouse position on pointer move", () => {
    const { container } = render(<Canvas3D />);
    const wrapper = container.firstChild as HTMLElement;

    // Initial state — mouse at 0,0
    expect(screen.getByTestId("tooltip").getAttribute("data-mouse-x")).toBe("0");
    expect(screen.getByTestId("tooltip").getAttribute("data-mouse-y")).toBe("0");

    // Use native MouseEvent (PointerEvent) which JSDOM supports clientX/Y on
    act(() => {
      const event = new MouseEvent("pointermove", {
        clientX: 500,
        clientY: 300,
        bubbles: true,
      });
      wrapper.dispatchEvent(event);
    });

    const tooltip = screen.getByTestId("tooltip");
    expect(tooltip.getAttribute("data-mouse-x")).toBe("500");
    expect(tooltip.getAttribute("data-mouse-y")).toBe("300");
  });

  it("should have a black background on the canvas", () => {
    render(<Canvas3D />);
    const canvas = screen.getByTestId("r3f-canvas");
    // JSDOM normalizes hex to rgb
    expect(canvas.style.background).toMatch(/^(#000000|rgb\(0,\s*0,\s*0\))$/);
  });

  it("corner mark should have pointer-events-none", () => {
    render(<Canvas3D />);
    const mark = screen.getByText("Cozy").closest(".pointer-events-none");
    expect(mark).toBeInTheDocument();
  });

  it("hint bar should have pointer-events-none", () => {
    render(<Canvas3D />);
    const hint = screen
      .getByText(/Drag to rotate/)
      .closest(".pointer-events-none");
    expect(hint).toBeInTheDocument();
  });
});
