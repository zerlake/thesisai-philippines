import { motion } from "framer-motion";
import clsx from "clsx";
import { LucideIcon } from "lucide-react";
import { Phase } from "@/data/landing-timeline";
import { iconMap } from "./thesis-journey-timeline"; // Assuming iconMap will be exported from parent

interface TimelineItemProps {
  phase: Phase;
  index: number;
  alignment: 'left' | 'right';
}

export function TimelineItem({ phase, index, alignment }: TimelineItemProps) {
  const Icon = iconMap[phase.icon]; // Using the exported iconMap from parent

  return (
    <motion.div
      key={phase.id}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center transform-gpu focus-within:ring-2 focus-within:ring-blue-500 outline-none"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
      tabIndex={0}
    >
      {alignment === 'left' ? (
        <>
          <div className="lg:col-start-1 lg:col-span-5 flex justify-center lg:justify-end">
            <div className={`p-8 rounded-2xl w-full max-w-md ${phase.bgColor} border ${phase.borderColor} backdrop-blur-sm transform-gpu`}>
              <div className={`inline-flex p-3 rounded-lg ${phase.bgColor} mb-4`}>
                {Icon ? <Icon className="w-8 h-8" /> : null}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{phase.title}</h3>
              <p className="text-slate-300 mb-4">{phase.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Phase {phase.id}</span>
                <div className="h-0.5 flex-1 bg-slate-700"></div>
              </div>
            </div>
          </div>

          <div className="lg:col-start-6 lg:col-span-2 flex justify-center">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${phase.color} flex items-center justify-center text-white border-4 border-slate-900 shadow-lg shadow-blue-500/30 transform-gpu`}>
              {Icon ? <Icon className="w-8 h-8" /> : null}
            </div>
          </div>

          <div className="lg:col-start-8 lg:col-span-5 hidden lg:flex"></div>
        </>
      ) : (
        <>
          <div className="lg:col-start-1 lg:col-span-5 hidden lg:flex"></div>

          <div className="lg:col-start-6 lg:col-span-2 flex justify-center">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${phase.color} flex items-center justify-center text-white border-4 border-slate-900 shadow-lg shadow-blue-500/30 transform-gpu`}>
              {Icon ? <Icon className="w-8 h-8" /> : null}
            </div>
          </div>

          <div className="lg:col-start-8 lg:col-span-5 flex justify-center lg:justify-start">
            <div className={`p-8 rounded-2xl w-full max-w-md ${phase.bgColor} border ${phase.borderColor} backdrop-blur-sm transform-gpu`}>
              <div className={`inline-flex p-3 rounded-lg ${phase.bgColor} mb-4`}>
                {Icon ? <Icon className="w-8 h-8" /> : null}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{phase.title}</h3>
              <p className="text-slate-300 mb-4">{phase.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Phase {phase.id}</span>
                <div className="h-0.5 flex-1 bg-slate-700"></div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}