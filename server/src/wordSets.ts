import { loadWordList } from "@boggle/shared";
import fs from "node:fs/promises";
import path from "node:path";

const defaultWordListId = "default";

export interface WordListStore {
  getWordList(id?: string): Set<string>;
}

export async function newWordListStore(
  defaultWordListPath: string
): Promise<WordListStore> {
  const wordLists: Map<string, Set<string>> = new Map();
  const filePath = path.join(__dirname, defaultWordListPath);
  const defaultWordListString = await fs.readFile(filePath, "utf8");
  const defaultWordList = loadWordList(defaultWordListString);
  wordLists.set(defaultWordListId, defaultWordList);

  return {
    getWordList: (id) => wordLists.get(id ?? defaultWordListId) ?? new Set()
  }
}
