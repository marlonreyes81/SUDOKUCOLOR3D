import type { Difficulty } from "./types";

export const COLORS: Record<
  Exclude<import("./types").CellValue, 0>,
  { name: string; class: string }
> = {
  1: { name: "Red", class: "bg-red-500" },
  2: { name: "Yellow", class: "bg-yellow-400" },
  3: { name: "Blue", class: "bg-blue-500" },
  4: { name: "Green", class: "bg-green-500" },
  5: { name: "Purple", class: "bg-purple-500" },
  6: { name: "Orange", class: "bg-orange-500" },
  7: { name: "Pink", class: "bg-pink-400" },
  8: { name: "Black", class: "bg-gray-900" },
  9: { name: "White", class: "bg-white border border-gray-300" },
};

export const DIFFICULTIES: Record<
  Difficulty,
  { name: string; clues: number }
> = {
  easy: { name: "Easy", clues: 35 },
  medium: { name: "Medium", clues: 28 },
  hard: { name: "Hard", clues: 22 },
};

export const GRID_SIZE = 9;
export const BOX_SIZE = 3;
