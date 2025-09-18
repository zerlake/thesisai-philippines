"use client";

import { Separator } from "./ui/separator";
import { WifiOff } from "lucide-react";

interface EditorStatusBarProps {
  wordCount: number;
  characterCount: number;
  saveState: 'idle' | 'saving' | 'saved';
  isOwner: boolean;
  isOffline: boolean;
}

export function EditorStatusBar({ wordCount, characterCount, saveState, isOwner, isOffline }: EditorStatusBarProps) {
  return (
    <div className="fixed bottom-4 left-4 flex items-center gap-4 text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md">
      <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
      <Separator orientation="vertical" className="h-4" />
      <span>{characterCount.toLocaleString()} {characterCount === 1 ? "character" : "characters"}</span>
      {saveState === 'saving' && isOwner && <><Separator orientation="vertical" className="h-4" /><span className="animate-pulse">Saving...</span></>}
      {isOffline && <><Separator orientation="vertical" className="h-4" /><span className="flex items-center gap-1 text-yellow-500"><WifiOff className="w-3 h-3" /> Offline</span></>}
    </div>
  );
}