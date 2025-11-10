import React from "react";

export function BrandLogo() {
  return (
    <div className="relative">
      <img src="/logo.svg" alt="XOver Logo" className="h-16 w-auto" />
    </div>
  );
}

export function StatusIndicator() {
  return (
    <div className="flex items-center gap-2">
      <style jsx>{`
        @keyframes colorBlink {
          0% {
            background-color: rgb(59, 130, 246);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.9);
            opacity: 1;
          }
          20% {
            background-color: rgb(59, 130, 246);
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
            opacity: 0.3;
          }
          25% {
            background-color: rgb(59, 130, 246);
            box-shadow: 0 0 0px rgba(59, 130, 246, 0);
            opacity: 0;
          }
          30% {
            background-color: rgb(239, 68, 68);
            box-shadow: 0 0 0px rgba(239, 68, 68, 0);
            opacity: 0;
          }
          35% {
            background-color: rgb(239, 68, 68);
            box-shadow: 0 0 5px rgba(239, 68, 68, 0.3);
            opacity: 0.3;
          }
          50% {
            background-color: rgb(239, 68, 68);
            box-shadow: 0 0 15px rgba(239, 68, 68, 0.9);
            opacity: 1;
          }
          70% {
            background-color: rgb(239, 68, 68);
            box-shadow: 0 0 5px rgba(239, 68, 68, 0.3);
            opacity: 0.3;
          }
          75% {
            background-color: rgb(239, 68, 68);
            box-shadow: 0 0 0px rgba(239, 68, 68, 0);
            opacity: 0;
          }
          80% {
            background-color: rgb(59, 130, 246);
            box-shadow: 0 0 0px rgba(59, 130, 246, 0);
            opacity: 0;
          }
          85% {
            background-color: rgb(59, 130, 246);
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
            opacity: 0.3;
          }
          100% {
            background-color: rgb(59, 130, 246);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.9);
            opacity: 1;
          }
        }
      `}</style>
      <div
        className="h-2 w-2 rounded-full"
        style={{
          animation: "colorBlink 4s ease-in-out infinite",
        }}
      ></div>
    </div>
  );
}

export function BrandHeader() {
  return (
    <div className="flex items-center justify-between gap-4">
      <BrandLogo />
      <StatusIndicator />
    </div>
  );
}
