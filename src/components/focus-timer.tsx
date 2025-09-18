"use client";

import { useEffect, useState } from "react";
import { useFocusMode } from "@/contexts/focus-mode-context";
import { toast } from "sonner";
import { Timer } from "lucide-react";

export function FocusTimer() {
  const { timerDuration, stopTimer } = useFocusMode();
  const [timeLeft, setTimeLeft] = useState(timerDuration);

  useEffect(() => {
    if (timeLeft <= 0) {
      toast.success("Focus session complete!", {
        description: "Great work. Time to take a short break.",
      });
      stopTimer();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, stopTimer]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-medium">
      <Timer className="w-4 h-4 text-primary" />
      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
}