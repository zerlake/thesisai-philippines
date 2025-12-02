"use client";

import { useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ChevronDown } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Category {
  id: string;
  phase: string;
  title: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  features: Feature[];
}

interface StaticFeaturesProps {
  categories: Category[];
}

/**
 * Static Features Section without Framer Motion
 * Optimized for performance (no TBT impact)
 * Use this on initial page load, then optionally enhance with animations via Intersection Observer
 */
export default function StaticFeatures({ categories }: StaticFeaturesProps) {
  const [expandedCategory, setExpandedCategory] = useState("conceptualize");
  const prefersReducedMotion = useReducedMotion();

  // Haptic feedback helper
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="grid gap-4 max-w-4xl mx-auto">
      {categories.map((category) => (
        <div
          key={category.id}
          className="group border border-slate-700/50 rounded-xl overflow-hidden transition-colors"
        >
          {/* Category Header - Always Visible */}
          <button
            onClick={() => {
              triggerHaptic();
              setExpandedCategory(expandedCategory === category.id ? "" : category.id);
            }}
            className={`w-full px-8 py-5 flex items-center justify-between transition-all ${
              expandedCategory === category.id
                ? `bg-gradient-to-r ${category.color} bg-opacity-10 border-b border-slate-700/50`
                : "bg-slate-800/50 hover:bg-slate-800/70"
            }`}
          >
            <div className="flex items-center gap-4 text-left">
              <div className={`flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${category.color} bg-opacity-20`}>
                <div className="text-white text-lg">{category.icon}</div>
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider ${
                  expandedCategory === category.id ? "text-blue-300" : "text-slate-400"
                }`}>
                  {category.phase}
                </p>
                <h3 className="text-xl font-bold text-white">{category.title}</h3>
              </div>
            </div>
            <div className={`transition-transform duration-300 ${expandedCategory === category.id ? "rotate-180" : ""}`}>
              <ChevronDown className="w-5 h-5 text-slate-400" />
            </div>
          </button>

          {/* Expandable Features List */}
          {expandedCategory === category.id && (
            <div className="px-8 py-6 bg-slate-900/50 space-y-4 border-t border-slate-700/50">
              <p className="text-base text-slate-300 mb-6 font-medium leading-relaxed">
                {category.description}
              </p>
              <div className="space-y-4">
                {category.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="flex gap-4 p-5 rounded-lg bg-slate-800/50 border border-slate-700/30 group/item transition-transform hover:translate-x-1"
                    onMouseEnter={triggerHaptic}
                  >
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0 bg-gradient-to-br ${category.color} bg-opacity-20 group-hover/item:bg-opacity-40 transition-colors`}>
                      <div className="text-blue-300">{feature.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-base mb-2 group-hover/item:text-blue-300 transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
