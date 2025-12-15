"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-brand-dark-bg/90 backdrop-blur-md border-b border-brand-dark-bg/50 py-2"
          : "bg-transparent py-4"
      }`}
      role="banner"
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 font-bold text-xl text-white group"
          aria-label="ThesisAI Philippines Home"
        >
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm">
            <Image
              src="/THESIS-AI-LOGO2.png"
              alt="ThesisAI Logo"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ThesisAI
          </span>
          <span className="text-slate-300 hidden sm:inline">Philippines</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {[
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "For Advisors", href: "/for-advisors" },
            { label: "For Critics", href: "/for-critics" },
            { label: "Help", href: "/faq" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-text-secondary hover:text-white hover:text-accent-cyan border border-brand-dark-bg/50 hover:border-accent-electric-purple/50 px-3 py-2 rounded-lg transition-all font-medium"
              aria-label={item.label}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" aria-label="Login to your account">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
              Login
            </Button>
          </Link>
          <Link href="/register" aria-label="Sign up for a free account">
            <Button className="bg-gradient-to-r from-accent-electric-purple to-purple-600 hover:from-accent-electric-purple hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              Get Started <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile menu"
        >
          <div className="container py-4 flex flex-col gap-4">
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "For Advisors", href: "/for-advisors" },
              { label: "For Critics", href: "/for-critics" },
              { label: "Help", href: "/faq" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-slate-300 hover:text-white transition-colors py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
                aria-label={item.label}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4">
              <Link
                href="/login"
                className="block"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Login to your account"
              >
                <Button
                  variant="outline"
                  className="w-full border-slate-600 text-white hover:bg-slate-800"
                >
                  Login
                </Button>
              </Link>
              <Link
                href="/register"
                className="block"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Sign up for a free account"
              >
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}