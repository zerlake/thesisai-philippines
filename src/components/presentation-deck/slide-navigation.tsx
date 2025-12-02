'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GripHorizontal } from 'lucide-react';

interface SlideNavigationProps {
  currentSlide: number;
  totalSlides: number;
  onGoToSlide: (slideNumber: number) => void;
}

export function SlideNavigation({
  currentSlide,
  totalSlides,
  onGoToSlide,
}: SlideNavigationProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(currentSlide));

  React.useEffect(() => {
    setInputValue(String(currentSlide));
  }, [currentSlide]);

  const handleSubmit = () => {
    const slideNum = parseInt(inputValue, 10);
    if (slideNum >= 1 && slideNum <= totalSlides) {
      onGoToSlide(slideNum);
      setIsEditing(false);
    } else {
      setInputValue(String(currentSlide));
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <GripHorizontal className="h-4 w-4 text-gray-400" />
        <Input
          type="number"
          min={1}
          max={totalSlides}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') {
              setInputValue(String(currentSlide));
              setIsEditing(false);
            }
          }}
          autoFocus
          className="w-12 text-center text-sm"
        />
        <span className="text-sm text-gray-600">/</span>
        <span className="text-sm text-gray-600">{totalSlides}</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
      onClick={() => setIsEditing(true)}
    >
      <GripHorizontal className="h-4 w-4 text-gray-400" />
      <span className="text-sm font-medium text-gray-700">
        {currentSlide} / {totalSlides}
      </span>
    </div>
  );
}
