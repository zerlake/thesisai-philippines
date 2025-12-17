// src/app/apps/page.tsx

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Calculator,
  BookOpen,
  Search,
  Target,
  Users,
  BarChart3,
  ArrowRight,
  Filter,
  Download,
  CheckCircle,
  PenTool,
  Activity,
  Award,
  Flame,
  Target as TargetIcon,
  PenTool as PenToolIcon
} from 'lucide-react';

const apps = [
  {
    id: 'citation-formatter',
    title: 'Citation Formatter',
    description: 'Generate properly formatted citations in multiple academic styles (APA, MLA, Chicago, Harvard, IEEE)',
    icon: FileText,
    category: 'Writing Tools',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
  },
  {
    id: 'thesis-calculator',
    title: 'Thesis Calculator',
    description: 'Calculate thesis statistics like word count, reading time, and complexity metrics',
    icon: Calculator,
    category: 'Planning',
    color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
  },
  {
    id: 'literature-review-assistant',
    title: 'Literature Review Assistant',
    description: 'Organize and analyze your research sources for comprehensive literature reviews',
    icon: BookOpen,
    category: 'Research',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
  },
  {
    id: 'research-gap-analyzer',
    title: 'Research Gap Analyzer',
    description: 'Identify potential research gaps in your field of study',
    icon: Search,
    category: 'Research',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300'
  },
  {
    id: 'goal-setter',
    title: 'Goal Setter',
    description: 'Set and track your thesis writing goals and milestones',
    icon: TargetIcon,
    category: 'Productivity',
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
  },
  {
    id: 'writing-tools',
    title: 'Writing Tools',
    description: 'Essential tools for effective academic writing',
    icon: PenToolIcon,
    category: 'Writing Tools',
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300'
  },
  {
    id: 'collaboration-hub',
    title: 'Collaboration Hub',
    description: 'Share and collaborate on thesis components with advisors and peers',
    icon: Users,
    category: 'Collaboration',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300'
  },
  {
    id: 'analytics-dashboard',
    title: 'Analytics Dashboard',
    description: 'Track your progress and gain insights to optimize your thesis preparation',
    icon: BarChart3,
    category: 'Analytics',
    color: 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300'
  }
];

export default function AppsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Thesis AI Apps</h1>
              <p className="text-muted-foreground mt-2">
                A collection of powerful tools to assist with every stage of your thesis writing process
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium">Readiness: </span>
              <span className="text-lg font-bold ml-1">72%</span>
            </div>
            <div className="flex items-center">
              <Flame className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium">Velocity: </span>
              <span className="text-lg font-bold ml-1">2.3%/wk</span>
            </div>
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium">Days: </span>
              <span className="text-lg font-bold ml-1">28</span>
            </div>
            <div className="flex items-center">
              <Award className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium">Streak: </span>
              <span className="text-lg font-bold ml-1">7 days</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => {
            const IconComponent = app.icon;
            return (
              <Link key={app.id} href={`/apps/${app.id}`} className="block">
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-lg ${app.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {app.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{app.title}</CardTitle>
                    <CardDescription>
                      {app.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <Button className="w-full mt-auto" variant="outline">
                      Launch App
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">About Thesis AI Apps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
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
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Integrated Dashboard</h3>
                  <p className="text-sm text-muted-foreground">All apps connect to your main dashboard for centralized tracking</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">AI-Powered Insights</h3>
                  <p className="text-sm text-muted-foreground">Get personalized suggestions based on your usage patterns</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Cross-App Sync</h3>
                  <p className="text-sm text-muted-foreground">Progress and data sync seamlessly across all tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}