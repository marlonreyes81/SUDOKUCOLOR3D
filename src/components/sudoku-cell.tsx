import { cn } from "@/lib/utils";
import { COLORS } from "@/lib/constants";
import type { CellValue } from "@/lib/types";

type SudokuCellProps = {
  value: CellValue;
  isInitial: boolean;
  isSelected: boolean;
  isConflict: boolean;
  isDisabled: boolean;
  onClick: () => void;
  row: number;
  col: number;
};

export function SudokuCell({
  value,
  isInitial,
  isSelected,
  isConflict,
  isDisabled,
  onClick,
}: SudokuCellProps) {
  const colorClass = value !== 0 ? COLORS[value].class : "";

  return (
    <button
      onClick={onClick}
      disabled={isInitial || isDisabled}
      className={cn(
        "relative w-full h-full flex items-center justify-center bg-card transition-all duration-150 focus:outline-none",
        "shadow-inner", // Gives a slight inset look for empty cells
        !isInitial && "cursor-pointer hover:bg-background",
        isDisabled && "cursor-not-allowed",
        isSelected && !isConflict && "ring-2 ring-primary ring-inset z-10",
        isConflict && "ring-2 ring-destructive ring-inset z-10 animate-pulse"
      )}
      aria-label={`Cell at row ${row + 1}, column ${col + 1}, value ${value || 'empty'}`}
    >
      {value !== 0 && (
        <div
          className={cn(
            "w-[85%] h-[85%] rounded-md transition-all",
            colorClass,
            "shadow-md", // The "soft 3D" or "alto relieve" effect
            isInitial ? "font-bold" : ""
          )}
        />
      )}
    </button>
  );
}
