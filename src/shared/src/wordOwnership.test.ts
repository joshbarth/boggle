import { describe, expect, it } from "vitest";
import { determineWordOwners } from "./wordOwnership";
import { FoundWord } from "./types";

describe("determineWordOwners", () => {
  describe('"first" rule', () => {
    it("gives word to the first player who found it", () => {
      const words: FoundWord[] = [
        { word: "CAT", playerId: "p1", foundTime: 1000 },
        { word: "CAT", playerId: "p2", foundTime: 2000 },
      ];
      const result = determineWordOwners(words, "first");
      expect(result.get("p1")).toContain("CAT");
      expect(result.get("p2")).not.toContain("CAT");
    });

    it("assigns different words to different players", () => {
      const words: FoundWord[] = [
        { word: "CAT", playerId: "p1", foundTime: 1000 },
        { word: "DOG", playerId: "p2", foundTime: 2000 },
      ];
      const result = determineWordOwners(words, "first");
      expect(result.get("p1")).toContain("CAT");
      expect(result.get("p2")).toContain("DOG");
    });

    it("handles a single player finding multiple words", () => {
      const words: FoundWord[] = [
        { word: "CAT", playerId: "p1", foundTime: 1000 },
        { word: "DOG", playerId: "p1", foundTime: 2000 },
      ];
      const result = determineWordOwners(words, "first");
      expect(result.get("p1")).toContain("CAT");
      expect(result.get("p1")).toContain("DOG");
    });

    it("returns empty sets when no words are found", () => {
      const result = determineWordOwners([], "first");
      expect(result.size).toBe(0);
    });
  });

  describe('"unique" rule', () => {
    it("awards word only when one player found it", () => {
      const words: FoundWord[] = [
        { word: "CAT", playerId: "p1", foundTime: 1000 },
        { word: "DOG", playerId: "p1", foundTime: 2000 },
        { word: "DOG", playerId: "p2", foundTime: 3000 },
      ];
      const result = determineWordOwners(words, "unique");
      expect(result.get("p1")).toContain("CAT");
      expect(result.get("p1")).not.toContain("DOG");
      expect(result.get("p2")).not.toContain("DOG");
    });

    it("awards nothing when all words are shared", () => {
      const words: FoundWord[] = [
        { word: "CAT", playerId: "p1", foundTime: 1000 },
        { word: "CAT", playerId: "p2", foundTime: 2000 },
      ];
      const result = determineWordOwners(words, "unique");
      expect(result.get("p1")?.size).toBe(0);
      expect(result.get("p2")?.size).toBe(0);
    });
  });

  describe('"all" rule', () => {
    it("awards word to every player who found it", () => {
      const words: FoundWord[] = [
        { word: "CAT", playerId: "p1", foundTime: 1000 },
        { word: "CAT", playerId: "p2", foundTime: 2000 },
      ];
      const result = determineWordOwners(words, "all");
      expect(result.get("p1")).toContain("CAT");
      expect(result.get("p2")).toContain("CAT");
    });

    it("only counts a word once per player even if submitted multiple times", () => {
      const words: FoundWord[] = [
        { word: "CAT", playerId: "p1", foundTime: 1000 },
        { word: "CAT", playerId: "p1", foundTime: 2000 },
      ];
      const result = determineWordOwners(words, "all");
      expect(result.get("p1")?.size).toBe(1);
    });
  });

  it("includes all players in the result even if they own no words", () => {
    const words: FoundWord[] = [
      { word: "CAT", playerId: "p1", foundTime: 1000 },
      { word: "CAT", playerId: "p2", foundTime: 2000 },
    ];
    const result = determineWordOwners(words, "unique");
    expect(result.has("p1")).toBe(true);
    expect(result.has("p2")).toBe(true);
  });
});
