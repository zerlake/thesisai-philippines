'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, ArrowLeft, Lightbulb, BookOpen, Network, FileText, FlaskConical, Bot, BookCopy, FileTextIcon } from 'lucide-react';

// Chapter 1 specific components
const Chapter1Features = [
  {
    id: "topic-ideator",
    icon: Lightbulb,
    title: "AI Topic Ideation",
    description: "Generate research topic ideas tailored to your field",
    href: "/topic-ideas"
  },
  {
    id: "research-problem-identifier",
    icon: Target,
    title: "Research Problem Identifier",
    description: "Define your research problem and questions",
    href: "/research-problem-identifier"
  },
  {
    id: "variable-mapper",
    icon: Network,
    title: "Variable Mapping Tool",
    description: "Map relationships between variables in your research",
    href: "/variable-mapping-tool"
  },
  {
    id: "outline-generator",
    icon: BookOpen,
    title: "Chapter Outline Generator",
    description: "Create structured outlines for your thesis chapters",
    href: "/outline"
  },
  {
    id: "definition-of-terms",
    icon: BookCopy,
    title: "Definition of Terms",
    description: "Define key terms with conceptual and operational definitions",
    href: "/thesis-phases/definition-of-terms"
  },
];

export default function Chapter1Page() {
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
            <h1 className="text-lg font-semibold text-foreground">Chapter 1 - Introduction</h1>
            <Link href="/thesis-phases/chapter-1/editor">
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
            <Target className="h-5 w-5" />
            <span className="font-semibold">Chapter 1</span>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground mb-6">
            The Problem and Its Background
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Define your research problem, establish background context, and develop your 
            theoretical/conceptual framework. This chapter sets the foundation for your entire thesis.
          </p>
          
          <div className="bg-muted border border-border rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="font-semibold text-foreground mb-3">About Chapter 1</h3>
            <p className="text-muted-foreground">
              Chapter 1 typically includes the introduction, background of the study, 
              theoretical/conceptual framework, statement of the problem, hypothesis (if applicable), 
              scope and delimitation, significance of the study, and definition of terms.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {[...Chapter1Features].map((feature) => {
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

        {/* Chapter 1 Guide */}
        <div className="bg-card rounded-xl border border-border p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Chapter 1 Essentials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-3">Problem Statement</h3>
              <p className="text-muted-foreground text-sm">
                Clearly define the research problem you aim to address. 
                Ensure it is specific, measurable, and researchable.
              </p>
            </div>
            
            <div className="bg-muted p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-3">Theoretical Framework</h3>
              <p className="text-muted-foreground text-sm">
                Identify and discuss the theories that underpin your study. 
                Often accompanied by a conceptual paradigm diagram.
              </p>
            </div>
            
            <div className="bg-muted p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-3">Significance</h3>
              <p className="text-muted-foreground text-sm">
                Explain the importance of your study to various stakeholders: 
                students, researchers, practitioners, and society.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center border-t border-border pt-12">
          <p className="text-muted-foreground mb-6">
            Ready to lay a strong foundation for your thesis?
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/research-problem-identifier">
              <Button size="lg" className="gap-2">
                <Target className="h-4 w-4" />
                Define Research Problem
              </Button>
            </Link>
            <Link href="/thesis-phases/chapter-1/editor">
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