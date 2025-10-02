
"use client";

import { useState, useEffect, useCallback } from "react";
import type { Grid, Difficulty, Position, CellValue } from "@/lib/types";
import { generateSudoku, checkSolution, findConflicts } from "@/lib/sudoku";
import { useToast } from "./use-toast";
import { GRID_SIZE } from "@/lib/constants";

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
  const { toast } = useToast();

  const updateCompletedLines = useCallback((grid: Grid) => {
    const newCompletedRows: number[] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      if (grid[i].every(cell => cell !== 0)) {
        newCompletedRows.push(i);
      }
    }
    setCompletedRows(newCompletedRows);

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
  }, []);

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
    localStorage.removeItem(SAVED_GAME_KEY);
  }, []);

  useEffect(() => {
    const savedGameRaw = localStorage.getItem(SAVED_GAME_KEY);
    if (savedGameRaw) {
      try {
        const savedGame = JSON.parse(savedGameRaw);
        setDifficulty(savedGame.difficulty);
        setSolution(savedGame.solution);
        setInitialGrid(savedGame.initialGrid);
        setUserGrid(savedGame.userGrid);
        updateCompletedLines(savedGame.userGrid);
      } catch (error) {
        console.error("Failed to load saved game", error);
        startNewGame("easy");
      }
    } else {
      startNewGame("easy");
    }
  }, [startNewGame, updateCompletedLines]);

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
    if (!selectedCell || !userGrid || isGameOver) return;

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
      updateCompletedLines(newGrid);
      // Check for row or column completion to show toast
      const isRowComplete = newGrid[row].every(cell => cell !== 0);
      const wasRowPreviouslyComplete = completedRows.includes(row);
      if (isRowComplete && !wasRowPreviouslyComplete) {
        toast({
          title: "Row Complete!",
          description: `You've successfully filled row ${row + 1}.`,
        });
      }
      
      let isColComplete = true;
      for (let i = 0; i < GRID_SIZE; i++) {
        if (newGrid[i][col] === 0) {
          isColComplete = false;
          break;
        }
      }
      const wasColPreviouslyComplete = completedCols.includes(col);
      if (isColComplete && !wasColPreviouslyComplete) {
        toast({
          title: "Column Complete!",
          description: `You've successfully filled column ${col + 1}.`,
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
    setIsWinDialogOpen,
    startNewGame,
    handleCellClick,
    handleColorSelect,
    checkBoard,
  };
}
