import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './components/GameBoard';
import './App.css';

type Cell = 'grass' | 'water' | 'road' | null;
type Entity = 'octocat' | 'vehicle' | 'log' | null;

const BOARD_SIZE = 13;
const INIT_OCTOCAT_POS = { x: 6, y: 12 };

const createBoard = (): Cell[][] => {
  const board: Cell[][] = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  
  // Set up the terrain
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (y === 0 || y === 6 || y === 12) {
        board[y][x] = 'grass';
      } else if (y < 6) {
        board[y][x] = 'water';
      } else {
        board[y][x] = 'road';
      }
    }
  }
  
  return board;
};

const App: React.FC = () => {
  const [board] = useState<Cell[][]>(createBoard());
  const [entities, setEntities] = useState<(Entity | null)[][]>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [octocatPosition, setOctocatPosition] = useState({ ...INIT_OCTOCAT_POS });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highestRow, setHighestRow] = useState(INIT_OCTOCAT_POS.y); // Track the highest row reached

  const moveEntities = useCallback(() => {
    setEntities(prev => {
      const newEntities = prev.map(row => [...row]);
      
      // Move vehicles (rows 7-11)
      for (let y = 7; y < 12; y++) {
        const row = [...newEntities[y]];
        
        if (y % 2 === 0) {
          const last = row[BOARD_SIZE - 1];
          for (let x = BOARD_SIZE - 1; x > 0; x--) {
            row[x] = row[x - 1];
          }
          row[0] = last;
        } else {
          const first = row[0];
          for (let x = 0; x < BOARD_SIZE - 1; x++) {
            row[x] = row[x + 1];
          }
          row[BOARD_SIZE - 1] = first;
        }
        
        newEntities[y] = row;
      }
      
      // Move logs (rows 1-5)
      for (let y = 1; y < 6; y++) {
        const row = [...newEntities[y]];
        
        if (y % 2 === 0) {
          const last = row[BOARD_SIZE - 1];
          for (let x = BOARD_SIZE - 1; x > 0; x--) {
            row[x] = row[x - 1];
          }
          row[0] = last;
        } else {
          const first = row[0];
          for (let x = 0; x < BOARD_SIZE - 1; x++) {
            row[x] = row[x + 1];
          }
          row[BOARD_SIZE - 1] = first;
        }
        
        newEntities[y] = row;
      }
      
      return newEntities;
    });
  }, []);

  const spawnEntities = useCallback(() => {
    setEntities(prev => {
      const newEntities = [...prev];
      
      // Spawn vehicles
      for (let y = 7; y < 12; y++) {
        if (Math.random() < 0.1) {
          const x = y % 2 === 0 ? 0 : BOARD_SIZE - 1;
          newEntities[y][x] = 'vehicle';
        }
      }
      
      // Spawn logs
      for (let y = 1; y < 6; y++) {
        if (Math.random() < 0.1) {
          const x = y % 2 === 0 ? 0 : BOARD_SIZE - 1;
          newEntities[y][x] = 'log';
        }
      }
      
      return newEntities;
    });
  }, []);

  const checkCollision = useCallback(() => {
    const { x, y } = octocatPosition;
    
    // Check vehicle collision
    if (board[y][x] === 'road' && entities[y][x] === 'vehicle') {
      setGameOver(true);
    }
    
    // Check water collision
    if (board[y][x] === 'water' && entities[y][x] !== 'log') {
      setGameOver(true);
    }
    
    // Check if reached the other side
    if (y === 0) {
      setScore(s => s + 100); // Bonus for reaching the goal
      setOctocatPosition({ ...INIT_OCTOCAT_POS });
      setHighestRow(INIT_OCTOCAT_POS.y); // Reset highest row
    }
  }, [board, entities, octocatPosition, setScore]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      setOctocatPosition(pos => {
        const newPos = { ...pos };
        
        switch (e.key) {
          case 'ArrowUp':
            if (pos.y > 0) newPos.y--;
            break;
          case 'ArrowDown':
            if (pos.y < BOARD_SIZE - 1) newPos.y++;
            break;
          case 'ArrowLeft':
            if (pos.x > 0) newPos.x--;
            break;
          case 'ArrowRight':
            if (pos.x < BOARD_SIZE - 1) newPos.x++;
            break;
        }
        
        return newPos;
      });
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver]);

  // Update score when player moves to a new highest position (lower row number)
  useEffect(() => {
    if (gameOver) return;
    
    // If the player moves to a new highest row (lower y value), update score
    if (octocatPosition.y < highestRow) {
      setScore(prevScore => prevScore + 10); // Add 10 points for each row advancement
      setHighestRow(octocatPosition.y);
    }
  }, [octocatPosition.y, highestRow, gameOver]);

  useEffect(() => {
    if (gameOver) return;

    const gameLoop = setInterval(() => {
      moveEntities();
      spawnEntities();
      // checkCollision(); // Removed from here
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [gameOver, moveEntities, spawnEntities]); // checkCollision removed from dependencies

  // useEffect for collision checking
  useEffect(() => {
    if (gameOver) return;
    checkCollision();
  }, [gameOver, checkCollision]); // checkCollision itself depends on frogPosition, entities

  const handleRestart = () => {
    setOctocatPosition({ ...INIT_OCTOCAT_POS });
    setEntities(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setScore(0);
    setGameOver(false);
    setHighestRow(INIT_OCTOCAT_POS.y); // Reset highest row on restart
  };

  return (
    <GameBoard
      board={board}
      entities={entities}
      frogPosition={octocatPosition}
      score={score}
      gameOver={gameOver}
      onRestart={handleRestart}
    />
  );
};

export default App;
