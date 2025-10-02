export type Difficulty = "easy" | "medium" | "hard";
export type CellValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0; // 0 for empty
export type Grid = CellValue[][];
export type Position = { row: number; col: number };
