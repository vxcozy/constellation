import React from "react";

// Mock useFrame - collects callbacks for testing
const frameCallbacks: Array<(state: { clock: { getElapsedTime: () => number } }) => void> = [];

export function useFrame(
  callback: (state: { clock: { getElapsedTime: () => number } }) => void
) {
  frameCallbacks.push(callback);
}

// Helper for tests to trigger frame callbacks
export function __triggerFrame(time = 0) {
  frameCallbacks.forEach((cb) =>
    cb({ clock: { getElapsedTime: () => time } })
  );
}

export function __clearFrameCallbacks() {
  frameCallbacks.length = 0;
}

export function useThree() {
  return {
    gl: {
      getContextAttributes: () => ({ alpha: true }),
      domElement: document.createElement("canvas"),
    },
    scene: {},
    camera: {},
    size: { width: 1920, height: 1080 },
  };
}

export function extend(_obj: Record<string, unknown>) {
  // no-op in tests
}

// Mock Canvas as a simple div wrapper
export function Canvas({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  return (
    <div data-testid="r3f-canvas" {...filterProps(props)}>
      {children}
    </div>
  );
}

// Filter non-DOM props
function filterProps(props: Record<string, unknown>) {
  const domProps: Record<string, unknown> = {};
  const nonDomKeys = ["camera", "gl", "style", "shadows", "dpr"];
  for (const [key, val] of Object.entries(props)) {
    if (!nonDomKeys.includes(key) && typeof val !== "object") {
      domProps[key] = val;
    }
    if (key === "style") {
      domProps[key] = val;
    }
  }
  return domProps;
}
