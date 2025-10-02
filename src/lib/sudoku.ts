import { DIFFICULTIES, GRID_SIZE, BOX_SIZE } from "./constants";
import type { Grid, CellValue, Difficulty, Position } from "./types";

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function isSafe(
  grid: Grid,
  row: number,
  col: number,
  num: CellValue
): boolean {
  for (let x = 0; x < GRID_SIZE; x++) {
    if (grid[row][x] === num || grid[x][col] === num) {
      return false;
    }
  }

  const startRow = row - (row % BOX_SIZE);
  const startCol = col - (col % BOX_SIZE);
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      if (grid[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
}

function fillGrid(grid: Grid): boolean {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === 0) {
        const numbers: CellValue[] = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isSafe(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) {
              return true;
            }
            grid[row][col] = 0; // backtrack
          }
        }
        return false;
      }
    }
  }
  return true;
}

function createPuzzle(solution: Grid, difficulty: Difficulty): Grid {
  const puzzle = solution.map((row) => [...row]) as Grid;
  const clues = DIFFICULTIES[difficulty].clues;
  let cellsToRemove = GRID_SIZE * GRID_SIZE - clues;

  while (cellsToRemove > 0) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      cellsToRemove--;
    }
  }
  return puzzle;
}

export async function generateSudoku(
  difficulty: Difficulty
): Promise<{ solution: Grid; puzzle: Grid }> {
  return new Promise((resolve) => {
    // Allow the UI to update before starting the heavy computation
    setTimeout(() => {
      const solution: Grid = Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill(0)
      );
      fillGrid(solution);
      const puzzle = createPuzzle(solution, difficulty);
      resolve({ solution, puzzle });
    }, 50); // A small delay
  });
}

export function checkSolution(
  userGrid: Grid,
  solution: Grid
): { isCorrect: boolean; incorrectCells: Position[] } {
  const incorrectCells: Position[] = [];
  let isCorrect = true;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (userGrid[row][col] === 0 || userGrid[row][col] !== solution[row][col]) {
        isCorrect = false;
        if (userGrid[row][col] !== 0) {
           incorrectCells.push({ row, col });
        }
      }
    }
  }
  return { isCorrect, incorrectCells };
}

export function findConflicts(grid: Grid, row: number, col: number): Position[] {
  const conflicts: Position[] = [];
  const value = grid[row][col];
  if (value === 0) return [];

  // Check row
  for (let c = 0; c < GRID_SIZE; c++) {
    if (c !== col && grid[row][c] === value) {
      conflicts.push({ row, col: c });
    }
  }

  // Check column
  for (let r = 0; r < GRID_SIZE; r++) {
    if (r !== row && grid[r][col] === value) {
      conflicts.push({ row: r, col });
    }
  }

  // Check box
  const boxStartRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxStartCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = boxStartRow; r < boxStartRow + BOX_SIZE; r++) {
    for (let c = boxStartCol; c < boxStartCol + BOX_SIZE; c++) {
      if (r !== row && c !== col && grid[r][c] === value) {
        conflicts.push({ row: r, col: c });
      }
    }
  }
  
  if (conflicts.length > 0) conflicts.push({ row, col });

  return conflicts;
}
