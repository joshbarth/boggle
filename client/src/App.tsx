import { useState } from "react";
import { Board, useBoggleBoard } from "./Board";

function App() {
  const {
    labels,
    setLabels,
    solution,
    saveBoard,
    solveBoard
  } = useBoggleBoard();

  const [submitted, setSubmitted] = useState(false);
  const [wrapAround, setWrapAround] = useState(false);

  async function submit() {
    if (submitted) return;
    if (!labels.every(row => row.every(Boolean))) return;
    const id = await saveBoard();
    await solveBoard(wrapAround, id);
    setSubmitted(true);
  }

  function sortAndFilterSolution(words: string[]): string[] {
    const minLength = wrapAround ? 5 : 4;
    return words
      .filter(word => word.length >= minLength)
      .sort((a, b) => b.length - a.length || a.localeCompare(b));
  }

  return (
    <div className="app">
      <h1>Boggers, Dude</h1>

      <div className="solver">
        <Board
          labels={labels}
          onLabelsChange={!submitted ? setLabels : undefined}
        />

        {!submitted && (
          <div className="controls">
            <label className="toggle">
              <input
                type="checkbox"
                checked={wrapAround}
                onChange={() => setWrapAround(!wrapAround)}
              />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
              <span className="toggle-label">Wrap around</span>
            </label>

            <button className="btn" onClick={submit}>
              Solve
            </button>
          </div>
        )}
      </div>

      {solution && (
        <ul className="solutions">
          {sortAndFilterSolution(solution).map(word => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
