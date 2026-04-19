import { Board, GameConfig } from "./types";

export function isSquare(board: Board): boolean {
  const rowCount = board.length;
  if (rowCount === 0) return true; // An empty board is considered square

  const colCount = board[0].length;
  if (colCount === 0) return true; // A board with empty rows is considered square

  return board.every((row) => row.length === colCount);
}

export function getNeighbors(
  board: Board,
  row: number,
  col: number,
  wrapAround: boolean = false,
): [row: number, col: number][] {
  const neighbors: [number, number][] = [];

  const size = board.length;
  const directions = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  for (const [dRow, dCol] of directions) {
    let newRow = row + dRow;
    let newCol = col + dCol;

    if (wrapAround) {
      newRow = (newRow + size) % size;
      newCol = (newCol + size) % size;
    }

    if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
      neighbors.push([newRow, newCol]);
    }
  }

  return neighbors;
}

export function getNextLetters(
  board: Board,
  neighbors: [number, number][],
  visited: Set<[number, number]>,
): string[] {
  const nextLetters: string[] = [];
  for (const [row, col] of neighbors) {
    if (!visited.has([row, col])) {
      nextLetters.push(board[row][col]);
    }
  }
  return nextLetters;
}

export function generateBoard(gameConfig: GameConfig): Board {
  const { boardSize, diceSet, diceReplace } = gameConfig;

  if (diceSet.length === 0) {
    throw new Error("Dice set cannot be empty");
  }

  const board: Board = [];
  const usedDiceIndices = new Set<number>();

  for (let row = 0; row < boardSize; row++) {
    const boardRow: string[] = [];
    for (let col = 0; col < boardSize; col++) {
      let dieIndex: number | undefined = undefined;
      const availableDiceCount = diceReplace
        ? diceSet.length
        : diceSet.length - usedDiceIndices.size;

      if (availableDiceCount === 0) {
        throw new Error(
          "Not enough dice to fill the board without replacement",
        );
      }

      const randomDiceAdjustment = Math.random() * availableDiceCount;
      let count = 0;
      for (let i = 0; i < diceSet.length; i++) {
        if (usedDiceIndices.has(i)) continue;
        if (count >= randomDiceAdjustment) {
          dieIndex = i;
          break;
        }
        count++;
      }

      if (dieIndex === undefined) {
        throw new Error("Failed to select a die");
      }

      const die = diceSet[dieIndex];
      const faceIndex = Math.floor(Math.random() * die.faces.length);
      boardRow.push(die.faces[faceIndex]);

      if (!diceReplace) {
        usedDiceIndices.add(dieIndex);
      }
    }
    board.push(boardRow);
  }

  return board;
}
