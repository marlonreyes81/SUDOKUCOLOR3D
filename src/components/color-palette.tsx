import { Eraser } from "lucide-react";
import { COLORS } from "@/lib/constants";
import type { CellValue } from "@/lib/types";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type ColorPaletteProps = {
  onColorSelect: (value: CellValue) => void;
  disabled?: boolean;
};

export function ColorPalette({ onColorSelect, disabled }: ColorPaletteProps) {
  return (
    <div className="w-full bg-card p-2 rounded-lg shadow-md">
      <div className="grid grid-cols-10 gap-2">
        {Object.entries(COLORS).map(([value, { class: colorClass }]) => (
          <button
            key={value}
            onClick={() => onColorSelect(Number(value) as CellValue)}
            disabled={disabled}
            className={cn(
              "aspect-square w-full rounded-md shadow-md hover:scale-110 active:scale-95 transition-transform duration-150 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
              colorClass
            )}
            aria-label={`Select color ${COLORS[Number(value) as keyof typeof COLORS].name}`}
          />
        ))}
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
