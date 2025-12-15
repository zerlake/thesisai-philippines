"use client";

import { motion } from "framer-motion";
import { Lightbulb, FileText, BookOpen, Users, Calendar, Target } from "lucide-react";

const painPoints = [
  {
    id: 1,
    pain: "Research takes months to complete",
    solution: "Our AI finds relevant sources and extracts key insights in minutes",
    icon: <BookOpen className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600"
  },
  {
    id: 2,
    pain: "Difficult to keep track of citations",
    solution: "Automatically generate and format citations in any academic style",
    icon: <FileText className="w-6 h-6" />,
    color: "from-purple-500 to-purple-600"
  },
  {
    id: 3,
    pain: "No clear direction for thesis structure",
    solution: "Get AI-powered guidance for organizing chapters and sections",
    icon: <Target className="w-6 h-6" />,
    color: "from-cyan-500 to-cyan-600"
  },
  {
    id: 4,
    pain: "Limited feedback from advisors",
    solution: "Get instant feedback through our AI advisor and peer collaboration tools",
    icon: <Users className="w-6 h-6" />,
    color: "from-emerald-500 to-emerald-600"
  },
  {
    id: 5,
    pain: "Last-minute stress during writing",
    solution: "Structured writing tools to keep you on track and avoid writer's block",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "from-amber-500 to-orange-500"
  },
  {
    id: 6,
    pain: "Missed deadlines and milestones",
    solution: "Built-in timeline management to ensure on-time thesis completion",
    icon: <Calendar className="w-6 h-6" />,
    color: "from-rose-500 to-pink-500"
  }
];

export function PainPointsSolutions() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards]">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
            Thesis <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Challenges Solved</span>
          </h2>
          <p className="text-lg text-slate-300">
            We understand the unique challenges of thesis writing in the Philippines
          </p>
        </div>

        <div className="space-y-20">
          {painPoints.map((item, index) => (
            <motion.div
              key={item.id}
              className={`grid grid-cols-1 ${index % 2 === 0 ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-12 items-center`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {index % 2 === 0 ? (
                <>
                  <div className="order-2 lg:order-1">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-8 transform-gpu">
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white`}>
                          {item.icon}
                        </div>
                        Challenge
                      </h3>
                      <p className="text-red-400 text-lg">{item.pain}</p>
                    </div>
                  </div>
                  <div className="order-1 lg:order-2">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-8 h-full transform-gpu">
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white`}>
                          {item.icon}
                        </div>
                        Solution
                      </h3>
                      <p className="text-green-400 text-lg">{item.solution}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="order-2 lg:order-2">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-8 transform-gpu">
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white`}>
                          {item.icon}
                        </div>
                        Challenge
                      </h3>
                      <p className="text-red-400 text-lg">{item.pain}</p>
                    </div>
                  </div>
                  <div className="order-1 lg:order-1">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl p-8 h-full transform-gpu">
                      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} text-white`}>
                          {item.icon}
                        </div>
                        Solution
                      </h3>
                      <p className="text-green-400 text-lg">{item.solution}</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}