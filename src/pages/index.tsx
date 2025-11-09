import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button, Input, Modal } from "@/features/ui";
import { generateSessionCode } from "@/features/signaling";
import { Game } from "@/features/game";

type Mode = "menu" | "local" | "host" | "join";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("menu");
  const [sessionCode, setSessionCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [error, setError] = useState("");

  const handleHostGame = async () => {
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
        setError("Failed to create session. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleJoinGame = async () => {
    const code = joinCode.trim().toUpperCase();

    if (code.length !== 6) {
      setError("Session code must be 6 characters");
      return;
    }

    try {
      const response = await fetch(`/api/signaling/${code}`);

      if (response.ok) {
        setSessionCode(code);
        setMode("join");
        setShowJoinModal(false);
      } else {
        setError("Session not found. Please check the code.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  const handleBackToMenu = () => {
    setMode("menu");
    setSessionCode("");
    setJoinCode("");
    setError("");
  };

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

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">XOver</h1>
          <p className="text-gray-600 text-lg">Ultimate Tic-Tac-Toe</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-4">
          <h2 className="text-2xl font-bold mb-6">Choose Mode</h2>

          <Button
            onClick={() => setMode("local")}
            className="w-full text-lg py-4"
          >
            Local Play
          </Button>

          <Button
            onClick={handleHostGame}
            className="w-full text-lg py-4"
            variant="secondary"
          >
            Host Online Game
          </Button>

          <Button
            onClick={() => setShowJoinModal(true)}
            className="w-full text-lg py-4"
            variant="secondary"
          >
            Join Online Game
          </Button>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>A two-player strategy game</p>
        </div>
      </div>

      <Modal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setError("");
        }}
        title="Join Game"
      >
        <Input
          label="Session Code"
          placeholder="Enter 6-character code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="mb-4"
        />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm mb-4">
            {error}
          </div>
        )}

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
            disabled={joinCode.length !== 6}
            className="flex-1"
          >
            Join
          </Button>
        </div>
      </Modal>
    </div>
  );
}
