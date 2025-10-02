import { GameContainer } from "@/components/game-container";
import { Logo } from "@/components/logo";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        <Logo />
        <GameContainer />
      </div>
      <Toaster />
    </main>
  );
}
