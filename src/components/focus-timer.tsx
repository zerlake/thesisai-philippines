"use client";

import { useEffect, useState } from "react";
import { useFocusMode } from "@/contexts/focus-mode-context";
import { Button } from "./ui/button";
import { Pause, Play, X } from "lucide-react";
import { toast } from "sonner";

export function FocusTimer() {
  const { timerDuration, stopTimer } = useFocusMode();
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setTimeLeft(timerDuration);
  }, [timerDuration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      toast.success("Focus session complete!", {
        description: "Great work. Time to take a short break.",
      });
      stopTimer();
      return;
    }

    if (isPaused) return;

    const intervalId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, isPaused, stopTimer]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg border flex items-center gap-2">
      <div className="font-mono text-lg font-semibold w-16 text-center">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)}>
        {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={stopTimer}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}