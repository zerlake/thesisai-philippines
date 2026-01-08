"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  FlaskConical,
  Calculator,
  ClipboardEdit,
  GitBranch,
  Sigma,
  Users,
  ClipboardList,
  Target,
} from "lucide-react";
import { MethodologyToolCard } from "./methodology-tool-card";
import { ResearchTypeAdvisor } from "./methodology-tools/research-type-advisor";
import { ResearchDesignSelector } from "./methodology-tools/research-design-selector";
import { SampleSizeCalculator } from "./methodology-tools/sample-size-calculator";
import { SamplingMethodAdvisor } from "./methodology-tools/sampling-method-advisor";
import { StatisticalTestAdvisor } from "./methodology-tools/statistical-test-advisor";
import { InformedConsentGenerator } from "./methodology-tools/informed-consent-generator";
import { PowerAnalysisCalculator } from "./methodology-tools/power-analysis-calculator";
import { SurveyQuestionGenerator } from "./methodology-tools/survey-question-generator";

export function MethodologyHelper() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chapter III: Methodology Helper</CardTitle>
          <CardDescription>
            Interactive tools to help you build and justify your research methodology.
          </CardDescription>
        </CardHeader>
      </Card>

      <MethodologyToolCard
        title="Research Type Advisor"
        description="Automatically detect whether your research is quantitative, qualitative, or mixed-method based on your problem statement."
        icon={Target}
      >
        <ResearchTypeAdvisor />
      </MethodologyToolCard>

      <MethodologyToolCard
        title="Research Design Selector"
        description="Choose your research design and generate a justification for your choice."
        icon={FlaskConical}
      >
        <ResearchDesignSelector />
      </MethodologyToolCard>

      <MethodologyToolCard
        title="Sample Size Calculator (Slovin's Formula)"
        description="Calculate the required sample size from a known total population."
        icon={Calculator}
      >
        <SampleSizeCalculator />
      </MethodologyToolCard>

      <MethodologyToolCard
        title="Sample Size & Power Analysis Calculator"
        description="Determine the required sample size based on your chosen statistical test and desired effect size."
        icon={Users}
      >
        <PowerAnalysisCalculator />
      </MethodologyToolCard>

      <MethodologyToolCard
        title="Sampling Method Advisor"
        description="Answer a few questions to get a recommendation for your sampling technique."
        icon={GitBranch}
      >
        <SamplingMethodAdvisor />
      </MethodologyToolCard>
      
      <MethodologyToolCard
        title="Survey Question Generator"
        description="Generate sample survey questions for your topic based on different question types."
        icon={ClipboardList}
      >
        <SurveyQuestionGenerator />
      </MethodologyToolCard>

      <MethodologyToolCard
        title="Data Analysis Plan Advisor"
        description="Answer a few questions to find the right statistical test, its assumptions, and a justification for your plan."
        icon={Sigma}
      >
        <StatisticalTestAdvisor />
      </MethodologyToolCard>

      <MethodologyToolCard
        title="Informed Consent Form Generator"
        description="Create a standard consent form for your participants."
        icon={ClipboardEdit}
      >
        <InformedConsentGenerator />
      </MethodologyToolCard>
    </div>
  );
}