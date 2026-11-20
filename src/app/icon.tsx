import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171615",
          color: "#ffffff",
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: -2,
        }}
      >
        o<span style={{ color: "#ec6f42" }}>.</span>
      </div>
    ),
    size,
  );
}
