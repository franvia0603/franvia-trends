import { ImageResponse } from "next/og";

export const alt = "Franvia K-Trend Chart";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          backgroundColor: "#18181b",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span style={{ fontSize: 96, fontWeight: 800, color: "#fbbf24" }}>
            FRANVIA
          </span>
          <span style={{ fontSize: 64, fontWeight: 300, color: "#ffffff" }}>
            K-Trend Chart
          </span>
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#a1a1aa" }}>
          Real-time K-Movie &amp; K-Drama Rankings
        </div>
      </div>
    ),
    { ...size },
  );
}
