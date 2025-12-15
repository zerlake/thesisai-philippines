'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AppDefinition } from '@/lib/app-registry';
import { useState } from 'react';
import { Play, Zap, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AppCardProps {
  app: AppDefinition;
  onRun?: (app: AppDefinition) => void;
  showRunButton?: boolean;
}

export function AppCard({ app, onRun, showRunButton = true }: AppCardProps) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    if (onRun) {
      onRun(app);
    } else {
      // Navigate to app-specific page for configuration
      router.push(`/apps/${app.id}`);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'conceptualize': return 'border-blue-500/30 bg-blue-500/5';
      case 'research': return 'border-purple-500/30 bg-purple-500/5';
      case 'write': return 'border-green-500/30 bg-green-500/5';
      case 'submit': return 'border-orange-500/30 bg-orange-500/5';
      case 'defense': return 'border-red-500/30 bg-red-500/5';
      default: return 'border-slate-500/30 bg-slate-500/5';
    }
  };

  return (
    <Card className={`h-full flex flex-col border ${getCategoryColor(app.category)}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-2xl">{app.icon}</div>
          <div>
            <CardTitle className="text-lg">{app.name}</CardTitle>
            <CardDescription className="text-xs mt-1">
              {app.category.charAt(0).toUpperCase() + app.category.slice(1)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-slate-300 text-sm">{app.description}</p>
      </CardContent>
      <CardFooter>
        {showRunButton && (
          <Button 
            onClick={handleRun} 
            disabled={isRunning}
            className="w-full gap-2"
          >
            {isRunning ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Use App
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}