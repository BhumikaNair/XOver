import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { generateSessionCode } from "@/features/signaling";
import { Game } from "@/features/game";
import { Card } from "@/components/common/Card";
import { InlineAlert } from "@/components/common/InlineAlert";
import { BrandHeader } from "@/components/menu/BrandHeader";
import { ModeButtons } from "@/components/menu/ModeButtons";
import { HowToPlaySection } from "@/components/menu/HowToPlaySection";
import { GameRulesSection } from "@/components/menu/GameRulesSection";
import { JoinGameModal } from "@/components/menu/JoinGameModal";
import { BackgroundEffects } from "@/components/menu/BackgroundEffects";

type Mode = "menu" | "local" | "host" | "join";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("menu");
  const [sessionCode, setSessionCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<null | "host" | "join">(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (mode !== "menu") return;
      if (e.key.toLowerCase() === "l") setMode("local");
      if (e.key.toLowerCase() === "h") handleHostGame();
      if (e.key.toLowerCase() === "j") setShowJoinModal(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, joinCode]);

  const handleHostGame = async () => {
    setError("");
    setLoading("host");
    const code = generateSessionCode();

    try {
      const response = await fetch(`/api/signaling/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "create" }),
      });

      if (response.ok) {
        setSessionCode(code);
        setMode("host");
      } else {
        setError("Failed to create session. Try again.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleJoinGame = async () => {
    setError("");
    setLoading("join");
    const code = joinCode.trim().toUpperCase();

    if (code.length !== 6) {
      setError("Session code must be 6 characters");
      setLoading(null);
      return;
    }

    try {
      const response = await fetch(`/api/signaling/${code}`);

      if (response.ok) {
        setSessionCode(code);
        setMode("join");
        setShowJoinModal(false);
      } else {
        setError("Session not found. Check the code.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleBackToMenu = () => {
    setMode("menu");
    setSessionCode("");
    setJoinCode("");
    setError("");
    setLoading(null);
  };

  // Routed game modes
  if (mode === "local") {
    return <Game mode="local" onExit={handleBackToMenu} />;
  }
  if (mode === "host") {
    return (
      <Game
        mode="online"
        sessionCode={sessionCode}
        isHost={true}
        onExit={handleBackToMenu}
      />
    );
  }
  if (mode === "join") {
    return (
      <Game
        mode="online"
        sessionCode={sessionCode}
        isHost={false}
        onExit={handleBackToMenu}
      />
    );
  }

  // ----- MENU -----
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b0e14] text-gray-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(1000px 600px at 50% -20%, rgba(80,120,255,0.25), rgba(0,0,0,0)), radial-gradient(600px 600px at 120% 20%, rgba(0,255,200,0.2), rgba(0,0,0,0))",
        }}
      />
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

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <Card className="p-6 lg:p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_rgba(0,255,200,0.05)]">
              <div className="flex items-center justify-between gap-4">
                <BrandLogo />
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
              </div>

              <p className="mt-3 text-sm tracking-widest text-gray-400">
                Tic it, tack it, make ‘em pack it!
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  onClick={() => setMode("local")}
                  className="group w-full py-4 text-base rounded-xl bg-linear-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-400 hover:to-blue-500 border-0 shadow-[0_10px_30px_rgba(0,200,255,0.25)]"
                >
                  <span className="font-semibold">Local Play</span>
                  <kbd className="ml-2 text-xs px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                    L
                  </kbd>
                </Button>

                <Button
                  onClick={handleHostGame}
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
                  onClick={() => setShowJoinModal(true)}
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

              {error && (
                <InlineAlert tone="error" message={error} className="mt-4" />
              )}
            </Card>

            {/* How to Play Online */}
            <Card className="p-5 bg-white/5 backdrop-blur-xl border border-white/10">
              <h3 className="text-lg font-semibold tracking-wide text-gray-200">
                How to Play Online
              </h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <h4 className="text-sm font-semibold text-cyan-300 mb-1.5">
                    Host
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Press H or Host to create and share game code.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <h4 className="text-sm font-semibold text-cyan-300 mb-1.5">
                    Join
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Press J or Join to enter code and connect
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <h4 className="text-sm font-semibold text-cyan-300 mb-1.5">
                    Local
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Press L for two-player mode on the same device.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">
                  Keyboard Shortcuts
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <ControlHint keys={["L"]} label="Local" />
                  <ControlHint keys={["H"]} label="Host" />
                  <ControlHint keys={["J"]} label="Join" />
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <ControlHint keys={["Esc"]} label="Close dialogs" />
                  <ControlHint keys={["Enter"]} label="Confirm box" />
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Game Rules */}
          <Card className="p-6 lg:p-7 bg-white/5 backdrop-blur-xl border border-white/10 h-full">
            <h2 className="text-xl font-semibold tracking-wide text-gray-200">
              Game Rules
            </h2>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-cyan-300 mb-1">
                  The Board
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  A 3×3 grid of smaller 3×3 grids. Win small boards to claim
                  them, then align three claimed boards to win the game.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-cyan-300 mb-1">
                  Making Moves
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your move in a small board determines which small board your
                  opponent plays next. If sent to a completed board, they may
                  play anywhere.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-cyan-300 mb-1">
                  Winning
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Get three in a row on small boards to win them. Get three won
                  boards in a row (horizontally, vertically, or diagonally) to
                  win the game.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-semibold text-cyan-300 mb-1">
                  Strategy Tip
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Think ahead! Each move controls where your opponent plays
                  next. Force them into difficult positions while setting up
                  your own wins.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Join Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setError("");
        }}
        title="Join Game"
      >
        <div className="space-y-4">
          <Input
            label="Session Code"
            placeholder="Enter 6-character code"
            value={joinCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setJoinCode(e.target.value.toUpperCase())
            }
            maxLength={6}
            className="mb-2"
          />

          {error && <InlineAlert tone="error" message={error} />}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowJoinModal(false);
                setError("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinGame}
              disabled={joinCode.length !== 6 || loading === "join"}
              className="flex-1"
            >
              {loading === "join" ? <Spinner label="Connecting…" /> : "Join"}
            </Button>
          </div>

          <p className="text-[11px] text-gray-500">
            Tip: Use Enter to submit. Esc to close.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function Card({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={
        "rounded-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_40px_120px_-40px_rgba(0,0,0,0.6)] " +
        (className ?? "")
      }
    >
      {children}
    </div>
  );
}

function BrandLogo() {
  return (
    <div className="relative">
      <img src="/logo.svg" alt="XOver Logo" className="h-16 w-auto" />
    </div>
  );
}

function ControlHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs text-gray-400">
      <div className="inline-flex items-center gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="px-1.5 py-0.5 rounded border border-white/10 bg-black/40 text-gray-200"
          >
            {k}
          </kbd>
        ))}
      </div>
      <span className="text-gray-500">=</span>
      <span>{label}</span>
    </div>
  );
}

function TipCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold text-gray-200">{title}</div>
      <div className="mt-1 text-xs text-gray-400">{body}</div>
    </div>
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

function Spinner({ label }: { label?: string }) {
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
