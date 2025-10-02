import type { Grid, Position } from "@/lib/types";
import { SudokuCell } from "./sudoku-cell";

type SudokuBoardProps = {
  grid: Grid;
  initialGrid: Grid;
  onCellClick: (row: number, col: number) => void;
  selectedCell: Position | null;
  conflicts: Position[];
  isGameOver: boolean;
};

export function SudokuBoard({
  grid,
  initialGrid,
  onCellClick,
  selectedCell,
  conflicts,
  isGameOver
}: SudokuBoardProps) {
  return (
    <div className="relative w-full aspect-square bg-card p-2 rounded-xl shadow-lg">
      <div className="grid grid-cols-9 grid-rows-9 gap-px w-full h-full bg-border">
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const isInitial = initialGrid[rowIndex][colIndex] !== 0;
            const isSelected =
              selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            const isConflict = conflicts.some(
              (p) => p.row === rowIndex && p.col === colIndex
            );

            return (
              <SudokuCell
                key={`${rowIndex}-${colIndex}`}
                value={value}
                row={rowIndex}
                col={colIndex}
                isInitial={isInitial}
                isSelected={isSelected}
                isConflict={isConflict}
                isDisabled={isGameOver}
                onClick={() => onCellClick(rowIndex, colIndex)}
              />
            );
          })
        )}
      </div>
      {/* Thick borders for 3x3 boxes */}
      {[...Array(2)].map((_, i) => (
        <div key={`v-${i}`} className="absolute top-2 bottom-2 bg-foreground/50" style={{ left: `calc(${(i + 1) * 100/3}% - 1px)`, width: '2px' }} />
      ))}
      {[...Array(2)].map((_, i) => (
        <div key={`h-${i}`} className="absolute left-2 right-2 bg-foreground/50" style={{ top: `calc(${(i + 1) * 100/3}% - 1px)`, height: '2px' }} />
      ))}
    </div>
  );
}
