"use client";

import React from 'react';

export function HeroBrainVisualization() {
  return (
    <div 
      className="absolute inset-0 z-0" 
      aria-hidden="true"
    >
      <style>{`
        @keyframes brainPulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 60px rgba(59, 130, 246, 0.3), 0 0 100px rgba(168, 85, 247, 0.2);
          }
          50% { 
            transform: scale(1.08);
            box-shadow: 0 0 80px rgba(59, 130, 246, 0.6), 0 0 120px rgba(168, 85, 247, 0.4);
          }
        }

        @keyframes flowGlow {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .brain-bg-container {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 40px;
        }

        .brain-core {
          animation: brainPulse 4s ease-in-out infinite;
          position: relative;
        }

        .orbit-ring {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Full-screen container */}
      <div className="brain-bg-container w-full h-full">
        {/* Main brain visualization - large glowing orbs */}
        <div className="brain-core w-96 h-96 relative">
          
          {/* Outer glow sphere - purple/blue */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600/30 via-purple-600/25 to-cyan-600/20 blur-3xl" />
          
          {/* Primary brain mass - blue side */}
          <div className="absolute top-12 left-0 w-64 h-72 rounded-full bg-gradient-to-br from-blue-500/40 to-blue-600/25 blur-xl shadow-2xl shadow-blue-500/30" />
          
          {/* Secondary brain mass - purple side */}
          <div className="absolute top-16 right-0 w-56 h-64 rounded-full bg-gradient-to-br from-purple-500/35 to-purple-600/20 blur-lg shadow-2xl shadow-purple-500/25" />
          
          {/* Bright cyan core center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400/50 to-blue-500/40 blur-md shadow-2xl shadow-cyan-500/40" />
          
          {/* Glow rings */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-400/20 blur-sm" style={{ animation: 'flowGlow 3s ease-in-out infinite' }} />
          <div className="absolute inset-12 rounded-full border border-cyan-400/15 blur-sm" style={{ animation: 'flowGlow 4s ease-in-out infinite 0.5s' }} />
          <div className="absolute inset-24 rounded-full border border-purple-400/10 blur-sm" style={{ animation: 'flowGlow 5s ease-in-out infinite 1s' }} />
          
          {/* Radial light beams */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 origin-left"
              style={{
                width: '200px',
                height: '2px',
                background: `linear-gradient(to right, rgba(6, 182, 212, 0.4), transparent)`,
                transform: `translateY(-50%) rotate(${i * 45}deg)`,
                opacity: 0.5,
                animation: `flowGlow ${2.5 + i * 0.1}s ease-in-out infinite ${i * 0.1}s`
              }}
            />
          ))}
          
          {/* Floating particles around the brain */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-blue-400 to-cyan-300"
              style={{
                width: `${8 + i * 2}px`,
                height: `${8 + i * 2}px`,
                top: `${20 + i * 12}%`,
                left: `${10 + i * 15}%`,
                opacity: 0.6,
                boxShadow: `0 0 ${12 + i * 2}px rgba(59, 130, 246, 0.6)`,
                animation: `float ${3 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`
              }}
            />
          ))}
          
          {/* Additional floating particles from right */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={`right-${i}`}
              className="absolute rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
              style={{
                width: `${6 + i * 2}px`,
                height: `${6 + i * 2}px`,
                top: `${35 + i * 15}%`,
                right: `${5 + i * 10}%`,
                opacity: 0.5,
                boxShadow: `0 0 ${10 + i * 1}px rgba(168, 85, 247, 0.5)`,
                animation: `float ${4 + i * 0.2}s ease-in-out infinite ${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
