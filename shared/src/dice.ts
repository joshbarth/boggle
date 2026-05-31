import { Die } from "./types";

export function rollDie(die: Die): string {
  const randomIndex = Math.floor(Math.random() * die.faces.length);
  return die.faces[randomIndex];
}

export function loadDiceSet(diceSetString: string): Die[] {
  const dice: Die[] = [];
  const lines = diceSetString.split(/\r?\n/);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) continue;
    const faces = trimmedLine
      .split(" ")
      .map((f) => f.trim().toUpperCase())
      .filter((f) => f.length > 0);
    if (faces.length > 0) {
      dice.push({ faces });
    }
  }
  return dice;
}
