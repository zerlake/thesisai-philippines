'use client';

import { motion } from 'framer-motion';
import { Users, Star, TrendingUp, BookOpen } from 'lucide-react';
import { useScrollAnimation, useCounterAnimation } from '@/hooks/useScrollAnimation';
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
  cardVariant,
} from '@/lib/landing/animation-variants';

/**
 * Social Proof Section
 * Displays trust signals: stats counters, testimonials, university logos
 * Performance: Counter animations use requestAnimationFrame for 60fps
 */

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
  description: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  university: string;
  avatar: string;
  rating: number;
}

const stats: StatItem[] = [
  {
    icon: <Users className="w-6 h-6" />,
    value: 50000,
    suffix: '+',
    label: 'Students',
    description: 'Actively using ThesisAI',
  },
  {
    icon: <Star className="w-6 h-6" />,
    value: 48,
    suffix: '/5',
    label: 'Rating',
    description: '4,200+ verified reviews',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    value: 95,
    suffix: '%',
    label: 'Improvement',
    description: 'Average thesis quality gain',
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    value: 250000,
    suffix: '+',
    label: 'Theses',
    description: 'Successfully completed',
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      'ThesisAI helped me organize my research and save months of work. The AI-powered suggestions were spot-on and academically sound.',
    author: 'Maria Santos',
    role: 'PhD Candidate',
    university: 'University of the Philippines',
    avatar: '👩‍🎓',
    rating: 5,
  },
  {
    quote:
      'As a busy student working part-time, ThesisAI was a game-changer. I finished my thesis 6 weeks ahead of schedule.',
    author: 'Juan Dela Cruz',
    role: 'Master\'s Student',
    university: 'Ateneo de Manila University',
    avatar: '👨‍🎓',
    rating: 5,
  },
  {
    quote:
      'My advisor was impressed with the quality and organization of my work. ThesisAI made a real difference in my academic success.',
    author: 'Ana Garcia',
    role: 'Undergraduate',
    university: 'De La Salle University',
    avatar: '👩‍🎓',
    rating: 5,
  },
];

const universityLogos = [
  'UP', 'ADMU', 'DLSU', 'UST', 'UAAP', 'PCC',
];

function StatCounter({ item, isVisible }: { item: StatItem; isVisible: boolean }) {
  const count = useCounterAnimation(item.value, 2000, isVisible ? 0 : item.value);

  return (
    <motion.div
      variants={cardVariant}
      className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 hover:border-accent-electric-purple/50 transition-colors"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-electric-purple/0 via-accent-electric-purple/0 to-accent-electric-purple/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-accent-electric-purple/10 text-accent-electric-purple">
            {item.icon}
          </div>
          <span className="text-xs font-semibold text-accent-cyan bg-accent-cyan/10 px-3 py-1 rounded-full">
            {item.label}
          </span>
        </div>

        <div className="mb-3">
          <p className="text-4xl md:text-5xl font-bold text-white">
            {count}
            <span className="text-2xl ml-1 text-accent-electric-purple">
              {item.suffix}
            </span>
          </p>
        </div>

        <p className="text-sm text-slate-400">{item.description}</p>
      </div>
    </motion.div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <motion.div
      variants={cardVariant}
      className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 hover:border-accent-electric-purple/50 transition-colors"
    >
      {/* Star rating */}
      <div className="flex gap-1 mb-4">
        {Array(testimonial.rating)
          .fill(null)
          .map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-accent-cyan text-accent-cyan"
            />
          ))}
      </div>

      {/* Quote */}
      <p className="text-slate-300 mb-6 leading-relaxed">
        "{testimonial.quote}"
      </p>

      {/* Author info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-electric-purple to-accent-cyan flex items-center justify-center text-xl">
          {testimonial.avatar}
        </div>
        <div>
          <p className="font-semibold text-white">{testimonial.author}</p>
          <p className="text-sm text-slate-400">{testimonial.role}</p>
          <p className="text-xs text-accent-cyan">{testimonial.university}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function SocialProofSectionEnhanced() {
  const { elementRef: statsRef, isVisible: statsVisible } =
    useScrollAnimation({ threshold: 0.2 });
  const { elementRef: testimonialsRef, isVisible: testimonialsVisible } =
    useScrollAnimation({ threshold: 0.2 });

  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-900 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-accent-electric-purple/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl" />

      <div className="container relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
            Trusted by{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple to-accent-cyan">
              50,000+ Students
            </span>
          </h2>
          <p className="text-lg text-slate-400">
            Join the fastest-growing thesis writing community in the Philippines
          </p>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          ref={statsRef}
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <StatCounter key={index} item={stat} isVisible={statsVisible} />
          ))}
        </motion.div>

        {/* Testimonials section */}
        <div className="mb-20">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold text-white mb-12 text-center"
          >
            Student Success Stories
          </motion.h3>

          <motion.div
            ref={testimonialsRef}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </motion.div>
        </div>

        {/* University logos */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-slate-700/50 pt-12"
        >
          <p className="text-center text-slate-400 text-sm mb-8">
            Trusted by students from leading Philippine universities
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {universityLogos.map((logo, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="flex items-center justify-center p-4 rounded-lg border border-slate-700/30 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-700/50 transition-colors"
              >
                <span className="text-sm font-semibold text-slate-400">
                  {logo}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
