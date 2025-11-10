import React from "react";
import { MicroBoard, MicroWinner, Player } from "@/lib/rules";
import { Icon } from "./ui";

interface MicroGridProps {
  index: number;
  microState: MicroBoard;
  isActive: boolean;
  onCellClick: (cellIndex: number) => void;
  winner: MicroWinner;
  disabled?: boolean;
  currentPlayer?: Player;
}

export function MicroGrid({
  index,
  microState,
  isActive,
  onCellClick,
  winner,
  disabled = false,
  currentPlayer,
}: MicroGridProps) {
  const isXTurn = currentPlayer === "X";

  return (
    <div
      className={`
        relative grid grid-cols-3 gap-0.5 sm:gap-1 p-1 sm:p-2 rounded-md sm:rounded-lg transition-all duration-200
        ${
          isActive && !winner
            ? isXTurn
              ? "bg-cyan-500/10 ring-1 sm:ring-2 ring-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              : "bg-red-500/10 ring-1 sm:ring-2 ring-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            : "bg-white/5"
        }
        ${winner ? "bg-white/10" : ""}
      `}
      role="grid"
      aria-label={`Micro board ${index + 1}`}
    >
      {microState.map((cell, cellIndex) => (
        <button
          key={cellIndex}
          onClick={() => !disabled && !winner && onCellClick(cellIndex)}
          disabled={disabled || !!winner || !!cell}
          className={`
            aspect-square flex items-center justify-center bg-white/10 rounded border border-white/10
            transition-all duration-150
            ${
              !winner && !cell && !disabled
                ? "hover:bg-white/20 cursor-pointer active:scale-95"
                : ""
            }
            ${cell ? "cursor-not-allowed" : ""}
            ${disabled || winner ? "opacity-50" : ""}
          `}
          aria-label={`Cell ${cellIndex + 1} in micro board ${index + 1}`}
        >
          {cell && (
            <Icon
              type={cell.toLowerCase() as "x" | "o"}
              className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${
                cell === "X" ? "text-cyan-400" : "text-red-400"
              }`}
            />
          )}
        </button>
      ))}

      {winner && winner !== "draw" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Icon
            type={winner.toLowerCase() as "x" | "o"}
            className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 ${
              winner === "X" ? "text-cyan-400" : "text-red-400"
            } opacity-80`}
          />
        </div>
      )}

      {winner === "draw" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-400 opacity-80">
            -
          </span>
        </div>
      )}
    </div>
  );
}
