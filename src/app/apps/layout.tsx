// src/app/apps/layout.tsx

import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  BookOpen, 
  FileText, 
  Users, 
  BarChart3, 
  ArrowLeft, 
  Home,
  Calculator,
  Search,
  GraduationCap,
  Wrench,
  GitBranch
} from 'lucide-react';

export default function AppsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* App Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">Thesis AI</span>
              </Link>
              
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                </Link>
                
                <Link href="/thesis-tools">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Wrench className="h-4 w-4" />
                    Tools
                  </Button>
                </Link>
                
                <Link href="/apps">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <GitBranch className="h-4 w-4" />
                    Apps
                  </Button>
                </Link>
                
                <Link href="/analytics">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Button>
                </Link>
              </nav>
            </div>
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* App Navigation Sidebar */}
      <div className="container mx-auto">
        <div className="flex gap-8 py-6">
          <aside className="w-64 flex-shrink-0 hidden md:block">
            <nav className="space-y-2 sticky top-24">
              <Link href="/apps/citation-formatter">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Citation Formatter
                </Button>
              </Link>
              
              <Link href="/apps/thesis-calculator">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Thesis Calculator
                </Button>
              </Link>
              
              <Link href="/apps/literature-review-assistant">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Literature Review Assistant
                </Button>
              </Link>
              
              <Link href="/apps/research-gap-analyzer">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                >
                  <Search className="h-4 w-4" />
                  Research Gap Analyzer
                </Button>
              </Link>
              
              <Link href="/apps/goal-setter">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                >
                  <Target className="h-4 w-4" />
                  Goal Setter
                </Button>
              </Link>
              
              <Link href="/apps/writing-tools">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Writing Tools
                </Button>
              </Link>
              
              <Link href="/apps/collaboration-hub">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                >
                  <Users className="h-4 w-4" />
                  Collaboration Hub
                </Button>
              </Link>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}