import { ScoreStrategy } from "./types";

export class ConstantScoreStrategy implements ScoreStrategy {
  private score: number;

  constructor(score: number = 1) {
    this.score = score;
  }

  calculateScore(word: string): number {
    return this.score;
  }
}

export class LinearLengthScoreStrategy implements ScoreStrategy {
  private offset: number;

  constructor(offset: number = 0) {
    this.offset = offset;
  }

  calculateScore(word: string): number {
    return word.length + this.offset;
  }
}

export class ClassicBoggleScoreStrategy implements ScoreStrategy {
  calculateScore(word: string): number {
    const length = word.length;
    if (length <= 2) return 0;
    if (length <= 4) return 1;
    if (length === 5) return 2;
    if (length === 6) return 3;
    if (length === 7) return 5;
    return 11;
  }
}
