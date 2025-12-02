'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, Copy } from 'lucide-react';
import { sampleProposalDefense, sampleFinalDefense, samplePresentationsByTopic } from '@/lib/defense-ppt-samples';
import { toast } from 'sonner';

export default function DefensePPTSamplesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySample = (sampleId: string, sampleData: any) => {
    // In a real app, this would save to the user's account
    localStorage.setItem(`defense-plan-${sampleId}`, JSON.stringify(sampleData));
    setCopiedId(sampleId);
    toast.success('Sample copied! You can now edit it.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/defense-ppt-coach" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Defense PPT Coach
          </Link>
          <h1 className="text-4xl font-bold mb-2">Sample Defense Presentations</h1>
          <p className="text-lg text-muted-foreground">
            Learn from realistic examples. Copy any sample to get started quickly.
          </p>
        </div>

        <Tabs defaultValue="proposal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="proposal">Proposal Defense</TabsTrigger>
            <TabsTrigger value="final">Final Defense</TabsTrigger>
            <TabsTrigger value="qa">Q&A Examples</TabsTrigger>
            <TabsTrigger value="topics">By Topic</TabsTrigger>
          </TabsList>

          {/* Proposal Defense Sample */}
          <TabsContent value="proposal" className="space-y-6 mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">
                      Factors Affecting Student Academic Performance in Philippine Public Schools
                    </CardTitle>
                    <CardDescription className="mt-2">
                      A realistic 15-minute proposal defense with 8 slides covering Chapters 1-3
                    </CardDescription>
                  </div>
                  <Badge>Proposal</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{sampleProposalDefense.slideCount}</div>
                    <div className="text-xs text-muted-foreground">Slides</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{sampleProposalDefense.totalTime}m</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">3</div>
                    <div className="text-xs text-muted-foreground">Chapters</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">Education</div>
                    <div className="text-xs text-muted-foreground">Field</div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Slide Outline:</h4>
                  <ol className="space-y-1 text-sm">
                    {sampleProposalDefense.slides.map((slide) => (
                      <li key={slide.id} className="text-muted-foreground">
                        {slide.order + 1}. {slide.title}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex gap-4">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/defense-ppt-coach?sample=proposal`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Presentation
                    </Link>
                  </Button>
                  <Button
                    onClick={() => handleCopySample('proposal', sampleProposalDefense)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copiedId === 'proposal' ? 'Copied!' : 'Copy as Template'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Key Features:</h4>
                <ul className="space-y-1 text-sm text-blue-900">
                  <li>✓ Concise bullets (max 3 per slide)</li>
                  <li>✓ Presenter notes with speaking scripts</li>
                  <li>✓ Realistic time estimates per slide</li>
                  <li>✓ Follows proposal defense structure</li>
                  <li>✓ Proper transitions between sections</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Final Defense Sample */}
          <TabsContent value="final" className="space-y-6 mt-8">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl">
                      Digital Literacy Programs and Student Achievement in Rural Philippine Schools
                    </CardTitle>
                    <CardDescription className="mt-2">
                      A complete 25-minute final defense with 10 slides covering all chapters
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Final</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{sampleFinalDefense.slideCount}</div>
                    <div className="text-xs text-muted-foreground">Slides</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{sampleFinalDefense.totalTime}m</div>
                    <div className="text-xs text-muted-foreground">Duration</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">5</div>
                    <div className="text-xs text-muted-foreground">Chapters</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">Education</div>
                    <div className="text-xs text-muted-foreground">Field</div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Slide Outline:</h4>
                  <ol className="space-y-1 text-sm">
                    {sampleFinalDefense.slides.map((slide) => (
                      <li key={slide.id} className="text-muted-foreground">
                        {slide.order + 1}. {slide.title}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex gap-4">
                  <Button asChild variant="outline" className="flex-1">
                    <Link href={`/defense-ppt-coach?sample=final`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Presentation
                    </Link>
                  </Button>
                  <Button
                    onClick={() => handleCopySample('final', sampleFinalDefense)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copiedId === 'final' ? 'Copied!' : 'Copy as Template'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Highlights:</h4>
                <ul className="space-y-1 text-sm text-green-900">
                  <li>✓ Complete research narrative (Chapter 1-5)</li>
                  <li>✓ Results and discussion with evidence</li>
                  <li>✓ Limitations and future directions</li>
                  <li>✓ Professional timing throughout</li>
                  <li>✓ Q&A-ready presenter notes</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Q&A Examples */}
          <TabsContent value="qa" className="space-y-6 mt-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Proposal Q&A */}
              <Card>
                <CardHeader>
                  <CardTitle>Proposal Defense Q&A</CardTitle>
                  <CardDescription>Likely questions and professional answers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sampleProposalDefense.slides.length > 0 && (
                    <>
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-sm mb-1">Q: Why focus on socioeconomic factors?</p>
                          <p className="text-sm text-muted-foreground">
                            A: Socioeconomic variables are more actionable for policy interventions. Schools can't change individual background, but policies can address infrastructure and resource allocation.
                          </p>
                        </div>
                        <div className="border-t pt-3">
                          <p className="font-semibold text-sm mb-1">Q: How will you ensure valid measurements?</p>
                          <p className="text-sm text-muted-foreground">
                            A: We're using validated instruments adapted for the Philippine context, with pilot testing to ensure Cronbach's α {'>'} 0.7.
                          </p>
                        </div>
                        <div className="border-t pt-3">
                          <p className="font-semibold text-sm mb-1">Q: What's your sample size justification?</p>
                          <p className="text-sm text-muted-foreground">
                            A: Using power analysis with effect size f = 0.15, α = 0.05, and power = 0.80, we calculated n = 800 across 40 schools.
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/defense-ppt-coach?sample=proposal-qa`}>
                          View All Q&A for Proposal
                        </Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Final Q&A */}
              <Card>
                <CardHeader>
                  <CardTitle>Final Defense Q&A</CardTitle>
                  <CardDescription>Sample questions challenging methodology & results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {sampleFinalDefense.slides.length > 0 && (
                    <>
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-sm mb-1">Q: Why quasi-experimental vs. RCT?</p>
                          <p className="text-sm text-muted-foreground">
                            A: RCTs are ethically problematic in schools. Quasi-experimental with propensity matching provides strong inference while being ethical.
                          </p>
                        </div>
                        <div className="border-t pt-3">
                          <p className="font-semibold text-sm mb-1">Q: The 23% improvement seems high. Why?</p>
                          <p className="text-sm text-muted-foreground">
                            A: The 95% CI is [18%, 28%], so it's robust. Multiple regression models confirmed (β = 0.23, p {'<'} 0.001).
                          </p>
                        </div>
                        <div className="border-t pt-3">
                          <p className="font-semibold text-sm mb-1">Q: Why stronger effects for females?</p>
                          <p className="text-sm text-muted-foreground">
                            A: Possibly higher baseline motivation or different learning styles. Boys may have had more informal exposure.
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/defense-ppt-coach?sample=final-qa`}>
                          View All Q&A for Final
                        </Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* By Topic */}
          <TabsContent value="topics" className="space-y-6 mt-8">
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(samplePresentationsByTopic).map(([key, topic]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                    <CardDescription>{key.charAt(0).toUpperCase() + key.slice(1)} Research</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Key Discussion Points:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {topic.keyPoints.map((point, index) => (
                          <li key={index}>• {point}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div>
                        <div className="font-semibold text-primary">{topic.totalTime}m</div>
                        <div className="text-xs text-muted-foreground">Typical Duration</div>
                      </div>
                      <div>
                        <div className="font-semibold text-primary">{topic.defenseType === 'final' ? 'Final' : 'Proposal'}</div>
                        <div className="text-xs text-muted-foreground">Defense Type</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" disabled>
                      Template Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle>How to Use These Samples</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="text-lg">1.</div>
              <div>
                <p className="font-semibold">Browse the samples above</p>
                <p className="text-muted-foreground">Study how real presentations are structured and timed</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-lg">2.</div>
              <div>
                <p className="font-semibold">Copy a sample as template</p>
                <p className="text-muted-foreground">Click "Copy as Template" to start with a proven structure</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-lg">3.</div>
              <div>
                <p className="font-semibold">Customize for your thesis</p>
                <p className="text-muted-foreground">Edit titles, bullets, and notes to match your research</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-lg">4.</div>
              <div>
                <p className="font-semibold">Practice with Q&A</p>
                <p className="text-muted-foreground">Use the sample questions to prepare for panel questions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
