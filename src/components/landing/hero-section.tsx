"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section
      className="relative bg-slate-900 py-24 md:py-32 lg:py-40 overflow-hidden"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center animate-pan-bg" 
        style={{ backgroundImage: "url('/hero-background.png')" }} 
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative container flex max-w-5xl flex-col items-center text-center">
        <motion.div 
          className="flex flex-col items-center bg-black/50 backdrop-blur-sm p-8 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-display font-extrabold tracking-tight text-white">
            Your AI-Powered Academic Co-Pilot
          </h1>
          <p className="mt-6 max-w-3xl text-body text-neutral-200">
            From <span className="font-medium text-white">balangkas</span> to bibliography, conquer your thesis, dissertation, or capstone project with confidence. ThesisAI helps you outline, draft, cite, and refine your work, so you can focus on what truly matters: your research.
          </p>
        </motion.div>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Start Writing Now</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}