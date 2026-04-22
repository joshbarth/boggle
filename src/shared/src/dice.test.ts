import { describe, expect, it } from "vitest";
import { loadDiceSet, rollDie } from "./dice";

describe("rollDie", () => {
  it("returns one of the die's faces", () => {
    const die = { faces: ["A", "B", "C"] };
    const result = rollDie(die);
    expect(["A", "B", "C"]).toContain(result);
  });

  it("returns the only face when the die has one face", () => {
    const die = { faces: ["Z"] };
    expect(rollDie(die)).toBe("Z");
  });

  it("returns a value from a large face set", () => {
    const faces = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const die = { faces };
    for (let i = 0; i < 50; i++) {
      expect(faces).toContain(rollDie(die));
    }
  });
});

describe("loadDiceSet", () => {
  it("parses a single die from one line", () => {
    const result = loadDiceSet("A B C D E F");
    expect(result).toHaveLength(1);
    expect(result[0].faces).toEqual(["A", "B", "C", "D", "E", "F"]);
  });

  it("parses multiple dice from multiple lines", () => {
    const result = loadDiceSet("A B C\nD E F");
    expect(result).toHaveLength(2);
    expect(result[0].faces).toEqual(["A", "B", "C"]);
    expect(result[1].faces).toEqual(["D", "E", "F"]);
  });

  it("converts faces to uppercase", () => {
    const result = loadDiceSet("a b c");
    expect(result[0].faces).toEqual(["A", "B", "C"]);
  });

  it("handles Windows-style CRLF line endings", () => {
    const result = loadDiceSet("A B C\r\nD E F");
    expect(result).toHaveLength(2);
  });

  it("skips empty lines", () => {
    const result = loadDiceSet("A B C\n\nD E F\n");
    expect(result).toHaveLength(2);
  });

  it("returns an empty array for an empty string", () => {
    expect(loadDiceSet("")).toEqual([]);
  });

  it("handles extra whitespace between faces", () => {
    const result = loadDiceSet("A  B   C");
    expect(result[0].faces).toEqual(["A", "B", "C"]);
  });
});
