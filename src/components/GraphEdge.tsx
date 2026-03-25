"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame, extend } from "@react-three/fiber";
import * as THREE from "three";

// Register THREE.Line so R3F can use <threeLine> declaratively
extend({ ThreeLine: THREE.Line });

interface GraphEdgeProps {
  sourcePos: THREE.Vector3;
  targetPos: THREE.Vector3;
  isHighlighted: boolean;
  dimmed: boolean;
  theme: "dark" | "light";
}

export default function GraphEdge({
  sourcePos,
  targetPos,
  isHighlighted,
  dimmed,
  theme,
}: GraphEdgeProps) {
  const lineRef = useRef<THREE.Line>(null);
  const currentOpacity = useRef(0.18);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setFromPoints([sourcePos, targetPos]);
    return geo;
  }, [sourcePos, targetPos]);

  const edgeColor = theme === "dark" ? "#ffffff" : "#000000";

  const material = useMemo(() => {
    return new THREE.LineDashedMaterial({
      color: edgeColor,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      dashSize: 0.15,
      gapSize: 0.1,
    });
  }, [edgeColor]);

  // Compute line distances for dashed rendering
  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.computeLineDistances();
    }
  }, [geometry]);

  useFrame(({ clock }) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.LineDashedMaterial;
    const t = clock.getElapsedTime();

    // Smooth opacity transitions
    let goal: number;
    if (isHighlighted) {
      goal = 0.5 + Math.sin(t * 2.5) * 0.1;
    } else if (dimmed) {
      goal = 0.04;
    } else {
      goal = 0.18;
    }

    currentOpacity.current += (goal - currentOpacity.current) * 0.08;
    mat.opacity = currentOpacity.current;
  });

  return (
    <threeLine ref={lineRef} geometry={geometry} material={material} />
  );
}
