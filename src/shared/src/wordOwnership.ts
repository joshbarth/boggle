import { FoundWord, WordOwnershipRule } from "./types";

export function determineWordOwners(
  foundWords: FoundWord[],
  ownershipRule: WordOwnershipRule,
): Map<string, Set<string>> {
  const wordPlayers = new Map<string, Set<string>>();

  const chronologicalWords = [...foundWords].sort(
    (a, b) => a.foundTime - b.foundTime,
  );

  for (const { word, playerId } of chronologicalWords) {
    if (!wordPlayers.has(word)) {
      wordPlayers.set(word, new Set());
    }
    const owners = wordPlayers.get(word)!;
    owners.add(playerId);
  }

  const playerWords = new Map<string, Set<string>>();

  const players = new Set<string>();
  for (const owners of wordPlayers.values()) {
    for (const owner of owners) {
      players.add(owner);
    }
  }
  for (const playerId of players) {
    playerWords.set(playerId, new Set());
  }

  for (const [word, owners] of wordPlayers.entries()) {
    if (ownershipRule === "first") {
      const firstOwner = [...owners][0];
      playerWords.get(firstOwner)!.add(word);
    } else if (ownershipRule === "unique") {
      if (owners.size === 1) {
        const uniqueOwner = [...owners][0];
        playerWords.get(uniqueOwner)!.add(word);
      }
    } else if (ownershipRule === "all") {
      for (const owner of owners) {
        playerWords.get(owner)!.add(word);
      }
    }
  }

  return playerWords;
}
