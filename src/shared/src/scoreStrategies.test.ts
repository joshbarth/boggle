import { describe, expect, it } from 'vitest';
import {
  ClassicBoggleScoreStrategy,
  ConstantScoreStrategy,
  LinearLengthScoreStrategy,
} from './scoreStrategies';

describe('ConstantScoreStrategy', () => {
  it('returns 1 for any word by default', () => {
    const strategy = new ConstantScoreStrategy();
    expect(strategy.calculateScore('cat')).toBe(1);
    expect(strategy.calculateScore('elephant')).toBe(1);
  });

  it('returns the configured constant score', () => {
    const strategy = new ConstantScoreStrategy(5);
    expect(strategy.calculateScore('cat')).toBe(5);
  });
});

describe('LinearLengthScoreStrategy', () => {
  it('returns word length with default offset of 0', () => {
    const strategy = new LinearLengthScoreStrategy();
    expect(strategy.calculateScore('cat')).toBe(3);
    expect(strategy.calculateScore('boggle')).toBe(6);
  });

  it('applies a positive offset', () => {
    const strategy = new LinearLengthScoreStrategy(2);
    expect(strategy.calculateScore('cat')).toBe(5);
  });

  it('applies a negative offset', () => {
    const strategy = new LinearLengthScoreStrategy(-2);
    expect(strategy.calculateScore('boggle')).toBe(4);
  });
});

describe('ClassicBoggleScoreStrategy', () => {
  const strategy = new ClassicBoggleScoreStrategy();

  it('returns 0 for words with 2 or fewer letters', () => {
    expect(strategy.calculateScore('a')).toBe(0);
    expect(strategy.calculateScore('at')).toBe(0);
  });

  it('returns 1 for 3-4 letter words', () => {
    expect(strategy.calculateScore('cat')).toBe(1);
    expect(strategy.calculateScore('cats')).toBe(1);
  });

  it('returns 2 for 5-letter words', () => {
    expect(strategy.calculateScore('boggl')).toBe(2);
  });

  it('returns 3 for 6-letter words', () => {
    expect(strategy.calculateScore('boggle')).toBe(3);
  });

  it('returns 5 for 7-letter words', () => {
    expect(strategy.calculateScore('boggles')).toBe(5);
  });

  it('returns 11 for words longer than 7 letters', () => {
    expect(strategy.calculateScore('bogglers')).toBe(11);
    expect(strategy.calculateScore('superlongest')).toBe(11);
  });
});
