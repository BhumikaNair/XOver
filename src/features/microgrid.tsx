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
}

export function MicroGrid({
  index,
  microState,
  isActive,
  onCellClick,
  winner,
  disabled = false,
}: MicroGridProps) {
  return (
    <div
      className={`
        relative grid grid-cols-3 gap-1 p-2 rounded-lg transition-all duration-200
        ${
          isActive && !winner
            ? "bg-blue-100 ring-2 ring-blue-500"
            : "bg-gray-50"
        }
        ${winner ? "bg-gray-200" : ""}
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
            aspect-square flex items-center justify-center bg-white rounded
            transition-all duration-150 min-h-11 min-w-11
            ${
              !winner && !cell && !disabled
                ? "hover:bg-gray-100 cursor-pointer active:scale-95"
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
              className={`w-6 h-6 ${
                cell === "X" ? "text-blue-600" : "text-red-600"
              }`}
            />
          )}
        </button>
      ))}

      {winner && winner !== "draw" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Icon
            type={winner.toLowerCase() as "x" | "o"}
            className={`w-20 h-20 ${
              winner === "X" ? "text-blue-600" : "text-red-600"
            } opacity-80`}
          />
        </div>
      )}

      {winner === "draw" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-gray-400 opacity-80">-</span>
        </div>
      )}
    </div>
  );
}
