'use client';

import Link from 'next/link';
import { THESIS_PHASES } from '@/lib/thesis-phases';
import { getIcon } from '@/lib/icon-resolver';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Zap,
} from 'lucide-react';

export default function ThesisPhasesOverview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Thesis Writing Phases
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Navigate your thesis journey with dedicated workstations for each phase.
            Each phase includes specialized tools and resources to guide you to success.
          </p>
        </div>

        {/* Phases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {THESIS_PHASES.map((phase) => (
            <Link key={phase.id} href={`/thesis-phases/${phase.id}`}>
              <Card className="h-full p-8 hover:shadow-xl transition-all border-2 border-slate-200 hover:border-slate-400 cursor-pointer group">
                {/* Phase Header */}
                <div className={`rounded-lg p-4 mb-6 bg-gradient-to-r ${phase.color} text-white`}>
                  <div className="flex items-center gap-3 mb-2">
                    {(() => {
                      const Icon = getIcon(phase.icon);
                      return <Icon className="h-6 w-6" />;
                    })()}
                    <span className="text-sm font-semibold opacity-80">{phase.phase}</span>
                  </div>
                </div>

                {/* Phase Content */}
                <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
                  {phase.title}
                </h2>
                <p className="text-slate-600 mb-6">{phase.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-slate-600 mb-6">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>{phase.toolsCount} tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>{phase.estimatedDuration}</span>
                  </div>
                </div>

                {/* Features Preview */}
                <div className="space-y-2 mb-6">
                  {phase.features.slice(0, 3).map((feature) => (
                    <div key={feature.id} className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="text-slate-400 mt-1">•</span>
                      <span>{feature.title}</span>
                    </div>
                  ))}
                  {phase.features.length > 3 && (
                    <p className="text-sm text-slate-500 italic">
                      +{phase.features.length - 3} more features
                    </p>
                  )}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                  Enter Workstation
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Timeline View */}
        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-12">Your Thesis Journey</h2>
          
          <div className="space-y-8">
            {THESIS_PHASES.map((phase, index) => (
              <div key={phase.id} className="flex gap-8">
                {/* Timeline marker */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg text-white bg-gradient-to-r ${phase.color}`}
                  >
                    {phase.phaseNumber}
                  </div>
                  {index < THESIS_PHASES.length - 1 && (
                    <div className="w-1 h-24 bg-slate-200 mt-4"></div>
                  )}
                </div>

                {/* Phase info */}
                <div className="pb-8 flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {phase.phase}: {phase.title}
                  </h3>
                  <p className="text-slate-600 mb-4">{phase.longDescription}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      {phase.toolsCount} tools
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blue-500" />
                      {phase.estimatedDuration}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-6">
            Ready to start your thesis journey?
          </p>
          <Link href={`/thesis-phases/${THESIS_PHASES[0].id}`}>
            <Button size="lg" className="gap-2">
              Start with Phase 1
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
