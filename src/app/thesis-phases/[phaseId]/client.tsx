'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getIcon } from '@/lib/icon-resolver';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { type ThesisPhase } from '@/lib/thesis-phases';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Zap,
  BookOpen,
  Grid3x3,
} from 'lucide-react';

interface PhasePageClientProps {
  phase: ThesisPhase;
  navigation: {
    previous: ThesisPhase | null;
    next: ThesisPhase | null;
  };
}

export function PhasePageClient({ phase, navigation }: PhasePageClientProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(
    phase.features[0]?.id || null
  );

  const selectedFeatureData = phase.features.find((f) => f.id === selectedFeature);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <div className="border-b border-border bg-background sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-center flex-1">{phase.phase}</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Phase Header */}
        <div className={`rounded-xl p-8 mb-12 bg-gradient-to-r ${phase.color} text-white`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {(() => {
                  const Icon = getIcon(phase.icon);
                  return <Icon className="h-8 w-8" />;
                })()}
                <h1 className="text-4xl font-bold">{phase.title}</h1>
              </div>
              <p className="text-lg opacity-90">{phase.longDescription}</p>
            </div>
            <div className="ml-8 flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{phase.toolsCount}</div>
                <div className="text-sm opacity-75">Tools Available</div>
              </div>
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-1" />
                <div className="text-sm opacity-75">{phase.estimatedDuration}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features List */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Grid3x3 className="h-5 w-5" />
                Features
              </h2>
              <div className="space-y-3">
                {phase.features.map((feature) => (
                  <button
                    key={feature.id}
                    onClick={() => setSelectedFeature(feature.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedFeature === feature.id
                        ? `border-slate-900 ${phase.bgColor} shadow-md`
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-slate-600 mt-1`}>
                        {(() => {
                          const Icon = getIcon(feature.icon);
                          return <Icon className="h-5 w-5" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                        <p className="text-xs text-slate-600 mt-1">{feature.tools?.length || 0} tools</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Details */}
          <div className="lg:col-span-2">
            {selectedFeatureData && (
              <div className="space-y-6">
                {/* Feature Header */}
                <Card className="p-8 border-2 border-slate-200">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-slate-600 mt-1">
                      {(() => {
                        const Icon = getIcon(selectedFeatureData.icon);
                        return <Icon className="h-8 w-8" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">{selectedFeatureData.title}</h2>
                      <p className="text-lg text-slate-600">{selectedFeatureData.description}</p>
                    </div>
                  </div>
                </Card>

                {/* Tools/Sub-features */}
                {selectedFeatureData.tools && selectedFeatureData.tools.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Available Tools</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedFeatureData.tools.map((tool) => (
                        <Link key={tool} href={`/${tool}`}>
                          <Card
                            className="p-6 border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer group h-full"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-yellow-500 group-hover:text-yellow-600" />
                                <div>
                                  <h4 className="font-semibold capitalize">
                                    {tool.replace(/-/g, ' ')}
                                  </h4>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Resources */}
                <Link href="/resources">
                  <Card className="p-6 bg-blue-50 border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer h-full">
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Learning Resources</h3>
                        <p className="text-sm text-blue-700">
                          Access tutorials, guides, and best practices for maximizing your use of all tools in this phase.
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Progress and Navigation */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            {navigation.previous && (
              <Link href={`/thesis-phases/${navigation.previous.id}`}>
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {navigation.previous.title}
                </Button>
              </Link>
            )}
            {!navigation.previous && <div></div>}

            {/* Phase Progress */}
            <div className="flex items-center gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 w-3 rounded-full transition-all ${
                    i < phase.phaseNumber
                      ? 'bg-slate-900'
                      : i === phase.phaseNumber - 1
                      ? 'bg-slate-400'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {navigation.next && (
              <Link href={`/thesis-phases/${navigation.next.id}`}>
                <Button className="gap-2">
                  {navigation.next.title}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {!navigation.next && <div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
