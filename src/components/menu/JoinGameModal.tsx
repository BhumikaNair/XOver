import React from "react";
import { Button, Input, Modal } from "@/features/ui";

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

function InlineAlert({
  tone,
  message,
  className,
}: {
  tone: "error" | "info" | "success";
  message: string;
  className?: string;
}) {
  const styles =
    tone === "error"
      ? "bg-red-500/10 text-red-300 border-red-500/30"
      : tone === "success"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
      : "bg-blue-500/10 text-blue-300 border-blue-500/30";
  return (
    <div
      className={`text-sm px-3 py-2 rounded-lg border ${styles} ${
        className ?? ""
      }`}
      role="alert"
    >
      {message}
    </div>
  );
}

interface JoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  joinCode: string;
  onJoinCodeChange: (code: string) => void;
  onJoin: () => void;
  error: string;
  loading: boolean;
}

export function JoinGameModal({
  isOpen,
  onClose,
  joinCode,
  onJoinCodeChange,
  onJoin,
  error,
  loading,
}: JoinGameModalProps) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.trim().toUpperCase().slice(0, 6);
      onJoinCodeChange(cleaned);
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  };

  const handleClear = () => {
    onJoinCodeChange("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Game">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Session Code
          </label>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/20 transition-all">
            <input
              type="text"
              placeholder="Enter 6-character code"
              value={joinCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onJoinCodeChange(e.target.value.toUpperCase())
              }
              maxLength={6}
              className="flex-1 px-4 py-2 bg-transparent border-0 focus:outline-none text-gray-100 placeholder:text-gray-500 min-h-11"
            />
            {joinCode.length > 0 ? (
              <button
                onClick={handleClear}
                className="px-3 py-2 hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors border-l border-white/10"
                title="Clear"
                type="button"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={handlePaste}
                className="px-3 py-2 hover:bg-white/10 text-gray-400 hover:text-cyan-300 transition-colors border-l border-white/10"
                title="Paste from clipboard"
                type="button"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 backdrop-blur-xl">
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-lg">⚠️</span>
              <div>
                <div className="text-red-300 font-semibold text-sm">Error</div>
                <div className="text-red-300/80 text-xs mt-0.5">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={onJoin}
            disabled={joinCode.length !== 6 || loading}
            className="flex-1"
          >
            {loading ? <Spinner label="Connecting…" /> : "Join"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
