// src/app/apps/thesis-calculator/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  Target, 
  FileText, 
  Clock, 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Calendar,
  GraduationCap,
  Brain,
  Scale,
  Type,
  Eye,
  TrendingDown
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ThesisCalculatorPage() {
  const [wordCount, setWordCount] = useState<string>('');
  const [pagesCount, setPagesCount] = useState<string>('');
  const [readingSpeed, setReadingSpeed] = useState<string>('200'); // words per minute
  const [writingSpeed, setWritingSpeed] = useState<string>('30'); // words per minute
  const [dailyGoal, setDailyGoal] = useState<string>('1000'); // words per day
  const [startDate, setStartDate] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>('');
  const [calculatedResults, setCalculatedResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('calculator');

  // Calculate thesis statistics
  const calculateMetrics = () => {
    const words = parseInt(wordCount) || 0;
    const pages = parseInt(pagesCount) || 0;
    const readSpeed = parseInt(readingSpeed) || 200;
    const writeSpeed = parseInt(writingSpeed) || 30;
    const goal = parseInt(dailyGoal) || 1000;
    
    if (!words && !pages) return null;
    
    // If pages are provided but not words, estimate words (assuming ~500 words per page)
    const finalWordCount = words || (pages * 500);
    
    // Calculate reading time
    const readingTimeMinutes = finalWordCount / readSpeed;
    const readingTimeHours = readingTimeMinutes / 60;
    
    // Calculate writing time
    const writingTimeMinutes = finalWordCount / writeSpeed;
    const writingTimeHours = writingTimeMinutes / 60;
    
    // Calculate days needed based on daily goal
    const daysNeeded = finalWordCount / goal;
    
    // If start and target dates are provided, calculate daily pace needed
    let dailyPace = goal;
    if (startDate && targetDate) {
      const start = new Date(startDate);
      const target = new Date(targetDate);
      const diffTime = Math.abs(target.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        dailyPace = Math.ceil(finalWordCount / diffDays);
      }
    }
    
    return {
      wordCount: finalWordCount,
      pageEstimate: Math.ceil(finalWordCount / 500),
      readingTimeMinutes: Math.round(readingTimeMinutes),
      readingTimeHours: parseFloat(readingTimeHours.toFixed(1)),
      writingTimeMinutes: Math.round(writingTimeMinutes),
      writingTimeHours: parseFloat(writingTimeHours.toFixed(1)),
      daysNeeded: Math.ceil(daysNeeded),
      dailyPace: dailyPace,
      progressPercent: 0 // This would be calculated based on actual progress vs plan
    };
  };

  useEffect(() => {
    const results = calculateMetrics();
    setCalculatedResults(results);
  }, [wordCount, pagesCount, readingSpeed, writingSpeed, dailyGoal, startDate, targetDate]);

  // Calculate progress based on actual writing progress
  const [actualWords, setActualWords] = useState<string>('0');
  
  const calculateProgress = () => {
    if (!calculatedResults || calculatedResults.wordCount === 0) return 0;
    const actual = parseInt(actualWords) || 0;
    return Math.min(100, Math.round((actual / calculatedResults.wordCount) * 100));
  };

  const progressPercent = calculateProgress();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Thesis Calculator</h1>
          <p className="text-muted-foreground">
            Calculate thesis statistics like word count, reading time, and complexity metrics
          </p>
        </div>

        <Tabs defaultValue="calculator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="complexity">Complexity Analysis</TabsTrigger>
            <TabsTrigger value="timeline">Timeline Planner</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Input Parameters
                  </CardTitle>
                  <CardDescription>
                    Enter your thesis parameters to calculate statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wordCount">Target Word Count</Label>
                      <Input
                        id="wordCount"
                        type="number"
                        placeholder="e.g., 15000"
                        value={wordCount}
                        onChange={(e) => setWordCount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pagesCount">Target Pages</Label>
                      <Input
                        id="pagesCount"
                        type="number"
                        placeholder="e.g., 50"
                        value={pagesCount}
                        onChange={(e) => setPagesCount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="readingSpeed">Reading Speed (words/min)</Label>
                      <Input
                        id="readingSpeed"
                        type="number"
                        value={readingSpeed}
                        onChange={(e) => setReadingSpeed(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="writingSpeed">Writing Speed (words/min)</Label>
                      <Input
                        id="writingSpeed"
                        type="number"
                        value={writingSpeed}
                        onChange={(e) => setWritingSpeed(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dailyGoal">Daily Writing Goal (words)</Label>
                    <Input
                      id="dailyGoal"
                      type="number"
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetDate">Target Date</Label>
                      <Input
                        id="targetDate"
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actualWords">Actual Words Written</Label>
                    <Input
                      id="actualWords"
                      type="number"
                      value={actualWords}
                      onChange={(e) => setActualWords(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Calculated Metrics
                  </CardTitle>
                  <CardDescription>
                    Your thesis statistics based on entered parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {calculatedResults ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-bold">{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} />

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Total Words</span>
                          </div>
                          <div className="text-xl font-bold">{calculatedResults.wordCount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            ~{calculatedResults.pageEstimate} pages
                          </div>
                        </div>

                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Reading Time</span>
                          </div>
                          <div className="text-xl font-bold">{calculatedResults.readingTimeHours}</div>
                          <div className="text-xs text-muted-foreground">
                            hours at {readingSpeed} wpm
                          </div>
                        </div>

                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Writing Time</span>
                          </div>
                          <div className="text-xl font-bold">{calculatedResults.writingTimeHours}</div>
                          <div className="text-xs text-muted-foreground">
                            hours at {writingSpeed} wpm
                          </div>
                        </div>

                        <div className="bg-muted p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">Days Needed</span>
                          </div>
                          <div className="text-xl font-bold">{calculatedResults.daysNeeded}</div>
                          <div className="text-xs text-muted-foreground">
                            at {dailyGoal} words/day
                          </div>
                        </div>
                      </div>

                      {startDate && targetDate ? (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Required Pace</span>
                          </div>
                          <div className="text-lg font-bold">{calculatedResults.dailyPace.toLocaleString()} words/day</div>
                          <div className="text-sm text-blue-700">
                            to finish by {new Date(targetDate).toLocaleDateString()}
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Completion Estimate</span>
                        </div>
                        {startDate ? (
                          <div>
                            <div className="text-lg font-bold">
                              {calculatedResults.dailyPace > 0 ? 
                                new Date(new Date(startDate).getTime() + (calculatedResults.wordCount / calculatedResults.dailyPace) * 24 * 60 * 60 * 1000).toLocaleDateString() 
                                : 'Not calculable'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Based on {calculatedResults.dailyPace} words/day pace
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Enter start date to see estimated completion
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      <div className="text-center">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Enter thesis parameters to calculate statistics</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="complexity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Complexity Analysis
                </CardTitle>
                <CardDescription>
                  Analyze the complexity of your thesis content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="text-center">
                        <Type className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                        <div className="text-2xl font-bold">8.2</div>
                        <div className="text-xs text-muted-foreground">Readability Score</div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="text-center">
                        <Brain className="h-8 w-8 mx-auto text-green-500 mb-2" />
                        <div className="text-2xl font-bold">Professional</div>
                        <div className="text-xs text-muted-foreground">Academic Level</div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="text-center">
                        <Eye className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                        <div className="text-2xl font-bold">12th+</div>
                        <div className="text-xs text-muted-foreground">Reading Grade</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Complexity Factors</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Sentence Length</span>
                        <Badge variant="secondary">Complex</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Vocabulary Difficulty</span>
                        <Badge variant="secondary">Professional</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Concept Density</span>
                        <Badge variant="outline">Moderate</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Source Citations</span>
                        <Badge variant="outline">High</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline Planner
                </CardTitle>
                <CardDescription>
                  Plan your thesis writing timeline based on calculated metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Writing Schedule</h3>
                    <Badge variant="outline">Based on {calculatedResults?.dailyPace || dailyGoal} words/day</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {calculatedResults && calculatedResults.daysNeeded > 0 ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Days to complete: {calculatedResults.daysNeeded}</span>
                          <span>At {calculatedResults.dailyPace} words/day</span>
                        </div>
                        <Progress value={progressPercent} />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="border rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">Week 1-2</div>
                            <div className="text-sm text-muted-foreground">Outline & Research</div>
                            <div className="text-xs mt-1">~{Math.round(calculatedResults.wordCount * 0.1)} words</div>
                          </div>
                          <div className="border rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">Week 3-6</div>
                            <div className="text-sm text-muted-foreground">Content Development</div>
                            <div className="text-xs mt-1">~{Math.round(calculatedResults.wordCount * 0.6)} words</div>
                          </div>
                          <div className="border rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">Week 7-8</div>
                            <div className="text-sm text-muted-foreground">Revision & Finalization</div>
                            <div className="text-xs mt-1">~{Math.round(calculatedResults.wordCount * 0.3)} words</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Enter thesis parameters to generate timeline
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}