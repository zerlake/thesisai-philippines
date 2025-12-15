'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3, ArrowLeft, FileText, FlaskConical, Bot, BookCopy, Presentation, FileTextIcon } from 'lucide-react';

// Chapter 4 specific components
const Chapter4Features = [
  {
    id: "data-visualizer",
    icon: BarChart3,
    title: "Data Visualizer",
    description: "Generate charts and graphs for your data presentation",
    href: "/statistical-analysis"
  },
  {
    id: "results-analyzer",
    icon: FileText,
    title: "Results Analyzer",
    description: "Analyze and interpret your research results",
    href: "/results"
  },
  {
    id: "stats-calculator",
    icon: FlaskConical,
    title: "Statistical Calculator",
    description: "Perform statistical calculations for your analysis",
    href: "/statistical-analysis"
  },
  {
    id: "presentation-builder",
    icon: Presentation,
    title: "Results Presentation",
    description: "Create effective presentations for your findings",
    href: "/presentation"
  },
];

export default function Chapter4Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/thesis-phases" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Phases
              </Link>
            </div>
            <h1 className="text-lg font-semibold text-foreground">Chapter 4 - Results & Analysis</h1>
            <Link href="/thesis-phases/chapter-4/editor">
              <Button size="sm" variant="outline">
                <FileTextIcon className="h-4 w-4 mr-2" />
                Text Editor
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-2 rounded-full mb-6">
            <BarChart3 className="h-5 w-5" />
            <span className="font-semibold">Chapter 4</span>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Presentation, Analysis and Interpretation of Data
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Present your research findings in an organized manner with appropriate 
            statistical treatments and meaningful interpretations.
          </p>
          
          <div className="bg-muted border border-border rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="font-semibold text-foreground mb-3">About Chapter 4</h3>
            <p className="text-muted-foreground">
              Chapter 4 presents the results of your data collection and analysis. 
              It includes the presentation of findings organized by research question 
              or hypothesis, statistical treatment of data, and interpretation of results.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {Chapter4Features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Link key={feature.id} href={feature.href}>
                <Card className="h-full p-6 hover:shadow-lg transition-all border border-border hover:border-primary/50 cursor-pointer group">
                  {/* Feature Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-muted text-primary">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-4 pt-4 border-t border-border flex justify-end">
                    <Button variant="outline" size="sm">
                      Access Tool
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Chapter 4 Guide */}
        <div className="bg-card rounded-xl border border-border p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Chapter 4 Essentials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-3">Data Presentation</h3>
              <p className="text-muted-foreground text-sm">
                Organize your findings in a logical sequence, typically 
                following the same order as your research questions.
              </p>
            </div>
            
            <div className="bg-muted p-6 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-3">Statistical Analysis</h3>
            <p className="text-muted-foreground text-sm">
                Apply appropriate statistical tools to analyze your data 
                as specified in your Chapter 3 methodology.
              </p>
            </div>
            
            <div className="bg-muted p-6 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-3">Results Interpretation</h3>
            <p className="text-muted-foreground text-sm">
                Interpret your findings in relation to your research questions 
                and existing literature, explaining what the data means.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center border-t border-border pt-12">
          <p className="text-muted-foreground mb-6">
            Ready to analyze and present your research findings?
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/statistical-analysis">
              <Button size="lg" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analyze Data
              </Button>
            </Link>
            <Link href="/thesis-phases/chapter-4/editor">
              <Button size="lg" variant="outline" className="gap-2">
                <FileTextIcon className="h-4 w-4" />
                Open Text Editor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}