import { describe, expect, it } from "vitest";
import { generateBoard, getNeighbors, getNextLetters, isSquare } from "./board";
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
    expect(getNextLetters(board, neighbors, visited)).toEqual(["A", "B", "C"]);
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
    expect(getNextLetters(board, neighbors, visited)).toEqual(["B"]);
  });

  it("returns empty array when all neighbors are visited", () => {
    const neighbors: [number, number][] = [
      [0, 0],
      [0, 1],
    ];
    const visited = new Set<[number, number]>([
      [0, 0],
      [0, 1],
    ]);
    expect(getNextLetters(board, neighbors, visited)).toEqual([]);
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
