'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, ArrowLeft, Lightbulb, BookOpen, Network, FileCheck, BookCopy, Target, FileTextIcon } from 'lucide-react';

// Chapter 5 specific components
const Chapter5Features = [
  {
    id: "summary-generator",
    icon: FileText,
    title: "Summary Generator",
    description: "Generate comprehensive summaries of your findings",
    href: "/outline"
  },
  {
    id: "conclusion-writer",
    icon: Lightbulb,
    title: "Conclusion Writer",
    description: "Craft meaningful conclusions based on your results",
    href: "/conclusion"
  },
  {
    id: "recommendations-builder",
    icon: Target,
    title: "Recommendations Builder",
    description: "Develop actionable recommendations from your research",
    href: "/outline"
  },
  {
    id: "thesis-reviewer",
    icon: FileCheck,
    title: "Thesis Review Tool",
    description: "Review and ensure completeness of your thesis document",
    href: "/document-analyzer"
  },
];

export default function Chapter5Page() {
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
            <h1 className="text-lg font-semibold text-foreground">Chapter 5 - Conclusions</h1>
            <Link href="/thesis-phases/chapter-5/editor">
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
            <FileText className="h-5 w-5" />
            <span className="font-semibold">Chapter 5</span>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Summary of Findings, Conclusions and Recommendations
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Synthesize your research findings, draw meaningful conclusions, 
            and provide recommendations for future research and practice.
          </p>
          
          <div className="bg-muted border border-border rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="font-semibold text-foreground mb-3">About Chapter 5</h3>
            <p className="text-muted-foreground">
              Chapter 5 presents the summary of your research, conclusions based on findings, 
              and recommendations for future research and practice. It ties together all 
              elements of your study and provides closure to your research narrative.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {Chapter5Features.map((feature) => {
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

        {/* Chapter 5 Guide */}
        <div className="bg-card rounded-xl border border-border p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Chapter 5 Essentials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-3">Summary of Findings</h3>
              <p className="text-muted-foreground text-sm">
                Concisely summarize your key findings corresponding to 
                your research questions or hypotheses.
              </p>
            </div>
            
            <div className="bg-muted p-6 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-3">Conclusions</h3>
            <p className="text-muted-foreground text-sm">
                Present logical conclusions drawn from your findings, 
                directly addressing your research questions.
              </p>
            </div>
            
            <div className="bg-muted p-6 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-3">Recommendations</h3>
            <p className="text-muted-foreground text-sm">
                Provide actionable recommendations for practice, policy, 
                and future research based on your study's implications.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center border-t border-border pt-12">
          <p className="text-muted-foreground mb-6">
            Ready to conclude your research journey?
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/conclusion">
              <Button size="lg" className="gap-2">
                <FileText className="h-4 w-4" />
                Write Conclusions
              </Button>
            </Link>
            <Link href="/thesis-phases/chapter-5/editor">
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