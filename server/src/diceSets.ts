import fs from "node:fs/promises"
import path from "node:path";
import { Die, loadDiceSet } from "@boggle/shared";

const defaultDiceSetId = "default";

export interface DiceSetStore {
  getDiceSet(id?: string): Die[]
}

export async function newDiceSetStore(
  defaultDiceSetPath: string
): Promise<DiceSetStore> {
  const diceSetStore = new Map<string, Die[]>
  const filePath = path.join(__dirname, defaultDiceSetPath);
  const diceString = await fs.readFile(filePath, "utf8");
  const diceSet = loadDiceSet(diceString);
  diceSetStore.set(defaultDiceSetId, diceSet);

  return {
    getDiceSet: (id) => diceSetStore.get(id ?? defaultDiceSetId) ?? []
  }
}
