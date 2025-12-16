// src/app/apps/page.tsx

import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Calculator, 
  BookOpen, 
  Search, 
  BarChart3,
  Target,
  Wrench,
  GitBranch
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Thesis AI Apps | Thesis AI',
  description: 'Collection of tools and utilities for thesis writing and research'
};

const apps = [
  {
    title: 'Citation Formatter',
    description: 'Generate properly formatted citations in multiple academic styles (APA, MLA, Chicago, Harvard, IEEE)',
    href: '/apps/citation-formatter',
    icon: FileText,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
  },
  {
    title: 'Thesis Calculator',
    description: 'Calculate thesis statistics like word count, reading time, and complexity metrics',
    href: '#',
    icon: Calculator,
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
  },
  {
    title: 'Literature Review Assistant',
    description: 'Organize and analyze your research sources for comprehensive literature reviews',
    href: '#',
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
  },
  {
    title: 'Research Gap Analyzer',
    description: 'Identify potential research gaps in your field of study',
    href: '#',
    icon: Search,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300'
  },
  {
    title: 'Progress Dashboard',
    description: 'Track your thesis writing progress with analytics and insights',
    href: '#',
    icon: BarChart3,
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
  },
  {
    title: 'Goal Setter',
    description: 'Set and track goals for your thesis writing milestones',
    href: '#',
    icon: Target,
    color: 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300'
  },
  {
    title: 'Writing Tools',
    description: 'Essential tools for effective academic writing',
    href: '#',
    icon: Wrench,
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300'
  },
  {
    title: 'Collaboration Hub',
    description: 'Share and collaborate on thesis components with advisors and peers',
    href: '#',
    icon: GitBranch,
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'
  }
];

export default function AppsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Thesis AI Apps</h1>
          <p className="text-lg text-muted-foreground mt-2">
            A collection of powerful tools to assist with every stage of your thesis writing process
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {apps.map((app, index) => {
            const IconComponent = app.icon;
            return (
              <Link key={index} href={app.href} passHref>
                <Card className="h-full cursor-pointer hover:shadow-md transition-shadow duration-200">
                  <CardHeader>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${app.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{app.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{app.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">About Thesis AI Apps</h2>
          <p className="text-muted-foreground mb-4">
            Our collection of specialized tools is designed to support researchers at every stage of their thesis journey. 
            From citation formatting to collaboration features, these apps help you focus on your research while we handle 
            the administrative and formatting tasks.
          </p>
          <p className="text-muted-foreground">
            Each app is powered by AI technology to provide smart assistance tailored to your academic needs. 
            We continuously update and expand our toolset based on feedback from researchers like you.
          </p>
        </div>
      </div>
    </div>
  );
}