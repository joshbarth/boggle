import { Board, Die, generateBoard, solveBoard } from "@boggle/shared";

const defaultSize = 4;

export type BoardRecord = {
  id: string,
  board: Board,
  solution?: Set<string>
}

export interface BoardStore {
  createRandomBoard(
    dice: Die[],
    size?: number,
    reuseDice?: boolean
  ): BoardRecord;
  getBoard(id: string): BoardRecord | undefined;
  solveBoardById(
    id: string,
    wordList: Set<string>,
    wrapAround?: boolean
  ): Set<string>;
}

export function newBoardStore(): BoardStore {
  const boards: Map<string, BoardRecord> = new Map();

  function createRandomBoard(
    dice: Die[],
    size?: number,
    reuseDice?: boolean,
  ): BoardRecord {
    const board = generateBoard(size ?? defaultSize, dice, reuseDice ?? false);
    const id = crypto.randomUUID();

    const boardRecord = {
      id: id,
      board: board
    };

    boards.set(id, boardRecord);
    return boardRecord;
  }

  function solveBoardById(
    id: string,
    wordList: Set<string>,
    wrapAround?: boolean
  ): Set<string> {
    const boardRecord = boards.get(id);
    if (!boardRecord?.board) {
      return new Set();
    }

    const board = boardRecord.board;
    return solveBoard(board, wordList, wrapAround ?? false);
  }

  return {
    createRandomBoard: createRandomBoard,
    getBoard: (id: string) => boards.get(id),
    solveBoardById: solveBoardById
  };
}
