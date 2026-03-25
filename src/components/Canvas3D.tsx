"use client";

import { useState, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import GraphScene from "./GraphScene";
import NodeCard from "./NodeCard";
import { useTheme } from "./ThemeProvider";
import type { PositionedNode } from "@/lib/layout";
import type { RootState } from "@react-three/fiber";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function Canvas3D() {
  const [hoveredNode, setHoveredNode] = useState<PositionedNode | null>(null);
  const [pinnedNode, setPinnedNode] = useState<PositionedNode | null>(null);
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const cardNode = pinnedNode || hoveredNode;

  const handleNodeClick = useCallback((node: PositionedNode) => {
    setPinnedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const handleCloseCard = useCallback(() => {
    setPinnedNode(null);
  }, []);

  const handleCreated = useCallback((state: RootState) => {
    state.gl.render(state.scene, state.camera);
  }, []);

  const cameraZ = isMobile ? 28 : 14;

  const textColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const hintColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const iconColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
  const iconHover = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)";
  const canvasBg = isDark ? "#000000" : "#f5f5f5";
  const gradientBg = isDark
    ? "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)"
    : "linear-gradient(135deg, rgba(245,245,245,0.7) 0%, rgba(245,245,245,0.3) 50%, transparent 100%)";

  return (
    <div role="main" className="relative h-screen w-screen" style={{ background: canvasBg }}>
      {/* Corner identity — uses CSS media queries to avoid CLS from JS isMobile */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 header-corner"
        style={{ background: gradientBg }}
      >
        <h1
          className="font-medium uppercase header-title"
          style={{
            letterSpacing: "0.3em",
            color: textColor,
          }}
        >
          Your Name
        </h1>
        <p
          className="header-subtitle"
          style={{
            marginTop: "2px",
            letterSpacing: "0.15em",
            color: textColor,
          }}
        >
          Design / Engineering / Product {/* ← Edit these */}
        </p>
      </div>

      {/* Bottom bar: hint + social links — z-60 so it sits above the card */}
      <div
        className="absolute z-[60] flex items-center justify-between bottom-bar"
        style={{
          left: 0,
          right: 0,
        }}
      >
        <p
          className="pointer-events-none bottom-hint"
          style={{
            letterSpacing: "0.2em",
            color: hintColor,
            margin: 0,
            flex: 1,
            textAlign: "center",
          }}
        >
          <span className="hint-desktop">Drag to rotate · Scroll to zoom · Hover to explore</span>
          <span className="hint-mobile">Touch to rotate · Pinch to zoom · Tap to explore</span>
        </p>

        <div className="flex items-center gap-4" style={{ flexShrink: 0 }}>
          <a
            href="https://x.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on X (formerly Twitter)"
            style={{ color: iconColor, transition: "color 200ms" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = iconHover)}
            onMouseLeave={(e) => (e.currentTarget.style.color = iconColor)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View GitHub profile"
            style={{ color: iconColor, transition: "color 200ms" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = iconHover)}
            onMouseLeave={(e) => (e.currentTarget.style.color = iconColor)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            style={{
              color: iconColor,
              transition: "color 200ms",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = iconHover)}
            onMouseLeave={(e) => (e.currentTarget.style.color = iconColor)}
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Node profile card */}
      <NodeCard
        node={cardNode}
        theme={theme}
        isMobile={isMobile}
        pinned={pinnedNode !== null}
        onClose={handleCloseCard}
      />

      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: [0, 2, cameraZ],
          fov: 50,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        frameloop="always"
        flat
        style={{ background: canvasBg }}
        onCreated={handleCreated}
      >
        <ambientLight intensity={isDark ? 0.08 : 0.15} />

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
          minDistance={isMobile ? 10 : 6}
          maxDistance={isMobile ? 55 : 45}
          rotateSpeed={0.5}
          autoRotate
          autoRotateSpeed={0.15}
        />

        <GraphScene
          onHover={setHoveredNode}
          onNodeClick={handleNodeClick}
          hoveredNode={hoveredNode}
          theme={theme}
        />
      </Canvas>
    </div>
  );
}
