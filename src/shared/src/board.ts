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
): Map<[number, number], string[]> {
  const nextLetters: Map<[number, number], string[]> = new Map();
  const visitedSet = new Set<string>();
  for (const [row, col] of visited) {
    visitedSet.add(`${row},${col}`);
  }
  for (const [row, col] of neighbors) {
    if (!visitedSet.has(`${row},${col}`)) {
      nextLetters.set([row, col], [board[row][col]]);
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

      const randomDiceAdjustment = Math.floor(
        Math.random() * availableDiceCount,
      );
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

// Returns whether the word can be formed on the board, adn the path of coordinates for the word
// If the word is not found, returns the longest prefix path found (which may be empty)
export function isWordOnBoard(
  board: Board,
  word: string,
  wrapAround: boolean = false,
): [boolean, [number, number][]] {
  const size = board.length;
  const wordLength = word.length;

  function dfs(
    row: number,
    col: number,
    index: number,
    visited: Set<string>,
  ): [boolean, [number, number][]] {
    if (board[row][col] !== word[index]) {
      return [false, []];
    }

    const newVisited = new Set(visited);
    newVisited.add(`${row},${col}`);

    if (index === wordLength - 1) {
      return [true, [[row, col]]];
    }

    const neighbors = getNeighbors(board, row, col, wrapAround);
    for (const [nRow, nCol] of neighbors) {
      if (newVisited.has(`${nRow},${nCol}`)) continue;
      const [found, path] = dfs(nRow, nCol, index + 1, newVisited);
      if (found) {
        return [true, [[row, col], ...path]];
      }
    }

    return [false, [[row, col]]];
  }

  const potentialPaths: [number, number][][] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const [found, path] = dfs(row, col, 0, new Set());
      if (found) {
        return [true, path];
      }
      if (path.length > 0) {
        potentialPaths.push(path);
      }
    }
  }

  const longestPath = potentialPaths.reduce(
    (longest, current) => (current.length > longest.length ? current : longest),
    [],
  );
  return [false, longestPath];
}
