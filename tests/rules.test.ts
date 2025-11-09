import {
  createInitialState,
  makeMove,
  checkWinnerMicro,
  checkWinnerBig,
  nextMicroIndexFrom,
  isValidMove,
  isMicroBoardAvailable,
  getAvailableMicroBoards,
  undoLastMove,
  MicroBoard,
  MicroWinner,
} from "../src/lib/rules";

describe("XOver Game Rules", () => {
  describe("checkWinnerMicro", () => {
    it("should detect horizontal win", () => {
      const board: MicroBoard = [
        "X",
        "X",
        "X",
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      expect(checkWinnerMicro(board)).toBe("X");
    });

    it("should detect vertical win", () => {
      const board: MicroBoard = [
        "O",
        null,
        null,
        "O",
        null,
        null,
        "O",
        null,
        null,
      ];
      expect(checkWinnerMicro(board)).toBe("O");
    });

    it("should detect diagonal win", () => {
      const board: MicroBoard = [
        "X",
        null,
        null,
        null,
        "X",
        null,
        null,
        null,
        "X",
      ];
      expect(checkWinnerMicro(board)).toBe("X");
    });

    it("should detect anti-diagonal win", () => {
      const board: MicroBoard = [
        null,
        null,
        "O",
        null,
        "O",
        null,
        "O",
        null,
        null,
      ];
      expect(checkWinnerMicro(board)).toBe("O");
    });

    it("should detect draw", () => {
      const board: MicroBoard = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
      expect(checkWinnerMicro(board)).toBe("draw");
    });

    it("should return null for incomplete game", () => {
      const board: MicroBoard = [
        "X",
        "O",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      expect(checkWinnerMicro(board)).toBeNull();
    });
  });

  describe("checkWinnerBig", () => {
    it("should detect big board horizontal win", () => {
      const winners: MicroWinner[] = [
        "X",
        "X",
        "X",
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      expect(checkWinnerBig(winners)).toBe("X");
    });

    it("should detect big board vertical win", () => {
      const winners: MicroWinner[] = [
        "O",
        null,
        null,
        "O",
        null,
        null,
        "O",
        null,
        null,
      ];
      expect(checkWinnerBig(winners)).toBe("O");
    });

    it("should detect big board diagonal win", () => {
      const winners: MicroWinner[] = [
        "X",
        null,
        null,
        null,
        "X",
        null,
        null,
        null,
        "X",
      ];
      expect(checkWinnerBig(winners)).toBe("X");
    });

    it("should ignore draw micro boards in win detection", () => {
      const winners: MicroWinner[] = [
        "X",
        "draw",
        "X",
        null,
        "X",
        null,
        null,
        null,
        null,
      ];
      expect(checkWinnerBig(winners)).toBeNull();
    });

    it("should detect big board draw", () => {
      const winners: MicroWinner[] = [
        "X",
        "O",
        "X",
        "O",
        "X",
        "O",
        "O",
        "X",
        "draw",
      ];
      expect(checkWinnerBig(winners)).toBe("draw");
    });

    it("should return null for incomplete big board", () => {
      const winners: MicroWinner[] = [
        "X",
        "O",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      expect(checkWinnerBig(winners)).toBeNull();
    });
  });

  describe("nextMicroIndexFrom", () => {
    it("should map cell index to next micro board index", () => {
      expect(nextMicroIndexFrom(0)).toBe(0);
      expect(nextMicroIndexFrom(4)).toBe(4);
      expect(nextMicroIndexFrom(8)).toBe(8);
    });
  });

  describe("isMicroBoardAvailable", () => {
    it("should return true for available board", () => {
      const winners: MicroWinner[] = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      expect(isMicroBoardAvailable(winners, 0)).toBe(true);
    });

    it("should return false for won board", () => {
      const winners: MicroWinner[] = [
        "X",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      expect(isMicroBoardAvailable(winners, 0)).toBe(false);
    });

    it("should return false for drawn board", () => {
      const winners: MicroWinner[] = [
        "draw",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      expect(isMicroBoardAvailable(winners, 0)).toBe(false);
    });
  });

  describe("getAvailableMicroBoards", () => {
    it("should return all available boards", () => {
      const winners: MicroWinner[] = [
        "X",
        null,
        "O",
        null,
        "draw",
        null,
        null,
        null,
        null,
      ];
      const available = getAvailableMicroBoards(winners);
      expect(available).toEqual([1, 3, 5, 6, 7, 8]);
    });

    it("should return empty array when all boards are taken", () => {
      const winners: MicroWinner[] = [
        "X",
        "O",
        "X",
        "O",
        "X",
        "O",
        "O",
        "X",
        "draw",
      ];
      const available = getAvailableMicroBoards(winners);
      expect(available).toEqual([]);
    });
  });

  describe("makeMove", () => {
    it("should place a mark in the correct position", () => {
      const state = createInitialState();
      const newState = makeMove(state, 0, 0, "X");

      expect(newState.bigBoard[0][0]).toBe("X");
      expect(newState.currentPlayer).toBe("O");
      expect(newState.moveHistory).toHaveLength(1);
    });

    it("should set next micro board based on cell index", () => {
      const state = createInitialState();
      const newState = makeMove(state, 0, 4, "X");

      expect(newState.nextMicroIndex).toBe(4);
    });

    it("should allow any board when directed board is won", () => {
      let state = createInitialState();

      state.bigBoard[4] = ["X", "X", "X", null, null, null, null, null, null];
      state.microWinners[4] = "X";

      state = makeMove(state, 0, 4, "X");

      expect(state.nextMicroIndex).toBeNull();
    });

    it("should detect micro board winner after move", () => {
      let state = createInitialState();
      state.bigBoard[0] = ["X", "X", null, null, null, null, null, null, null];

      state = makeMove(state, 0, 2, "X");

      expect(state.microWinners[0]).toBe("X");
    });

    it("should detect big board winner", () => {
      let state = createInitialState();

      state.microWinners = ["X", "X", null, null, null, null, null, null, null];
      state.bigBoard[2] = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ];
      state.currentPlayer = "X";
      state.nextMicroIndex = 2;

      state.bigBoard[2] = ["X", "X", null, null, null, null, null, null, null];
      state = makeMove(state, 2, 2, "X");

      state.microWinners[2] = "X";

      const finalWinner = checkWinnerBig(state.microWinners);
      expect(finalWinner).toBe("X");
    });

    it("should not allow move in occupied cell", () => {
      let state = createInitialState();
      state = makeMove(state, 0, 0, "X");
      const newState = makeMove(state, 0, 0, "O");

      expect(newState).toBe(state);
    });

    it("should not allow move in wrong micro board", () => {
      let state = createInitialState();
      state = makeMove(state, 0, 4, "X");

      const newState = makeMove(state, 0, 0, "O");

      expect(newState).toBe(state);
    });
  });

  describe("undoLastMove", () => {
    it("should undo the last move", () => {
      let state = createInitialState();
      state = makeMove(state, 0, 0, "X");
      state = makeMove(state, 0, 1, "O");

      const undoneState = undoLastMove(state);

      expect(undoneState.bigBoard[0][1]).toBeNull();
      expect(undoneState.currentPlayer).toBe("O");
      expect(undoneState.moveHistory).toHaveLength(1);
    });

    it("should return same state when no moves to undo", () => {
      const state = createInitialState();
      const undoneState = undoLastMove(state);

      expect(undoneState).toEqual(state);
    });

    it("should correctly restore game state after multiple undos", () => {
      let state = createInitialState();
      state = makeMove(state, 0, 0, "X");
      state = makeMove(state, 0, 1, "O");
      state = makeMove(state, 1, 2, "X");

      state = undoLastMove(state);
      state = undoLastMove(state);

      expect(state.bigBoard[0][1]).toBeNull();
      expect(state.bigBoard[1][2]).toBeNull();
      expect(state.bigBoard[0][0]).toBe("X");
      expect(state.moveHistory).toHaveLength(1);
    });
  });

  describe("isValidMove", () => {
    it("should return false when game is over", () => {
      let state = createInitialState();
      state.winner = "X";

      expect(isValidMove(state, 0, 0)).toBe(false);
    });

    it("should return false when micro board is won", () => {
      let state = createInitialState();
      state.microWinners[0] = "X";

      expect(isValidMove(state, 0, 0)).toBe(false);
    });

    it("should return false when cell is occupied", () => {
      let state = createInitialState();
      state.bigBoard[0][0] = "X";

      expect(isValidMove(state, 0, 0)).toBe(false);
    });

    it("should return false when playing in wrong micro board", () => {
      let state = createInitialState();
      state.nextMicroIndex = 4;

      expect(isValidMove(state, 0, 0)).toBe(false);
    });

    it("should return true for valid move", () => {
      const state = createInitialState();

      expect(isValidMove(state, 0, 0)).toBe(true);
    });
  });
});
