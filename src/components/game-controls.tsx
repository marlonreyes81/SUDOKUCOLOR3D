import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, RefreshCw, Check } from "lucide-react";
import type { Difficulty } from "@/lib/types";
import { DIFFICULTIES } from "@/lib/constants";

type GameControlsProps = {
  difficulty: Difficulty;
  onNewGame: (difficulty: Difficulty) => void;
  onValidate: () => void;
  isGameOver: boolean;
};

export function GameControls({
  difficulty,
  onNewGame,
  onValidate,
  isGameOver
}: GameControlsProps) {
  return (
    <div className="w-full flex justify-between items-center bg-card p-2 rounded-lg shadow-md">
      <Button
        variant="ghost"
        onClick={() => onNewGame(difficulty)}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        New Game
      </Button>

      <div className="flex items-center gap-2">
         <Button
            variant="outline"
            onClick={onValidate}
            disabled={isGameOver}
          >
            <Check className="mr-2 h-4 w-4" />
            Check
          </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {DIFFICULTIES[difficulty].name}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
              <DropdownMenuItem key={d} onClick={() => onNewGame(d)}>
                {DIFFICULTIES[d].name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
