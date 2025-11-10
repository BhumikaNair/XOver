import React from "react";
import { Button } from "@/features/ui";

interface Spinner {
  label?: string;
}

function Spinner({ label }: Spinner) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        className="h-4 w-4 animate-spin"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          opacity="0.2"
        />
        <path
          d="M22 12a10 10 0 0 1-10 10"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
        />
      </svg>
      {label ? <span className="text-sm">{label}</span> : null}
    </span>
  );
}

interface ModeButtonsProps {
  onLocalClick: () => void;
  onHostClick: () => void;
  onJoinClick: () => void;
  loading: null | "host" | "join";
}

export function ModeButtons({
  onLocalClick,
  onHostClick,
  onJoinClick,
  loading,
}: ModeButtonsProps) {
  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Button
        onClick={onLocalClick}
        className="group w-full py-4 text-base rounded-xl bg-linear-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-400 hover:to-blue-500 border-0 shadow-[0_10px_30px_rgba(0,200,255,0.25)]"
      >
        <span className="font-semibold">Local Play</span>
        <kbd className="ml-2 text-xs px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
          L
        </kbd>
      </Button>

      <Button
        onClick={onHostClick}
        disabled={loading === "host"}
        className="group w-full py-4 text-base rounded-xl bg-white/10 hover:bg-white/15 border border-white/15"
        variant="secondary"
      >
        {loading === "host" ? (
          <Spinner label="Creating…" />
        ) : (
          <span className="font-semibold">Host Online</span>
        )}
        <kbd className="ml-2 text-xs px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
          H
        </kbd>
      </Button>

      <Button
        onClick={onJoinClick}
        disabled={loading === "join"}
        className="group w-full py-4 text-base rounded-xl bg-white/10 hover:bg-white/15 border border-white/15"
        variant="secondary"
      >
        <span className="font-semibold">Join Online</span>
        <kbd className="ml-2 text-xs px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
          J
        </kbd>
      </Button>
    </div>
  );
}
