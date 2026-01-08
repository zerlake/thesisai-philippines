"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Target,
  Calendar,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Play
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const modules = [
  {
    id: 1,
    title: "Understanding Your Role as an Advisor",
    duration: "30 mins",
    completed: true,
    content: {
      overview: "Learn the fundamental responsibilities and expectations of a thesis advisor, including ethical guidelines and professional standards.",
      keyPoints: [
        "Core responsibilities of thesis advisors",
        "Ethical guidelines and academic integrity",
        "Balancing support with independence",
        "Legal and institutional requirements",
        "Professional boundaries and relationships"
      ],
      practicalTips: [
        "Create a clear advisor-student agreement at the start",
        "Document all major decisions and meetings",
        "Set regular check-in schedules (weekly or bi-weekly)",
        "Establish response time expectations for emails and drafts",
        "Know when to involve department chairs or ethics committees"
      ],
      resources: [
        "Advisor Code of Ethics (PDF)",
        "Sample Advisor-Student Agreement Template",
        "Institutional Guidelines Checklist"
      ],
      caseStudy: {
        title: "Case Study: Navigating Dual Relationships",
        scenario: "Dr. Santos has been asked to advise a student who is also a family friend. The student's research aligns perfectly with Dr. Santos's expertise.",
        challenge: "How should Dr. Santos handle this situation to maintain professional boundaries?",
        solution: "Dr. Santos should disclose the relationship to the department chair, establish clear professional boundaries in a written agreement, and consider having a co-advisor to provide oversight. Regular documentation of all interactions and decisions is essential."
      },
      quiz: [
        {
          question: "What is the primary role of a thesis advisor?",
          options: ["Write the thesis for the student", "Guide and mentor the student's research", "Grade the thesis", "Fund the research"],
          correct: 1
        },
        {
          question: "How often should regular check-ins be scheduled?",
          options: ["Daily", "Weekly or bi-weekly", "Once a month", "Only when student requests"],
          correct: 1
        }
      ]
    }
  },
  {
    id: 2,
    title: "Setting Clear Expectations with Students",
    duration: "30 mins",
    completed: true,
    content: {
      overview: "Establish clear communication channels, timelines, and quality standards to prevent misunderstandings and ensure project success.",
      keyPoints: [
        "Creating comprehensive project timelines",
        "Defining quality standards and deliverables",
        "Establishing communication protocols",
        "Setting boundaries for availability",
        "Managing student expectations about workload"
      ],
      practicalTips: [
        "Hold a kick-off meeting to discuss goals and expectations",
        "Create a shared timeline with milestones and deadlines",
        "Provide examples of acceptable work quality",
        "Specify your preferred communication channels",
        "Be explicit about turnaround times for feedback"
      ],
      resources: [
        "Thesis Timeline Template (Excel)",
        "Expectations Document Template",
        "First Meeting Agenda Template"
      ],
      caseStudy: {
        title: "Case Study: Unrealistic Timeline Expectations",
        scenario: "Maria expects to complete her thesis in 3 months while working full-time. Her advisor, Dr. Reyes, knows this is unrealistic for her topic.",
        challenge: "How should Dr. Reyes address this situation?",
        solution: "Dr. Reyes should present a realistic timeline based on similar past projects, break down the work into phases with estimated durations, and help Maria understand the quality-time tradeoff. Together, they should create a feasible plan that accounts for her work schedule."
      },
      checklist: [
        "Schedule initial meeting within first week",
        "Create shared document with expectations",
        "Agree on meeting frequency and format",
        "Establish email response time expectations",
        "Set deadlines for each thesis chapter",
        "Define what constitutes 'complete' for each deliverable",
        "Discuss authorship and publication plans"
      ]
    }
  },
  {
    id: 3,
    title: "Time Management for Advisors",
    duration: "30 mins",
    completed: false,
    content: {
      overview: "Develop strategies to balance multiple advisees, research, teaching, and administrative duties effectively.",
      keyPoints: [
        "Batch processing for efficient feedback",
        "Setting office hours for student consultations",
        "Using templates and rubrics to save time",
        "Prioritizing advisor responsibilities",
        "Preventing advisor burnout"
      ],
      practicalTips: [
        "Block dedicated time slots for reading thesis drafts",
        "Use feedback templates for common issues",
        "Set maximum number of advisees per semester",
        "Group similar tasks together (e.g., all chapter reviews on one day)",
        "Learn to say no to over-commitment"
      ],
      timeManagementStrategies: [
        {
          strategy: "The Pomodoro Technique",
          description: "Review thesis drafts in 25-minute focused sessions with 5-minute breaks",
          whenToUse: "For intensive reading and commenting on student work"
        },
        {
          strategy: "Batch Processing",
          description: "Dedicate specific days for specific advisory tasks (e.g., Tuesdays for literature review feedback)",
          whenToUse: "When managing multiple students at similar thesis stages"
        },
        {
          strategy: "The 2-Minute Rule",
          description: "If a student email can be answered in 2 minutes or less, do it immediately",
          whenToUse: "For quick questions and administrative responses"
        }
      ],
      resources: [
        "Advisor Time Tracking Template",
        "Weekly Planning Worksheet",
        "Feedback Template Library"
      ],
      caseStudy: {
        title: "Case Study: Managing 10 Advisees",
        scenario: "Prof. Garcia advises 10 thesis students, teaches 2 courses, and serves on 3 committees. Students complain about slow feedback.",
        challenge: "How can Prof. Garcia manage time more effectively?",
        solution: "Prof. Garcia implements: 1) Staggered deadlines so not all students submit on the same week, 2) Dedicated thesis reading blocks on Tuesday/Thursday afternoons, 3) Template-based feedback for common issues, 4) Group feedback sessions for similar chapters, 5) Reduction to 8 advisees next semester."
      }
    }
  },
  {
    id: 4,
    title: "Building Productive Advisor-Student Relationships",
    duration: "30 mins",
    completed: false,
    content: {
      overview: "Foster supportive, professional relationships that motivate students while maintaining appropriate boundaries.",
      keyPoints: [
        "Establishing trust and psychological safety",
        "Active listening and empathetic communication",
        "Recognizing and addressing student stress",
        "Cultural sensitivity in advisory relationships",
        "Handling difficult conversations"
      ],
      practicalTips: [
        "Start each meeting by asking about student well-being",
        "Celebrate small wins and progress milestones",
        "Provide both critical and positive feedback",
        "Be transparent about your own research challenges",
        "Recognize signs of burnout or mental health issues"
      ],
      communicationTechniques: [
        {
          technique: "Active Listening",
          description: "Fully concentrate on what student is saying, show you're listening, provide feedback, defer judgment, respond appropriately",
          example: "Instead of: 'You should try method X.' Try: 'I hear that method Y isn't working. What have you considered as alternatives?'"
        },
        {
          technique: "Growth Mindset Language",
          description: "Frame challenges as learning opportunities rather than failures",
          example: "Instead of: 'This analysis is wrong.' Try: 'This analysis is a good start. Let's explore how we can strengthen it.'"
        },
        {
          technique: "Sandwich Method",
          description: "Deliver critical feedback between positive observations",
          example: "Start with strength → Address improvement area → End with encouragement"
        }
      ],
      warningSignsOfStrugglingStudent: [
        "Missing scheduled meetings without explanation",
        "Sudden drop in communication frequency",
        "Visible anxiety or distress during meetings",
        "Repeated requests for deadline extensions",
        "Quality of work deteriorates",
        "Mentions of personal problems affecting research"
      ],
      resources: [
        "Mental Health Resources for Students",
        "Difficult Conversations Script Templates",
        "Cultural Competency Guide for Advisors"
      ],
      caseStudy: {
        title: "Case Study: Student Experiencing Burnout",
        scenario: "John, usually punctual and engaged, has missed two meetings and submitted rushed work. He mentions feeling 'overwhelmed.'",
        challenge: "How should the advisor respond?",
        solution: "The advisor should: 1) Schedule a private, supportive conversation, 2) Express concern without judgment, 3) Help John break down tasks into manageable pieces, 4) Consider timeline adjustments if needed, 5) Provide campus mental health resources, 6) Schedule more frequent, shorter check-ins, 7) Document the situation and support plan."
      }
    }
  }
];

export default function Course1Page() {
  const router = useRouter();
  const [completedModules, setCompletedModules] = useState(
    modules.filter(m => m.completed).map(m => m.id)
  );
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const progress = Math.round((completedModules.length / modules.length) * 100);

  const toggleModuleComplete = (moduleId: number) => {
    setCompletedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/advisor/resources/training')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Training
        </Button>
        <Badge className="bg-blue-500">
          <Target className="w-3 h-3 mr-1" />
          Course 1
        </Badge>
      </div>

      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl md:text-3xl mb-2">
                Effective Thesis Advising
              </CardTitle>
              <CardDescription className="text-base">
                Master the fundamentals of successful thesis supervision and student mentorship
              </CardDescription>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  2 hours total
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {modules.length} modules
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {completedModules.length} completed
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Course Progress</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <div className="space-y-4">
        {modules.map((module) => {
          const isCompleted = completedModules.includes(module.id);
          const isActive = activeModule === module.id;

          return (
            <Card key={module.id} className={isCompleted ? 'border-green-500/50 bg-green-50/10' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isCompleted ? 'bg-green-500 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'}`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : module.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-1">{module.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {module.duration}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={isActive ? "outline" : "default"}
                    onClick={() => setActiveModule(isActive ? null : module.id)}
                  >
                    {isActive ? "Hide Content" : "View Module"}
                    <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  </Button>
                </div>
              </CardHeader>

              {isActive && (
                <CardContent className="border-t pt-6">
                  <div className="space-y-6">
                    {/* Overview */}
                    <div>
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        Overview
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{module.content.overview}</p>
                    </div>

                    {/* Key Points */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5 text-purple-500" />
                        Key Learning Points
                      </h3>
                      <ul className="space-y-2">
                        {module.content.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Practical Tips */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        Practical Tips
                      </h3>
                      <div className="grid gap-2">
                        {module.content.practicalTips.map((tip, idx) => (
                          <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <p className="text-sm"><span className="font-medium">Tip {idx + 1}:</span> {tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Time Management Strategies (if present) */}
                    {module.content.timeManagementStrategies && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          Time Management Strategies
                        </h3>
                        <div className="space-y-3">
                          {module.content.timeManagementStrategies.map((strategy, idx) => (
                            <Card key={idx}>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">{strategy.strategy}</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                <p><strong>Description:</strong> {strategy.description}</p>
                                <p className="text-muted-foreground"><strong>When to use:</strong> {strategy.whenToUse}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Communication Techniques (if present) */}
                    {module.content.communicationTechniques && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-green-500" />
                          Communication Techniques
                        </h3>
                        <Accordion type="single" collapsible className="w-full">
                          {module.content.communicationTechniques.map((technique, idx) => (
                            <AccordionItem key={idx} value={`technique-${idx}`}>
                              <AccordionTrigger>{technique.technique}</AccordionTrigger>
                              <AccordionContent className="space-y-2">
                                <p>{technique.description}</p>
                                <div className="p-3 bg-muted rounded-lg">
                                  <p className="text-sm font-medium mb-1">Example:</p>
                                  <p className="text-sm text-muted-foreground">{technique.example}</p>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    )}

                    {/* Warning Signs (if present) */}
                    {module.content.warningSignsOfStrugglingStudent && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                          <MessageSquare className="h-5 w-5" />
                          Warning Signs of Struggling Students
                        </h3>
                        <div className="grid gap-2">
                          {module.content.warningSignsOfStrugglingStudent.map((sign, idx) => (
                            <div key={idx} className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                              <p className="text-sm">{sign}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Checklist (if present) */}
                    {module.content.checklist && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          Implementation Checklist
                        </h3>
                        <div className="space-y-2">
                          {module.content.checklist.map((item, idx) => (
                            <label key={idx} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                              <input type="checkbox" className="mt-1" />
                              <span className="text-sm">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Case Study */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        Case Study: {module.content.caseStudy.title}
                      </h3>
                      <Card className="bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800">
                        <CardContent className="pt-6 space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Scenario</h4>
                            <p className="text-sm text-muted-foreground">{module.content.caseStudy.scenario}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Challenge</h4>
                            <p className="text-sm text-muted-foreground">{module.content.caseStudy.challenge}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Recommended Solution</h4>
                            <p className="text-sm">{module.content.caseStudy.solution}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Resources */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Additional Resources</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {module.content.resources.map((resource, idx) => (
                          <Button key={idx} variant="outline" className="justify-start">
                            <BookOpen className="mr-2 h-4 w-4" />
                            {resource}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Mark Complete Button */}
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => toggleModuleComplete(module.id)}
                        className="w-full sm:w-auto"
                        variant={isCompleted ? "outline" : "default"}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Completed
                          </>
                        ) : (
                          <>
                            Mark as Complete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Course Completion */}
      {progress === 100 && (
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
                <p className="text-muted-foreground mb-4">
                  You've completed all modules in this course. You're now equipped with essential thesis advising skills.
                </p>
              </div>
              <div className="flex gap-3">
                <Button>
                  Download Certificate
                </Button>
                <Button variant="outline" onClick={() => router.push('/advisor/resources/training')}>
                  Back to Training
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
