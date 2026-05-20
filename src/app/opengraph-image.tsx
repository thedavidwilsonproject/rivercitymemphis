import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "River City Church — Bartlett, TN · Sundays at 10:15 AM";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px 96px",
          background:
            "linear-gradient(135deg, #2aa5ca 0%, #1f7a93 60%, #1a1a1a 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 8,
            textTransform: "uppercase",
            opacity: 0.8,
          }}
        >
          Bartlett, TN
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 128,
            lineHeight: 1.05,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: -2,
          }}
        >
          River City
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 128,
            lineHeight: 1.05,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: -2,
          }}
        >
          Church
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 36,
            opacity: 0.95,
          }}
        >
          Sundays at 10:15 AM · 3871 Kirby Whitten Pkwy
        </div>
      </div>
    ),
    size,
  );
}
