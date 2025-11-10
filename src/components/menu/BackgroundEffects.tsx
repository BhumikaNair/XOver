import React from "react";

export function BackgroundEffects() {
  return (
    <>
      {/* Gradient overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(1000px 600px at 50% -20%, rgba(80,120,255,0.25), rgba(0,0,0,0)), radial-gradient(600px 600px at 120% 20%, rgba(0,255,200,0.2), rgba(0,0,0,0))",
        }}
      />

      {/* Grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(1200px 600px at 50% 0%, rgba(0,0,0,1), transparent)",
          WebkitMaskImage:
            "radial-gradient(1200px 600px at 50% 0%, rgba(0,0,0,1), transparent)",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px, 48px 48px",
          transform: "translateZ(0)",
        }}
      />
    </>
  );
}
