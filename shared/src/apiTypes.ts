import { Board } from "./types";

export type NewBoardRequest = {
  size: number;
  diceSetId: string;
}

export type NewBoardResponse = {
  board: Board;
  boardId: string;
}

export type SolveBoardRequest = {
  boardId: string | undefined;
  minWordLength: number | undefined;
  wrapAround: boolean | undefined;
}
