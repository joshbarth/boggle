import cors from "cors";
import express, { Request } from "express";
import path from "node:path";
import { newWordListStore } from "./wordSets";
import { newDiceSetStore } from "./diceSets";
import { newBoardStore } from "./boards";

const app = express();
const PORT = process.env.PORT ?? 3000;

const wordListPath = "../words/enable1.txt";
const diceSetPath = "../dicesets/boggle_classic_dice.txt";

async function start() {
  const wordListStore = await newWordListStore(wordListPath);
  const diceSetStore = await newDiceSetStore(diceSetPath);
  const boardStore = newBoardStore();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/wordlist", (_req, res) => {
    res.send([... wordListStore.getWordList()]);
  });

  app.get("/api/board/:boardId", (
    req: Request<{ boardId?: string }, {}, {}, {}>,
    res) => {
      console.debug(`GET request for /api/board/${req.params.boardId}`);
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

  app.get("/api/solve-random-board", (
    req: Request<{}, {}, {}, { wraparound?: string }>,
    res
  ) => {
    const wraparound = req.query.wraparound === "true";
    const dice = diceSetStore.getDiceSet();
    const wordList = wordListStore.getWordList();
    const boardRecord = boardStore.createRandomBoard(dice);
    const solution = boardStore.solveBoardById(
      boardRecord.id,
      wordList,
      wraparound);

    res.json({
      boardId: boardRecord.id,
      board: boardRecord.board,
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
