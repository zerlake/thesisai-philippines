import React from 'react';
import { Users, TrendingUp, Sparkles } from 'lucide-react';

const STATS = [
  { value: '10K+', label: 'Students', icon: Users },
  { value: '98%', label: 'Approval Rate', icon: TrendingUp },
  { value: '24/7', label: 'Support', icon: Sparkles }
];

export function HeroStats() {
  return (
    <div className="grid grid-cols-3 gap-4 md:gap-8 mb-10 max-w-2xl opacity-0 animate-[fade-in_0.5s_ease-out_0.5s_forwards]">
      {STATS.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all opacity-0 animate-[fade-in_0.5s_ease-out_0.6s_forwards]"
            style={{ animationDelay: `${500 + idx * 100}ms` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple to-accent-cyan mb-1">
              {stat.value}
            </p>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
