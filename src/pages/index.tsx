import React, { useEffect, useState } from "react";
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
      <BackgroundEffects />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <Card className="p-6 lg:p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_rgba(0,255,200,0.05)]">
              <BrandHeader />

              <p className="mt-3 text-sm tracking-widest text-gray-400">
                Tic it, tack it, make 'em pack it!
              </p>

              <ModeButtons
                onLocalClick={() => setMode("local")}
                onHostClick={handleHostGame}
                onJoinClick={() => setShowJoinModal(true)}
                loading={loading}
              />

              {error && (
                <InlineAlert tone="error" message={error} className="mt-4" />
              )}
            </Card>

            <Card className="p-5 bg-white/5 backdrop-blur-xl border border-white/10">
              <HowToPlaySection />
            </Card>
          </div>

          <Card className="p-6 lg:p-7 bg-white/5 backdrop-blur-xl border border-white/10 h-full">
            <GameRulesSection />
          </Card>
        </div>
      </div>

      <JoinGameModal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setError("");
        }}
        joinCode={joinCode}
        onJoinCodeChange={setJoinCode}
        onJoin={handleJoinGame}
        error={error}
        loading={loading === "join"}
      />
    </div>
  );
}
