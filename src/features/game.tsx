import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  GameState,
  Player,
  createInitialState,
  makeMove,
  undoLastMove,
  isValidMove,
} from "@/lib/rules";
import { MicroGrid } from "./microgrid";
import { Button, Icon, SmallBadge, CopyButton, Modal } from "./ui";
import { SignalingClient } from "./signaling";

interface GameMove {
  type: "move";
  microIndex: number;
  cellIndex: number;
  player: Player;
  timestamp: number;
}

interface GameProps {
  mode: "local" | "online";
  sessionCode?: string;
  isHost?: boolean;
  onExit?: () => void;
}

export function Game({ mode, sessionCode, isHost = false, onExit }: GameProps) {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [connection, setConnection] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [canUndo, setCanUndo] = useState(true); // Track if undo is available
  const [showWinModal, setShowWinModal] = useState(false);

  // Random player assignment for online mode
  const myPlayerRef = useRef<Player | null>(null);
  if (mode === "online" && myPlayerRef.current === null) {
    // Random assignment: 50% chance to be X or O regardless of host status
    myPlayerRef.current = Math.random() < 0.5 ? "X" : "O";
  }
  const myPlayer = mode === "local" ? null : myPlayerRef.current;

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const signalingClient = useRef<SignalingClient | null>(null);
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const processedIceCandidates = useRef<Set<string>>(new Set());

  const setupWebRTC = useCallback(async () => {
    if (mode !== "online" || !sessionCode) return;

    setConnection("connecting");
    signalingClient.current = new SignalingClient(sessionCode, isHost);

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    peerConnection.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && signalingClient.current) {
        signalingClient.current.sendIceCandidate(event.candidate.toJSON());
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setConnection("connected");
        setError(null);
      } else if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected"
      ) {
        setConnection("disconnected");
        setError("Connection lost. Please refresh to reconnect.");
      }
    };

    if (isHost) {
      const channel = pc.createDataChannel("game");
      dataChannel.current = channel;
      setupDataChannel(channel);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await signalingClient.current.sendOffer(offer);

      startPolling();
    } else {
      pc.ondatachannel = (event) => {
        dataChannel.current = event.channel;
        setupDataChannel(event.channel);
      };

      startPolling();
    }
  }, [mode, sessionCode, isHost]);

  const setupDataChannel = (channel: RTCDataChannel) => {
    channel.onopen = () => {
      setConnection("connected");
      setError(null);
    };

    channel.onclose = () => {
      setConnection("disconnected");
      setError("Connection closed.");
    };

    channel.onmessage = (event) => {
      try {
        const message: GameMove = JSON.parse(event.data);
        if (message.type === "move") {
          setGameState((prev: GameState) => {
            if (isValidMove(prev, message.microIndex, message.cellIndex)) {
              return makeMove(
                prev,
                message.microIndex,
                message.cellIndex,
                message.player
              );
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };
  };

  const startPolling = () => {
    if (pollingInterval.current) return;

    pollingInterval.current = setInterval(async () => {
      if (!signalingClient.current || !peerConnection.current) return;

      const sessionData = await signalingClient.current.pollMessages();
      if (!sessionData) return;

      const pc = peerConnection.current;

      if (isHost && sessionData.answer && !pc.remoteDescription) {
        const answer = new RTCSessionDescription({
          type: "answer",
          sdp: sessionData.answer.payload.sdp,
        });
        await pc.setRemoteDescription(answer);

        for (const ice of sessionData.joinerIce) {
          const candidateKey = JSON.stringify(ice.payload.candidate);
          if (!processedIceCandidates.current.has(candidateKey)) {
            await pc.addIceCandidate(
              new RTCIceCandidate(ice.payload.candidate)
            );
            processedIceCandidates.current.add(candidateKey);
          }
        }
      }

      if (!isHost && sessionData.offer && !pc.remoteDescription) {
        const offer = new RTCSessionDescription({
          type: "offer",
          sdp: sessionData.offer.payload.sdp,
        });
        await pc.setRemoteDescription(offer);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await signalingClient.current.sendAnswer(answer);

        for (const ice of sessionData.hostIce) {
          const candidateKey = JSON.stringify(ice.payload.candidate);
          if (!processedIceCandidates.current.has(candidateKey)) {
            await pc.addIceCandidate(
              new RTCIceCandidate(ice.payload.candidate)
            );
            processedIceCandidates.current.add(candidateKey);
          }
        }
      }

      if (pc.remoteDescription) {
        const iceCandidates = isHost
          ? sessionData.joinerIce
          : sessionData.hostIce;
        for (const ice of iceCandidates) {
          const candidateKey = JSON.stringify(ice.payload.candidate);
          if (!processedIceCandidates.current.has(candidateKey)) {
            await pc.addIceCandidate(
              new RTCIceCandidate(ice.payload.candidate)
            );
            processedIceCandidates.current.add(candidateKey);
          }
        }
      }
    }, 1000);
  };

  useEffect(() => {
    if (mode === "online") {
      setupWebRTC();
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
      if (dataChannel.current) {
        dataChannel.current.close();
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, [mode, setupWebRTC]);

  const handleCellClick = (microIndex: number, cellIndex: number) => {
    if (mode === "online" && connection !== "connected") {
      setError("Waiting for connection...");
      return;
    }

    if (mode === "online" && gameState.currentPlayer !== myPlayer) {
      setError("Not your turn!");
      setTimeout(() => setError(null), 2000);
      return;
    }

    if (!isValidMove(gameState, microIndex, cellIndex)) {
      setError("Invalid move!");
      setTimeout(() => setError(null), 2000);
      return;
    }

    const newState = makeMove(
      gameState,
      microIndex,
      cellIndex,
      gameState.currentPlayer
    );
    setGameState(newState);
    setCanUndo(true);

    // Check if this move resulted in a win and show modal
    if (newState.winner) {
      setShowWinModal(true);
    }

    if (mode === "online" && dataChannel.current?.readyState === "open") {
      const message: GameMove = {
        type: "move",
        microIndex,
        cellIndex,
        player: gameState.currentPlayer,
        timestamp: Date.now(),
      };
      dataChannel.current.send(JSON.stringify(message));
    }
  };

  const handleUndo = () => {
    if (mode === "local" && canUndo && gameState.moveHistory.length > 0) {
      setGameState(undoLastMove(gameState));
      setCanUndo(false);
    }
  };

  const handleNewGame = () => {
    setGameState(createInitialState());
    setError(null);
    setCanUndo(true);
    setShowWinModal(false);
  };

  const handleResign = () => {
    if (onExit) {
      onExit();
    } else {
      handleNewGame();
    }
    setShowResignConfirm(false);
  };

  const handleExitToHome = () => {
    setShowWinModal(false);
    if (onExit) {
      onExit();
    }
  };

  const canPlayInMicro = (microIndex: number): boolean => {
    if (gameState.winner) return false;
    if (gameState.microWinners[microIndex] !== null) return false;
    if (gameState.nextMicroIndex === null) return true;
    return gameState.nextMicroIndex === microIndex;
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0b0e14] text-gray-100 relative flex flex-col">
      {/* Background effects */}
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

      {/* Top Header - Logo Only */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <img src="/logo_2.svg" alt="XOver" className="h-12 w-auto" />
      </div>

      {/* Main Game Area - Centered */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-0 px-6 py-6">
        {/* Error Messages */}
        {error && (
          <div className="mb-2 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-lg backdrop-blur-xl max-w-md animate-pulse">
            {error}
          </div>
        )}

        {/* Turn Indicator - Centered Above Grid */}
        <div
          className={`mb-3 px-4 py-2 rounded-lg backdrop-blur-xl border transition-all duration-300 ${
            gameState.currentPlayer === "X"
              ? "bg-cyan-500/5 border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              : "bg-red-500/5 border-red-400/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Icon
              type={gameState.currentPlayer.toLowerCase() as "x" | "o"}
              className={`w-5 h-5 ${
                gameState.currentPlayer === "X"
                  ? "text-cyan-400"
                  : "text-red-400"
              }`}
            />
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-base font-semibold ${
                  gameState.currentPlayer === "X"
                    ? "text-cyan-300"
                    : "text-red-300"
                }`}
              >
                Player {gameState.currentPlayer}
              </span>
              {gameState.nextMicroIndex !== null && (
                <span className="text-base text-gray-400 font-normal">
                  • Board {gameState.nextMicroIndex + 1}
                </span>
              )}
              {gameState.nextMicroIndex === null && !gameState.winner && (
                <span className="text-base text-gray-400 font-normal">
                  • Any board
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div
          className={`grid grid-cols-3 gap-3 max-w-3xl w-full aspect-square p-5 rounded-3xl backdrop-blur-xl border-2 transition-all duration-300 shadow-2xl mb-6 ${
            gameState.currentPlayer === "X"
              ? "bg-cyan-500/5 border-cyan-400/30 shadow-[0_0_60px_rgba(6,182,212,0.25)]"
              : "bg-red-500/5 border-red-400/30 shadow-[0_0_60px_rgba(239,68,68,0.25)]"
          }`}
          role="grid"
          aria-label="Game board"
        >
          {gameState.bigBoard.map((microState, microIndex) => (
            <MicroGrid
              key={microIndex}
              index={microIndex}
              microState={microState}
              isActive={canPlayInMicro(microIndex)}
              onCellClick={(cellIndex) =>
                handleCellClick(microIndex, cellIndex)
              }
              winner={gameState.microWinners[microIndex]}
              disabled={
                !canPlayInMicro(microIndex) ||
                (mode === "online" && gameState.currentPlayer !== myPlayer)
              }
              currentPlayer={gameState.currentPlayer}
            />
          ))}
        </div>
      </div>

      {/* Fixed Control Buttons - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {mode === "local" && (
          <Button
            onClick={handleUndo}
            disabled={!canUndo || gameState.moveHistory.length === 0}
            variant="secondary"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-20 disabled:cursor-not-allowed backdrop-blur-xl transition-colors text-sm text-gray-300"
            title="Undo Last Move"
          >
            ↶ Undo
          </Button>
        )}
        <Button
          onClick={handleNewGame}
          variant="secondary"
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xl transition-colors text-sm text-gray-300"
          title="Start New Game"
        >
          ⟳ New
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowResignConfirm(true)}
          className="px-4 py-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-400/30 text-gray-400 hover:text-red-300 backdrop-blur-xl transition-colors text-sm"
          title="Exit Game"
        >
          Exit
        </Button>
      </div>

      {/* Connection UI - Bottom Left */}
      {mode === "online" && sessionCode && (
        <div className="fixed bottom-6 left-6 z-50 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-xl">
          <div className="space-y-3.5">
            {/* Player Identity */}
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg ${
                  myPlayer === "X"
                    ? "bg-cyan-500/10 border border-cyan-400/30"
                    : "bg-red-500/10 border border-red-400/30"
                }`}
              >
                <Icon
                  type={myPlayer?.toLowerCase() as "x" | "o"}
                  className={`w-5 h-5 ${
                    myPlayer === "X" ? "text-cyan-400" : "text-red-400"
                  }`}
                />
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                  You are
                </div>
                <span
                  className={`text-sm font-semibold ${
                    myPlayer === "X" ? "text-cyan-300" : "text-red-300"
                  }`}
                >
                  Player {myPlayer}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10"></div>

            {/* Connection Status */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 flex items-center justify-center">
                <SmallBadge
                  variant={connection === "connected" ? "success" : "warning"}
                >
                  {connection === "connected" ? "●" : "○"}
                </SmallBadge>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                  Status
                </div>
                <span className="text-xs text-gray-300 font-medium">
                  {connection === "connected"
                    ? "Connected"
                    : connection === "connecting"
                    ? "Connecting..."
                    : "Disconnected"}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10"></div>

            {/* Session Code */}
            <div>
              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide mb-1.5">
                Session Code
              </div>
              <div className="flex items-center bg-white/10 border border-white/10 rounded-lg overflow-hidden">
                <code className="flex-1 px-2.5 py-1.5 text-cyan-300 text-xs font-mono">
                  {sessionCode}
                </code>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(sessionCode);
                    } catch (err) {
                      console.error("Failed to copy:", err);
                    }
                  }}
                  className="px-2.5 py-1.5 hover:bg-white/10 text-gray-400 hover:text-cyan-300 transition-colors border-l border-white/10"
                  title="Copy to clipboard"
                >
                  ⧉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showResignConfirm}
        onClose={() => setShowResignConfirm(false)}
        title="Exit Game?"
      >
        <p className="mb-6 text-gray-300">
          Are you sure you want to exit? The game progress will be lost.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setShowResignConfirm(false)}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 backdrop-blur-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleResign}
            className="px-5 py-2.5 bg-linear-to-r from-red-500/80 to-red-600/80 hover:from-red-400 hover:to-red-500 border-0 text-white shadow-lg"
          >
            Exit Game
          </Button>
        </div>
      </Modal>

      {/* Win Modal */}
      <Modal
        isOpen={showWinModal}
        onClose={() => setShowWinModal(false)}
        title={
          gameState.winner === "draw"
            ? "🤝 It's a Draw!"
            : `🏆 Player ${gameState.winner} Wins!`
        }
      >
        <div className="text-center mb-8">
          {gameState.winner === "draw" ? (
            <p className="text-gray-300 text-lg">
              The game ended in a draw. Well played!
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <Icon
                  type={gameState.winner?.toLowerCase() as "x" | "o"}
                  className={`w-16 h-16 ${
                    gameState.winner === "X" ? "text-cyan-400" : "text-red-400"
                  }`}
                />
              </div>
              <p className="text-gray-300 text-lg">
                Congratulations!{" "}
                <span
                  className={`font-bold ${
                    gameState.winner === "X" ? "text-cyan-300" : "text-red-300"
                  }`}
                >
                  Player {gameState.winner}
                </span>{" "}
                has won the game!
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={handleNewGame}
            className="px-6 py-3 bg-linear-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-400/30 text-cyan-300 backdrop-blur-xl transition-colors"
          >
            <span className="font-semibold">⟳ New Game</span>
          </Button>
          <Button
            variant="secondary"
            onClick={handleExitToHome}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 backdrop-blur-xl transition-colors"
          >
            <span className="font-semibold">← Exit to Home</span>
          </Button>
        </div>
      </Modal>
    </div>
  );
}
