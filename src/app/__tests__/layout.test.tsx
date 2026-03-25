/**
 * RootLayout tests.
 *
 * React 19 treats <html> and <body> as singletons — they merge into the
 * existing JSDOM document rather than appearing in the render container.
 * So we test via document.documentElement / document.body.
 */

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// Mock the geist font imports
jest.mock("geist/font/sans", () => ({
  GeistSans: {
    variable: "font-geist-sans",
    className: "geist-sans",
  },
}));

jest.mock("geist/font/mono", () => ({
  GeistMono: {
    variable: "font-geist-mono",
    className: "geist-mono",
  },
}));

import RootLayout from "../layout";

describe("RootLayout", () => {
  // Suppress React warnings about rendering <html> and <body> inside a div
  const originalError = console.error;
  beforeAll(() => {
    console.error = (...args: unknown[]) => {
      const msg = String(args[0] ?? "");
      if (
        msg.includes("validateDOMNesting") ||
        msg.includes("<html>") ||
        msg.includes("<body>") ||
        msg.includes("cannot be a child")
      ) {
        return;
      }
      originalError.call(console, ...args);
    };
  });
  afterAll(() => {
    console.error = originalError;
  });

  it("should render children", () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Hello</div>
      </RootLayout>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should set lang attribute on html element", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    // React 19 merges attributes onto the existing <html> singleton
    expect(document.documentElement.getAttribute("lang")).toBe("en");
  });

  it("should add Geist font CSS variables to html class", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const htmlClass = document.documentElement.className;
    expect(htmlClass).toContain("font-geist-sans");
    expect(htmlClass).toContain("font-geist-mono");
  });

  it("should add antialiased class to body", () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    expect(document.body.className).toContain("antialiased");
  });
});

describe("Layout metadata", () => {
  it("should export metadata with correct title", async () => {
    const { metadata } = await import("../layout");
    expect(metadata.title).toBe("Cozy — Design / Engineering / Product");
  });

  it("should export metadata with description", async () => {
    const { metadata } = await import("../layout");
    expect(metadata.description).toContain("Cozy");
    expect(metadata.description).toContain("design");
  });
});
