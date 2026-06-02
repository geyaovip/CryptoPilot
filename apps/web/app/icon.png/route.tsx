import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#FFFFFF",
          borderRadius: 18,
          color: "#111111",
          display: "flex",
          height: "64px",
          justifyContent: "center",
          width: "64px"
        }}
      >
        <svg height="64" viewBox="0 0 64 64" width="64">
          <path d="M30 10C18 10 10 18 10 30C10 42 18 50 30 50" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
          <path d="M30 30L48 23L41 41Z" fill="currentColor" />
        </svg>
      </div>
    ),
    {
      height: 64,
      width: 64
    }
  );
}
