"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";

interface CelebrationAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export function CelebrationAnimation({ isVisible, onComplete }: CelebrationAnimationProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={100}
            gravity={0.1}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999]"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              🎉
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ delay: 0.3 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="bg-gradient-to-r from-accent-electric-purple via-accent-cyan to-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg text-center"
            >
              <p className="mb-2 text-lg">🚀 Amazing work!</p>
              <p className="text-sm">You're unlocking new features</p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
