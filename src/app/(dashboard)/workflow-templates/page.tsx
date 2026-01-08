'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GraduationCap,
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  ArrowRight,
  FileText,
  TrendingUp,
  PresentationChart,
} from 'lucide-react';

const templates = [
  {
    id: 'undergraduate-thesis',
    title: 'Undergraduate Thesis',
    description: 'Standard 5-chapter format with typical 1-semester timeline',
    icon: GraduationCap,
    difficulty: 'beginner',
    duration: '1 semester',
    features: [
      'Chapter 1: Introduction',
      'Chapter 2: Review of Related Literature',
      'Chapter 3: Methodology',
      'Chapter 4: Results and Discussion',
      'Chapter 5: Summary and Conclusions',
    ],
    timeline: [
      { phase: 'Weeks 1-4', task: 'Topic Approval & Proposal' },
      { phase: 'Weeks 5-8', task: 'Literature Review & Methodology' },
      { phase: 'Weeks 9-12', task: 'Data Collection & Analysis' },
      { phase: 'Weeks 13-16', task: 'Results & Discussion' },
    ],
  },
  {
    id: 'masters-thesis',
    title: "Master's Thesis",
    description: 'Extended research timeline with comprehensive literature review phase',
    icon: BookOpen,
    difficulty: 'intermediate',
    duration: '2 semesters',
    features: [
      'Extended Literature Review',
      'Advanced Methodology',
      'Comprehensive Data Analysis',
      'Multiple Draft Reviews',
      'Publication Requirements',
    ],
    timeline: [
      { phase: 'Semester 1', task: 'Research Proposal & Literature' },
      { phase: 'Semester 2', task: 'Data Collection & Writing' },
    ],
  },
  {
    id: 'doctoral-dissertation',
    title: "Doctoral Dissertation",
    description: 'Multi-year plan with publication milestones and comprehensive exams',
    icon: FileText,
    difficulty: 'advanced',
    duration: '3-4 years',
    features: [
      'Comprehensive Exams',
      'Dissertation Proposal',
      'Publication Milestones',
      'Multi-Stage Review Process',
      'Defense Preparation',
    ],
    timeline: [
      { phase: 'Year 1', task: 'Coursework & Comprehensive Exams' },
      { phase: 'Year 2', task: 'Research Proposal & Literature' },
      { phase: 'Year 3', task: 'Data Collection & Analysis' },
      { phase: 'Year 4', task: 'Writing & Defense' },
    ],
  },
  {
    id: 'group-research',
    title: 'Group Research Project',
    description: 'Collaborative workflow with task assignments and team coordination',
    icon: Users,
    difficulty: 'intermediate',
    duration: '1-2 semesters',
    features: [
      'Team Role Assignment',
      'Task Coordination',
      'Progress Tracking',
      'Review Scheduling',
      'Final Integration',
    ],
    timeline: [
      { phase: 'Weeks 1-2', task: 'Team Formation & Roles' },
      { phase: 'Weeks 3-6', task: 'Research Planning' },
      { phase: 'Weeks 7-12', task: 'Data Collection & Analysis' },
      { phase: 'Weeks 13-16', task: 'Integration & Final Review' },
    ],
  },
];

export default function WorkflowTemplatesPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleUseTemplate = (templateId: string) => {
    // Navigate to the workflows page with the template selected
    router.push(`/workflows?template=${templateId}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/10 text-green-500';
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'advanced':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-slate-500/10 text-slate-500';
    }
  };

  const getIconComponent = (IconComponent: React.ComponentType<{ className?: string }>) => {
    return <IconComponent className="w-12 h-12 text-blue-500" />;
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Workflow Templates</h1>
        <p className="text-slate-400">
          Choose from our pre-built templates designed for Philippine universities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  {getIconComponent(Icon)}
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{template.title}</CardTitle>
                <CardDescription className="text-base">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {template.duration}
                  </div>
                </div>

                <Tabs defaultValue="features" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>

                  <TabsContent value="features" className="space-y-2 mt-4">
                    {template.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="timeline" className="space-y-2 mt-4">
                    {template.timeline.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{item.phase}:</span>{' '}
                          <span className="text-slate-400">{item.task}</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  Use This Template
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
