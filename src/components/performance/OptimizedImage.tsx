'use client';

import Image from 'next/image';
import { ComponentProps } from 'react';

interface OptimizedImageProps extends ComponentProps<typeof Image> {
  responsive?: boolean;
  aspect?: 'square' | 'video' | 'custom';
}

/**
 * OptimizedImage component with automatic sizing and format support
 * Converts images to WebP/AVIF with automatic fallbacks
 * Implements lazy loading and responsive sizing
 */
export function OptimizedImage({
  responsive = true,
  aspect = 'video',
  ...props
}: OptimizedImageProps) {
  const aspectRatios = {
    square: 1,
    video: 16 / 9,
    custom: 4 / 3,
  };

  return (
    <div
      className={responsive ? 'relative w-full' : 'relative'}
      style={responsive ? { aspectRatio: aspectRatios[aspect] } : undefined}
    >
      <Image
        {...props}
        alt={props.alt || 'Image'}
        fill={responsive}
        loading="lazy"
        sizes={responsive ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : undefined}
        quality={85}
      />
    </div>
  );
}
