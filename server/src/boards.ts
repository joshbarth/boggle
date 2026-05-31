import { Board, generateBoard, solveBoard } from "@boggle/shared";
import { DiceSetStore } from "./diceSets";
import { defaultWordListId, WordListStore } from "./wordSets";

const defaultSize = 4;

type InternalBoardRecord = {
  id: string,
  board: Board,
  solutions: Map<string, Set<string>>
}

export type BoardRecord = {
  id: string,
  board: Board,
}

export interface BoardStore {
  createRandomBoard(
    diceSetId?: string,
    size?: number,
    reuseDice?: boolean
  ): BoardRecord;
  getBoard(id: string): BoardRecord | undefined;
  solveBoardById(
    id: string,
    wordListId?: string,
    wrapAround?: boolean
  ): Set<string>;
}

export function serializeSolverParams(
  wordListId?: string,
  wrapAround?: boolean
): string {
  return `${wordListId ?? defaultWordListId}:${wrapAround ?? false}`;
}

export function newBoardStore(
  diceSetStore: DiceSetStore,
  wordListStore: WordListStore
): BoardStore {
  const boards: Map<string, InternalBoardRecord> = new Map();

  function createRandomBoard(
    diceSetId?: string,
    size?: number,
    reuseDice?: boolean,
  ): BoardRecord {
    const dice = diceSetStore.getDiceSet(diceSetId);
    const board = generateBoard(size ?? defaultSize, dice, reuseDice ?? false);
    const id = crypto.randomUUID();

    const boardRecord = {
      id: id,
      board: board,
      solutions: new Map()
    };

    boards.set(id, boardRecord);
    return boardRecord;
  }

  function solveBoardById(
    id: string,
    wordListId?: string,
    wrapAround?: boolean
  ): Set<string> {
    const boardRecord = boards.get(id);
    if (!boardRecord?.board) {
      return new Set();
    }

    const solutionKey = serializeSolverParams(wordListId, wrapAround);
    let solution = boardRecord.solutions.get(solutionKey);
    if (solution) {
      console.log(`cache hit on ${id} for ${solutionKey}`);
      return solution;
    }
    console.log(`cache miss on ${id} for ${solutionKey}`);

    const board = boardRecord.board;
    const wordList = wordListStore.getWordList(wordListId);
    solution = solveBoard(board, wordList, wrapAround ?? false);
    boardRecord.solutions.set(solutionKey, solution);
    return solution;
  }

  return {
    createRandomBoard: createRandomBoard,
    getBoard: (id: string) => boards.get(id),
    solveBoardById: solveBoardById
  };
}
