import { describe, expect, it } from "vitest";
import { generateBoard, getNeighbors, getNextLetters, isSquare, isWordOnBoard } from "./board";
import { GameConfig } from "./types";

// Minimal GameConfig for generateBoard tests
const baseConfig: GameConfig = {
  boardSize: 4,
  diceSet: Array.from({ length: 16 }, () => ({ faces: ["A", "B", "C"] })),
  diceReplace: false,
  minWordLength: 3,
  wrapAround: false,
  wordList: new Set(),
  immediatelyRejectInvalidWords: false,
  timeLimitSeconds: 120,
  scoreStrategy: { calculateScore: () => 1 },
  invalidWordPenalty: 0,
  wordOwnershipRule: "first",
  minPlayers: 2,
  canJoinInProgress: false,
};

describe("isSquare", () => {
  it("returns true for an empty board", () => {
    expect(isSquare([])).toBe(true);
  });

  it("returns true for a square board", () => {
    expect(
      isSquare([
        ["A", "B"],
        ["C", "D"],
      ]),
    ).toBe(true);
  });

  it("returns false for a non-square board", () => {
    expect(
      isSquare([
        ["A", "B", "C"],
        ["D", "E"],
      ]),
    ).toBe(false);
  });

  it("returns true for a board with all empty rows", () => {
    expect(isSquare([[], []])).toBe(true);
  });
});

describe("getNeighbors", () => {
  const board = [
    ["A", "B", "C"],
    ["D", "E", "F"],
    ["G", "H", "I"],
  ];

  it("returns 8 neighbors for a center cell", () => {
    expect(getNeighbors(board, 1, 1)).toHaveLength(8);
  });

  it("returns 3 neighbors for a corner cell", () => {
    expect(getNeighbors(board, 0, 0)).toHaveLength(3);
  });

  it("returns 5 neighbors for an edge cell", () => {
    expect(getNeighbors(board, 0, 1)).toHaveLength(5);
  });

  it("returns 8 neighbors for a corner cell when wrapAround is true", () => {
    expect(getNeighbors(board, 0, 0, true)).toHaveLength(8);
  });

  it("returns correct neighbor coordinates for top-left corner", () => {
    const neighbors = getNeighbors(board, 0, 0);
    expect(neighbors).toEqual(
      expect.arrayContaining([
        [0, 1],
        [1, 0],
        [1, 1],
      ]),
    );
    expect(neighbors).toHaveLength(3);
  });
});

describe("getNextLetters", () => {
  const board = [
    ["A", "B"],
    ["C", "D"],
  ];

  it("returns letters for all unvisited neighbors", () => {
    const neighbors: [number, number][] = [
      [0, 0],
      [0, 1],
      [1, 0],
    ];
    const visited = new Set<[number, number]>();
    const result = getNextLetters(board, neighbors, visited);
    const entries = [...result.entries()].map(([[r, c], v]) => ({ r, c, v }));
    expect(entries).toEqual([
      { r: 0, c: 0, v: ["A"] },
      { r: 0, c: 1, v: ["B"] },
      { r: 1, c: 0, v: ["C"] },
    ]);
  });

  it("excludes visited cells", () => {
    const neighbors: [number, number][] = [
      [0, 0],
      [0, 1],
      [1, 0],
    ];
    const visited = new Set<[number, number]>([
      [0, 0],
      [1, 0],
    ]);
    const result = getNextLetters(board, neighbors, visited);
    const entries = [...result.entries()].map(([[r, c], v]) => ({ r, c, v }));
    expect(entries).toEqual([{ r: 0, c: 1, v: ["B"] }]);
  });

  it("returns an empty map when all neighbors are visited", () => {
    const neighbors: [number, number][] = [
      [0, 0],
      [0, 1],
    ];
    const visited = new Set<[number, number]>([
      [0, 0],
      [0, 1],
    ]);
    expect(getNextLetters(board, neighbors, visited).size).toBe(0);
  });
});

describe("generateBoard", () => {
  it("generates a board with the correct dimensions", () => {
    const board = generateBoard(baseConfig);
    expect(board).toHaveLength(4);
    board.forEach((row) => expect(row).toHaveLength(4));
  });

  it("only uses letters from the dice faces", () => {
    const board = generateBoard(baseConfig);
    board.flat().forEach((letter) => expect(["A", "B", "C"]).toContain(letter));
  });

  it("throws when the dice set is empty", () => {
    const config = { ...baseConfig, diceSet: [] };
    expect(() => generateBoard(config)).toThrow("Dice set cannot be empty");
  });

  it("throws when there are not enough dice to fill the board without replacement", () => {
    const config = {
      ...baseConfig,
      diceSet: [{ faces: ["A"] }],
      diceReplace: false,
    };
    expect(() => generateBoard(config)).toThrow("Not enough dice");
  });

  it("succeeds with a single die when diceReplace is true", () => {
    const config = {
      ...baseConfig,
      diceSet: [{ faces: ["A"] }],
      diceReplace: true,
    };
    const board = generateBoard(config);
    expect(board.flat()).toHaveLength(16);
    expect(board.flat().every((l) => l === "A")).toBe(true);
  });
});

describe("isWordOnBoard", () => {
  const board = [
    ["C", "A", "T"],
    ["D", "O", "G"],
    ["B", "I", "R"],
  ];

  it("finds a word that exists on the board", () => {
    const [found, path] = isWordOnBoard(board, "CAT");
    expect(found).toBe(true);
    expect(path).toHaveLength(3);
  });

  it("returns false for a word not on the board", () => {
    const [found] = isWordOnBoard(board, "ZZZ");
    expect(found).toBe(false);
  });

  it("returns false when the word requires reusing a cell", () => {
    const [found] = isWordOnBoard(board, "CATA");
    expect(found).toBe(false);
  });

  it("returns the longest matching prefix path when word is not found", () => {
    const [found, path] = isWordOnBoard(board, "CATS");
    expect(found).toBe(false);
    expect(path.length).toBeGreaterThan(0);
  });

  it("returns empty path when no prefix matches", () => {
    const [found, path] = isWordOnBoard(board, "ZZZ");
    expect(found).toBe(false);
    expect(path).toHaveLength(0);
  });

  it("finds a word using wrap-around", () => {
    const wrapBoard = [
      ["A", "B"],
      ["C", "D"],
    ];
    // D is at (1,1), A is at (0,0) — not adjacent normally, but adjacent with wrap-around
    const [found] = isWordOnBoard(wrapBoard, "DA", true);
    expect(found).toBe(true);
  });

  it("does not find a word requiring non-adjacent cells when wrapAround is false", () => {
    // D at (2,2) and A at (0,0) are not adjacent on a 3x3 board
    const sparse = [
      ["A", "X", "X"],
      ["X", "X", "X"],
      ["X", "X", "D"],
    ];
    const [found] = isWordOnBoard(sparse, "DA", false);
    expect(found).toBe(false);
  });
});
