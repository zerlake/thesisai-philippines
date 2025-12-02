'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Maximize2,
  Minimize2,
  Presentation,
  BookOpen,
  Play,
  Pause,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PresentationControlsProps {
  showNotes: boolean;
  isFullscreen: boolean;
  isPresentationMode: boolean;
  autoAdvance: boolean;
  onToggleNotes: () => void;
  onToggleFullscreen: () => void;
  onTogglePresentationMode: () => void;
  onToggleAutoAdvance: () => void;
}

export function PresentationControls({
  showNotes,
  isFullscreen,
  isPresentationMode,
  autoAdvance,
  onToggleNotes,
  onToggleFullscreen,
  onTogglePresentationMode,
  onToggleAutoAdvance,
}: PresentationControlsProps) {
  return (
    <TooltipProvider>
      <div className="flex gap-1">
        {/* Toggle Notes */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={showNotes ? 'default' : 'outline'}
              onClick={onToggleNotes}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {showNotes ? 'Hide' : 'Show'} speaker notes (N)
          </TooltipContent>
        </Tooltip>

        {/* Toggle Auto-Advance */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={autoAdvance ? 'default' : 'outline'}
              onClick={onToggleAutoAdvance}
            >
              {autoAdvance ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {autoAdvance ? 'Pause' : 'Play'} auto-advance
          </TooltipContent>
        </Tooltip>

        {/* Toggle Presentation Mode */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={isPresentationMode ? 'default' : 'outline'}
              onClick={onTogglePresentationMode}
            >
              <Presentation className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isPresentationMode ? 'Exit' : 'Enter'} presentation mode (P)
          </TooltipContent>
        </Tooltip>

        {/* Toggle Fullscreen */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={isFullscreen ? 'default' : 'outline'}
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isFullscreen ? 'Exit' : 'Enter'} fullscreen (Ctrl+F)
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
