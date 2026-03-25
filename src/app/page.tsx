"use client";

import dynamic from "next/dynamic";

// Load 3D canvas client-side only (Three.js needs browser APIs)
const Canvas3D = dynamic(() => import("@/components/Canvas3D"), {
  ssr: false,
  loading: () => (
    <div className="relative h-screen w-screen bg-black" />
  ),
});

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <Canvas3D />
    </div>
  );
}
