// src/app/apps/goal-setter/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  Calendar,
  Clock,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Plus,
  Trash2,
  Edit3,
  Filter,
  Download,
  Upload,
  Users,
  BookOpen,
  GraduationCap,
  Award,
  Flame,
  Activity,
  Goal,
  Flag
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function GoalSetterPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'writing',
    priority: 'medium',
    targetDate: '',
    targetMetric: 0,
    currentMetric: 0
  });
  const [milestones, setMilestones] = useState<any[]>([]);
  const [newMilestone, setNewMilestone] = useState({
    goalId: '',
    title: '',
    targetDate: ''
  });
  const [activeTab, setActiveTab] = useState('create');
  const [filter, setFilter] = useState('all');

  // Sample goals for demonstration
  useEffect(() => {
    setGoals([
      {
        id: '1',
        title: 'Complete Literature Review',
        description: 'Finish reviewing and synthesizing 30+ research papers for the literature review chapter',
        category: 'research',
        priority: 'high',
        targetDate: '2025-02-15',
        createdDate: '2025-01-10',
        targetMetric: 30, // papers to review
        currentMetric: 18, // papers reviewed
        completed: false,
        progress: 60,
        notes: 'Making good progress, focusing on recent publications'
      },
      {
        id: '2',
        title: 'Write Methodology Chapter',
        description: 'Complete the methodology section with 3,000 words',
        category: 'writing',
        priority: 'high',
        targetDate: '2025-02-28',
        createdDate: '2025-01-12',
        targetMetric: 3000, // words to write
        currentMetric: 1200, // words written
        completed: false,
        progress: 40,
        notes: 'Need to clarify data collection methods'
      },
      {
        id: '3',
        title: 'Defense Preparation',
        description: 'Prepare for thesis defense by completing practice sessions',
        category: 'preparation',
        priority: 'medium',
        targetDate: '2025-03-15',
        createdDate: '2025-01-05',
        targetMetric: 5, // practice sessions
        currentMetric: 2, // sessions completed
        completed: false,
        progress: 40,
        notes: 'Scheduled 2 more sessions with advisor'
      }
    ]);

    setMilestones([
      {
        id: 'm1',
        goalId: '1',
        title: 'Complete first 10 papers',
        targetDate: '2025-01-25',
        completed: true,
        completedDate: '2025-01-24',
        notes: 'Finished reviewing the foundational papers'
      },
      {
        id: 'm2',
        goalId: '1',
        title: 'Complete middle 10 papers',
        targetDate: '2025-02-05',
        completed: true,
        completedDate: '2025-02-04',
        notes: 'Good progress on methodology papers'
      },
      {
        id: 'm3',
        goalId: '2',
        title: 'Complete first draft section',
        targetDate: '2025-02-01',
        completed: false,
        notes: 'Still working on data collection description'
      }
    ]);
  }, []);

  const addGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal = {
      id: `goal-${Date.now()}`,
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      priority: newGoal.priority,
      targetDate: newGoal.targetDate,
      createdDate: new Date().toISOString().split('T')[0],
      targetMetric: newGoal.targetMetric || 0,
      currentMetric: newGoal.currentMetric || 0,
      completed: false,
      progress: newGoal.targetMetric > 0 ? Math.round((newGoal.currentMetric / newGoal.targetMetric) * 100) : 0,
      notes: ''
    };

    setGoals([...goals, goal]);
    setNewGoal({
      title: '',
      description: '',
      category: 'writing',
      priority: 'medium',
      targetDate: '',
      targetMetric: 0,
      currentMetric: 0
    });
  };

  const updateGoalProgress = (goalId: string, newValue: number) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newProgress = goal.targetMetric > 0 ? Math.round((newValue / goal.targetMetric) * 100) : 0;
        return {
          ...goal,
          currentMetric: newValue,
          progress: newProgress,
          completed: newProgress >= 100
        };
      }
      return goal;
    }));
  };

  const toggleGoalCompletion = (goalId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const newCompleted = !goal.completed;
        return {
          ...goal,
          completed: newCompleted,
          progress: newCompleted ? 100 : goal.currentMetric > 0 ? goal.progress : 0
        };
      }
      return goal;
    }));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    setMilestones(milestones.filter(ms => ms.goalId !== goalId));
  };

  const addMilestone = () => {
    if (!newMilestone.title.trim() || !newMilestone.goalId) return;

    const milestone = {
      id: `ms-${Date.now()}`,
      goalId: newMilestone.goalId,
      title: newMilestone.title,
      targetDate: newMilestone.targetDate,
      completed: false,
      notes: ''
    };

    setMilestones([...milestones, milestone]);
    setNewMilestone({
      goalId: '',
      title: '',
      targetDate: ''
    });
  };

  const toggleMilestoneCompletion = (milestoneId: string) => {
    setMilestones(milestones.map(ms => {
      if (ms.id === milestoneId) {
        const updated = {
          ...ms,
          completed: !ms.completed,
          completedDate: !ms.completed ? new Date().toISOString().split('T')[0] : undefined
        };
        
        // Update parent goal progress if milestone completion affects it
        const parentGoal = goals.find(g => g.id === ms.goalId);
        if (parentGoal) {
          // Calculate new progress based on milestones completion
          const goalMilestones = milestones.filter(m => m.goalId === parentGoal.id);
          const completedMilestones = goalMilestones.filter(m => m.completed).length;
          const totalMilestones = goalMilestones.length;
          
          if (totalMilestones > 0) {
            const milestoneProgress = Math.round((completedMilestones / totalMilestones) * 100);
            updateGoalProgress(parentGoal.id, Math.round((milestoneProgress / 100) * parentGoal.targetMetric));
          }
        }
        
        return updated;
      }
      return ms;
    }));
  };

  const getFilteredGoals = () => {
    switch (filter) {
      case 'active':
        return goals.filter(g => !g.completed);
      case 'completed':
        return goals.filter(g => g.completed);
      case 'high-priority':
        return goals.filter(g => g.priority === 'high' && !g.completed);
      default:
        return goals;
    }
  };

  const calculateOverallProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(totalProgress / goals.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Goal Setter</h1>
          <p className="text-muted-foreground">
            Set and track your thesis writing goals and milestones
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Overall Progress</span>
              </div>
              <div className="w-64">
                <Progress value={calculateOverallProgress()} className="h-3" />
              </div>
              <span className="text-sm font-medium w-12">{calculateOverallProgress()}%</span>
            </div>
            <Badge variant="outline">
              {goals.filter(g => !g.completed).length} active goals
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="create">Create Goals</TabsTrigger>
            <TabsTrigger value="track">Track Progress</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Set New Goal
                </CardTitle>
                <CardDescription>
                  Define your thesis writing objectives and milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Goal Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Complete literature review"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newGoal.category} onValueChange={(value) => setNewGoal({...newGoal, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="writing">Writing</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="editing">Editing</SelectItem>
                        <SelectItem value="defense">Defense Prep</SelectItem>
                        <SelectItem value="submission">Submission</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your goal in detail..."
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newGoal.priority} onValueChange={(value) => setNewGoal({...newGoal, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={newGoal.targetDate}
                      onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metric">Target Metric</Label>
                    <Input
                      id="metric"
                      type="number"
                      placeholder="e.g., 3000 words"
                      value={newGoal.targetMetric || ''}
                      onChange={(e) => setNewGoal({...newGoal, targetMetric: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentMetric">Current Progress</Label>
                  <Input
                    id="currentMetric"
                    type="number"
                    placeholder="Current value toward target"
                    value={newGoal.currentMetric || ''}
                    onChange={(e) => setNewGoal({...newGoal, currentMetric: parseInt(e.target.value) || 0})}
                  />
                </div>

                <Button onClick={addGoal} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="track" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Track Goals
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Goals</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="high-priority">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {getFilteredGoals().length > 0 ? (
                  <div className="space-y-4">
                    {getFilteredGoals().map((goal) => (
                      <Card key={goal.id} className={goal.completed ? "opacity-75" : ""}>
                        <CardContent className="p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleGoalCompletion(goal.id)}
                                className="h-8 w-8 p-0"
                              >
                                {goal.completed ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <div className="h-4 w-4 rounded border" />
                                )}
                              </Button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold truncate">{goal.title}</h3>
                                  <Badge variant={goal.priority === 'high' ? 'default' : goal.priority === 'medium' ? 'secondary' : 'outline'}>
                                    {goal.priority}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {goal.category.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {goal.description}
                                </p>
                                
                                <div className="mt-3">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Progress</span>
                                    <span>{goal.progress}%</span>
                                  </div>
                                  <Progress value={goal.progress} className="h-2" />
                                  
                                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex justify-between">
                                      <span>Target:</span>
                                      <span>{goal.targetMetric}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Current:</span>
                                      <span>{goal.currentMetric}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {goal.notes && (
                                  <div className="mt-2 text-sm bg-muted p-2 rounded">
                                    <span className="font-medium">Notes:</span> {goal.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteGoal(goal.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // For editing, we would open a modal or change to edit mode
                                  console.log('Edit goal:', goal.id);
                                }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No goals found. Create your first goal to start tracking progress.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="h-5 w-5" />
                    Add Milestone
                  </CardTitle>
                  <CardDescription>
                    Create smaller checkpoints to reach your main goal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-select">Parent Goal</Label>
                    <Select value={newMilestone.goalId} onValueChange={(value) => setNewMilestone({...newMilestone, goalId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {goals.filter(g => !g.completed).map((goal) => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="milestone-title">Milestone Title</Label>
                    <Input
                      id="milestone-title"
                      placeholder="e.g., Complete first 10 papers"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="milestone-date">Target Date</Label>
                    <Input
                      id="milestone-date"
                      type="date"
                      value={newMilestone.targetDate}
                      onChange={(e) => setNewMilestone({...newMilestone, targetDate: e.target.value})}
                    />
                  </div>

                  <Button onClick={addMilestone} disabled={!newMilestone.goalId || !newMilestone.title}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Milestone Progress
                  </CardTitle>
                  <CardDescription>
                    Track progress toward your milestones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {milestones.length > 0 ? (
                    <div className="space-y-3">
                      {milestones.map((milestone) => {
                        const parentGoal = goals.find(g => g.id === milestone.goalId);
                        return (
                          <div 
                            key={milestone.id} 
                            className={`flex items-center justify-between p-3 rounded border ${
                              milestone.completed ? 'bg-green-50 border-green-200' : 'hover:bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleMilestoneCompletion(milestone.id)}
                                className={`h-8 w-8 p-0 ${
                                  milestone.completed ? 'bg-green-500 hover:bg-green-500' : ''
                                }`}
                              >
                                {milestone.completed ? (
                                  <CheckCircle className="h-4 w-4 text-white" />
                                ) : (
                                  <div className="h-4 w-4 rounded border" />
                                )}
                              </Button>
                              <div>
                                <div className="font-medium">{milestone.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {parentGoal ? `For: ${parentGoal.title}` : 'Orphaned milestone'}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {milestone.targetDate}
                              {milestone.completed && milestone.completedDate && (
                                <div className="text-green-600">Completed {milestone.completedDate}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No milestones created yet. Add a milestone to break down your goals.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Goal Analytics
                </CardTitle>
                <CardDescription>
                  Track your goal completion rate and progress trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{goals.length}</div>
                    <div className="text-sm text-muted-foreground">Total Goals</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{goals.filter(g => g.completed).length}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{goals.filter(g => g.priority === 'high').length}</div>
                    <div className="text-sm text-muted-foreground">High Priority</div>
                  </div>
                  <div className="border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold">{calculateOverallProgress()}%</div>
                    <div className="text-sm text-muted-foreground">Overall Progress</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Goals by Category</h3>
                  <div className="space-y-2">
                    {['writing', 'research', 'editing', 'defense', 'submission', 'other'].map((category) => {
                      const categoryGoals = goals.filter(g => g.category === category);
                      const completedGoals = categoryGoals.filter(g => g.completed).length;
                      const progress = categoryGoals.length > 0 ? 
                        Math.round((completedGoals / categoryGoals.length) * 100) : 0;
                      
                      if (categoryGoals.length === 0) return null;
                      
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{category}</span>
                            <span>{completedGoals}/{categoryGoals.length} completed</span>
                          </div>
                          <Progress value={progress} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="font-medium">Goals by Priority</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {['high', 'medium', 'low'].map((priority) => {
                      const priorityGoals = goals.filter(g => g.priority === priority);
                      const completedGoals = priorityGoals.filter(g => g.completed).length;
                      const progress = priorityGoals.length > 0 ? 
                        Math.round((completedGoals / priorityGoals.length) * 100) : 0;
                      
                      return (
                        <div key={priority} className="border rounded-lg p-4">
                          <div className="text-lg font-bold text-center capitalize">{priority}</div>
                          <div className="text-2xl font-bold text-center my-2">
                            {priorityGoals.length > 0 ? progress : 0}%
                          </div>
                          <div className="text-center text-sm text-muted-foreground">
                            {completedGoals}/{priorityGoals.length} completed
                          </div>
                        </div>
                      );
                    })}
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