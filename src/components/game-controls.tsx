import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown, RefreshCw, Check, Lightbulb, Clock } from "lucide-react";
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
  time: number;
};

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function GameControls({
  difficulty,
  onNewGame,
  onValidate,
  onHint,
  hintsRemaining,
  isGameOver,
  time,
}: GameControlsProps) {
  return (
    <div className="w-full flex justify-between items-center bg-card p-2 rounded-lg shadow-md">
      <div className="flex items-center gap-1">
        <TooltipProvider>
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
        </TooltipProvider>
        <div className="flex items-center gap-2 text-muted-foreground ml-2">
            <Clock className="h-5 w-5" />
            <span className="font-mono text-lg">{formatTime(time)}</span>
        </div>
      </div>

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
