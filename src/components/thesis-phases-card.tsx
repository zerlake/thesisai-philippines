'use client';

import Link from 'next/link';
import { THESIS_PHASES } from '@/lib/thesis-phases';
import { getIcon } from '@/lib/icon-resolver';
import { EnterpriseCard, EnterpriseCardContent } from '@/components/enterprise-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Zap,
  Clock,
} from 'lucide-react';

export function ThesisPhasesCard() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Thesis Workstations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Navigate through each phase with dedicated workspaces and specialized tools
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {THESIS_PHASES.map((phase) => {
          const Icon = getIcon(phase.icon);
          return (
            <Link key={phase.id} href={`/thesis-phases/${phase.id}`}>
              <EnterpriseCard className="h-full hover:shadow-lg transition-all border-l-4" style={{
                borderLeftColor: `var(--color-${phase.color.split('-')[1]})`
              }}>
                <EnterpriseCardContent className="space-y-4">
                  {/* Phase Icon and Number */}
                  <div className={`rounded-lg p-3 bg-gradient-to-r ${phase.color} text-white w-fit`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Phase Info */}
                  <div>
                    <h3 className="font-bold text-sm">{phase.phase}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{phase.title}</p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      <span>{phase.toolsCount} tools</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{phase.estimatedDuration}</span>
                    </div>
                  </div>

                  {/* Features Preview */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Key features:</p>
                    <div className="flex flex-wrap gap-1">
                      {phase.features.slice(0, 2).map((feature) => (
                        <Badge key={feature.id} variant="secondary" className="text-xs">
                          {feature.title.split(' ')[0]}
                        </Badge>
                      ))}
                      {phase.features.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{phase.features.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <Button size="sm" className="w-full gap-2 mt-2">
                    Enter
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </EnterpriseCardContent>
              </EnterpriseCard>
            </Link>
          );
        })}
      </div>

      {/* View All Phases Link */}
      <div className="flex justify-center pt-2">
        <Link href="/thesis-phases">
          <Button variant="outline" size="sm">
            View All Phases & Timeline
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
