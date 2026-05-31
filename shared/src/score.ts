import { FoundWord, GameConfig } from "./types";
import { determineWordOwners } from "./wordOwnership";

export function calculateScores(
  foundWords: FoundWord[],
  config: GameConfig,
): Map<string, number> {
  const scores = new Map<string, number>();

  const ownedWords = determineWordOwners(foundWords, config.wordOwnershipRule);

  for (const [playerId, words] of ownedWords.entries()) {
    let playerScore = 0;
    for (const word of words) {
      playerScore += config.scoreStrategy.calculateScore(word);
    }
    scores.set(playerId, playerScore);
  }

  return scores;
}
