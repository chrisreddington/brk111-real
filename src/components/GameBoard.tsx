import React, { useEffect, useState } from 'react';

type Cell = 'grass' | 'water' | 'road' | null;
type Entity = 'octocat' | 'vehicle' | 'log' | null;

interface GameBoardProps {
  board: Cell[][];
  entities: (Entity | null)[][];
  frogPosition: { x: number; y: number };
  score: number;
  gameOver: boolean;
  onRestart: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  entities,
  frogPosition,
  score,
  gameOver,
  onRestart,
}) => {
  const [animateScore, setAnimateScore] = useState(false);
  
  // Add animation when score changes
  useEffect(() => {
    if (score > 0) {
      setAnimateScore(true);
      const timer = setTimeout(() => setAnimateScore(false), 500);
      return () => clearTimeout(timer);
    }
  }, [score]);

  return (
    <div className="game-container">
      <div className="game-header">
        <div className={`score ${animateScore ? 'score-change' : ''}`}>Score: {score}</div>
      </div>
      <div className="game-board">
        {board.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`cell ${cell || ''}`}
            >
              {frogPosition.x === x && frogPosition.y === y ? (
                <div className="octocat" />
              ) : entities[y][x] ? (
                <div className={entities[y][x] || ''} />
              ) : null}
            </div>
          ))
        )}
      </div>
      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <button onClick={onRestart}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
