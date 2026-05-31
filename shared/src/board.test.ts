import { describe, expect, it } from "vitest";
import { getNeighbors, getNextLetters, isSquare, isWordOnBoard } from "./board";

describe("isSquare", () => {
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
    const visited = new Set<string>();
    const result = getNextLetters(board, neighbors, visited);
    const entries = [...result.entries()].map(([[r, c], v]) => ({ r, c, v }));
    expect(entries).toEqual([
      { r: 0, c: 0, v: "A" },
      { r: 0, c: 1, v: "B" },
      { r: 1, c: 0, v: "C" },
    ]);
  });

  it("excludes visited cells", () => {
    const neighbors: [number, number][] = [
      [0, 0],
      [0, 1],
      [1, 0],
    ];
    const visited = new Set<string>([
      "0,0",
      "1,0",
    ]);
    const result = getNextLetters(board, neighbors, visited);
    const entries = [...result.entries()].map(([[r, c], v]) => ({ r, c, v }));
    expect(entries).toEqual([{ r: 0, c: 1, v: "B" }]);
  });

  it("returns an empty map when all neighbors are visited", () => {
    const neighbors: [number, number][] = [
      [0, 0],
      [0, 1],
    ];
    const visited = new Set<string>([
      "0,0",
      "0,1",
    ]);
    expect(getNextLetters(board, neighbors, visited).size).toBe(0);
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
