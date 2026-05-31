import { createWordTrie } from "./wordList";
import { Board, WordTrieNode } from "./types";
import { getNeighbors, getNextLetters, serializeCoords } from "./board";

export function solveBoard(
  board: Board,
  wordList: Set<string>,
  wrapAround: boolean = false,
): Set<string> {
  const wordTrieRoot = createWordTrie(wordList);

  function dfs(
    row: number,
    col: number,
    trieNode: WordTrieNode,
    visited: Set<string> = new Set(),
    prefix: string = "",
  ): Set<string> {
    let foundWords = new Set<string>();
    const currentLetter = board[row][col];

    let nextNode: WordTrieNode | undefined = trieNode;

    for (const char of currentLetter) {
      nextNode = nextNode.children.get(char);
      if (!nextNode) {
        return new Set();
      }
    }

    const nextPrefix = prefix + currentLetter;

    if (nextNode.isWord) {
      foundWords.add(nextPrefix);
    }

    if (nextNode.children.size === 0) {
      return foundWords;
    }

    const newVisited = new Set(visited);
    newVisited.add(serializeCoords(row, col));

    const neighbors = getNeighbors(board, row, col, wrapAround);
    const nextLetters = getNextLetters(board, neighbors, newVisited);
    for (const [[nRow, nCol], _] of nextLetters) {
      foundWords = foundWords.union(dfs(
        nRow, nCol, nextNode, newVisited, nextPrefix));
    }

    return foundWords;
  }

  let foundWords = new Set<string>();

  const size = board.length;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      foundWords = foundWords.union(dfs(row, col, wordTrieRoot))
    }
  }

  return foundWords;
}
