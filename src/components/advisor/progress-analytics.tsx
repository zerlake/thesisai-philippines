'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Clock,
  Target,
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StudentProgress {
  id: string;
  name: string;
  thesis_title: string;
  phase: number;
  phase_name: string;
  progress: number; // percentage
  days_overdue: number;
  last_activity: string;
  status: 'on_track' | 'at_risk' | 'completed' | 'delayed';
  next_milestone: string;
  next_milestone_date: string;
  completed_milestones: number;
  total_milestones: number;
}

interface AnalyticsData {
  title: string;
  value: number | string;
  change: number;
  description: string;
}

interface ProgressTrend {
  date: string;
  avg_progress: number;
  on_track: number;
  at_risk: number;
  completed: number;
}

interface ThesisPhaseData {
  phase: string;
  students: number;
  avg_completion: number;
  overdue: number;
}

const mockStudents: StudentProgress[] = [
  {
    id: 'student1',
    name: 'Maria Santos',
    thesis_title: 'AI in Education: A Study of Personalized Learning Systems',
    phase: 2,
    phase_name: 'Literature Review',
    progress: 65,
    days_overdue: 0,
    last_activity: '2024-12-15',
    status: 'on_track',
    next_milestone: 'Complete Literature Review',
    next_milestone_date: '2024-12-20',
    completed_milestones: 5,
    total_milestones: 8
  },
  {
    id: 'student2',
    name: 'Juan Dela Cruz',
    thesis_title: 'Blockchain Applications in Supply Chain Management',
    phase: 3,
    phase_name: 'Methodology',
    progress: 40,
    days_overdue: 3,
    last_activity: '2024-12-12',
    status: 'at_risk',
    next_milestone: 'Finalize Research Instruments',
    next_milestone_date: '2024-12-18',
    completed_milestones: 3,
    total_milestones: 9
  },
  {
    id: 'student3',
    name: 'Ana Reyes',
    thesis_title: 'Sustainable Energy Solutions for Rural Philippines',
    phase: 1,
    phase_name: 'Proposal',
    progress: 90,
    days_overdue: 0,
    last_activity: '2024-12-14',
    status: 'on_track',
    next_milestone: 'Submit Proposal',
    next_milestone_date: '2024-12-17',
    completed_milestones: 7,
    total_milestones: 8
  },
  {
    id: 'student4',
    name: 'Carlos Garcia',
    thesis_title: 'Impact of Social Media on Academic Performance',
    phase: 5,
    phase_name: 'Final Review',
    progress: 95,
    days_overdue: 0,
    last_activity: '2024-12-10',
    status: 'completed',
    next_milestone: 'Defense Preparation',
    next_milestone_date: '2024-12-25',
    completed_milestones: 10,
    total_milestones: 10
  },
  {
    id: 'student5',
    name: 'Isabella Martinez',
    thesis_title: 'Machine Learning in Healthcare Diagnostics',
    phase: 2,
    phase_name: 'Literature Review',
    progress: 30,
    days_overdue: 7,
    last_activity: '2024-12-08',
    status: 'at_risk',
    next_milestone: 'Complete Literature Review',
    next_milestone_date: '2024-12-22',
    completed_milestones: 2,
    total_milestones: 8
  }
];

const mockAnalytics: AnalyticsData[] = [
  {
    title: 'Average Progress',
    value: '68%',
    change: 5,
    description: 'Of all managed students'
  },
  {
    title: 'Students On Track',
    value: `${mockStudents.filter(s => s.status === 'on_track' || s.status === 'completed').length}/${mockStudents.length}`,
    change: 1,
    description: 'Meeting milestones on time'
  },
  {
    title: 'At Risk Students',
    value: mockStudents.filter(s => s.status === 'at_risk').length,
    change: -2,
    description: 'Needing additional support'
  },
  {
    title: 'Avg. Completion Time',
    value: '7.2 months',
    change: -0.3,
    description: 'Compared to last semester'
  }
];

const mockProgressTrends: ProgressTrend[] = [
  { date: 'Week 1', avg_progress: 30, on_track: 8, at_risk: 2, completed: 0 },
  { date: 'Week 2', avg_progress: 35, on_track: 7, at_risk: 3, completed: 0 },
  { date: 'Week 3', avg_progress: 42, on_track: 7, at_risk: 2, completed: 1 },
  { date: 'Week 4', avg_progress: 48, on_track: 6, at_risk: 3, completed: 1 },
  { date: 'Week 5', avg_progress: 55, on_track: 6, at_risk: 2, completed: 2 },
  { date: 'Week 6', avg_progress: 61, on_track: 5, at_risk: 3, completed: 2 },
  { date: 'Week 7', avg_progress: 68, on_track: 5, at_risk: 2, completed: 3 },
];

const mockPhaseData: ThesisPhaseData[] = [
  { phase: 'Proposal', students: 12, avg_completion: 85, overdue: 2 },
  { phase: 'Chapter 1', students: 10, avg_completion: 75, overdue: 1 },
  { phase: 'Chapter 2', students: 15, avg_completion: 65, overdue: 3 },
  { phase: 'Chapter 3', students: 8, avg_completion: 45, overdue: 4 },
  { phase: 'Chapter 4', students: 5, avg_completion: 30, overdue: 1 },
  { phase: 'Chapter 5', students: 3, avg_completion: 20, overdue: 0 },
  { phase: 'Final Review', students: 2, avg_completion: 90, overdue: 0 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ProgressAnalytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'comparison'>('overview');

  // Calculate statistics
  const onTrackCount = mockStudents.filter(s => s.status === 'on_track' || s.status === 'completed').length;
  const atRiskCount = mockStudents.filter(s => s.status === 'at_risk').length;
  const delayedCount = mockStudents.filter(s => s.status === 'delayed').length;
  const completedCount = mockStudents.filter(s => s.status === 'completed').length;

  // Get filtered data based on selections
  const filteredStudents = selectedStudent === 'all' 
    ? mockStudents 
    : mockStudents.filter(s => s.id === selectedStudent);

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Student Progress Analytics
            </CardTitle>
            <CardDescription>Track and analyze student progress with detailed analytics</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export Report
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="border-b">
          <div className="flex">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'overview' 
                  ? 'text-foreground border-b-2 border-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'trends' 
                  ? 'text-foreground border-b-2 border-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('trends')}
            >
              Trends
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'comparison' 
                  ? 'text-foreground border-b-2 border-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('comparison')}
            >
              Comparison
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {activeTab === 'overview' && (
            <div className="flex-1 flex flex-col">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {mockAnalytics.map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardDescription>{item.title}</CardDescription>
                      <CardTitle className="text-2xl">{item.value}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-1 text-sm">
                        <span className={item.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {item.change >= 0 ? '↑' : '↓'} {Math.abs(item.change)}%
                        </span>
                        <span className="text-muted-foreground">{item.description}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Progress Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 flex-1">
                {/* Student Status Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Student Status Distribution</CardTitle>
                    <CardDescription>Current status of all managed students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'On Track', value: onTrackCount },
                            { name: 'At Risk', value: atRiskCount },
                            { name: 'Delayed', value: delayedCount },
                            { name: 'Completed', value: completedCount },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'On Track', value: onTrackCount },
                            { name: 'At Risk', value: atRiskCount },
                            { name: 'Delayed', value: delayedCount },
                            { name: 'Completed', value: completedCount },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#0088FE]"></div>
                        <span className="text-sm">On Track: {onTrackCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#00C49F]"></div>
                        <span className="text-sm">At Risk: {atRiskCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FFBB28]"></div>
                        <span className="text-sm">Delayed: {delayedCount}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#FF8042]"></div>
                        <span className="text-sm">Completed: {completedCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Thesis Phase Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progress by Thesis Phase</CardTitle>
                    <CardDescription>Students distributed by current thesis phase</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={mockPhaseData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="phase" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="students" name="Students in Phase" fill="#8884d8" />
                        <Bar dataKey="avg_completion" name="Avg. Completion %" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Progress Trends Over Time</h3>
                <p className="text-sm text-muted-foreground">Track how student progress has changed over the selected period</p>
              </div>
              
              <div className="flex-1 p-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Overall Progress Trend</CardTitle>
                    <CardDescription>Average progress of all students over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={mockProgressTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="avg_progress" name="Average Progress" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="on_track" name="On Track Students" stroke="#00C49F" fill="#00C49F" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="at_risk" name="At Risk Students" stroke="#FFBB28" fill="#FFBB28" fillOpacity={0.3} />
                        <Area type="monotone" dataKey="completed" name="Completed Students" stroke="#FF8042" fill="#FF8042" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Completion Rate</CardTitle>
                      <CardDescription>Percentage of students completing milestones</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={mockProgressTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="avg_progress" name="Average Progress" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Assessment</CardTitle>
                      <CardDescription>Students needing additional support over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={mockProgressTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="at_risk" name="At Risk Students" fill="#FFBB28" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Cohort Comparison</h3>
                  <p className="text-sm text-muted-foreground">Compare student progress across different cohorts</p>
                </div>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {mockStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b">
                  <h4 className="font-semibold mb-2">Student Comparison Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">{filteredStudents.length}</CardTitle>
                        <CardDescription>Students Selected</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">{Math.round(filteredStudents.reduce((sum, s) => sum + s.progress, 0) / filteredStudents.length) || 0}%</CardTitle>
                        <CardDescription>Average Progress</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">{filteredStudents.filter(s => s.status === 'on_track').length}</CardTitle>
                        <CardDescription>On Track</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {filteredStudents.map(student => (
                      <Card key={student.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{student.name}</CardTitle>
                              <CardDescription>{student.thesis_title}</CardDescription>
                            </div>
                            <Badge variant={
                              student.status === 'on_track' ? 'default' : 
                              student.status === 'at_risk' ? 'destructive' : 
                              student.status === 'completed' ? 'secondary' : 
                              'outline'
                            }>
                              {student.status === 'on_track' ? 'On Track' : 
                               student.status === 'at_risk' ? 'At Risk' : 
                               student.status === 'completed' ? 'Completed' : 
                               'Delayed'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-sm font-medium">Phase: {student.phase_name} ({student.phase})</p>
                              <p className="text-sm text-muted-foreground">Next: {student.next_milestone}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold">{student.progress}%</p>
                              <p className="text-sm text-muted-foreground">Progress</p>
                            </div>
                          </div>
                          
                          <div className="w-full bg-secondary rounded-full h-2.5 mb-4">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center p-2 bg-muted rounded">
                              <p className="font-semibold">{student.completed_milestones}/{student.total_milestones}</p>
                              <p className="text-xs text-muted-foreground">Milestones</p>
                            </div>
                            <div className="text-center p-2 bg-muted rounded">
                              {student.days_overdue > 0 ? (
                                <p className="font-semibold text-destructive">{student.days_overdue} days overdue</p>
                              ) : (
                                <p className="font-semibold text-green-600">On schedule</p>
                              )}
                              <p className="text-xs text-muted-foreground">Deadline</p>
                            </div>
                            <div className="text-center p-2 bg-muted rounded">
                              <p className="font-semibold">{new Date(student.last_activity).toLocaleDateString()}</p>
                              <p className="text-xs text-muted-foreground">Last Activity</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}