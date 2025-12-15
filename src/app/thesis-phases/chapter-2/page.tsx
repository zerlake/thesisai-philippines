'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, ArrowLeft, Network, FileText, FlaskConical, Bot, BookCopy, FileTextIcon } from 'lucide-react';

// Chapter 2 specific components
const Chapter2Features = [
  {
    id: "literature-matrix",
    icon: BookOpen,
    title: "Literature Matrix",
    description: "Organize and analyze your literature sources systematically",
    href: "/literature-review"
  },
  {
    id: "article-extractor",
    icon: FileText,
    title: "Research Article Extractor",
    description: "Extract methodology, findings, and conclusions from articles",
    href: "/research-article-analyzer"
  },
  {
    id: "annotation-tool",
    icon: BookCopy,
    title: "Shared Annotation Tool",
    description: "Annotate and tag literature with your research team",
    href: "/literature-review"
  },
  {
    id: "synthesis-tool",
    icon: Network,
    title: "Literature Synthesis Tool",
    description: "Synthesize multiple sources into coherent themes",
    href: "/literature-review"
  },
];

export default function Chapter2Page() {
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
            <h1 className="text-lg font-semibold text-foreground">Chapter 2 - Literature Review</h1>
            <Link href="/thesis-phases/chapter-2/editor">
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
            <BookOpen className="h-5 w-5" />
            <span className="font-semibold">Chapter 2</span>
          </div>
          
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Review of Related Literature
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Review, synthesize, and critically analyze literature relevant to your study. 
            This chapter provides the theoretical foundation and identifies research gaps.
          </p>
          
          <div className="bg-muted border border-border rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="font-semibold text-foreground mb-3">About Chapter 2</h3>
            <p className="text-muted-foreground">
              Chapter 2 includes foreign and local literature, foreign and local studies, 
              and a synthesis that connects these to your research. It establishes the 
              theoretical framework for your study and identifies gaps your research addresses.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {Chapter2Features.map((feature) => {
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

        {/* Chapter 2 Guide */}
        <div className="bg-card rounded-xl border border-border p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Chapter 2 Essentials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-3">Literature Review</h3>
              <p className="text-muted-foreground text-sm">
                Review relevant literature from academic journals, books, 
                and other scholarly sources that relate to your research.
              </p>
            </div>
            
            <div className="bg-muted p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-3">Studies Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Analyze existing studies related to your topic, noting 
                methodologies, findings, and limitations.
              </p>
            </div>
            
            <div className="bg-muted p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-3">Synthesis</h3>
              <p className="text-muted-foreground text-sm">
                Synthesize the literature to build a logical argument 
                that leads to your research questions and methodology.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center border-t border-border pt-12">
          <p className="text-muted-foreground mb-6">
            Ready to build your theoretical foundation?
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/literature-review">
              <Button size="lg" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Start Literature Review
              </Button>
            </Link>
            <Link href="/thesis-phases/chapter-2/editor">
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