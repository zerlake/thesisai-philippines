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
  MessageSquare,
  Target,
  FileText,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Award
} from "lucide-react";

const modules = [
  {
    id: 1,
    title: "Principles of Effective Feedback",
    duration: "25 mins",
    completed: false,
    content: {
      overview: "Understand the fundamental principles that make feedback actionable, specific, and developmentally appropriate for thesis students.",
      keyPoints: [
        "Specific vs. vague feedback: the importance of concrete examples",
        "Timeliness: providing feedback while work is still fresh in student's mind",
        "Balanced feedback: addressing both strengths and weaknesses",
        "Actionable suggestions: what students can actually do to improve",
        "Forward-looking feedback: connecting current work to future chapters"
      ],
      practicalTips: [
        "Use the 'What, Why, How' framework: What needs improvement, Why it matters, How to fix it",
        "Provide feedback within 7-10 business days while student momentum is maintained",
        "Use track changes and comments in documents for inline, context-specific feedback",
        "Start with strengths: identify what the student did well before addressing weaknesses",
        "End with next steps: clear action items for the student to work on"
      ],
      feedbackFramework: [
        {
          type: "What",
          description: "Clearly identify what needs improvement",
          example: "The literature review needs more synthesis across studies rather than sequential summaries"
        },
        {
          type: "Why",
          description: "Explain why this improvement matters",
          example: "Synthesis demonstrates critical thinking and shows how studies relate to each other and your research question"
        },
        {
          type: "How",
          description: "Provide specific guidance on how to improve",
          example: "Group studies by theme (A, B, C) instead of chronologically. For each theme, compare/contrast findings and identify gaps"
        }
      ],
      caseStudy: {
        title: "Vague vs. Specific Feedback",
        scenario: "Student submits literature review chapter. Advisor writes: 'This needs more work. The structure is unclear and sources are insufficient.'",
        challenge: "Student is confused and doesn't know where to start. What went wrong?",
        solution: "The feedback is too vague. Better approach: 'Your literature review has good potential. **Strengths**: You identified key themes (A, B, C) and included recent studies. **Areas to develop**: 1) Add transition sentences between sections (see paragraph 3-4 for example), 2) Include seminal works from before 2015 (I've listed 5 key papers in comments: Smith 2010, Jones 2012...), 3) Reorganize section 2 chronologically rather than by author (see attached outline). See attached example from last year's successful thesis for structure reference. Please revise and resubmit by [specific date]. Let's discuss section 2 structure in our next meeting on [date/time].' This gives student clear, actionable direction with specific examples and deadlines."
      },
      resources: [
        "Feedback Quality Checklist",
        "Track Changes Best Practices Guide",
        "Sample Annotated Feedback Examples",
        "What-Why-How Template"
      ]
    }
  },
  {
    id: 2,
    title: "Balancing Criticism with Encouragement",
    duration: "20 mins",
    completed: false,
    content: {
      overview: "Master the art of delivering critical feedback while maintaining student motivation and confidence throughout the thesis journey.",
      keyPoints: [
        "The psychological impact of feedback on student motivation and self-efficacy",
        "Identifying and reinforcing student strengths to build confidence",
        "Framing criticism as developmental opportunities rather than failures",
        "Adjusting feedback style to individual student needs and confidence levels",
        "Recognizing when students need more support vs. more challenge"
      ],
      practicalTips: [
        "Use a 3:1 or 2:1 ratio of positive to constructive comments when possible",
        "Frame criticism in growth terms: 'This will be even stronger when you...' instead of 'This is weak'",
        "Acknowledge effort and improvement over time, not just outcomes",
        "Vary feedback intensity based on student confidence level and thesis stage (gentle early, more direct later)",
        "Follow up harsh but necessary feedback with supportive check-in within 24-48 hours"
      ],
      feedbackStrategies: [
        {
          strategy: "Start-Stop-Continue",
          description: "Structured approach for balanced feedback",
          usage: "Start: What should student begin doing? Stop: What should they discontinue? Continue: What's working well?",
          example: "Start synthesizing sources. Stop listing studies sequentially. Continue your strong critical analysis."
        },
        {
          strategy: "Compliment Sandwich",
          description: "Buffer criticism between positive observations",
          usage: "Positive → Constructive → Encouraging",
          example: "Your methodology is well-designed [+]. The sample size needs justification [-]. Your approach shows creative thinking [+]."
        },
        {
          strategy: "Growth Feedback",
          description: "Frame as learning opportunity with clear path forward",
          usage: "Acknowledge current state + Show potential + Provide roadmap",
          example: "This is a solid first attempt. With refinement of X and Y, this will be publication-quality work. Here's how..."
        }
      ],
      caseStudy: {
        title: "Harsh Feedback Demotivates High-Achieving Student",
        scenario: "An advisor's direct criticism of a methodology chapter causes a typically confident student to doubt their entire research approach. The student emails saying they're considering dropping out because 'the whole project is fundamentally flawed.'",
        challenge: "How can advisors deliver critical feedback without crushing student confidence?",
        solution: "The advisor should immediately: 1) **Acknowledge impact** - Schedule urgent meeting, say 'I see my feedback upset you, let's talk', 2) **Clarify scope** - Explain criticism was about specific methodology execution, NOT student's ability or project viability, 3) **Highlight strengths** - 'Your research question is important, literature review is solid, you have the skills needed', 4) **Provide clear path** - Break corrections into manageable steps with timeline, 5) **Share context** - 'All researchers face similar challenges, here's how I revised my dissertation 3 times', 6) **Offer increased support** - Weekly check-ins during revision, 7) **Adjust tone** - Future feedback will be firm but encouraging. Result: Student regains confidence, makes improvements with support, ultimately produces strong work. Key lesson: Harsh truth must come with support and clear path forward."
      },
      resources: [
        "Motivational Feedback Phrases Library",
        "Student Psychology in Graduate Education (Article)",
        "Growth Mindset in Academic Advising",
        "Feedback Tone Adjustment Guide"
      ],
      warningSignsTable: [
        {
          sign: "Defensive responses to feedback",
          meaning: "May feel criticized rather than helped",
          response: "Clarify that feedback is about work, not them as person"
        },
        {
          sign: "Delayed resubmissions",
          meaning: "May be overwhelmed or demotivated",
          response: "Check in, break tasks into smaller pieces"
        },
        {
          sign: "Quality suddenly drops",
          meaning: "Possible burnout or loss of confidence",
          response: "Discuss well-being, adjust expectations temporarily"
        }
      ]
    }
  },
  {
    id: 3,
    title: "Using Rubrics and Templates",
    duration: "25 mins",
    completed: false,
    content: {
      overview: "Learn to create and utilize rubrics and templates to provide consistent, comprehensive feedback efficiently across multiple students.",
      keyPoints: [
        "Benefits of rubrics: consistency, transparency, and time efficiency",
        "Creating chapter-specific rubrics (literature review, methodology, results, discussion)",
        "Using comment templates for common issues while personalizing feedback",
        "Adapting rubrics to different research methodologies and academic disciplines",
        "Communicating rubric criteria to students upfront to set clear expectations"
      ],
      practicalTips: [
        "Develop rubrics collaboratively with other advisors in your department for consistency",
        "Share rubrics with students BEFORE they write chapters to set clear expectations",
        "Use weighted rubrics: assign more points to critical criteria (e.g., analysis 40%, organization 20%)",
        "Create comment library for common issues but always add personalized context and examples",
        "Update rubrics annually based on recurring student challenges and feedback"
      ],
      sampleRubrics: [
        {
          chapter: "Literature Review",
          criteria: [
            { name: "Comprehensiveness", weight: "30%", excellent: "Covers all major themes, includes seminal and recent works", needsWork: "Major gaps in coverage or outdated sources only" },
            { name: "Critical Analysis", weight: "30%", excellent: "Deep evaluation of methods and findings, identifies contradictions", needsWork: "Purely descriptive summaries without critique" },
            { name: "Synthesis", weight: "20%", excellent: "Integrates across studies, identifies patterns and gaps", needsWork: "Sequential summaries without connections" },
            { name: "Organization", weight: "10%", excellent: "Logical flow with clear themes and transitions", needsWork: "Unclear structure or poor transitions" },
            { name: "Writing Quality", weight: "10%", excellent: "Clear, concise, professional academic writing", needsWork: "Unclear expression or numerous errors" }
          ]
        },
        {
          chapter: "Methodology",
          criteria: [
            { name: "Appropriateness", weight: "30%", excellent: "Perfect match between research questions and methods chosen", needsWork: "Mismatch between questions and methods" },
            { name: "Rigor", weight: "25%", excellent: "Thorough explanation with justification for all decisions", needsWork: "Superficial description missing key details" },
            { name: "Clarity", weight: "20%", excellent: "Step-by-step procedure enabling full replication", needsWork: "Vague descriptions preventing replication" },
            { name: "Reproducibility", weight: "15%", excellent: "Complete detail allowing independent replication", needsWork: "Missing steps or unclear procedures" },
            { name: "Ethics", weight: "10%", excellent: "Full IRB approval with ethical considerations addressed", needsWork: "Ethics not mentioned or incomplete" }
          ]
        }
      ],
      caseStudy: {
        title: "Streamlining Feedback for Multiple Advisees",
        scenario: "Advisor spends 4-5 hours reviewing each chapter from 8 students, leading to 32-40 hours per round of reviews and significant delays in feedback delivery. Students complain, and advisor is burning out.",
        challenge: "How can the advisor maintain quality while reducing time spent on reviews?",
        solution: "**Implementation Plan**: 1) **Develop rubrics** - Create chapter-specific rubrics with weighted criteria (e.g., Lit Review: Comprehensiveness 30%, Critical Analysis 30%, Organization 20%, Writing 20%), 2) **Build template library** - Create 50+ templated comments for common issues like 'Need more recent sources - include studies from past 5 years [INSERT SPECIFIC RECOMMENDATIONS]', 3) **Systematic evaluation** - Use rubric to score each criterion, add template comments where applicable, personalize with specific examples, 4) **Batch processing** - Review all lit reviews on Tuesday, all methods on Thursday, 5) **Quality check** - Spot-check personalization to ensure templates don't feel generic. **Results**: Review time reduced to 2-2.5 hours per chapter while maintaining or improving feedback quality due to consistency. Students appreciate knowing evaluation criteria upfront. Advisor has time for research again. **Key insight**: Templates handle routine issues, advisor's expertise focused on unique, substantive feedback."
      },
      resources: [
        "Thesis Chapter Rubric Templates (Lit Review, Methods, Results, Discussion)",
        "Comment Template Library (100+ common feedback items)",
        "Rubric Creation Guide with Examples",
        "Sample Weighted Rubrics from Top Universities"
      ],
      templateExamples: [
        {
          category: "Literature Review",
          templates: [
            "Need more recent sources - include studies from past 5 years. See: [specific recommendations]",
            "Synthesis needed - compare/contrast these studies rather than summarizing separately: [list studies]",
            "Missing key theme - add section on [specific topic]. Key sources: [citations]"
          ]
        },
        {
          category: "Methodology",
          templates: [
            "Justify sample size - explain power analysis or provide rationale for N=[number]",
            "Add reproducibility details - specify [software version, parameter settings, etc.]",
            "Explain method choice - why [chosen method] instead of alternatives like [list options]?"
          ]
        }
      ]
    }
  },
  {
    id: 4,
    title: "Tracking Revision Cycles",
    duration: "20 mins",
    completed: false,
    content: {
      overview: "Implement systems to track feedback, revisions, and student progress through multiple draft iterations efficiently and effectively.",
      keyPoints: [
        "Documenting feedback across multiple revision rounds systematically",
        "Using version control systems for thesis documents",
        "Tracking which feedback items have been addressed and which remain",
        "Knowing when to move forward vs. request another revision",
        "Maintaining comprehensive revision history for final defense preparation"
      ],
      practicalTips: [
        "Use clear file naming convention: StudentName_Chapter3_Draft2_2024-01-15.docx",
        "Create feedback tracker spreadsheet: Issue | Draft Number | Status | Student Response | Resolution",
        "Require students to submit revision summary: 'Here's what I changed and why' document",
        "Set maximum number of revisions per chapter (usually 2-3) before moving forward",
        "Save all draft versions in organized folders for reference during defense preparation"
      ],
      versionControlSystem: {
        namingConvention: "StudentLastName_ChapterN_DraftN_YYYY-MM-DD.docx",
        example: "Garcia_Chapter2_Draft3_2024-03-15.docx",
        folderStructure: [
          "ThesisProject_Garcia/",
          "  Chapter1_Introduction/",
          "    Garcia_Chapter1_Draft1_2024-01-10.docx",
          "    Garcia_Chapter1_Draft2_2024-01-24.docx",
          "    Garcia_Chapter1_FINAL_2024-02-05.docx",
          "  Chapter2_LitReview/",
          "    Garcia_Chapter2_Draft1_2024-02-12.docx",
          "    Garcia_Chapter2_Draft2_2024-03-01.docx",
          "  FeedbackTracking.xlsx"
        ]
      },
      caseStudy: {
        title: "Student Stuck in Revision Loop",
        scenario: "Student has submitted 5 drafts of literature review over 4 months. Each revision addresses some feedback but introduces new issues. Both student and advisor are frustrated. Student says 'I don't know what you want!' Advisor thinks 'Why can't they get this right?'",
        challenge: "How can they break the revision cycle and move forward productively?",
        solution: "**Intervention Strategy**: 1) **Diagnose pattern** - Advisor schedules in-person working session to review feedback history together. They discover: student addresses surface comments but misses deeper structural issues, 2) **Prioritize ruthlessly** - Create tiered priority list: 'Must-fix before moving on' (3 structural issues), 'Should-fix eventually' (5 medium issues), 'Nice-to-have' (10 minor polish items), 3) **Focus next revision** - Student will ONLY address top 3 structural problems in next draft. Ignore all minor issues for now, 4) **Set firm deadline** - 2 weeks for focused revision, then schedule immediate review meeting, 5) **Define 'done'** - Document acceptance criteria: 'This chapter is complete enough when: clear theme-based organization, critical analysis present, major sources included. Polish happens later.' 6) **Move forward agreement** - If criteria met, chapter is 'done' and student moves to methodology, 7) **Schedule polish phase** - All chapters get final polish together after dissertation draft complete. **Result**: Student submits focused revision in 2 weeks, meets criteria, moves forward with renewed energy. Chapter gets final polish 6 months later before defense. **Key lesson**: Perfect is the enemy of done. Define 'good enough' and move forward."
      },
      resources: [
        "Revision Tracking Spreadsheet Template",
        "Version Control Guide for Academic Writing",
        "Student Revision Summary Template",
        "When to Move Forward: Decision Framework"
      ],
      checklist: [
        "Establish clear version control system from day one",
        "Maintain detailed feedback log for each chapter across all revisions",
        "Set expectations: maximum 2-3 major revision rounds per chapter",
        "Require revision summary from student with each resubmission",
        "Track major vs. minor issues to prioritize feedback delivery",
        "Save all versions with dates in organized folders",
        "Document 'good enough' criteria for each chapter",
        "Conduct periodic progress reviews to avoid getting stuck",
        "Schedule polish phase after full draft complete",
        "Keep revision history for defense committee questions"
      ],
      decisionFramework: [
        {
          question: "Are fundamental structural issues resolved?",
          ifYes: "Consider moving forward",
          ifNo: "One more focused revision required"
        },
        {
          question: "Has student addressed all 'must-fix' items?",
          ifYes: "Chapter can move to 'done' status",
          ifNo: "Clarify must-fix items and set deadline"
        },
        {
          question: "Will further revisions yield significant improvement?",
          ifYes: "One more revision justified",
          ifNo: "Move forward, address in polish phase"
        },
        {
          question: "Is student making progress or spinning wheels?",
          ifYes: "Continue revision cycle",
          ifNo: "Working session needed to unstick"
        }
      ]
    }
  }
];

export default function Course2Page() {
  const router = useRouter();
  const [completedModules, setCompletedModules] = useState<number[]>([]);
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
        <Badge className="bg-green-500">
          <MessageSquare className="w-3 h-3 mr-1" />
          Course 2
        </Badge>
      </div>

      {/* Course Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl md:text-3xl mb-2">
                Providing Constructive Feedback
              </CardTitle>
              <CardDescription className="text-base">
                Learn techniques for delivering feedback that motivates and improves student work
              </CardDescription>
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  1.5 hours total
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
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isCompleted ? 'bg-green-500 text-white' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'}`}>
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

                    {/* Feedback Framework (if present) */}
                    {module.content.feedbackFramework && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-blue-500" />
                          Feedback Framework
                        </h3>
                        <div className="space-y-3">
                          {module.content.feedbackFramework.map((item, idx) => (
                            <Card key={idx}>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">{item.type}</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                <p>{item.description}</p>
                                <div className="p-3 bg-muted rounded-lg">
                                  <p className="font-medium mb-1">Example:</p>
                                  <p className="text-muted-foreground">{item.example}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Feedback Strategies (if present) */}
                    {module.content.feedbackStrategies && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-purple-500" />
                          Feedback Strategies
                        </h3>
                        <div className="space-y-3">
                          {module.content.feedbackStrategies.map((strategy, idx) => (
                            <Card key={idx}>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">{strategy.strategy}</CardTitle>
                                <CardDescription>{strategy.description}</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-2 text-sm">
                                <div>
                                  <p className="font-medium mb-1">When to use:</p>
                                  <p className="text-muted-foreground">{strategy.usage}</p>
                                </div>
                                <div className="p-3 bg-muted rounded-lg">
                                  <p className="font-medium mb-1">Example:</p>
                                  <p className="text-muted-foreground">{strategy.example}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sample Rubrics (if present) */}
                    {module.content.sampleRubrics && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-indigo-500" />
                          Sample Rubrics
                        </h3>
                        <div className="space-y-4">
                          {module.content.sampleRubrics.map((rubric, idx) => (
                            <Card key={idx}>
                              <CardHeader>
                                <CardTitle className="text-base">{rubric.chapter} Rubric</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {rubric.criteria.map((criterion, cidx) => (
                                    <div key={cidx} className="border rounded-lg p-3">
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium">{criterion.name}</h4>
                                        <Badge variant="outline">{criterion.weight}</Badge>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                                          <p className="font-medium text-green-700 dark:text-green-300 mb-1">Excellent:</p>
                                          <p className="text-muted-foreground">{criterion.excellent}</p>
                                        </div>
                                        <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-200 dark:border-orange-800">
                                          <p className="font-medium text-orange-700 dark:text-orange-300 mb-1">Needs Work:</p>
                                          <p className="text-muted-foreground">{criterion.needsWork}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Template Examples (if present) */}
                    {module.content.templateExamples && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          Template Examples
                        </h3>
                        <div className="space-y-3">
                          {module.content.templateExamples.map((category, idx) => (
                            <div key={idx}>
                              <h4 className="font-medium mb-2">{category.category}</h4>
                              <div className="space-y-2">
                                {category.templates.map((template, tidx) => (
                                  <div key={tidx} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm font-mono">{template}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Version Control System (if present) */}
                    {module.content.versionControlSystem && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-purple-500" />
                          Version Control System
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="font-medium mb-2">Naming Convention:</p>
                            <code className="block p-3 bg-muted rounded-lg text-sm">
                              {module.content.versionControlSystem.namingConvention}
                            </code>
                            <p className="text-sm text-muted-foreground mt-2">
                              Example: <code>{module.content.versionControlSystem.example}</code>
                            </p>
                          </div>
                          <div>
                            <p className="font-medium mb-2">Folder Structure:</p>
                            <code className="block p-3 bg-muted rounded-lg text-sm whitespace-pre font-mono">
                              {module.content.versionControlSystem.folderStructure.join('\n')}
                            </code>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Warning Signs Table (if present) */}
                    {module.content.warningSignsTable && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-orange-600 dark:text-orange-400">
                          <AlertCircle className="h-5 w-5" />
                          Warning Signs to Watch For
                        </h3>
                        <div className="space-y-2">
                          {module.content.warningSignsTable.map((item, idx) => (
                            <div key={idx} className="p-3 border rounded-lg">
                              <h4 className="font-medium mb-1">{item.sign}</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                <span className="font-medium">What it means:</span> {item.meaning}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">How to respond:</span> {item.response}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Decision Framework (if present) */}
                    {module.content.decisionFramework && (
                      <div>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <Target className="h-5 w-5 text-green-500" />
                          Decision Framework
                        </h3>
                        <div className="space-y-3">
                          {module.content.decisionFramework.map((decision, idx) => (
                            <Card key={idx}>
                              <CardContent className="pt-6">
                                <h4 className="font-medium mb-3">{decision.question}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <p className="font-medium text-green-700 dark:text-green-300 mb-1">If Yes:</p>
                                    <p className="text-sm">{decision.ifYes}</p>
                                  </div>
                                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                    <p className="font-medium text-orange-700 dark:text-orange-300 mb-1">If No:</p>
                                    <p className="text-sm">{decision.ifNo}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Case Study */}
                    <div>
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Award className="h-5 w-5 text-indigo-500" />
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
                            <p className="text-sm leading-relaxed">{module.content.caseStudy.solution}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

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
                  You've completed all modules in this course. You're now equipped with advanced feedback techniques.
                </p>
              </div>
              <div className="flex gap-3">
                <Button>
                  <Award className="mr-2 h-4 w-4" />
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
