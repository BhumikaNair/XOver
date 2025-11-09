export type Player = "X" | "O";
export type CellState = Player | null;
export type MicroBoard = CellState[];
export type BigBoard = MicroBoard[];
export type MicroWinner = Player | "draw" | null;

export interface GameState {
  bigBoard: BigBoard;
  microWinners: MicroWinner[];
  currentPlayer: Player;
  nextMicroIndex: number | null;
  moveHistory: Array<{ microIndex: number; cellIndex: number; player: Player }>;
  winner: Player | "draw" | null;
}

export function createInitialState(): GameState {
  return {
    bigBoard: Array(9)
      .fill(null)
      .map(() => Array(9).fill(null)),
    microWinners: Array(9).fill(null),
    currentPlayer: "X",
    nextMicroIndex: null,
    moveHistory: [],
    winner: null,
  };
}

export function checkWinnerMicro(microBoard: MicroBoard): MicroWinner {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (
      microBoard[a] &&
      microBoard[a] === microBoard[b] &&
      microBoard[a] === microBoard[c]
    ) {
      return microBoard[a] as Player;
    }
  }

  if (microBoard.every((cell) => cell !== null)) {
    return "draw";
  }

  return null;
}

export function checkWinnerBig(
  microWinners: MicroWinner[]
): Player | "draw" | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (
      microWinners[a] &&
      microWinners[a] !== "draw" &&
      microWinners[a] === microWinners[b] &&
      microWinners[a] === microWinners[c]
    ) {
      return microWinners[a] as Player;
    }
  }

  if (microWinners.every((w) => w !== null)) {
    return "draw";
  }

  return null;
}

export function nextMicroIndexFrom(cellIndex: number): number {
  return cellIndex;
}

export function isMicroBoardAvailable(
  microWinners: MicroWinner[],
  microIndex: number
): boolean {
  return microWinners[microIndex] === null;
}

export function getAvailableMicroBoards(microWinners: MicroWinner[]): number[] {
  return microWinners
    .map((winner, index) => (winner === null ? index : -1))
    .filter((index) => index !== -1);
}

export function isValidMove(
  state: GameState,
  microIndex: number,
  cellIndex: number
): boolean {
  if (state.winner !== null) return false;

  if (!isMicroBoardAvailable(state.microWinners, microIndex)) return false;

  if (state.bigBoard[microIndex][cellIndex] !== null) return false;

  if (state.nextMicroIndex !== null && state.nextMicroIndex !== microIndex) {
    return false;
  }

  return true;
}

export function makeMove(
  state: GameState,
  microIndex: number,
  cellIndex: number,
  player: Player
): GameState {
  if (!isValidMove(state, microIndex, cellIndex)) {
    return state;
  }

  const newBigBoard = state.bigBoard.map((micro, i) =>
    i === microIndex
      ? micro.map((cell, j) => (j === cellIndex ? player : cell))
      : [...micro]
  );

  const newMicroWinners = [...state.microWinners];
  newMicroWinners[microIndex] = checkWinnerMicro(newBigBoard[microIndex]);

  const newWinner = checkWinnerBig(newMicroWinners);

  let nextMicro: number | null = nextMicroIndexFrom(cellIndex);
  if (!isMicroBoardAvailable(newMicroWinners, nextMicro)) {
    const available = getAvailableMicroBoards(newMicroWinners);
    nextMicro = available.length > 0 ? null : null;
  }

  return {
    bigBoard: newBigBoard,
    microWinners: newMicroWinners,
    currentPlayer: player === "X" ? "O" : "X",
    nextMicroIndex: newWinner ? null : nextMicro,
    moveHistory: [...state.moveHistory, { microIndex, cellIndex, player }],
    winner: newWinner,
  };
}

export function undoLastMove(state: GameState): GameState {
  if (state.moveHistory.length === 0) return state;

  const newHistory = state.moveHistory.slice(0, -1);
  let newState = createInitialState();

  for (const move of newHistory) {
    newState = makeMove(newState, move.microIndex, move.cellIndex, move.player);
  }

  return newState;
}
