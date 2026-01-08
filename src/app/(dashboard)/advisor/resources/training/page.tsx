"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Play,
  Clock,
  CheckCircle,
  BookOpen,
  Users,
  FileText,
  Video,
  Download,
  Star,
  Award,
  Shield,
  Target,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const courses = [
  {
    id: 1,
    title: "Effective Thesis Advising",
    duration: "2 hours",
    progress: 100,
    status: "completed",
    description: "Master the fundamentals of successful thesis supervision and student mentorship",
    modules: [
      "Understanding your role as an advisor",
      "Setting clear expectations with students",
      "Time management for advisors",
      "Building productive advisor-student relationships"
    ],
    resources: ["PDF Guide", "Video Tutorial", "Case Studies"]
  },
  {
    id: 2,
    title: "Providing Constructive Feedback",
    duration: "1.5 hours",
    progress: 60,
    status: "in-progress",
    description: "Learn techniques for delivering feedback that motivates and improves student work",
    modules: [
      "Principles of effective feedback",
      "Balancing criticism with encouragement",
      "Using rubrics and templates",
      "Tracking revision cycles"
    ],
    resources: ["Feedback Templates", "Example Reviews", "Quick Reference Guide"]
  },
  {
    id: 3,
    title: "Research Ethics and Integrity",
    duration: "1 hour",
    progress: 0,
    status: "not-started",
    description: "Ensure academic integrity and ethical research practices in student work",
    modules: [
      "Plagiarism detection and prevention",
      "Research ethics fundamentals",
      "Data handling and privacy",
      "Citation and attribution standards"
    ],
    resources: ["Ethics Checklist", "Policy Documents", "Case Examples"]
  },
  {
    id: 4,
    title: "Defense Panel Best Practices",
    duration: "45 mins",
    progress: 0,
    status: "not-started",
    description: "Prepare students for successful thesis defenses and panel evaluations",
    modules: [
      "Defense preparation timeline",
      "Common panel questions",
      "Presentation best practices",
      "Post-defense procedures"
    ],
    resources: ["Defense Checklist", "Question Bank", "Evaluation Rubrics"]
  },
  {
    id: 5,
    title: "Using AI Tools in Advisory",
    duration: "1 hour",
    progress: 0,
    status: "not-started",
    description: "Leverage AI-powered tools to enhance your advisory effectiveness",
    modules: [
      "AI analytics and insights",
      "Automated progress tracking",
      "Smart feedback suggestions",
      "Plagiarism detection tools"
    ],
    resources: ["Platform Tutorial", "AI Tools Guide", "Video Walkthrough"]
  },
];

export default function TrainingMaterialsPage() {
  const router = useRouter();
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);

  const getCourseIcon = (id: number) => {
    const icons = [
      <Target className="h-6 w-6 text-blue-500" />,
      <MessageSquare className="h-6 w-6 text-green-500" />,
      <Shield className="h-6 w-6 text-purple-500" />,
      <Award className="h-6 w-6 text-orange-500" />,
      <TrendingUp className="h-6 w-6 text-pink-500" />
    ];
    return icons[id - 1] || <GraduationCap className="h-6 w-6 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Training Materials</h1>
        <p className="text-muted-foreground">Professional development resources for advisors</p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {courses.filter(c => c.status === "completed").length}/{courses.length}
              </div>
              <div className="text-sm text-muted-foreground">Courses Completed</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {courses.reduce((sum, c) => {
                  const hours = parseFloat(c.duration);
                  return sum + (isNaN(hours) ? 0 : hours);
                }, 0).toFixed(1)}h
              </div>
              <div className="text-sm text-muted-foreground">Total Training Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses */}
      <div className="grid gap-4">
        {courses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {getCourseIcon(course.id)}
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate">{course.title}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />{course.duration}
                      </span>
                      <span>•</span>
                      <span>{course.modules.length} modules</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                  {course.status === "completed" ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />Completed
                    </Badge>
                  ) : course.status === "in-progress" ? (
                    <div className="flex items-center gap-2">
                      <Progress value={course.progress} className="w-20 h-2" />
                      <span className="text-sm font-medium">{course.progress}%</span>
                    </div>
                  ) : (
                    <Badge variant="outline">Not Started</Badge>
                  )}
                  <Button
                    size="sm"
                    variant={course.status === "completed" ? "outline" : "default"}
                    onClick={() => {
                      if (course.id <= 3) {
                        router.push(`/advisor/resources/training/course-${course.id}`);
                      } else {
                        setExpandedCourse(expandedCourse === course.id ? null : course.id);
                      }
                    }}
                  >
                    {expandedCourse === course.id && course.id > 3 ? (
                      <>View Less</>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1" />
                        {course.status === "completed" ? "Review" : course.status === "in-progress" ? "Continue" : "Start"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedCourse === course.id && (
              <CardContent className="border-t">
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">{course.description}</p>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Course Modules
                    </h4>
                    <div className="space-y-2">
                      {course.modules.map((module, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300">
                            {idx + 1}
                          </div>
                          <span className="text-sm">{module}</span>
                          {course.status === "completed" || (course.status === "in-progress" && idx < 2) ? (
                            <CheckCircle className="ml-auto h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Available Resources
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {course.resources.map((resource, idx) => (
                        <Button key={idx} variant="outline" size="sm" className="justify-start">
                          {resource.includes("Video") ? <Video className="h-4 w-4 mr-2" /> :
                           resource.includes("PDF") || resource.includes("Guide") ? <FileText className="h-4 w-4 mr-2" /> :
                           <Download className="h-4 w-4 mr-2" />}
                          {resource}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button className="flex-1 sm:flex-none">
                      <Play className="h-4 w-4 mr-2" />
                      {course.status === "completed" ? "Review Course" : course.status === "in-progress" ? "Continue Learning" : "Start Course"}
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Materials
                    </Button>
                    {course.status === "completed" && (
                      <Button variant="outline">
                        <Award className="h-4 w-4 mr-2" />
                        View Certificate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Additional Resources
          </CardTitle>
          <CardDescription>Supplementary materials for professional development</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <BookOpen className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">Research Methodology Handbook</div>
                <div className="text-sm text-muted-foreground">
                  Comprehensive guide to research methods and best practices
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Video className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">Webinar Series: Modern Thesis Supervision</div>
                <div className="text-sm text-muted-foreground">
                  12 recorded webinars covering contemporary advisory challenges
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Play className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <Users className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">Advisor Community Forum</div>
                <div className="text-sm text-muted-foreground">
                  Connect with other advisors, share experiences, and get support
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <FileText className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium">Template Library</div>
                <div className="text-sm text-muted-foreground">
                  Pre-made feedback templates, evaluation rubrics, and assessment forms
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
