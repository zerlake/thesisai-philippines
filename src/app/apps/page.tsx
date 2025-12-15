// src/app/apps/page.tsx
'use client';

import { useState } from 'react';
import { AppCard } from '@/components/app-card';
import { getAllApps, getAppsByCategory } from '@/lib/app-registry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function AppsPage() {
  const router = useRouter();
  const [allApps] = useState(() => getAllApps());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categoryNames = {
    conceptualize: 'Conceptualize',
    research: 'Research',
    write: 'Write & Refine',
    submit: 'Submit & Present',
    defense: 'Defense'
  };

  const appsByCategory = getAppsByCategory(selectedCategory as any);
  const displayApps = selectedCategory ? appsByCategory : allApps;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ThesisAI Apps</h1>
        <p className="text-slate-400">Discover and use our suite of research tools</p>
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            All Apps
          </Button>
          {Object.entries(categoryNames).map(([key, name]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(key)}
            >
              {name}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayApps.map(app => (
            <AppCard 
              key={app.id} 
              app={app} 
              onRun={() => router.push(`/apps/${app.id}`)}
            />
          ))}
        </div>

        {displayApps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No apps found in this category.</p>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start a New Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-4">
            Chain multiple apps together to create powerful research workflows.
          </p>
          <Button onClick={() => router.push('/workflows')}>
            Create Workflow
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}