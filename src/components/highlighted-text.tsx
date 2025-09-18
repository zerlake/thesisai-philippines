"use client";

import React from 'react';
import { cn } from '../lib/utils';

interface HighlightedTextProps {
  text: string;
  highlights: string[];
  className?: string;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function HighlightedText({ text, highlights, className }: HighlightedTextProps) {
  if (!highlights || highlights.length === 0) {
    return <div className={cn("whitespace-pre-wrap p-4 border rounded-md bg-muted/50", className)}>{text}</div>;
  }

  const regex = new RegExp(`(${highlights.map(escapeRegExp).join('|')})`, 'g');
  
  const parts = text.split(regex);

  return (
    <div className={cn("whitespace-pre-wrap p-4 border rounded-md bg-muted/50 max-h-[400px] overflow-y-auto", className)}>
      {parts.map((part, i) => 
        highlights.includes(part) ? (
          <mark key={i} className="bg-destructive/20 rounded px-1 py-0.5">
            {part}
          </mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </div>
  );
}