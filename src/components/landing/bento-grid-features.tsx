"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { Bot, Target, BookOpen, FileText, Share2, Presentation, FlaskConical, FileCheck, University, LucideIcon } from "lucide-react";
import { features } from "@/data/landing-features";

const iconMap: { [key: string]: LucideIcon } = {
  Bot,
  Target,
  BookOpen,
  FileText,
  Share2,
  Presentation,
  FlaskConical,
  FileCheck,
  University,
};

export function BentoGridFeatures() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-900/80" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards]">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Enterprise Features for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Academic Excellence</span>
          </h2>
          <p className="text-lg text-slate-300">
            Powerful tools designed specifically for the thesis writing process in Philippine universities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-min opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              className={clsx(
                feature.className,
                "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 focus-within:ring-2 focus-within:ring-blue-500 outline-none"
              )}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              tabIndex={0}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${feature.iconBg} text-white`}>
                  {(() => {
                    const Icon = iconMap[feature.icon];
                    return Icon ? <Icon className="w-6 h-6" /> : null;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-300 text-sm">{feature.description}</p>
                </div>
              </div>

              {feature.subFeatures && (
                <div className="mt-auto pt-4">
                  <div className="space-y-3">
                    {feature.subFeatures.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <div className="text-cyan-400">
                          {(() => {
                            const SubIcon = iconMap[item.icon];
                            return SubIcon ? <SubIcon className="w-4 h-4" /> : null;
                          })()}
                        </div>
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}