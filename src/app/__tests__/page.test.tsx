/**
 * Page (Home) tests.
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

jest.mock("next/dynamic", () => {
  return function mockDynamic(
    _loader: () => Promise<{ default: React.ComponentType }>,
    options?: { loading?: () => React.ReactNode; ssr?: boolean }
  ) {
    const MockComponent = () => {
      if (options?.loading) {
        return <>{options.loading()}</>;
      }
      return <div data-testid="canvas3d-dynamic" />;
    };
    MockComponent.displayName = "DynamicMock";
    return MockComponent;
  };
});

import Home from "../page";

describe("Home Page", () => {
  it("should render without crashing", () => {
    const { container } = render(<Home />);
    expect(container).toBeTruthy();
  });

  it("should render main element with correct classes", () => {
    render(<Home />);
    const main = document.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main?.className).toContain("h-screen");
    expect(main?.className).toContain("w-screen");
    expect(main?.className).toContain("overflow-hidden");
    expect(main?.className).toContain("bg-black");
  });

  it("should render loading state with 'Loading' text", () => {
    render(<Home />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  it("loading text should have pulse animation", () => {
    render(<Home />);
    expect(screen.getByText("Loading").className).toContain("animate-pulse");
  });

  it("loading container should have centering and black bg classes", () => {
    render(<Home />);
    let el = screen.getByText("Loading").parentElement;
    let found = false;
    while (el) {
      if (el.className?.includes("flex")) {
        found = true;
        expect(el.className).toContain("items-center");
        expect(el.className).toContain("justify-center");
        expect(el.className).toContain("bg-black");
        break;
      }
      el = el.parentElement;
    }
    expect(found).toBe(true);
  });
});
