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
