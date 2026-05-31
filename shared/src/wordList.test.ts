import { describe, expect, it } from "vitest";
import { createWordTrie, isValidWord, loadWordList } from "./wordList";

describe("isValidWord", () => {
  const wordList = new Set(["CAT", "DOG", "BIRD"]);

  it("returns true for a word in the list", () => {
    expect(isValidWord("CAT", wordList)).toBe(true);
  });

  it("returns false for a word not in the list", () => {
    expect(isValidWord("FISH", wordList)).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isValidWord("cat", wordList)).toBe(true);
    expect(isValidWord("Cat", wordList)).toBe(true);
  });

  it("returns false for an empty string", () => {
    expect(isValidWord("", wordList)).toBe(false);
  });
});

describe("loadWordList", () => {
  it("parses a newline-delimited word list", () => {
    const result = loadWordList("cat\ndog\nbird");
    expect(result).toEqual(new Set(["CAT", "DOG", "BIRD"]));
  });

  it("handles Windows-style CRLF line endings", () => {
    const result = loadWordList("cat\r\ndog\r\nbird");
    expect(result).toEqual(new Set(["CAT", "DOG", "BIRD"]));
  });

  it("converts words to uppercase", () => {
    const result = loadWordList("cat\nDog\nBIRD");
    expect(result).toContain("CAT");
    expect(result).toContain("DOG");
    expect(result).toContain("BIRD");
  });

  it("removes non-alphabetic characters", () => {
    const result = loadWordList("cat1\ndo-g\nb!ird");
    expect(result).toContain("CAT");
    expect(result).toContain("DOG");
    expect(result).toContain("BIRD");
  });

  it("filters empty lines", () => {
    const result = loadWordList("cat\n\ndog\n");
    expect(result.size).toBe(2);
  });

  it("deduplicates words", () => {
    const result = loadWordList("cat\ncat\nCAT");
    expect(result.size).toBe(1);
  });

  it("returns an empty set for an empty string", () => {
    expect(loadWordList("")).toEqual(new Set());
  });
});

describe("createWordTrie", () => {
  it("marks words correctly at leaf nodes", () => {
    const trie = createWordTrie(new Set(["CAT"]));
    const c = trie.children.get("C");
    const a = c?.children.get("A");
    const t = a?.children.get("T");
    expect(trie.isWord).toBe(false);
    expect(c?.isWord).toBe(false);
    expect(a?.isWord).toBe(false);
    expect(t?.isWord).toBe(true);
  });

  it("shares prefixes between words", () => {
    const trie = createWordTrie(new Set(["CAT", "CAR"]));
    const c = trie.children.get("C");
    const a = c?.children.get("A");
    expect(a?.children.size).toBe(2);
    expect(a?.children.has("T")).toBe(true);
    expect(a?.children.has("R")).toBe(true);
  });

  it("marks intermediate nodes as words when they are words", () => {
    const trie = createWordTrie(new Set(["CAT", "CATS"]));
    const t = trie.children.get("C")?.children.get("A")?.children.get("T");
    expect(t?.isWord).toBe(true);
    expect(t?.children.get("S")?.isWord).toBe(true);
  });

  it("returns an empty root for an empty word list", () => {
    const trie = createWordTrie(new Set());
    expect(trie.isWord).toBe(false);
    expect(trie.children.size).toBe(0);
  });
});
