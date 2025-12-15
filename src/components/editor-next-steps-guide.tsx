"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { 
  ArrowRight, 
  CheckCircle2, 
  Lightbulb, 
  BookOpen, 
  Target,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface EditorNextStepsGuideProps {
  phase?: 'conceptualize' | 'research' | 'write' | 'submit';
}

export function EditorNextStepsGuide({ phase = 'conceptualize' }: EditorNextStepsGuideProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const steps = [
    {
      number: 1,
      title: "01. Conceptualize - Research Planning",
      phaseKey: "conceptualize",
      description: "Define your research focus and identify your research gap",
      tools: [
        {
          name: "Topic Ideas",
          description: "Generate research topic ideas",
          icon: Lightbulb,
          href: "/topic-ideas",
        },
        {
          name: "Research Question Generator",
          description: "Create focused research questions",
          icon: Target,
          href: "/research-problem-identifier",
        },
        {
          name: "Outline Generator",
          description: "Structure your thesis outline",
          icon: FileText,
          href: "/outline",
        },
      ],
    },
    {
      number: 2,
      title: "02. Research - Literature & Analysis",
      phaseKey: "research",
      description: "Dive deep into your research by analyzing literature and conducting studies",
      tools: [
        {
          name: "Research Helper",
          description: "Find and manage academic papers",
          icon: BookOpen,
          href: "/research",
        },
        {
          name: "Research Article Analyzer",
          description: "Extract methodology, findings, conclusions",
          icon: FileText,
          href: "/research-article-analyzer",
        },
        {
          name: "Literature Review Tool",
          description: "Manage and annotate sources collaboratively",
          icon: BookOpen,
          href: "/literature-review",
        },
      ],
    },
    {
      number: 3,
      title: "03. Write & Refine - Content Creation",
      phaseKey: "write",
      description: "Transform your research into polished writing",
      tools: [
        {
          name: "Grammar & Style Check",
          description: "Improve clarity and academic tone",
          icon: FileText,
          href: "/grammar-check",
        },
        {
          name: "Paraphraser",
          description: "Rewrite for clarity while maintaining meaning",
          icon: Target,
          href: "/paraphraser",
        },
        {
          name: "Reference Manager",
          description: "Generate citations and manage bibliography",
          icon: BookOpen,
          href: "/references",
        },
      ],
    },
    {
      number: 4,
      title: "04. Submit & Present - Finalization & Defense",
      phaseKey: "submit",
      description: "Polish, submit, and prepare for your defense",
      tools: [
        {
          name: "Format Checker",
          description: "Check compliance with university requirements",
          icon: CheckCircle2,
          href: "/university-format-checker",
        },
        {
          name: "Defense PPT Coach",
          description: "Create structured defense presentations",
          icon: Target,
          href: "/defense-ppt-coach",
        },
        {
          name: "Originality Check",
          description: "Scan for plagiarism and ensure academic integrity",
          icon: CheckCircle2,
          href: "/originality-check",
        },
      ],
    },
  ];

  const currentStepIndex = steps.findIndex(s => s.phaseKey === phase);
  const currentStep = { ...steps[currentStepIndex], status: "current", description: `You're here! ${steps[currentStepIndex].description}` };
  const nextStep = currentStepIndex < steps.length - 1 ? { ...steps[currentStepIndex + 1], status: "next" } : null;

  if (isCollapsed) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="rounded-full shadow-lg"
        >
          <Lightbulb className="w-4 h-4 mr-2" />
          Show Next Steps
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Step Card */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">{currentStep.title}</CardTitle>
                <CardDescription className="mt-1 text-muted-foreground">{currentStep.description}</CardDescription>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Collapse"
            >
              ✕
            </button>
          </div>
        </CardHeader>
      </Card>

      {/* Next Step - Call to Action */}
      {nextStep && (
        <Card className="border-2 border-primary bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                {nextStep.number}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-foreground">{nextStep.title}</CardTitle>
                <CardDescription className="mt-1 text-muted-foreground">{nextStep.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground mb-4">
              Ready for the next phase? Here are your essential tools:
            </p>
            <div className="space-y-2">
              {nextStep.tools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Link key={tool.href} href={tool.href}>
                    <Button
                      variant="outline"
                      className="w-full justify-between hover:bg-primary/10 text-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-foreground">{tool.name}</div>
                          <div className="text-xs text-muted-foreground">{tool.description}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Steps Overview */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          View all thesis phases
        </summary>
        <div className="mt-4 space-y-3">
          {steps.map((step) => (
            <Card key={step.number} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className={`rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold ${
                    step.phaseKey === phase ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {step.phaseKey === phase ? "✓" : step.number}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base text-foreground">{step.title}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </details>

      {/* Quick Navigation */}
      <Card className="bg-secondary border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">Quick Access to All Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/thesis-phases">
            <Button variant="outline" className="w-full justify-start text-foreground hover:text-foreground">
              <Target className="w-4 h-4 mr-2" />
              View All Thesis Phases
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start text-foreground hover:text-foreground">
              <FileText className="w-4 h-4 mr-2" />
              Back to Dashboard
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
