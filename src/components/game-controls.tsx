import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, RefreshCw, Check, Lightbulb } from "lucide-react";
import type { Difficulty } from "@/lib/types";
import { DIFFICULTIES } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type GameControlsProps = {
  difficulty: Difficulty;
  onNewGame: (difficulty: Difficulty) => void;
  onValidate: () => void;
  onHint: () => void;
  hintsRemaining: number;
  isGameOver: boolean;
};

export function GameControls({
  difficulty,
  onNewGame,
  onValidate,
  onHint,
  hintsRemaining,
  isGameOver,
}: GameControlsProps) {
  return (
    <div className="w-full flex justify-between items-center bg-card p-2 rounded-lg shadow-md">
      <TooltipProvider>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onNewGame(difficulty)}>
                <RefreshCw className="h-5 w-5" />
                <span className="sr-only">New Game</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start a New Game</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onValidate}
                disabled={isGameOver}
              >
                <Check className="h-5 w-5" />
                 <span className="sr-only">Check Solution</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Check Board</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onHint}
          disabled={isGameOver || hintsRemaining === 0}
          className="relative"
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          Hint
          <span className="absolute -right-2 -top-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {hintsRemaining}
          </span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-32 justify-between">
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
