import { describe, expect, it } from "vitest";
import { calculateScores } from "./score";
import { FoundWord, GameConfig } from "./types";
import { ClassicBoggleScoreStrategy, ConstantScoreStrategy } from "./scoreStrategies";

const baseConfig: GameConfig = {
  boardSize: 4,
  diceSet: [],
  diceReplace: false,
  minWordLength: 3,
  wrapAround: false,
  wordList: new Set(),
  immediatelyRejectInvalidWords: false,
  timeLimitSeconds: 120,
  scoreStrategy: new ConstantScoreStrategy(),
  invalidWordPenalty: 0,
  wordOwnershipRule: "first",
  minPlayers: 2,
  canJoinInProgress: false,
};

describe("calculateScores", () => {
  it("returns an empty map when no words are found", () => {
    const result = calculateScores([], baseConfig);
    expect(result.size).toBe(0);
  });

  it('scores each unique word once per player under "first" rule', () => {
    const words: FoundWord[] = [
      { word: "CAT", playerId: "p1", foundTime: 1000 },
      { word: "CAT", playerId: "p2", foundTime: 2000 },
      { word: "DOG", playerId: "p2", foundTime: 3000 },
    ];
    const result = calculateScores(words, { ...baseConfig, wordOwnershipRule: "first" });
    expect(result.get("p1")).toBe(1);
    expect(result.get("p2")).toBe(1);
  });

  it('awards words to all players under "all" rule', () => {
    const words: FoundWord[] = [
      { word: "CAT", playerId: "p1", foundTime: 1000 },
      { word: "CAT", playerId: "p2", foundTime: 2000 },
    ];
    const result = calculateScores(words, { ...baseConfig, wordOwnershipRule: "all" });
    expect(result.get("p1")).toBe(1);
    expect(result.get("p2")).toBe(1);
  });

  it('awards zero for shared words under "unique" rule', () => {
    const words: FoundWord[] = [
      { word: "CAT", playerId: "p1", foundTime: 1000 },
      { word: "CAT", playerId: "p2", foundTime: 2000 },
    ];
    const result = calculateScores(words, { ...baseConfig, wordOwnershipRule: "unique" });
    expect(result.get("p1")).toBe(0);
    expect(result.get("p2")).toBe(0);
  });

  it("uses the configured score strategy", () => {
    const words: FoundWord[] = [
      { word: "CATS", playerId: "p1", foundTime: 1000 },
      { word: "DOGS", playerId: "p1", foundTime: 2000 },
    ];
    const config = {
      ...baseConfig,
      scoreStrategy: new ClassicBoggleScoreStrategy(),
      wordOwnershipRule: "all" as const,
    };
    const result = calculateScores(words, config);
    expect(result.get("p1")).toBe(2);
  });

  it("sums scores across multiple owned words", () => {
    const words: FoundWord[] = [
      { word: "CAT", playerId: "p1", foundTime: 1000 },
      { word: "DOG", playerId: "p1", foundTime: 2000 },
      { word: "BIRD", playerId: "p1", foundTime: 3000 },
    ];
    const result = calculateScores(words, { ...baseConfig, wordOwnershipRule: "all" });
    expect(result.get("p1")).toBe(3);
  });
});
