"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 bg-grid-slate-700/[0.05] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]"></div>
      <div className="relative container flex flex-col items-center justify-center text-center py-24 md:py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            From Blank Page to Polished Paper
          </h1>
          <p className="mt-6 max-w-3xl text-lg text-slate-300">
            ThesisAI is your academic co-pilot, designed to streamline your research journey. Generate outlines, find sources, check for originality, and format citations—all in one intelligent workspace.
          </p>
        </motion.div>
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <Button size="lg" asChild>
            <Link href="/register">
              Get Started for Free <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}