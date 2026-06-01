import axios, { AxiosResponse } from "axios";
import { useEffect, useRef, useState } from "react";
import { Tile } from "./Tile";

const saveBoardEndpoint = "/api/board";
const solveBoardEndpoint = (id: string) => `/api/board/${id}/solve`;

export function useBoggleBoard(size = 4) {
  const initialLabels = Array.from(
    { length: size },
    () => Array(size).fill(""));
  const [labels, setLabels] = useState<string[][]>(initialLabels);
  const [boardId, setBoardId] = useState<string | undefined>();
  const [solution, setSolution] = useState<string[] | undefined>();

  async function saveBoard() {
    if (boardId) {
      // TODO handle updates
      return;
    }
    const response: AxiosResponse<{id: string}> = await axios.post(
      saveBoardEndpoint,
      {
        board: labels
      });
    const id = response.data.id;
    setBoardId(id);
    return id;
  }

  async function solveBoard(wrapAround = false, id?: string) {
    const board = id ?? boardId;
    if (!board) {
      return;
    }

    const response: AxiosResponse<{solution: string[]}> = await axios.post(
      solveBoardEndpoint(board),
      {
        wrapAround: wrapAround
      }
    );

    const solution = response.data.solution;
    setSolution(solution)
  }

  return { labels, setLabels, boardId, solution, saveBoard, solveBoard };
}

interface BoardProps {
  labels: string[][];
  onLabelsChange?: (labels: string[][]) => void;
  // size in pixels for the board
  size?: number;
}

const GAP = 10 // must match --board-gap in index.css

function normalize(raw: string): string {
  const s = raw.toUpperCase().replace(/[^A-Z]/g, '');
  if (!s) return '';
  if (s[0] === 'Q') return 'QU';
  return s[0];
}

function advance(
  from: [number, number],
  gridSize: number
): [number, number] | null {
  const [r, c] = from;
  if (c < gridSize - 1) return [r, c + 1];
  if (r < gridSize - 1) return [r + 1, 0];
  return null;
}

export function Board(props: BoardProps) {
  const { labels, onLabelsChange, size = 340 } = props;
  const gridSize = labels.length;
  const tileSize = Math.floor((size - GAP * (gridSize - 1)) / gridSize);
  const editable = !!onLabelsChange;

  const [activeTile, setActiveTile] = useState<[number, number] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTile) {
      inputRef.current?.focus();
    }
  }, [activeTile]);

  function setLabel(r: number, c: number, value: string) {
    const next = labels.map((row, i) => {
      return i === r ? row.map((tile, j) => (j === c ? value : tile)) : row;
    });
    onLabelsChange?.(next);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!activeTile) return;
    const [r, c] = activeTile;
    const char = normalize((e.nativeEvent as InputEvent).data ?? "");
    e.target.value = "";
    if (!char) return;
    setLabel(r, c, char);
    setActiveTile(advance([r, c], gridSize));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!activeTile) return;
    const [r, c] = activeTile;

    if (e.key === "Backspace") {
      e.preventDefault();
      if (labels[r][c] !== "") {
        setLabel(r, c, "");
      } else {
        const prev: [number, number] | null =
          c > 0 ? [r, c - 1] :
          r > 0 ? [r - 1, gridSize - 1] :
          null;
        if (prev) {
          setLabel(prev[0], prev[1], "");
          setActiveTile(prev);
        }
      }
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveTile(advance([r, c], gridSize));
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveTile(
        c > 0 ? [r, c - 1] :
        r > 0 ? [r - 1, gridSize - 1] :
        null);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveTile(r < gridSize - 1 ? [r + 1, c] : null);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveTile(r > 0 ? [r - 1, c] : null);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setActiveTile(null);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      setActiveTile(advance([r, c], gridSize));
      return;
    }
  }


  return (
    <div
      className="board"
      style={{
        "--tile-size": `${tileSize}px`,
        "--board-gap": `${GAP}px`,
        "--grid-size": gridSize,
        width: size,
      } as React.CSSProperties}
    >
      {editable && (
        <input
          ref={inputRef}
          className="board-hidden-input"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setActiveTile(null)}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
      )}
      {labels.map((row, r) =>
        row.map((label, c) => (
          <Tile
            key={`${r}-${c}`}
            label={label}
            isActive={activeTile?.[0] === r && activeTile?.[1] === c}
            onClick={editable ? () => setActiveTile([r, c]) : undefined}
          />
        ))
      )}
    </div>
  );
}
