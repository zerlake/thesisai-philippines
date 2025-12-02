'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, ArrowLeft, BookText, Target, FlaskConical, BookOpen, Network, FileText } from 'lucide-react';

// Chapter 3 specific components
const Chapter3Features = [
  {
    id: "validity-defender",
    icon: Shield,
    title: "Validity Defender",
    description: "Validate instruments, generate defense responses, practice with AI scoring, export PPT slides",
    href: "/thesis-phases/chapter-3/validity-defender"
  },
  {
    id: "methodology-analyzer",
    icon: BookText,
    title: "Methodology Analyzer",
    description: "Analyze and validate your chosen research methodology",
    href: "/methodology"
  },
  {
    id: "instrument-builder",
    icon: Target,
    title: "Instrument Builder",
    description: "Create and validate research instruments like surveys and interview guides",
    href: "/methodology"
  },
  {
    id: "statistical-planner",
    icon: FlaskConical,
    title: "Statistical Treatment Planner",
    description: "Plan your statistical analysis approach for Chapter 3",
    href: "/statistical-analysis"
  },
];

export default function Chapter3Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100">
      {/* Header */}
      <div className="border-b border-amber-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/thesis-phases" className="flex items-center gap-2 text-amber-600 hover:text-amber-800 transition-colors">
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
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-full mb-6">
            <Shield className="h-5 w-5" />
            <span className="font-semibold">Chapter 3</span>
          </div>
          
          <h1 className="text-5xl font-bold text-amber-900 mb-6">
            Research Methodology
          </h1>
          
          <p className="text-xl text-amber-700 max-w-3xl mx-auto mb-10">
            Develop and validate your research methodology with AI-powered tools. 
            This section helps you defend your methodological choices and ensure 
            your research design aligns with your research questions.
          </p>
          
          <div className="bg-amber-100 border border-amber-200 rounded-xl p-6 max-w-4xl mx-auto">
            <h3 className="font-semibold text-amber-800 mb-3">About Chapter 3</h3>
            <p className="text-amber-700">
              Chapter 3 typically includes Research Methodology, covering your research design, 
              data collection methods, instrumentation, sampling techniques, and statistical treatments. 
              This phase is crucial for defending your research approach.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {Chapter3Features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Link key={feature.id} href={feature.href}>
                <Card className="h-full p-6 hover:shadow-xl transition-all border-2 border-amber-200 hover:border-amber-400 cursor-pointer group">
                  {/* Feature Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-amber-100 text-amber-600">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-amber-900 mb-2 group-hover:text-amber-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-amber-700">{feature.description}</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 pt-4 border-t border-amber-100 flex justify-end">
                    <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      Access Tool
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Chapter 3 Guide */}
        <div className="bg-white rounded-xl border border-amber-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">Chapter 3 Essentials</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
              <h3 className="font-semibold text-amber-800 mb-3">Research Design</h3>
              <p className="text-amber-700 text-sm">
                Choose between quantitative, qualitative, or mixed-methods approaches. 
                Justify your choice based on your research questions.
              </p>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
              <h3 className="font-semibold text-amber-800 mb-3">Data Collection</h3>
              <p className="text-amber-700 text-sm">
                Plan your data gathering methods: surveys, interviews, observations, 
                or document analysis. Ensure reliability and validity.
              </p>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
              <h3 className="font-semibold text-amber-800 mb-3">Statistical Treatment</h3>
              <p className="text-amber-700 text-sm">
                Specify statistical tools for data analysis. Plan hypothesis testing 
                and relationship examination techniques.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-amber-700 mb-6">
            Ready to strengthen your research methodology?
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/thesis-phases/chapter-3/validity-defender">
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 gap-2">
                <Shield className="h-4 w-4" />
                Start Validity Defender
              </Button>
            </Link>
            <Link href="/methodology">
              <Button size="lg" variant="outline" className="border-amber-300 text-amber-700">
                Methodology Builder
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}