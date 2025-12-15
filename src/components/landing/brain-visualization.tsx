"use client";

import React, { useEffect, useRef } from 'react';

const BrainVisualization = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This would normally be a more complex 3D implementation
    // For now, we'll create a CSS-based representation
  }, []);

  // Predefined positions and sizes for particles to ensure consistent rendering
  const particlePositions = [
    { top: '10%', left: '15%', size: '6px', delay: '0s' },
    { top: '20%', left: '85%', size: '4px', delay: '0.5s' },
    { top: '35%', left: '30%', size: '7px', delay: '1s' },
    { top: '50%', left: '70%', size: '5px', delay: '1.5s' },
    { top: '65%', left: '20%', size: '4px', delay: '0.8s' },
    { top: '80%', left: '80%', size: '6px', delay: '1.2s' },
    { top: '75%', left: '45%', size: '5px', delay: '0.3s' },
    { top: '40%', left: '55%', size: '8px', delay: '1.8s' },
    { top: '25%', left: '40%', size: '4px', delay: '0.7s' },
    { top: '15%', left: '65%', size: '6px', delay: '0.2s' },
    { top: '55%', left: '10%', size: '5px', delay: '1.4s' },
    { top: '90%', left: '50%', size: '7px', delay: '0.9s' },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
      aria-hidden="true" // This is decorative, so hide from screen readers
    >
      {/* 3D Brain representation using CSS */}
      <div className="relative w-48 h-48 md:w-64 md:h-64" aria-label="AI Brain Visualization">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl motion-safe:animate-pulse-slow"></div>

        {/* Main brain shape */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm border border-blue-500/20"></div>

        {/* Neural network lines */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-8 bg-gradient-to-t from-blue-400/50 to-transparent motion-safe:animate-pulse"
              style={{
                top: '10%',
                left: `${(i + 1) * 12}%`,
                transform: `rotate(${i * 45}deg) translateY(-20px)`,
                transformOrigin: 'bottom center',
              }}
            ></div>
          ))}
        </div>

        {/* Floating particles */}
        {particlePositions.map((pos, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/30 motion-safe:animate-float"
            style={{
              width: pos.size,
              height: pos.size,
              top: pos.top,
              left: pos.left,
              animationDelay: pos.delay,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default BrainVisualization;