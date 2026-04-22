import { WordTrieNode } from "./types";

export function isValidWord(word: string, wordList: Set<string>): boolean {
  return wordList.has(word.toUpperCase());
}

export function loadWordList(wordListString: string): Set<string> {
  const words = wordListString
    .split(/\r?\n/)
    .map((w) => w.trim().toUpperCase())
    .map((w) => w.replace(/[^A-Z]/g, ""))
    .filter((w) => w.length > 0);
  return new Set(words);
}

export function createWordTrie(wordList: Set<string>): WordTrieNode {
  const root: WordTrieNode = { children: new Map(), isWord: false };

  for (const word of wordList) {
    let currentNode = root;
    for (const char of word) {
      if (!currentNode.children.has(char)) {
        currentNode.children.set(char, { children: new Map(), isWord: false });
      }
      currentNode = currentNode.children.get(char)!;
    }
    currentNode.isWord = true;
  }

  return root;
}
