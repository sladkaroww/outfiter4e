import { ImageResponse } from "next/og";

export const alt = "outfiter. — Your style, your story.";
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
          padding: "90px",
          background: "#f6f3ee",
          color: "#171615",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 112, fontWeight: 700, letterSpacing: -5 }}>
          outfiter<span style={{ color: "#ec6f42" }}>.</span>
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 40, color: "#77736d" }}>
          Your style, your story.
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 26, color: "#77736d" }}>
          Share outfits · Keep a digital wardrobe
        </div>
      </div>
    ),
    size,
  );
}
