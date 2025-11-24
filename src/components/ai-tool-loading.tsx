"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface AIToolLoadingProps {
  isOpen: boolean;
  title: string;
  estimatedSeconds?: number;
  onCancel?: () => void;
}

export function AIToolLoading({
  isOpen,
  title,
  estimatedSeconds = 3,
  onCancel,
}: AIToolLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showAlternatives, setShowAlternatives] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setElapsedSeconds(0);
      setShowAlternatives(false);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 30;
        return Math.min(newProgress, 95); // Never reach 100% until complete
      });
    }, 500);

    const timeInterval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    // Show alternatives after 10 seconds
    if (elapsedSeconds >= 10 && !showAlternatives) {
      setShowAlternatives(true);
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
    };
  }, [isOpen, elapsedSeconds, showAlternatives]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const isLongWait = elapsedSeconds > 10;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle>⏳ {title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Processing</span>
              <span className="font-semibold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Time Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Elapsed time:</span>
              <span className="font-mono text-lg font-bold">{formatTime(elapsedSeconds)}</span>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Usually completes in ~{estimatedSeconds} seconds
            </p>
          </div>

          {/* Long Wait Message */}
          {isLongWait && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900">
                  This is taking longer than expected. You can try again or use a template instead.
                </p>
              </div>
            </div>
          )}

          {/* Alternatives (shown after 10 seconds) */}
          {isLongWait && (
            <div className="space-y-2">
              <Button
                onClick={onCancel}
                variant="outline"
                className="w-full"
              >
                Cancel & Try Again
              </Button>
              <Button
                variant="ghost"
                className="w-full text-xs"
              >
                Use Template Instead
              </Button>
            </div>
          )}

          {/* Cancel Button (initial wait) */}
          {!isLongWait && (
            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-full text-xs"
            >
              Cancel
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
