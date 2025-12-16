'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Calendar,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Download,
  Filter,
  Activity,
  Award,
  Flame,
  Brain,
  LoaderCircle
} from 'lucide-react';
import { DailyActivityChart } from './charts/daily-activity-chart';
import { WeeklyTrendChart } from './charts/weekly-trend-chart';
import { SkillMasteryHeatmap } from './charts/skill-mastery-heatmap';
import { TimeSpentChart } from './charts/time-spent-chart';
import { RetentionCurveChart } from './charts/retention-curve-chart';
import { LearningVelocityChart } from './charts/learning-velocity-chart';
import { useAuth } from '@/components/auth-provider';
import {
  fetchProgressData,
  fetchFlashcardData,
  fetchDefenseData,
  fetchStudyGuideData,
  fetchInsights,
  dismissInsight,
  ProgressData,
  FlashcardData,
  DefenseData,
  StudyGuideData,
  Insight
} from '@/services/analytics-service';
import {
  Recommendation,
  recommendationService
} from '@/services/recommendation-service';
import {
  CompletionPrediction,
  completionPredictionService
} from '@/services/completion-prediction-service';

export default function AnalyticsDashboardPage() {
  const { session } = useAuth();
  const [dateRange, setDateRange] = useState('last-7-days');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [flashcardData, setFlashcardData] = useState<FlashcardData | null>(null);
  const [defenseData, setDefenseData] = useState<DefenseData | null>(null);
  const [studyGuideData, setStudyGuideData] = useState<StudyGuideData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [completionPrediction, setCompletionPrediction] = useState<CompletionPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [progress, flashcards, defense, studyGuides, insightsData, recommendationsData, prediction] = await Promise.all([
          fetchProgressData(),
          fetchFlashcardData(),
          fetchDefenseData(),
          fetchStudyGuideData(),
          fetchInsights(),
          recommendationService.fetchRecommendations(),
          completionPredictionService.fetchCurrentPrediction()
        ]);

        setProgressData(progress);
        setFlashcardData(flashcards);
        setDefenseData(defense);
        setStudyGuideData(studyGuides);
        setInsights(insightsData);
        setRecommendations(recommendationsData);
        setCompletionPrediction(prediction);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleRefreshData = async () => {
    setLoading(true);
    try {
      const [progress, flashcards, defense, studyGuides, insightsData, recommendationsData, prediction] = await Promise.all([
        fetchProgressData(),
        fetchFlashcardData(),
        fetchDefenseData(),
        fetchStudyGuideData(),
        fetchInsights(),
        recommendationService.fetchRecommendations(),
        completionPredictionService.fetchCurrentPrediction()
      ]);

      setProgressData(progress);
      setFlashcardData(flashcards);
      setDefenseData(defense);
      setStudyGuideData(studyGuides);
      setInsights(insightsData);
      setRecommendations(recommendationsData);
      setCompletionPrediction(prediction);
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissInsight = async (id: number) => {
    try {
      // Optimistically remove the insight
      setInsights(prev => prev.filter(insight => insight.id !== id));

      // In a real app, we would await the API call
      await dismissInsight(id);
    } catch (error) {
      console.error('Error dismissing insight:', error);
      // Revert optimistic update if API call fails
      // This would require keeping track of the dismissed insight
    }
  };

  const trackRecommendationInteraction = async (id: string, action: 'viewed' | 'completed' | 'dismissed' | 'ignored') => {
    try {
      await recommendationService.trackRecommendationInteraction(id, action);

      // If the action is 'dismissed', remove it from the list
      if (action === 'dismissed') {
        setRecommendations(prev => prev.filter(rec => rec.id !== id));
      }
    } catch (error) {
      console.error('Error tracking recommendation interaction:', error);
    }
  };

  const handleRecommendationAction = (rec: Recommendation) => {
    // Track the action
    trackRecommendationInteraction(rec.id, 'completed');

    // Redirect to the appropriate tool based on the recommendation
    switch (rec.targetTool) {
      case 'flashcard':
        window.location.href = '/thesis-phases/flashcard-generator';
        break;
      case 'defense':
        window.location.href = '/thesis-phases/defense-question-generator';
        break;
      case 'study_guide':
        window.location.href = '/thesis-phases/study-guide-generator';
        break;
      default:
        // For content/resource recommendations, we might show a modal or navigate differently
        console.log(`Recommendation action: ${rec.title}`);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-4">
              Please sign in to view your learning analytics dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg">Loading analytics dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Learning Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Track your progress and gain insights to optimize your thesis preparation
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm" onClick={handleRefreshData}>
                <Filter className="h-4 w-4 mr-2" />
                Refresh Data
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
              <span className="text-lg font-bold ml-1">{progressData?.estimatedReadiness}%</span>
            </div>
            <div className="flex items-center">
              <Flame className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium">Velocity: </span>
              <span className="text-lg font-bold ml-1">{progressData?.learningVelocity}%/wk</span>
            </div>
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium">Days: </span>
              <span className="text-lg font-bold ml-1">{progressData?.daysSinceStart}</span>
            </div>
            <div className="flex items-center">
              <Award className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium">Streak: </span>
              <span className="text-lg font-bold ml-1">{7} days</span>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-[800px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="defense">Defense</TabsTrigger>
            <TabsTrigger value="study">Study Guides</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estimated Readiness</CardTitle>
                  <Target className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressData?.estimatedReadiness}%</div>
                  <Progress value={progressData?.estimatedReadiness} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">+5% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Learning Velocity</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressData?.learningVelocity}%/wk</div>
                  <p className="text-xs text-muted-foreground mt-2">Based on recent activity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Consistency Score</CardTitle>
                  <Activity className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressData?.consistencyScore}%</div>
                  <Progress value={progressData?.consistencyScore} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">Session frequency: {progressData?.sessionFrequency}/day</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Topics Mastered</CardTitle>
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progressData?.topicsMastered}</div>
                  <p className="text-xs text-muted-foreground mt-2">+2 from last week</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Daily Activity
                  </CardTitle>
                  <CardDescription>Learning sessions over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <DailyActivityChart />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Weekly Trend
                  </CardTitle>
                  <CardDescription>Performance over the last 4 weeks</CardDescription>
                </CardHeader>
                <CardContent>
                  <WeeklyTrendChart />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Learning Velocity
                  </CardTitle>
                  <CardDescription>Tracking your learning speed and efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <LearningVelocityChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Time Spent by Tool
                  </CardTitle>
                  <CardDescription>How you distribute your time across tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <TimeSpentChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Flashcards Tab */}
          <TabsContent value="flashcards" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Mastery by Deck</CardTitle>
                  <CardDescription>How well you know each flashcard deck</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flashcardData?.masteryByDeck.map((deck, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{deck.deck}</span>
                          <span className="text-sm font-medium">{deck.mastery}%</span>
                        </div>
                        <Progress value={deck.mastery} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retention Curve</CardTitle>
                  <CardDescription>How well you retain information over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <RetentionCurveChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Review Forecast</CardTitle>
                  <CardDescription>Upcoming cards to review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flashcardData?.nextReviewForecast.map((forecast, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm">{new Date(forecast.date).toLocaleDateString()}</span>
                        <Badge variant="secondary">{forecast.count} cards</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Defense Tab */}
          <TabsContent value="defense" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Difficulty Progression</CardTitle>
                  <CardDescription>How your performance changes with difficulty</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm font-medium">Moderate</div>
                        <div className="text-2xl font-bold">{defenseData?.difficultyProgression[defenseData.difficultyProgression.length - 1]?.moderate}%</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Challenging</div>
                        <div className="text-2xl font-bold">{defenseData?.difficultyProgression[defenseData.difficultyProgression.length - 1]?.challenging}%</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Expert</div>
                        <div className="text-2xl font-bold">{defenseData?.difficultyProgression[defenseData.difficultyProgression.length - 1]?.expert}%</div>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      Performance increasing across all difficulty levels
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance by Category</CardTitle>
                  <CardDescription>How you perform in each defense category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {defenseData?.performanceByCategory.map((category, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{category.category}</span>
                          <span className="text-sm font-medium">{category.score}%</span>
                        </div>
                        <Progress value={category.score} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Study Guides Tab */}
          <TabsContent value="study" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Completion by Guide</CardTitle>
                  <CardDescription>How much of each study guide you've completed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studyGuideData?.completionByGuide.map((guide, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{guide.guide}</span>
                          <span className="text-sm font-medium">{guide.completion}%</span>
                        </div>
                        <Progress value={guide.completion} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reading Activity</CardTitle>
                  <CardDescription>Your study guide engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pages Read</span>
                      <span className="text-lg font-bold">{studyGuideData?.pagesRead}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Notes Taken</span>
                      <span className="text-lg font-bold">{studyGuideData?.notesTaken}</span>
                    </div>
                    <div className="pt-4">
                      <SkillMasteryHeatmap />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {loadingInsights ? (
              <div className="flex items-center justify-center py-8">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <Card key={insight.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {insight.type === 'opportunity' && <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />}
                          {insight.type === 'achievement' && <Award className="h-5 w-5 text-yellow-500 mt-0.5" />}
                          {insight.type === 'warning' && <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                          {insight.type === 'recommendation' && <Lightbulb className="h-5 w-5 text-green-500 mt-0.5" />}
                          <div>
                            <CardTitle className="text-lg">{insight.title}</CardTitle>
                            <CardDescription className="mt-1">{insight.description}</CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismissInsight(insight.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-2">Action Items:</h4>
                        <ul className="space-y-1">
                          {insight.actionItems.map((item, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2 text-muted-foreground">•</span>
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {insights.length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No insights available</h3>
                      <p className="text-muted-foreground">
                        Complete more activities to receive personalized insights
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Personalized Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-powered suggestions based on your learning patterns and progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.length > 0 ? (
                      recommendations.map((rec) => (
                        <Card key={rec.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {rec.type === 'content' && <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />}
                                {rec.type === 'tool' && <Target className="h-5 w-5 text-green-500 mt-0.5" />}
                                {rec.type === 'activity' && <Activity className="h-5 w-5 text-orange-500 mt-0.5" />}
                                {rec.type === 'resource' && <Users className="h-5 w-5 text-purple-500 mt-0.5" />}
                                <div>
                                  <CardTitle className="text-base">{rec.title}</CardTitle>
                                  <CardDescription className="mt-1 text-sm">{rec.description}</CardDescription>
                                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                    <Badge variant={rec.priority === 'high' ? 'default' : rec.priority === 'medium' ? 'secondary' : 'outline'}>
                                      {rec.priority} priority
                                    </Badge>
                                    {rec.targetTool && (
                                      <Badge variant="outline" className="capitalize">
                                        {rec.targetTool.replace('_', ' ')}
                                      </Badge>
                                    )}
                                    <Badge variant="outline">
                                      ~{rec.estimatedTime} min
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => trackRecommendationInteraction(rec.id, 'dismissed')}
                                >
                                  Dismiss
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleRecommendationAction(rec)}
                                >
                                  Try Now
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Reason:</span> {rec.reason}
                            </p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium">No recommendations available</h3>
                          <p className="text-muted-foreground">
                            Complete more activities to receive personalized recommendations
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Completion Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Thesis Completion Predictions
                  </CardTitle>
                  <CardDescription>
                    AI-powered estimates for your thesis completion based on your progress and activity patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {completionPrediction ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center">
                                <Target className="h-6 w-6 text-blue-500 mr-2" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                                  <p className="text-2xl font-bold">{completionPrediction.predictedDaysRemaining}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center">
                                <Calendar className="h-6 w-6 text-green-500 mr-2" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Estimated Completion</p>
                                  <p className="text-xl font-bold">{completionPrediction.completionDate.toLocaleDateString()}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center">
                                <Activity className="h-6 w-6 text-orange-500 mr-2" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Confidence</p>
                                  <p className="text-xl font-bold">{Math.round(completionPrediction.confidence * 100)}%</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardContent className="p-4">
                              <div className="flex items-center">
                                <BarChart3 className="h-6 w-6 text-purple-500 mr-2" />
                                <div>
                                  <p className="text-sm text-muted-foreground">Risk Level</p>
                                  <Badge
                                    variant={completionPrediction.riskFactors.lowPace || completionPrediction.riskFactors.inconsistent ||
                                            completionPrediction.riskFactors.disengaged || completionPrediction.riskFactors.manyInterruptions ||
                                            completionPrediction.riskFactors.insufficientSupport ? 'destructive' : 'default'}
                                    className="capitalize"
                                  >
                                    {(Object.values(completionPrediction.riskFactors).filter(Boolean).length > 2 ? 'high' :
                                      Object.values(completionPrediction.riskFactors).filter(Boolean).length > 0 ? 'medium' : 'low')} risk
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Risk Factors</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {completionPrediction.riskFactors.lowPace && (
                                <Badge variant="destructive">Low Writing Pace</Badge>
                              )}
                              {completionPrediction.riskFactors.inconsistent && (
                                <Badge variant="destructive">Inconsistent Schedule</Badge>
                              )}
                              {completionPrediction.riskFactors.disengaged && (
                                <Badge variant="destructive">Low Engagement</Badge>
                              )}
                              {completionPrediction.riskFactors.manyInterruptions && (
                                <Badge variant="destructive">Frequent Interruptions</Badge>
                              )}
                              {completionPrediction.riskFactors.insufficientSupport && (
                                <Badge variant="destructive">Insufficient Support</Badge>
                              )}
                              {Object.values(completionPrediction.riskFactors).every(v => !v) && (
                                <Badge variant="default">No Significant Risk Factors</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Recommendations</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="list-disc pl-5 space-y-2">
                              {completionPrediction.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm">{rec}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Factors Affecting Timeline</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Writing Pace</p>
                                <p className="text-lg font-semibold">{(completionPrediction.factors.pace * 100).toFixed(0)}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Consistency</p>
                                <p className="text-lg font-semibold">{(completionPrediction.factors.consistency * 100).toFixed(0)}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Engagement</p>
                                <p className="text-lg font-semibold">{(completionPrediction.factors.engagement * 100).toFixed(0)}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Interruptions</p>
                                <p className="text-lg font-semibold">{(completionPrediction.factors.interruptions * 100).toFixed(0)}%</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">Support</p>
                                <p className="text-lg font-semibold">{(completionPrediction.factors.support * 100).toFixed(0)}%</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="py-8 text-center">
                          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium">No completion prediction available</h3>
                          <p className="text-muted-foreground">
                            Complete more activities to receive thesis completion estimates
                          </p>
                        </CardContent>
                      </Card>
                    )}
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