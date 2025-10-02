
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Grid, Difficulty, Position, CellValue } from "@/lib/types";
import { generateSudoku, checkSolution, findConflicts } from "@/lib/sudoku";
import { useToast } from "./use-toast";
import { GRID_SIZE, BOX_SIZE, DIFFICULTIES } from "@/lib/constants";

const SAVED_GAME_KEY = "sudokuColorGameState";

const useAudio = (src: string) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (typeof Audio !== "undefined") {
      const newAudio = new Audio(src);
      newAudio.preload = "auto";
      setAudio(newAudio);
    }
  }, [src]);

  const play = useCallback(() => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.error("Audio play failed:", e));
    }
  }, [audio]);

  return play;
};

export function useSudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [solution, setSolution] = useState<Grid | null>(null);
  const [initialGrid, setInitialGrid] = useState<Grid | null>(null);
  const [userGrid, setUserGrid] = useState<Grid | null>(null);
  const [selectedCell, setSelectedCell] = useState<Position | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [conflicts, setConflicts] = useState<Position[]>([]);
  const [isWinDialogOpen, setIsWinDialogOpen] = useState(false);
  const [completedRows, setCompletedRows] = useState<number[]>([]);
  const [completedCols, setCompletedCols] = useState<number[]>([]);
  const [completedBoxes, setCompletedBoxes] = useState<number[]>([]);
  const [colorCounts, setColorCounts] = useState<Record<number, number>>({});
  const [animatedColor, setAnimatedColor] = useState<CellValue | null>(null);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [time, setTime] = useState(0);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  const playCompleteSound = useAudio("/sounds/complete.mp3");
  const playConflictSound = useAudio("/sounds/conflict.mp3");
  const playWinSound = useAudio("/sounds/win.mp3");

  const updateColorCounts = useCallback((grid: Grid) => {
    const counts: Record<number, number> = {};
    for (let i = 1; i <= GRID_SIZE; i++) {
      counts[i] = 0;
    }
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const value = grid[r][c];
        if (value !== 0) {
          counts[value]++;
        }
      }
    }
    setColorCounts(counts);
    return counts;
  }, []);

  const updateCompletedAreas = useCallback((grid: Grid) => {
    let playedSound = false;
    // Check rows
    const newCompletedRows: number[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      if (grid[i].every(cell => cell !== 0)) {
        newCompletedRows.push(i);
        if (!completedRows.includes(i)) {
          playCompleteSound();
          playedSound = true;
          toast({ title: "Row Complete!", description: `You've successfully filled row ${i + 1}.` });
        }
      }
    }
    setCompletedRows(newCompletedRows);

    // Check columns
    const newCompletedCols: number[] = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      let colComplete = true;
      for (let i = 0; i < GRID_SIZE; i++) {
        if (grid[i][j] === 0) {
          colComplete = false;
          break;
        }
      }
      if (colComplete && !completedCols.includes(j)) {
        if (!playedSound) playCompleteSound();
        playedSound = true;
        newCompletedCols.push(j);
        toast({ title: "Column Complete!", description: `You've successfully filled column ${j + 1}.` });
      } else if (colComplete) {
        newCompletedCols.push(j);
      }
    }
    setCompletedCols(newCompletedCols);

    // Check boxes
    const newCompletedBoxes: number[] = [];
    for (let boxRow = 0; boxRow < BOX_SIZE; boxRow++) {
      for (let boxCol = 0; boxCol < BOX_SIZE; boxCol++) {
        const boxIndex = boxRow * BOX_SIZE + boxCol;
        let boxComplete = true;
        for (let i = 0; i < BOX_SIZE; i++) {
          for (let j = 0; j < BOX_SIZE; j++) {
            if (grid[boxRow * BOX_SIZE + i][boxCol * BOX_SIZE + j] === 0) {
              boxComplete = false;
              break;
            }
          }
          if (!boxComplete) break;
        }
        if (boxComplete && !completedBoxes.includes(boxIndex)) {
            if (!playedSound) playCompleteSound();
            newCompletedBoxes.push(boxIndex);
            toast({ title: "Box Complete!", description: `You've successfully filled a 3x3 box.` });
        } else if (boxComplete) {
            newCompletedBoxes.push(boxIndex);
        }
      }
    }
    setCompletedBoxes(newCompletedBoxes);
    updateColorCounts(grid);
  }, [updateColorCounts, completedRows, completedCols, completedBoxes, playCompleteSound, toast]);

    const startNewGame = useCallback(async (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setInitialGrid(null); // Show loading
    setUserGrid(null);

    const { solution, puzzle } = await generateSudoku(newDifficulty);
    
    setSolution(solution);
    setInitialGrid(puzzle);
    setUserGrid(puzzle);
    setSelectedCell(null);
    setConflicts([]);
    setIsGameOver(false);
    setIsWinDialogOpen(false);
    setCompletedRows([]);
    setCompletedCols([]);
    setCompletedBoxes([]);
    setTime(0);
    setHintsRemaining(DIFFICULTIES[newDifficulty].hints);
    updateColorCounts(puzzle);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SAVED_GAME_KEY);
    }
  }, [updateColorCounts]);


  const placeColorOnBoard = useCallback(
    (row: number, col: number, colorValue: CellValue) => {
      if (!userGrid || isGameOver) return;

      const newGrid = userGrid.map((r) => [...r]) as Grid;
      newGrid[row][col] = colorValue;
      setUserGrid(newGrid);

      // Clear previous conflicts for this cell before re-evaluating
      setConflicts(c => c.filter(p => p.row !== row || p.col !== col));

      if (colorValue === 0) { // Eraser logic
          updateColorCounts(newGrid);
          updateCompletedAreas(newGrid);
          return;
      }

      // We clear conflicts from other cells, and only show new ones
      const currentConflicts = findConflicts(newGrid, row, col);
      setConflicts(currentConflicts);

      if (currentConflicts.length > 0) {
        playConflictSound();
        toast({
          title: "Conflict!",
          description:
            "That color conflicts with another in the same row, column, or box.",
          variant: "destructive",
          duration: 2000,
        });
      } else {
        const newCounts = updateColorCounts(newGrid);

        if (newCounts[colorValue] === GRID_SIZE) {
          setAnimatedColor(colorValue);
          if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
          }
          animationTimeoutRef.current = setTimeout(() => {
            setAnimatedColor(null);
            animationTimeoutRef.current = null;
          }, 3000);
        }

        updateCompletedAreas(newGrid);

        // Check for win condition
        const isFilled = newGrid.every((row) => row.every((cell) => cell !== 0));
        if (isFilled) {
          const { isCorrect } = checkSolution(newGrid, solution!);
          if (isCorrect) {
            playWinSound();
            setIsGameOver(true);
            setIsWinDialogOpen(true);
            if (typeof window !== "undefined") {
              localStorage.removeItem(SAVED_GAME_KEY);
            }
          }
        }
      }
    },
    [userGrid, isGameOver, solution, toast, updateColorCounts, updateCompletedAreas, playConflictSound, playWinSound]
  );
  
  useEffect(() => {
    const initializeGame = async () => {
      if (typeof window !== "undefined") {
        const savedGameRaw = localStorage.getItem(SAVED_GAME_KEY);
        if (savedGameRaw) {
          try {
            const savedGame = JSON.parse(savedGameRaw);
            setDifficulty(savedGame.difficulty);
            setSolution(savedGame.solution);
            setInitialGrid(savedGame.initialGrid);
            setUserGrid(savedGame.userGrid);
            setHintsRemaining(savedGame.hintsRemaining ?? DIFFICULTIES[savedGame.difficulty].hints);
            setTime(savedGame.time ?? 0);
            updateCompletedAreas(savedGame.userGrid);
          } catch (error) {
            console.error("Failed to load saved game", error);
            await startNewGame("easy");
          }
        } else {
          await startNewGame("easy");
        }
      }
    };
  
    initializeGame();
    
    // Cleanup timeout on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userGrid && solution && initialGrid && typeof window !== "undefined") {
      const gameState = {
        difficulty,
        solution,
        initialGrid,
        userGrid,
        hintsRemaining,
        time,
      };
      localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(gameState));
    }
  }, [userGrid, solution, initialGrid, difficulty, hintsRemaining, time]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (!isGameOver && initialGrid) {
      timerInterval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      clearInterval(timerInterval);
    };
  }, [isGameOver, initialGrid]);


  const handleCellClick = (row: number, col: number) => {
    if (isGameOver) return;
    if (initialGrid && initialGrid[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleColorSelect = (colorValue: CellValue) => {
    if (!selectedCell) return;
    placeColorOnBoard(selectedCell.row, selectedCell.col, colorValue);
  };
  
  const handleHint = () => {
    if (isGameOver || hintsRemaining === 0) return;

    if (!selectedCell) {
        toast({
            title: "Select a cell",
            description: "Please select an empty cell to use a hint.",
            variant: "destructive",
            duration: 3000,
        });
        return;
    }
    
    if (solution) {
        const { row, col } = selectedCell;
        const correctColor = solution[row][col];
        placeColorOnBoard(row, col, correctColor);
        setHintsRemaining(prev => prev - 1);
        toast({
            title: "Hint Used!",
            description: `The correct color has been placed. You have ${hintsRemaining-1} hints left.`,
        });
    }
  };


  const checkBoard = () => {
    if (!userGrid || !solution) return;
    const { isCorrect, incorrectCells } = checkSolution(userGrid, solution);
    if (isCorrect) {
      playWinSound();
      setIsGameOver(true);
      setIsWinDialogOpen(true);
      if (typeof window !== "undefined") {
        localStorage.removeItem(SAVED_GAME_KEY);
      }
    } else {
      playConflictSound();
      setConflicts(incorrectCells);
      toast({
        title: "Not quite...",
        description: "There are some mistakes on the board. Keep trying!",
        variant: "destructive",
      });
    }
  };

  return {
    difficulty,
    initialGrid,
    userGrid,
    selectedCell,
    conflicts,
    isGameOver,
    isWinDialogOpen,
    completedRows,
    completedCols,
    completedBoxes,
    colorCounts,
    animatedColor,
    hintsRemaining,
    time,
    setIsWinDialogOpen,
    startNewGame,
    handleCellClick,
    handleColorSelect,
    checkBoard,
    handleHint,
  };
}
