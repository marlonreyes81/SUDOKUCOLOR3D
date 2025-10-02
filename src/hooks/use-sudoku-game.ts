
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Grid, Difficulty, Position, CellValue } from "@/lib/types";
import { generateSudoku, checkSolution, findConflicts } from "@/lib/sudoku";
import { useToast } from "./use-toast";
import { GRID_SIZE, BOX_SIZE } from "@/lib/constants";

const SAVED_GAME_KEY = "sudokuColorGameState";

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
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

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
    // Check rows
    const newCompletedRows: number[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      if (grid[i].every(cell => cell !== 0)) {
        newCompletedRows.push(i);
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
      if (colComplete) {
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
        if (boxComplete) {
          newCompletedBoxes.push(boxIndex);
        }
      }
    }
    setCompletedBoxes(newCompletedBoxes);
    updateColorCounts(grid);
  }, [updateColorCounts]);

  const startNewGame = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    const { solution, puzzle } = generateSudoku(newDifficulty);
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
    updateColorCounts(puzzle);
    localStorage.removeItem(SAVED_GAME_KEY);
  }, [updateColorCounts]);

  useEffect(() => {
    const savedGameRaw = localStorage.getItem(SAVED_GAME_KEY);
    if (savedGameRaw) {
      try {
        const savedGame = JSON.parse(savedGameRaw);
        setDifficulty(savedGame.difficulty);
        setSolution(savedGame.solution);
        setInitialGrid(savedGame.initialGrid);
        setUserGrid(savedGame.userGrid);
        updateCompletedAreas(savedGame.userGrid);
        updateColorCounts(savedGame.userGrid);
      } catch (error) {
        console.error("Failed to load saved game", error);
        startNewGame("easy");
      }
    } else {
      startNewGame("easy");
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [startNewGame, updateCompletedAreas, updateColorCounts]);

  useEffect(() => {
    if (userGrid && solution && initialGrid) {
      const gameState = {
        difficulty,
        solution,
        initialGrid,
        userGrid,
      };
      localStorage.setItem(SAVED_GAME_KEY, JSON.stringify(gameState));
    }
  }, [userGrid, solution, initialGrid, difficulty]);

  const handleCellClick = (row: number, col: number) => {
    if (isGameOver) return;
    if (initialGrid && initialGrid[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleColorSelect = (colorValue: CellValue) => {
    if (!selectedCell || !userGrid || isGameOver || colorValue === 0) return;

    const { row, col } = selectedCell;
    const newGrid = userGrid.map((r) => [...r]) as Grid;
    newGrid[row][col] = colorValue;
    setUserGrid(newGrid);

    const currentConflicts = findConflicts(newGrid, row, col);
    setConflicts(currentConflicts);

    if (currentConflicts.length > 0) {
      toast({
        title: "Conflict!",
        description: "That color conflicts with another in the same row, column, or box.",
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
      
      const wasRowPreviouslyComplete = completedRows.includes(row);
      const isRowNowComplete = newGrid[row].every(cell => cell !== 0);
      if (isRowNowComplete && !wasRowPreviouslyComplete) {
        toast({
          title: "Row Complete!",
          description: `You've successfully filled row ${row + 1}.`,
        });
      }
      
      const wasColPreviouslyComplete = completedCols.includes(col);
      let isColNowComplete = true;
      for (let i = 0; i < GRID_SIZE; i++) {
        if (newGrid[i][col] === 0) {
          isColNowComplete = false;
          break;
        }
      }
      if (isColNowComplete && !wasColPreviouslyComplete) {
        toast({
          title: "Column Complete!",
          description: `You've successfully filled column ${col + 1}.`,
        });
      }

      const boxIndex = Math.floor(row / BOX_SIZE) * BOX_SIZE + Math.floor(col / BOX_SIZE);
      const wasBoxPreviouslyComplete = completedBoxes.includes(boxIndex);
      let isBoxNowComplete = true;
      const boxStartRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
      const boxStartCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
      for (let i = 0; i < BOX_SIZE; i++) {
        for (let j = 0; j < BOX_SIZE; j++) {
          if (newGrid[boxStartRow + i][boxStartCol + j] === 0) {
            isBoxNowComplete = false;
            break;
          }
        }
        if (!isBoxNowComplete) break;
      }
      if (isBoxNowComplete && !wasBoxPreviouslyComplete) {
        toast({
          title: "Box Complete!",
          description: `You've successfully filled a 3x3 box.`,
        });
      }

      // Check for win condition
      const isFilled = newGrid.every(row => row.every(cell => cell !== 0));
      if (isFilled) {
        const { isCorrect } = checkSolution(newGrid, solution!);
        if (isCorrect) {
          setIsGameOver(true);
          setIsWinDialogOpen(true);
          localStorage.removeItem(SAVED_GAME_KEY);
        }
      }
    }
  };

  const checkBoard = () => {
    if (!userGrid || !solution) return;
    const { isCorrect, incorrectCells } = checkSolution(userGrid, solution);
    if (isCorrect) {
      setIsGameOver(true);
      setIsWinDialogOpen(true);
      localStorage.removeItem(SAVED_GAME_KEY);
    } else {
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
    setIsWinDialogOpen,
    startNewGame,
    handleCellClick,
    handleColorSelect,
    checkBoard,
  };
}
