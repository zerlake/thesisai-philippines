'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, ArrowLeft, Lightbulb, BookOpen, Network, FileCheck, BookCopy, Target } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      {/* Header */}
      <div className="border-b border-orange-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/thesis-phases" className="flex items-center gap-2 text-orange-600 hover:text-orange-800 transition-colors">
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
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full mb-6">
            <FileText className="h-5 w-5" />
            <span className="font-semibold">Chapter 5</span>
          </div>
          
          <h1 className="text-5xl font-bold text-orange-900 mb-6">
            Summary of Findings, Conclusions and Recommendations
          </h1>
          
          <p className="text-xl text-orange-700 max-w-3xl mx-auto mb-10">
            Synthesize your research findings, draw meaningful conclusions, 
            and provide recommendations for future research and practice.
          </p>
          
          <div className="bg-orange-100 border border-orange-200 rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="font-semibold text-orange-800 mb-3">About Chapter 5</h3>
            <p className="text-orange-700">
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
                <Card className="h-full p-6 hover:shadow-xl transition-all border-2 border-orange-200 hover:border-orange-400 cursor-pointer group">
                  {/* Feature Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-orange-900 mb-2 group-hover:text-orange-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-orange-700">{feature.description}</p>
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-4 pt-4 border-t border-orange-100 flex justify-end">
                    <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                      Access Tool
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Chapter 5 Guide */}
        <div className="bg-white rounded-xl border border-orange-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-orange-900 mb-6">Chapter 5 Essentials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
              <h3 className="font-semibold text-orange-800 mb-3">Summary of Findings</h3>
              <p className="text-orange-700 text-sm">
                Concisely summarize your key findings corresponding to 
                your research questions or hypotheses.
              </p>
            </div>
            
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
              <h3 className="font-semibold text-orange-800 mb-3">Conclusions</h3>
              <p className="text-orange-700 text-sm">
                Present logical conclusions drawn from your findings, 
                directly addressing your research questions.
              </p>
            </div>
            
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-100">
              <h3 className="font-semibold text-orange-800 mb-3">Recommendations</h3>
              <p className="text-orange-700 text-sm">
                Provide actionable recommendations for practice, policy, 
                and future research based on your study's implications.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-orange-700 mb-6">
            Ready to conclude your research journey?
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/conclusion">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 gap-2">
                <FileText className="h-4 w-4" />
                Write Conclusions
              </Button>
            </Link>
            <Link href="/document-analyzer">
              <Button size="lg" variant="outline" className="border-orange-300 text-orange-700">
                Review Thesis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}