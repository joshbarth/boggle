import cors from "cors";
import express, { Request } from "express";
import path from "node:path";
import { newWordListStore } from "./wordSets";
import { newDiceSetStore } from "./diceSets";
import { newBoardStore } from "./boards";
import { isSquare } from "@boggle/shared";

const app = express();
const PORT = process.env.PORT ?? 3000;

const wordListPath = "../words/enable1.txt";
const diceSetPath = "../dicesets/boggle_classic_dice.txt";

const boardSizeLimit = 5;

async function start() {
  const wordListStore = await newWordListStore(wordListPath);
  const diceSetStore = await newDiceSetStore(diceSetPath);
  const boardStore = newBoardStore(diceSetStore, wordListStore);

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/wordlist", (_req, res) => {
    res.send([... wordListStore.getWordList()]);
  });

  app.get("/api/board/:boardId", (
    req: Request<{ boardId?: string }>,
    res
  ) => {
    if (!req.params.boardId) {
      res.status(400).json({ error: "bad request" });
      return;
    }
    const boardRecord = boardStore.getBoard(req.params.boardId);
    if (!boardRecord) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json(boardRecord);
  });

  app.post("/api/board", (
    req: Request<{}, {}, {
      board?: string[][]
    }>,
    res
  ) => {
    const board = req.body.board;
    if (!board) {
      res.status(400).json({ error: "bad request" });
      return;
    }
    if (!isSquare(board)) {
      res.status(400).json({ error: "board must be square" });
    }

    if (board.length > boardSizeLimit) {
      res.status(400).json({
        error: `board cannot be bigger than ${boardSizeLimit}`
      });
    }

    const id = boardStore.createBoard(board);
    if (!id) {
      res.status(500).json({ error: "unexpected error creating board" });
      return;
    }

    res.send({ id: id });
  });

  app.post("/api/board/new", (
    req: Request<{}, {}, {
      size?: number,
      diceSet?: string,
      reuseDice?: boolean
    }>,
    res
  ) => {
    const size = req.body.size ?? 4;
    const reuseDice = req.body.reuseDice ?? false;
    if (size < 1 || size > boardSizeLimit) {
      res.status(400).json({ error: "invalid board size" });
      return;
    }

    const boardRecord = boardStore.createRandomBoard(
      req.body.diceSet,
      size,
      reuseDice);

    if (!boardRecord) {
      res.status(500).json({ error: "unexpected error creating board" });
      return;
    }
    res.send(boardRecord);
  });

  app.post("/api/board/:boardId/solve", (
    req: Request<{ boardId?: string }, {}, {
      wordList?: string,
      wrapAround?: boolean,
    }>,
    res
  ) => {
    if (!req.params.boardId) {
      res.status(400).json({ error: "bad request" });
      return;
    }

    const boardRecord = boardStore.getBoard(req.params.boardId);
    if (!boardRecord) {
      res.status(404).json({ error: "not found" });
      return;
    }

    const solution = boardStore.solveBoardById(
      req.params.boardId,
      req.body.wordList,
      req.body.wrapAround);
    res.json({
      solution: [...solution]
    });
  });

  const clientDist = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
