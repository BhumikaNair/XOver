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

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const signalingClient = useRef<SignalingClient | null>(null);
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const processedIceCandidates = useRef<Set<string>>(new Set());

  const myPlayer = mode === "local" ? null : isHost ? "X" : "O";

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
    if (mode === "local") {
      setGameState(undoLastMove(gameState));
    }
  };

  const handleNewGame = () => {
    setGameState(createInitialState());
    setError(null);
  };

  const handleResign = () => {
    if (onExit) {
      onExit();
    } else {
      handleNewGame();
    }
    setShowResignConfirm(false);
  };

  const canPlayInMicro = (microIndex: number): boolean => {
    if (gameState.winner) return false;
    if (gameState.microWinners[microIndex] !== null) return false;
    if (gameState.nextMicroIndex === null) return true;
    return gameState.nextMicroIndex === microIndex;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h1 className="text-3xl font-bold">XOver</h1>
            <div className="flex gap-2 items-center flex-wrap">
              {mode === "online" && sessionCode && (
                <div className="flex gap-2 items-center">
                  <SmallBadge
                    variant={connection === "connected" ? "success" : "warning"}
                  >
                    {connection === "connected"
                      ? "● Connected"
                      : "○ Connecting..."}
                  </SmallBadge>
                  <code className="px-3 py-1 bg-black text-white rounded font-mono text-sm">
                    {sessionCode}
                  </code>
                  <CopyButton text={sessionCode} label="Copy Code" />
                </div>
              )}
              <Button
                variant="ghost"
                onClick={() => setShowResignConfirm(true)}
              >
                Exit
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-lg font-medium">Turn:</span>
              <div className="flex items-center gap-2">
                <Icon
                  type={gameState.currentPlayer.toLowerCase() as "x" | "o"}
                  className={`w-8 h-8 ${
                    gameState.currentPlayer === "X"
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                />
                <span className="text-xl font-bold">
                  {gameState.currentPlayer}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {mode === "local" && (
                <Button
                  onClick={handleUndo}
                  disabled={gameState.moveHistory.length === 0}
                  variant="secondary"
                >
                  Undo
                </Button>
              )}
              <Button onClick={handleNewGame} variant="secondary">
                New Game
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {gameState.winner && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center">
              <span className="text-xl font-bold">
                {gameState.winner === "draw"
                  ? "It's a draw!"
                  : `Player ${gameState.winner} wins!`}
              </span>
            </div>
          )}
        </div>

        <div
          className="grid grid-cols-3 gap-3 max-w-2xl mx-auto bg-white p-4 rounded-xl shadow-lg"
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
            />
          ))}
        </div>

        {gameState.nextMicroIndex !== null && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Next move must be in board {gameState.nextMicroIndex + 1}
          </div>
        )}
      </div>

      <Modal
        isOpen={showResignConfirm}
        onClose={() => setShowResignConfirm(false)}
        title="Exit Game?"
      >
        <p className="mb-4">
          Are you sure you want to exit? The game progress will be lost.
        </p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="secondary"
            onClick={() => setShowResignConfirm(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleResign}>Exit</Button>
        </div>
      </Modal>
    </div>
  );
}
