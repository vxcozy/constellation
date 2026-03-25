import React from "react";
import "@testing-library/jest-dom";
import { render, screen, act } from "@testing-library/react";
import Tooltip from "../Tooltip";
import type { PositionedNode } from "@/lib/layout";

// We need a Vector3-like object for PositionedNode
const mockPosition = { x: 0, y: 0, z: 0, clone: () => mockPosition };

function makeNode(overrides: Partial<PositionedNode> = {}): PositionedNode {
  return {
    id: "test-node",
    label: "Test Node",
    type: "project",
    position: mockPosition as unknown as PositionedNode["position"],
    ...overrides,
  };
}

describe("Tooltip", () => {
  beforeEach(() => {
    // Set window dimensions for viewport calculations
    Object.defineProperty(window, "innerWidth", { value: 1920, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 1080, writable: true });
  });

  it("should render nothing when node is null", () => {
    const { container } = render(
      <Tooltip node={null} mouse={{ x: 100, y: 100 }} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("should render the node label", async () => {
    render(
      <Tooltip
        node={makeNode({ label: "ShaWars" })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    expect(screen.getByText("ShaWars")).toBeInTheDocument();
  });

  it("should render description when provided", () => {
    render(
      <Tooltip
        node={makeNode({
          label: "ShaWars",
          description: "SHA-256 hash collision battle game",
        })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    expect(
      screen.getByText("SHA-256 hash collision battle game")
    ).toBeInTheDocument();
  });

  it("should not render description when not provided", () => {
    render(
      <Tooltip
        node={makeNode({ label: "Test", description: undefined })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    // Only label should be present, no description paragraph
    const paragraphs = document.querySelectorAll("p");
    expect(paragraphs.length).toBe(0);
  });

  it("should render role when provided", () => {
    render(
      <Tooltip
        node={makeNode({ role: "Creator" })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Creator")).toBeInTheDocument();
  });

  it("should not render role when not provided", () => {
    render(
      <Tooltip
        node={makeNode({ role: undefined })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    expect(screen.queryByText("Role")).not.toBeInTheDocument();
  });

  it("should render contributions when provided", () => {
    render(
      <Tooltip
        node={makeNode({ contributions: "Core protocol, UI design" })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    expect(screen.getByText("Contributions")).toBeInTheDocument();
    expect(screen.getByText("Core protocol, UI design")).toBeInTheDocument();
  });

  it("should not render contributions when not provided", () => {
    render(
      <Tooltip
        node={makeNode({ contributions: undefined })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    expect(screen.queryByText("Contributions")).not.toBeInTheDocument();
  });

  it("should render period when provided", () => {
    render(
      <Tooltip
        node={makeNode({ period: "2021-2023" })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    expect(screen.getByText("Period")).toBeInTheDocument();
    expect(screen.getByText("2021-2023")).toBeInTheDocument();
  });

  it("should not render period when not provided", () => {
    render(
      <Tooltip
        node={makeNode({ period: undefined })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    expect(screen.queryByText("Period")).not.toBeInTheDocument();
  });

  it("should show 'Click node to visit repo' when github is set", () => {
    render(
      <Tooltip
        node={makeNode({ github: "https://github.com/vxcozy/shawars" })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    expect(
      screen.getByText(/Click node to visit repo/)
    ).toBeInTheDocument();
  });

  it("should show 'Click node to visit site' when url is set but not github", () => {
    render(
      <Tooltip
        node={makeNode({ url: "https://exodus.io", github: undefined })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    expect(
      screen.getByText(/Click node to visit site/)
    ).toBeInTheDocument();
  });

  it("should not show link hint when neither url nor github is set", () => {
    render(
      <Tooltip
        node={makeNode({ url: undefined, github: undefined })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    expect(
      screen.queryByText(/Click node to visit/)
    ).not.toBeInTheDocument();
  });

  it("should position near mouse cursor", () => {
    render(
      <Tooltip
        node={makeNode()}
        mouse={{ x: 300, y: 400 }}
      />
    );

    const tooltip = document.querySelector(".fixed");
    expect(tooltip).toBeInTheDocument();
    const style = (tooltip as HTMLElement).style;
    // Should be offset from mouse position (default +20px offset)
    expect(parseInt(style.left)).toBe(320); // 300 + 20
    expect(parseInt(style.top)).toBe(420); // 400 + 20
  });

  it("should flip position when near right edge of viewport", () => {
    render(
      <Tooltip
        node={makeNode()}
        mouse={{ x: 1800, y: 400 }}
      />
    );

    const tooltip = document.querySelector(".fixed");
    const style = (tooltip as HTMLElement).style;
    // When x > innerWidth - 300 (1620), offset should be -280
    expect(parseInt(style.left)).toBe(1520); // 1800 - 280
  });

  it("should flip position when near bottom edge of viewport", () => {
    render(
      <Tooltip
        node={makeNode()}
        mouse={{ x: 300, y: 950 }}
      />
    );

    const tooltip = document.querySelector(".fixed");
    const style = (tooltip as HTMLElement).style;
    // When y > innerHeight - 200 (880), offset should be -180
    expect(parseInt(style.top)).toBe(770); // 950 - 180
  });

  it("should have pointer-events-none class", () => {
    render(
      <Tooltip
        node={makeNode()}
        mouse={{ x: 100, y: 100 }}
      />
    );

    const tooltip = document.querySelector(".pointer-events-none");
    expect(tooltip).toBeInTheDocument();
  });

  it("should become visible after requestAnimationFrame", async () => {
    render(
      <Tooltip
        node={makeNode()}
        mouse={{ x: 100, y: 100 }}
      />
    );

    // Initially opacity might be 0 (before rAF fires)
    const tooltip = document.querySelector(".fixed") as HTMLElement;
    expect(tooltip).toBeInTheDocument();

    // After rAF fires, opacity should transition to 1
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(tooltip.style.opacity).toBe("1");
  });

  it("should render all meta fields together", () => {
    render(
      <Tooltip
        node={makeNode({
          label: "Exodus",
          description: "Multi-asset cryptocurrency wallet",
          role: "Exchange Operations",
          contributions: "Pair listings, exchange ops",
          period: "2020-2022",
          url: "https://exodus.io",
        })}
        mouse={{ x: 100, y: 100 }}
      />
    );

    expect(screen.getByText("Exodus")).toBeInTheDocument();
    expect(screen.getByText("Multi-asset cryptocurrency wallet")).toBeInTheDocument();
    expect(screen.getByText("Exchange Operations")).toBeInTheDocument();
    expect(screen.getByText("Pair listings, exchange ops")).toBeInTheDocument();
    expect(screen.getByText("2020-2022")).toBeInTheDocument();
    expect(screen.getByText(/Click node to visit site/)).toBeInTheDocument();
  });
});
