export type Player = {
  id: string;
  name: string;
};

export type Die = {
  faces: string[];
};

export interface ScoreStrategy {
  calculateScore(word: string): number;
}

export type WordOwnershipRule = "first" | "unique" | "all";

export type GameConfig = {
  boardSize: number;
  diceSet: Die[];
  diceReplace: boolean; // during board generation, if a die is replaced it can be used again
  minWordLength: number;
  wrapAround: boolean;
  wordList: Set<string>;
  immediatelyRejectInvalidWords: boolean;
  timeLimitSeconds: number;
  scoreStrategy: ScoreStrategy;
  invalidWordPenalty: number;
  wordOwnershipRule: WordOwnershipRule;
  roundLimit?: number;
  scoreLimit?: number;
  minPlayers: number;
  maxPlayers?: number;
  canJoinInProgress: boolean;
};

export type GameConfigOverrides = Partial<GameConfig>;

export type Board = string[][]; // 2D array of letters

export type FoundWord = {
  word: string;
  playerId: string;
  foundTime: number; // timestamp in milliseconds
};

export type RoundSummary = {
  roundNumber: number;
  players: Player[];
  foundWords: FoundWord[];
  playerScores: Map<string, number>; // playerId to score for this round
  totalScores: Map<string, number>; // playerId to cumulative score after this round
};

export type GamePhase =
  | "config"
  | "lobby"
  | "playing"
  | "round_results"
  | "game_over";

export type GameState = {
  board: Board;
  config: GameConfig;
  players: Player[];
  foundWords: FoundWord[];
  roundStartTime?: number; // timestamp in milliseconds
  roundEndTime?: number; // timestamp in milliseconds
  phase: GamePhase;
  history: RoundSummary[]; // summaries of completed rounds
  scores: Map<string, number>; // current cumulative scores
};
