"use client";

import { motion } from "framer-motion";
import { Star, Users, GraduationCap, TrendingUp, LucideIcon } from "lucide-react";
import { stats, testimonials, universities } from "@/data/landing-social-proof";

const iconMap: { [key: string]: LucideIcon } = {
  Users,
  TrendingUp,
  Star,
  GraduationCap,
};

export function SocialProofSection() {

  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        {/* Stats Section */}
        <div className="text-center mb-20 opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards]">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Thousands of Students</span>
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-12">
            Join the growing community of Filipino students achieving academic excellence with AI
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="inline-flex p-3 rounded-xl bg-slate-800/50 mb-4 border border-slate-700/50 transform-gpu">
                  <div className="text-blue-400">
                    {(() => {
                      const Icon = iconMap[stat.icon];
                      return Icon ? <Icon className="w-6 h-6" /> : null;
                    })()}
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-300 text-sm md:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-20 opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards]">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">Student Success Stories</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm transform-gpu"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3" role="img" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-slate-300 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* University Logos */}
        <div className="opacity-0 animate-[fade-in_0.5s_ease-out_0.4s_forwards]">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-12">Trusted by Leading Universities</h3>

          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-80">
            {universities.map((university, index) => (
              <motion.div
                key={university.name}
                className="text-2xl font-bold text-slate-300"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {university.logo}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}