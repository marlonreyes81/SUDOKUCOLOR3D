
import { Eraser } from "lucide-react";
import { COLORS } from "@/lib/constants";
import type { CellValue } from "@/lib/types";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type ColorPaletteProps = {
  onColorSelect: (value: CellValue) => void;
  disabled?: boolean;
  colorCounts?: Record<number, number>;
  maxCount?: number;
};

export function ColorPalette({
  onColorSelect,
  disabled,
  colorCounts = {},
  maxCount = 9,
}: ColorPaletteProps) {
  return (
    <div className="w-full bg-card p-2 rounded-lg shadow-md">
      <div className="grid grid-cols-10 gap-2">
        {Object.entries(COLORS).map(([valueStr, { class: colorClass }]) => {
          const value = Number(valueStr) as CellValue;
          const count = colorCounts[value] || 0;
          const remaining = maxCount - count;
          const isColorDisabled = disabled || remaining <= 0;

          return (
            <button
              key={value}
              onClick={() => onColorSelect(value)}
              disabled={isColorDisabled}
              className={cn(
                "relative aspect-square w-full rounded-md shadow-md hover:scale-110 active:scale-95 transition-transform duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
                colorClass
              )}
              aria-label={`Select color ${
                COLORS[value as keyof typeof COLORS].name
              }`}
            >
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                {remaining > 0 ? remaining : ''}
              </span>
            </button>
          );
        })}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onColorSelect(0)}
          disabled={disabled}
          className="aspect-square w-full h-full shadow-md hover:scale-110 active:scale-95 transition-transform"
          aria-label="Erase cell"
        >
          <Eraser className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
