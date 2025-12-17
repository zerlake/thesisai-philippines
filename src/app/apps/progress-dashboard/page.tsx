// src/app/apps/progress-dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  BarChart3,
  TrendingUp,
  Target,
  Calendar,
  Clock,
  BookOpen,
  Users,
  CheckCircle,
  AlertCircle,
  Award,
  Flame,
  Brain,
  FileText,
  Presentation,
  MessageCircleQuestion,
  GraduationCap,
  Download,
  Filter,
  LoaderCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock data for the dashboard
const mockProgressData = {
  estimatedReadiness: 72,
  learningVelocity: 2.8,
  daysSinceStart: 28,
  totalReviews: 142,
  averageSuccess: 84,
  consistencyScore: 88,
  sessionFrequency: 3.2,
  avgSessionLength: 25,
  topicsMastered: 18,
  areasNeedingWork: 4,
  weeklyProgress: [
    { week: 'Week 1', progress: 15 },
    { week: 'Week 2', progress: 28 },
    { week: 'Week 3', progress: 42 },
    { week: 'Week 4', progress: 65 },
    { week: 'Week 5', progress: 72 },
  ],
  dailyActivity: [
    { day: 'Mon', activity: 45 },
    { day: 'Tue', activity: 58 },
    { day: 'Wed', activity: 42 },
    { day: 'Thu', activity: 65 },
    { day: 'Fri', activity: 52 },
    { day: 'Sat', activity: 32 },
    { day: 'Sun', activity: 28 },
  ],
  toolUsage: [
    { name: 'Flashcards', value: 35 },
    { name: 'Defense Prep', value: 25 },
    { name: 'Study Guides', value: 20 },
    { name: 'Writing', value: 20 },
  ],
  subjectMastery: [
    { subject: 'Literature Review', mastery: 85 },
    { subject: 'Methodology', mastery: 78 },
    { subject: 'Analysis', mastery: 72 },
    { subject: 'Conceptual Framework', mastery: 90 },
    { subject: 'Literature Review', mastery: 85 },
  ],
};

export default function ProgressDashboardPage() {
  const [dateRange, setDateRange] = useState('last-7-days');
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgressData(mockProgressData);
      setLoading(false);
    };

    loadData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          <span>Loading progress dashboard...</span>
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Progress Dashboard</h1>
              <p className="text-muted-foreground">
                Track your thesis writing progress with analytics and insights
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {dateRange}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 pb-2">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium">Readiness: </span>
              <span className="text-lg font-bold ml-1">{progressData.estimatedReadiness}%</span>
            </div>
            <div className="flex items-center">
              <Flame className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium">Velocity: </span>
              <span className="text-lg font-bold ml-1">{progressData.learningVelocity}%/wk</span>
            </div>
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium">Days: </span>
              <span className="text-lg font-bold ml-1">{progressData.daysSinceStart}</span>
            </div>
            <div className="flex items-center">
              <Award className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium">Streak: </span>
              <span className="text-lg font-bold ml-1">{8} days</span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="defense">Defense Prep</TabsTrigger>
            <TabsTrigger value="study">Study Guides</TabsTrigger>
            <TabsTrigger value="writing">Writing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estimated Readiness</CardTitle>
                  <Target className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressData.estimatedReadiness}%</div>
                  <Progress value={progressData.estimatedReadiness} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">+7% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Learning Velocity</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressData.learningVelocity}%/wk</div>
                  <p className="text-xs text-muted-foreground mt-2">Based on recent activity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consistency</CardTitle>
                  <Activity className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressData.consistencyScore}%</div>
                  <Progress value={progressData.consistencyScore} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">Session freq: {progressData.sessionFrequency}/day</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Topics Mastered</CardTitle>
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressData.topicsMastered}</div>
                  <p className="text-xs text-muted-foreground mt-2">+3 from last week</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Weekly Progress
                  </CardTitle>
                  <CardDescription>Learning progress over the last 5 weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={progressData.weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="progress" stroke="#3b82f6" fill="#93c5fd" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Daily Activity
                  </CardTitle>
                  <CardDescription>Learning sessions this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={progressData.dailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="activity" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Subject Mastery
                  </CardTitle>
                  <CardDescription>Knowledge level across subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressData.subjectMastery.map((subject: any, index: number) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{subject.subject}</span>
                          <span className="text-sm font-medium">{subject.mastery}%</span>
                        </div>
                        <Progress value={subject.mastery} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tool Usage
                  </CardTitle>
                  <CardDescription>Time distribution across tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={progressData.toolUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {progressData.toolUsage.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="flashcards" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Decks Created</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cards Reviewed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">847</div>
                  <p className="text-xs text-muted-foreground">Avg. 32/day</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Retention</CardTitle>
                  <Target className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <Progress value={87} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mastery Rate</CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">74%</div>
                  <p className="text-xs text-muted-foreground">of cards mastered</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Deck Performance</CardTitle>
                <CardDescription>Performance across different flashcard decks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Chapter 1', mastery: 92 },
                    { name: 'Chapter 2', mastery: 87 },
                    { name: 'Chapter 3', mastery: 78 },
                    { name: 'Chapter 4', mastery: 85 },
                    { name: 'Chapter 5', mastery: 94 },
                  ].map((deck, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{deck.name}</span>
                        <span className="text-sm font-medium">{deck.mastery}%</span>
                      </div>
                      <Progress value={deck.mastery} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="defense" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Practice Sessions</CardTitle>
                  <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+3 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.2s</div>
                  <p className="text-xs text-muted-foreground">Decreased from 5.1s</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <Target className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">82%</div>
                  <Progress value={82} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <Presentation className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Methodology, Findings, etc.</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Category</CardTitle>
                  <CardDescription>Success rates in different defense categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { category: 'Methodology', score: 88 },
                      { category: 'Findings', score: 85 },
                      { category: 'Implications', score: 79 },
                      { category: 'Limitations', score: 76 },
                      { category: 'Research Questions', score: 82 },
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.category}</span>
                          <span className="text-sm font-medium">{item.score}%</span>
                        </div>
                        <Progress value={item.score} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Practice Trends</CardTitle>
                  <CardDescription>Defense practice over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[
                      { day: 'Mon', score: 75 },
                      { day: 'Tue', score: 78 },
                      { day: 'Wed', score: 82 },
                      { day: 'Thu', score: 80 },
                      { day: 'Fri', score: 85 },
                      { day: 'Sat', score: 82 },
                      { day: 'Sun', score: 88 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#8b5cf6" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="study" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Guides Completed</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">out of 12</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pages Read</CardTitle>
                  <FileText className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">342</div>
                  <p className="text-xs text-muted-foreground">Avg. 12/day</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notes Taken</CardTitle>
                  <MessageCircleQuestion className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">+12 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retrieval Rate</CardTitle>
                  <Award className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">79%</div>
                  <p className="text-xs text-muted-foreground">information retention</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Study Guide Progress</CardTitle>
                <CardDescription>Completion status across study guides</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Research Methods', completion: 95 },
                    { name: 'Literature Review', completion: 87 },
                    { name: 'Analysis', completion: 72 },
                    { name: 'Conclusion', completion: 45 },
                    { name: 'Abstract', completion: 30 },
                  ].map((guide, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{guide.name}</span>
                        <span className="text-sm font-medium">{guide.completion}%</span>
                      </div>
                      <Progress value={guide.completion} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="writing" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Words Written</CardTitle>
                  <FileText className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15,428</div>
                  <p className="text-xs text-muted-foreground">+1,245 this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Words/Hour</CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">427</div>
                  <p className="text-xs text-muted-foreground">Improved from 382</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chapters Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">out of 5 major chapters</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Writing Streak</CardTitle>
                  <Flame className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12 days</div>
                  <p className="text-xs text-muted-foreground">Best streak: 18 days</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Writing Progress</CardTitle>
                  <CardDescription>Words written per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { day: 'Mon', words: 1245 },
                      { day: 'Tue', words: 987 },
                      { day: 'Wed', words: 1456 },
                      { day: 'Thu', words: 876 },
                      { day: 'Fri', words: 1654 },
                      { day: 'Sat', words: 1123 },
                      { day: 'Sun', words: 1345 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="words" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Chapter Progress</CardTitle>
                  <CardDescription>Completion status by chapter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'Introduction', completion: 100 },
                      { name: 'Literature Review', completion: 100 },
                      { name: 'Methodology', completion: 100 },
                      { name: 'Analysis', completion: 75 },
                      { name: 'Conclusion', completion: 30 },
                    ].map((chapter, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{chapter.name}</span>
                          <span className="text-sm font-medium">{chapter.completion}%</span>
                        </div>
                        <Progress value={chapter.completion} />
                        {chapter.completion === 100 && (
                          <Badge variant="secondary" className="ml-2">Complete</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}