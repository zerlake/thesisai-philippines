"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const CAROUSEL_IMAGES = [
  {
    src: '/hero-background.webp',
    alt: 'Hero background visualization',
  },
  {
    src: '/hero-background-2.webp',
    alt: 'Hero background visualization 2',
  },
  {
    src: '/hero-background-3.webp',
    alt: 'Hero background visualization 3',
  }
];

const CAROUSEL_INTERVAL = 5000; // 5 seconds

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % CAROUSEL_IMAGES.length);
    }, CAROUSEL_INTERVAL);

    return () => clearInterval(interval);
  }, [mounted]);

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (!mounted) {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-800 animate-pulse" />
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-900">
      {/* Image Container */}
      <div className="relative w-full h-full">
        {CAROUSEL_IMAGES.map((img, idx) => (
          <Image
            key={idx}
            src={img.src}
            alt={img.alt}
            fill
            priority={idx === 0}
            quality={85}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
            className={`object-cover transition-opacity duration-500 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            onError={(e) => {
              console.error(`Failed to load image: ${img.src}`);
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/20 pointer-events-none z-5" />

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {CAROUSEL_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToImage(idx)}
            aria-label={`Go to image ${idx + 1} of ${CAROUSEL_IMAGES.length}`}
            className={`transition-all duration-300 rounded-full cursor-pointer hover:opacity-100 ${
              idx === currentIndex
                ? 'w-3 h-2 bg-accent-cyan opacity-100'
                : 'w-2 h-2 bg-white/30 opacity-50'
            }`}
            aria-current={idx === currentIndex ? 'true' : 'false'}
            type="button"
          />
        ))}
      </div>

      {/* Image counter */}
      <div className="absolute top-4 right-4 text-white/70 text-sm font-medium z-20">
        {currentIndex + 1} / {CAROUSEL_IMAGES.length}
      </div>
    </div>
  );
}
