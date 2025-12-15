"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRightIcon, Sparkles, Users, TrendingUp } from "lucide-react";
import { useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import Image from "next/image";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

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
      aria-labelledby="hero-title"
    >
      {/* Preloaded hero background image with explicit dimensions to prevent CLS */}
      <Image
        src="/hero-background.webp"
        alt="Hero background"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="absolute inset-0 object-cover"
        onLoad={() => setBackgroundLoaded(true)}
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
          objectFit: 'cover',
          color: 'transparent' // Hide alt text during loading
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-slate-900" />

      {/* Simplified background elements with CSS animations for performance */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-electric-purple/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse-slower" />

      <div className="relative container flex flex-col items-center justify-center text-center py-4 md:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="mb-6 inline-flex opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards]">
            <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">AI-Powered Academic Excellence</span>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards]">
            Your Thesis,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple via-accent-cyan to-pink-500">
              Perfected
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed opacity-0 animate-[fade-in_0.5s_ease-out_0.4s_forwards]">
            From research conceptualization to final defense, ThesisAI provides enterprise-grade tools to streamline every stage of your academic journey.
          </p>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 mb-10 max-w-2xl mx-auto opacity-0 animate-[fade-in_0.5s_ease-out_0.5s_forwards]">
            {[
              { value: "10K+", label: "Students", icon: Users },
              { value: "98%", label: "Approval Rate", icon: TrendingUp },
              { value: "24/7", label: "Support", icon: Sparkles }
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all opacity-0 animate-[fade-in_0.5s_ease-out_0.6s_forwards]"
                style={{ animationDelay: `${500 + idx * 100}ms` }}
              >
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple to-accent-cyan mb-1">
                  {stat.value}
                </p>
                <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-8 opacity-0 animate-[fade-in_0.5s_ease-out_0.8s_forwards]">
            <div
              onMouseEnter={triggerHaptic}
              className="motion-safe:transition-transform motion-safe:hover:scale-105 motion-safe:hover:-translate-y-0.5"
            >
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-accent-electric-purple to-accent-cyan text-white hover:shadow-2xl hover:shadow-accent-electric-purple/50 transition-all h-12 px-8 text-base font-semibold w-full"
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
                className="border border-slate-600 text-white hover:bg-slate-800 h-12 px-8 text-base font-semibold w-full"
              >
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>

          {/* Trust statement */}
          <p className="text-sm text-slate-400 opacity-0 animate-[fade-in_0.5s_ease-out_1s_forwards]">
            <strong className="text-slate-300">🚀 Ready to elevate your thesis?</strong> Join thousands of Filipino students and researchers using ThesisAI.
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-[fade-in_0.5s_ease-out_1.2s_forwards]">
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