'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart3, ArrowLeft, FileText, FlaskConical, Bot, BookCopy, Presentation } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      {/* Header */}
      <div className="border-b border-emerald-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/thesis-phases" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-800 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Phases
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2 rounded-full mb-6">
            <BarChart3 className="h-5 w-5" />
            <span className="font-semibold">Chapter 4</span>
          </div>
          
          <h1 className="text-5xl font-bold text-emerald-900 mb-6">
            Presentation, Analysis and Interpretation of Data
          </h1>
          
          <p className="text-xl text-emerald-700 max-w-3xl mx-auto mb-10">
            Present your research findings in an organized manner with appropriate 
            statistical treatments and meaningful interpretations.
          </p>
          
          <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="font-semibold text-emerald-800 mb-3">About Chapter 4</h3>
            <p className="text-emerald-700">
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
                <Card className="h-full p-6 hover:shadow-xl transition-all border-2 border-emerald-200 hover:border-emerald-400 cursor-pointer group">
                  {/* Feature Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-emerald-900 mb-2 group-hover:text-emerald-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-emerald-700">{feature.description}</p>
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-4 pt-4 border-t border-emerald-100 flex justify-end">
                    <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                      Access Tool
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Chapter 4 Guide */}
        <div className="bg-white rounded-xl border border-emerald-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-emerald-900 mb-6">Chapter 4 Essentials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
              <h3 className="font-semibold text-emerald-800 mb-3">Data Presentation</h3>
              <p className="text-emerald-700 text-sm">
                Organize your findings in a logical sequence, typically 
                following the same order as your research questions.
              </p>
            </div>
            
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
              <h3 className="font-semibold text-emerald-800 mb-3">Statistical Analysis</h3>
              <p className="text-emerald-700 text-sm">
                Apply appropriate statistical tools to analyze your data 
                as specified in your Chapter 3 methodology.
              </p>
            </div>
            
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
              <h3 className="font-semibold text-emerald-800 mb-3">Results Interpretation</h3>
              <p className="text-emerald-700 text-sm">
                Interpret your findings in relation to your research questions 
                and existing literature, explaining what the data means.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-emerald-700 mb-6">
            Ready to analyze and present your research findings?
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/statistical-analysis">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 gap-2">
                <BarChart3 className="h-4 w-4" />
                Analyze Data
              </Button>
            </Link>
            <Link href="/results">
              <Button size="lg" variant="outline" className="border-emerald-300 text-emerald-700">
                View Results
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}