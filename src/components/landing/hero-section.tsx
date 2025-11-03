"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

export function HeroSection() {
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/hero-background.png')" }}
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative container flex flex-col items-center justify-center text-center py-20 md:py-24 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-card/70 p-8 md:p-12 rounded-xl backdrop-blur-sm border border-border max-w-3xl mx-auto"
          role="region"
          aria-label="Hero section"
        >
          <h1 id="hero-title" className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            From Blank Page to Polished Paper
          </h1>
          <p className="mt-6 text-lg text-muted-foreground" aria-describedby="hero-description">
            ThesisAI is your academic co-pilot, designed to streamline your research journey. Generate outlines, find sources, check for originality, and format citations—all in one intelligent workspace.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4" role="group" aria-label="Primary actions">
            <Button size="lg" asChild>
              <Link href="/register">
                Get Started for Free <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/referrals" className="flex items-center">
                Learn About Referrals
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            <strong>Earn while you learn!</strong> Invite classmates using your referral code and earn credits towards your subscription.
          </p>
        </motion.div>
      </div>
    </section>
  );
}