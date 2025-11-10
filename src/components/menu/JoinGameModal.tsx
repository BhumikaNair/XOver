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
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Game">
      <div className="space-y-4">
        <Input
          label="Session Code"
          placeholder="Enter 6-character code"
          value={joinCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onJoinCodeChange(e.target.value.toUpperCase())
          }
          maxLength={6}
          className="mb-2"
        />

        {error && <InlineAlert tone="error" message={error} />}

        <div className="flex gap-2">
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
