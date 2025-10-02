
"use client";

import { useSudokuGame } from "@/hooks/use-sudoku-game";
import { SudokuBoard } from "./sudoku-board";
import { ColorPalette } from "./color-palette";
import { GameControls } from "./game-controls";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function GameContainer() {
  const {
    difficulty,
    initialGrid,
    userGrid,
    selectedCell,
    conflicts,
    isGameOver,
    isWinDialogOpen,
    completedRows,
    completedCols,
    completedBoxes,
    setIsWinDialogOpen,
    startNewGame,
    handleCellClick,
    handleColorSelect,
    checkBoard,
  } = useSudokuGame();

  if (!userGrid || !initialGrid) {
    return (
      <div className="w-full aspect-square bg-card rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading Game...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4 md:gap-6">
      <GameControls
        difficulty={difficulty}
        onNewGame={startNewGame}
        onValidate={checkBoard}
        isGameOver={isGameOver}
      />
      <SudokuBoard
        grid={userGrid}
        initialGrid={initialGrid}
        onCellClick={handleCellClick}
        selectedCell={selectedCell}
        conflicts={conflicts}
        isGameOver={isGameOver}
        completedRows={completedRows}
        completedCols={completedCols}
        completedBoxes={completedBoxes}
      />
      <ColorPalette onColorSelect={handleColorSelect} disabled={isGameOver} />
      
      <AlertDialog open={isWinDialogOpen} onOpenChange={setIsWinDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Congratulations!</AlertDialogTitle>
            <AlertDialogDescription>
              You have successfully completed the Sudoku puzzle. Would you like to start a new game?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => startNewGame(difficulty)}>
              New Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    