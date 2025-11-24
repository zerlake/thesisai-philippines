"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { ArrowRightIcon, Sparkles, Users, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInView, setIsInView] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Spring animation configuration
  const springConfig = prefersReducedMotion 
    ? { type: "tween", duration: 0.3 }
    : { type: "spring", stiffness: 100, damping: 30, mass: 1 };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: prefersReducedMotion ? 0.05 : 0.15, 
        delayChildren: 0 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        ...springConfig,
        duration: prefersReducedMotion ? 0.3 : 0.8 
      } 
    }
  };

  // Track mouse for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current && !prefersReducedMotion) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x: x * 10, y: y * 10 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion]);

  // Haptic feedback helper
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/hero-background.png')" }}
      aria-labelledby="hero-title"
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-slate-900" />
      
      {/* Animated background elements with parallax */}
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
        animate={!prefersReducedMotion ? mousePosition : {}}
        transition={{ type: "tween", duration: 0.6 }}
      />
      <motion.div 
        className="absolute bottom-0 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={!prefersReducedMotion ? { x: -mousePosition.x, y: -mousePosition.y } : {}}
        transition={{ type: "tween", duration: 0.6 }}
      />

      <div className="relative container flex flex-col items-center justify-center text-center py-4 md:py-6 lg:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6 inline-flex">
            <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">AI-Powered Academic Excellence</span>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            variants={itemVariants}
            id="hero-title"
            className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6"
          >
            Your Thesis,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Perfected
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            From research conceptualization to final defense, ThesisAI provides enterprise-grade tools to streamline every stage of your academic journey.
          </motion.p>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 gap-4 md:gap-8 mb-10 max-w-2xl mx-auto"
          >
            {[
              { icon: Users, label: "AI-Powered", value: "Research Tools" },
              { icon: TrendingUp, label: "Smart", value: "Analysis Engine" },
              { icon: Sparkles, label: "Instant", value: "AI Feedback" }
            ].map((stat, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
                <stat.icon className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-white">{stat.label}</p>
                <p className="text-xs text-slate-400">{stat.value}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col md:flex-row justify-center gap-4 mb-8"
          >
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={triggerHaptic}
              transition={springConfig}
            >
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all h-12 px-8 text-base font-semibold w-full"
              >
                <Link href="/register" className="flex items-center gap-2">
                  Get Started Free <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onMouseEnter={triggerHaptic}
              transition={springConfig}
            >
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border border-slate-600 text-white hover:bg-slate-800 h-12 px-8 text-base font-semibold w-full"
              >
                <Link href="#features">Explore Features</Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust statement */}
          <motion.p variants={itemVariants} className="text-sm text-slate-400">
            <strong className="text-slate-300">🚀 Ready to elevate your thesis?</strong> Join thousands of Filipino students and researchers using ThesisAI.
          </motion.p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-slate-400">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex items-center justify-center">
            <div className="w-1 h-3 bg-slate-400 rounded-full" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}