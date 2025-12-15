'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  fadeInUp,
  buttonHover,
  pulseGlow,
  staggerContainer,
} from '@/lib/landing/animation-variants';

/**
 * Premium CTA Section
 * High-conversion call-to-action with trust signals
 * Focus: "Start Free Trial" with clear value proposition
 */

export function PremiumCTAEnhanced() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-electric-purple/10 via-slate-900 to-accent-cyan/10" />

      {/* Animated background shapes */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-electric-purple/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-cyan/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container relative">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex mb-8"
          >
            <div className="px-4 py-2 rounded-full bg-accent-electric-purple/10 border border-accent-electric-purple/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-electric-purple" />
              <span className="text-sm font-semibold text-accent-electric-purple">
                Limited Time Offer
              </span>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            Ready to Transform Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple via-accent-cyan to-pink-500">
              Thesis?
            </span>
          </motion.h2>

          {/* Subheading */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-2xl mx-auto"
          >
            Join thousands of students who've already accelerated their thesis journey with AI-powered tools designed for academic excellence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            {/* Primary CTA */}
            <motion.div variants={buttonHover}>
              <Link href="/signup?plan=free">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-accent-electric-purple to-accent-cyan hover:from-accent-electric-purple/90 hover:to-accent-cyan/90 text-white font-semibold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-2xl transition-all group"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            {/* Secondary CTA */}
            <motion.div variants={buttonHover}>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-600 text-white hover:bg-slate-800/50 font-semibold text-lg px-8 py-6 rounded-xl"
              >
                <span>Watch Demo</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust signals */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-slate-700/50"
          >
            {[
              {
                icon: Shield,
                text: '100% Secure',
                description: 'Enterprise-grade encryption',
              },
              {
                icon: Clock,
                text: 'Instant Access',
                description: 'Start in under 2 minutes',
              },
              {
                icon: Sparkles,
                text: 'No Credit Card',
                description: 'Free trial, no strings',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="flex flex-col items-center"
              >
                <div className="p-3 rounded-lg bg-accent-electric-purple/10 text-accent-electric-purple mb-3">
                  <item.icon className="w-6 h-6" />
                </div>
                <p className="font-semibold text-white mb-1">{item.text}</p>
                <p className="text-sm text-slate-400">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating cards for visual interest */}
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 left-10 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hidden lg:block"
        >
          <p className="text-sm font-semibold text-white max-w-xs">
            "Finished my thesis 3 months early!"
          </p>
          <p className="text-xs text-slate-400 mt-2">— Maria S., UP</p>
        </motion.div>

        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-10 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hidden lg:block"
        >
          <p className="text-sm font-semibold text-white max-w-xs">
            "The best thesis tool available!"
          </p>
          <p className="text-xs text-slate-400 mt-2">— Juan D., ADMU</p>
        </motion.div>
      </div>
    </section>
  );
}
