import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Constellation — Interactive 3D Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Subtle radial glow behind text */}
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.35em",
            textTransform: "uppercase" as const,
          }}
        >
          Constellation
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.2em",
            marginTop: "16px",
          }}
        >
          Design / Engineering / Product
        </div>

        {/* Decorative dots to hint at the graph */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "48px",
            alignItems: "center",
          }}
        >
          {[4, 6, 3, 8, 5, 4, 6].map((r, i) => (
            <div
              key={i}
              style={{
                width: `${r}px`,
                height: `${r}px`,
                borderRadius: "50%",
                backgroundColor: `rgba(255,255,255,${0.15 + i * 0.05})`,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
