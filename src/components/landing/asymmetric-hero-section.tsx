"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { ArrowRightIcon, Sparkles } from 'lucide-react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { HeroCarousel } from './hero-carousel';

export function AsymmetricHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Haptic feedback helper
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/HERO_IMAGE.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          quality={85}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/75 to-slate-800/90" />
      </div>

      {/* Animated Background Orbs - now on top of image */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-electric-purple/10 rounded-full blur-3xl motion-safe:animate-pulse-slow z-[1]" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl motion-safe:animate-pulse-slower z-[1]" />

      {/* Content Container - Positioned at Top */}
      <div className="relative z-10 container flex flex-col md:flex-row items-start justify-between gap-8 pt-8 md:pt-12 lg:pt-16 pb-32 md:pb-40 lg:pb-48">
        
        {/* Left Content (60% on desktop) */}
        <div className="w-full md:w-3/5 lg:w-3/5 flex flex-col">
          
          {/* Badge */}
          <div className="mb-6 inline-flex opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards] w-fit">
            <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">AI-Powered Academic Excellence</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 
            id="hero-title"
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards] leading-tight"
          >
            Your Thesis,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple via-accent-cyan to-pink-500">
              Perfected
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl lg:text-2xl text-slate-300 mb-8 max-w-2xl leading-relaxed opacity-0 animate-[fade-in_0.5s_ease-out_0.4s_forwards]">
            From research conceptualization to final defense, ThesisAI provides enterprise-grade tools to streamline every stage of your academic journey.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 opacity-0 animate-[fade-in_0.5s_ease-out_0.8s_forwards]">
            <div
              onMouseEnter={triggerHaptic}
              className="motion-safe:transition-transform motion-safe:hover:scale-105 motion-safe:hover:-translate-y-0.5"
            >
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-accent-electric-purple to-accent-cyan text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all h-12 px-8 text-base font-semibold w-full md:w-auto"
              >
                <Link href="/register" className="flex items-center gap-2">
                  Get Started Free <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </Button>
            </div>
            <div
              onMouseEnter={triggerHaptic}
              className="motion-safe:transition-transform motion-safe:hover:scale-105 motion-safe:hover:-translate-y-0.5"
            >
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border border-slate-600 text-white hover:bg-slate-800 h-12 px-8 text-base font-semibold w-full md:w-auto"
              >
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>

          {/* Trust Statement */}
          <p className="text-sm text-slate-400 opacity-0 animate-[fade-in_0.5s_ease-out_1s_forwards]">
            <strong className="text-slate-300">🚀 Ready to elevate your thesis?</strong> Join thousands of Filipino students and researchers using ThesisAI.
          </p>
        </div>

        {/* Right Carousel (40% on desktop) */}
        <div className="w-full md:w-2/5 lg:w-2/5 h-64 md:h-80 lg:h-96 opacity-0 animate-[fade-in_0.5s_ease-out_0.6s_forwards]">
          <HeroCarousel />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-[fade-in_0.5s_ease-out_1.2s_forwards] z-10">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-slate-400">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex items-center justify-center">
            <div className="w-1 h-3 bg-slate-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
