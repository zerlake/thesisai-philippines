"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  TrendingUp, 
  Target, 
  Activity, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Upload,
  UserCheck,
  UserX,
  UserMinus,
  UserPlus,
  Mail,
  Bell,
  CalendarClock,
  CalendarCheck,
  CalendarRange,
  ClockArrowUp,
  Timer,
  Hourglass,
  Coffee,
  Moon,
  Sun,
  Flame,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  ActivitySquare,
  Gauge,
  TrendingDown
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend,
  ChartLegendContent 
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell, Line, LineChart } from "recharts";

interface WorkloadItem {
  id: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  type: "meeting" | "review" | "feedback" | "evaluation" | "consultation" | "defense-prep" | "grading";
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in-progress" | "completed" | "overdue" | "cancelled";
  assignedDate: string;
  dueDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours?: number;
  advisorId: string;
  advisorName: string;
  advisorEmail: string;
  category: string;
  tags: string[];
  isRecurring: boolean;
  recurrencePattern?: "daily" | "weekly" | "bi-weekly" | "monthly";
  progress: number;
}

interface WorkloadMetrics {
  totalCapacity: number; // Weekly hours available
  allocatedHours: number;
  availableHours: number;
  pendingTasks: number;
  overdueTasks: number;
  completedTasks: number;
  averageCompletionTime: number; // In hours
  utilizationRate: number; // Percentage
  stressLevel: "low" | "medium" | "high" | "critical";
}

interface AdvisorCapacity {
  id: string;
  name: string;
  email: string;
  department: string;
  maxWeeklyHours: number;
  currentWeeklyHours: number;
  availableHours: number;
  assignedStudents: number;
  maxStudents: number;
  currentStudents: number;
  specialization: string;
  status: "available" | "busy" | "overloaded" | "on-leave";
  utilizationRate: number;
  performanceRating: number;
}

const WorkloadManagement = () => {
  const [workloadItems, setWorkloadItems] = useState<WorkloadItem[]>([
    {
      id: "1",
      title: "Review Maria's Chapter 3 Draft",
      description: "Provide feedback on methodology section",
      studentId: "student-1",
      studentName: "Maria Santos",
      studentEmail: "maria.santos@up.edu.ph",
      studentDepartment: "Computer Science",
      type: "review",
      priority: "high",
      status: "in-progress",
      assignedDate: "2024-12-20",
      dueDate: "2024-12-25",
      completedDate: "",
      estimatedHours: 3,
      actualHours: 1.5,
      advisorId: "advisor-1",
      advisorName: "Dr. Juan Dela Cruz",
      advisorEmail: "juan.dc@thesisai.ph",
      category: "Thesis Review",
      tags: ["methodology", "chapter-3", "feedback"],
      isRecurring: false,
      progress: 50
    },
    {
      id: "2",
      title: "Weekly Advisory Meeting with Group A",
      description: "Regular progress check with thesis students",
      studentId: "group-a",
      studentName: "Thesis Group A",
      studentEmail: "group-a@up.edu.ph",
      studentDepartment: "Computer Science",
      type: "meeting",
      priority: "medium",
      status: "pending",
      assignedDate: "2024-12-22",
      dueDate: "2024-12-27",
      estimatedHours: 1.5,
      advisorId: "advisor-1",
      advisorName: "Dr. Juan Dela Cruz",
      advisorEmail: "juan.dc@thesisai.ph",
      category: "Advisory Meeting",
      tags: ["weekly", "group-meeting", "progress-check"],
      isRecurring: true,
      recurrencePattern: "weekly",
      progress: 0
    },
    {
      id: "3",
      title: "Evaluate Juan's Research Methodology",
      description: "Assess research approach and methodology validity",
      studentId: "student-2",
      studentName: "Juan Dela Cruz",
      studentEmail: "juan.dc@up.edu.ph",
      studentDepartment: "Economics",
      type: "evaluation",
      priority: "critical",
      status: "pending",
      assignedDate: "2024-12-21",
      dueDate: "2024-12-24",
      estimatedHours: 2,
      advisorId: "advisor-1",
      advisorName: "Dr. Juan Dela Cruz",
      advisorEmail: "juan.dc@thesisai.ph",
      category: "Methodology Review",
      tags: ["methodology", "validation", "research"],
      isRecurring: false,
      progress: 0
    },
    {
      id: "4",
      title: "Defense Preparation Session",
      description: "Prepare Ana for upcoming thesis defense",
      studentId: "student-3",
      studentName: "Ana Reyes",
      studentEmail: "ana.reyes@up.edu.ph",
      studentDepartment: "Business Administration",
      type: "defense-prep",
      priority: "high",
      status: "pending",
      assignedDate: "2024-12-22",
      dueDate: "2024-12-30",
      estimatedHours: 2.5,
      advisorId: "advisor-1",
      advisorName: "Dr. Juan Dela Cruz",
      advisorEmail: "juan.dc@thesisai.ph",
      category: "Defense Preparation",
      tags: ["defense", "preparation", "practice"],
      isRecurring: false,
      progress: 0
    },
    {
      id: "5",
      title: "Grade Carlos's Midterm Submission",
      description: "Evaluate midterm thesis chapter and provide grade",
      studentId: "student-4",
      studentName: "Carlos Gomez",
      studentEmail: "carlos.gomez@up.edu.ph",
      studentDepartment: "Agricultural Sciences",
      type: "grading",
      priority: "medium",
      status: "completed",
      assignedDate: "2024-12-15",
      dueDate: "2024-12-20",
      completedDate: "2024-12-19",
      estimatedHours: 1,
      actualHours: 0.8,
      advisorId: "advisor-1",
      advisorName: "Dr. Juan Dela Cruz",
      advisorEmail: "juan.dc@thesisai.ph",
      category: "Grading",
      tags: ["grading", "midterm", "evaluation"],
      isRecurring: false,
      progress: 100
    }
  ]);
  
  const [advisors, setAdvisors] = useState<AdvisorCapacity[]>([
    {
      id: "advisor-1",
      name: "Dr. Juan Dela Cruz",
      email: "juan.dc@thesisai.ph",
      department: "Computer Science",
      maxWeeklyHours: 20,
      currentWeeklyHours: 16,
      availableHours: 4,
      assignedStudents: 8,
      maxStudents: 10,
      currentStudents: 8,
      specialization: "AI and Machine Learning",
      status: "busy",
      utilizationRate: 80,
      performanceRating: 4.7
    },
    {
      id: "advisor-2",
      name: "Dr. Maria Santos",
      email: "maria.santos@thesisai.ph",
      department: "Mathematics",
      maxWeeklyHours: 18,
      currentWeeklyHours: 12,
      availableHours: 6,
      assignedStudents: 6,
      maxStudents: 8,
      currentStudents: 6,
      specialization: "Applied Statistics",
      status: "available",
      utilizationRate: 67,
      performanceRating: 4.8
    },
    {
      id: "advisor-3",
      name: "Dr. Ana Reyes",
      email: "ana.reyes@thesisai.ph",
      department: "Business Administration",
      maxWeeklyHours: 25,
      currentWeeklyHours: 24,
      availableHours: 1,
      assignedStudents: 12,
      maxStudents: 12,
      currentStudents: 12,
      specialization: "Business Strategy",
      status: "overloaded",
      utilizationRate: 96,
      performanceRating: 4.5
    }
  ]);
  
  const [metrics, setMetrics] = useState<WorkloadMetrics>({
    totalCapacity: 20,
    allocatedHours: 16,
    availableHours: 4,
    pendingTasks: 3,
    overdueTasks: 0,
    completedTasks: 12,
    averageCompletionTime: 24,
    utilizationRate: 80,
    stressLevel: "medium"
  });
  
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "capacity" | "analytics">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<WorkloadItem | null>(null);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    studentName: "",
    studentEmail: "",
    studentDepartment: "",
    type: "review" as "meeting" | "review" | "feedback" | "evaluation" | "consultation" | "defense-prep" | "grading",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 7 days from now
    estimatedHours: 1,
    category: "",
    tags: "",
    isRecurring: false,
    recurrencePattern: undefined as "daily" | "weekly" | "bi-weekly" | "monthly" | undefined
  });

  const handleAddTask = () => {
    if (!newTask.title || !newTask.studentName || !newTask.studentEmail) return;

    const task: WorkloadItem = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      studentId: `student-${Date.now()}`,
      studentName: newTask.studentName,
      studentEmail: newTask.studentEmail,
      studentDepartment: newTask.studentDepartment,
      type: newTask.type,
      priority: newTask.priority,
      status: "pending",
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: newTask.dueDate,
      estimatedHours: newTask.estimatedHours,
      advisorId: "advisor-1", // Current advisor
      advisorName: "Dr. Juan Dela Cruz", // Current advisor name
      advisorEmail: "juan.dc@thesisai.ph", // Current advisor email
      category: newTask.category || "General",
      tags: newTask.tags.split(',').map(tag => tag.trim()),
      isRecurring: newTask.isRecurring,
      recurrencePattern: newTask.recurrencePattern,
      progress: 0
    };

    setWorkloadItems([task, ...workloadItems]);
    
    // Update metrics
    setMetrics({
      ...metrics,
      pendingTasks: metrics.pendingTasks + 1,
      allocatedHours: metrics.allocatedHours + task.estimatedHours
    });
    
    setNewTask({
      title: "",
      description: "",
      studentName: "",
      studentEmail: "",
      studentDepartment: "",
      type: "review",
      priority: "medium",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 1,
      category: "",
      tags: "",
      isRecurring: false,
      recurrencePattern: undefined
    });
    
    setShowAddTaskDialog(false);
  };

  const handleCompleteTask = (taskId: string) => {
    setWorkloadItems(workloadItems.map(task => 
      task.id === taskId 
        ? { ...task, status: "completed", completedDate: new Date().toISOString().split('T')[0], progress: 100 } 
        : task
    ));
    
    // Update metrics
    setMetrics({
      ...metrics,
      pendingTasks: metrics.pendingTasks - 1,
      completedTasks: metrics.completedTasks + 1,
      allocatedHours: metrics.allocatedHours - (workloadItems.find(t => t.id === taskId)?.estimatedHours || 0)
    });
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: WorkloadItem["status"]) => {
    setWorkloadItems(workloadItems.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const filteredTasks = workloadItems.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesType = typeFilter === "all" || task.type === typeFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "high":
        return <Badge className="bg-red-500">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "meeting":
        return <Badge variant="outline" className="border-blue-300 text-blue-600">Meeting</Badge>;
      case "review":
        return <Badge className="bg-purple-500">Review</Badge>;
      case "feedback":
        return <Badge variant="outline" className="border-green-300 text-green-600">Feedback</Badge>;
      case "evaluation":
        return <Badge className="bg-orange-500">Evaluation</Badge>;
      case "consultation":
        return <Badge variant="outline" className="border-cyan-300 text-cyan-600">Consultation</Badge>;
      case "defense-prep":
        return <Badge className="bg-red-500">Defense Prep</Badge>;
      case "grading":
        return <Badge variant="outline" className="border-gray-300 text-gray-600">Grading</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStressLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-orange-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStressLevelIcon = (level: string) => {
    switch (level) {
      case "low":
        return <ThermometerSnowflake className="h-5 w-5" />;
      case "medium":
        return <Thermometer className="h-5 w-5" />;
      case "high":
        return <ThermometerSun className="h-5 w-5" />;
      case "critical":
        return <Flame className="h-5 w-5" />;
      default:
        return <Thermometer className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Data for charts
  const taskDistributionData = [
    { name: "Pending", value: metrics.pendingTasks },
    { name: "In Progress", value: workloadItems.filter(t => t.status === "in-progress").length },
    { name: "Completed", value: metrics.completedTasks },
    { name: "Overdue", value: metrics.overdueTasks }
  ];

  const weeklyHoursData = [
    { day: "Mon", hours: 4 },
    { day: "Tue", hours: 6 },
    { day: "Wed", hours: 3 },
    { day: "Thu", hours: 5 },
    { day: "Fri", hours: 4 },
    { day: "Sat", hours: 2 },
    { day: "Sun", hours: 1 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workload Management</h2>
          <p className="text-muted-foreground">
            Plan and manage your advisor capacity and tasks
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">AI Workload Assistant: Active</span>
          </div>
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Gauge className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <FileText className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="capacity">
            <ActivitySquare className="h-4 w-4 mr-2" />
            Capacity
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Hours</CardTitle>
                <ClockArrowUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.availableHours}h</div>
                <p className="text-xs text-muted-foreground">of {metrics.totalCapacity}h free</p>
                <Progress value={(metrics.availableHours / metrics.totalCapacity) * 100} className="mt-2" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.pendingTasks}</div>
                <p className="text-xs text-muted-foreground">awaiting completion</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {metrics.overdueTasks} overdue
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.utilizationRate}%</div>
                <Progress value={metrics.utilizationRate} className="mt-2" />
                <div className="flex items-center mt-2">
                  {getStressLevelIcon(metrics.stressLevel)}
                  <span className={`ml-2 text-sm capitalize ${getStressLevelColor(metrics.stressLevel)}`}>
                    {metrics.stressLevel} stress
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
                <Timer className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.averageCompletionTime}h</div>
                <p className="text-xs text-muted-foreground">response time</p>
                <div className="text-xs text-muted-foreground mt-1">
                  {workloadItems.filter(t => t.status === "completed").length} tasks
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>
                  Breakdown of your tasks by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  pending: { label: "Pending" },
                  progress: { label: "In Progress" },
                  completed: { label: "Completed" },
                  overdue: { label: "Overdue" }
                }} className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {taskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Workload</CardTitle>
                <CardDescription>
                  Estimated hours per day for the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  hours: { label: "Hours" }
                }} className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyHoursData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="hours" fill="#8884d8" name="Estimated Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>
                Your next 5 scheduled tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workloadItems
                  .filter(task => task.status !== "completed")
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .slice(0, 5)
                  .map(task => (
                    <div key={task.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      {/* Top row - Title and Status */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div className="flex items-start space-x-3 min-w-0 flex-1">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg flex-shrink-0">
                            {task.type === "meeting" && <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                            {task.type === "review" && <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                            {task.type === "feedback" && <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
                            {task.type === "evaluation" && <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />}
                            {task.type === "defense-prep" && <Award className="h-5 w-5 text-red-600 dark:text-red-400" />}
                            {task.type === "grading" && <UserCheck className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{task.title}</div>
                            <div className="text-sm text-muted-foreground truncate">{task.studentName} • {task.category}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                        </div>
                      </div>

                      {/* Metrics row */}
                      <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                        <div className="p-2 bg-muted/50 rounded">
                          <div className="font-medium truncate">{formatDate(task.dueDate)}</div>
                          <div className="text-xs text-muted-foreground">Due</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <div className="font-medium">{task.estimatedHours}h</div>
                          <div className="text-xs text-muted-foreground">Est. time</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <div className="font-medium">{task.progress}%</div>
                          <Progress value={task.progress} className="mt-1" />
                        </div>
                      </div>

                      {/* Actions row */}
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={task.status === "completed"}
                        >
                          <CheckCircle className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Complete</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                
                {workloadItems.filter(task => task.status !== "completed").length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No upcoming tasks</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      You have no pending tasks at the moment.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} in your workload
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="evaluation">Evaluation</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="defense-prep">Defense Prep</SelectItem>
                    <SelectItem value="grading">Grading</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={() => setShowAddTaskDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      selectedTask?.id === task.id ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    {/* Top row - Title and Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.studentName}&backgroundColor=b6e6ff&fontSize=32`} alt={task.studentName} />
                          <AvatarFallback>{task.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{task.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{task.studentName} • {task.category}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        {getPriorityBadge(task.priority)}
                        {getTypeBadge(task.type)}
                        {getStatusBadge(task.status)}
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium truncate">{task.studentDepartment}</div>
                        <div className="text-xs text-muted-foreground">Department</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium truncate">{formatDate(task.dueDate)}</div>
                        <div className="text-xs text-muted-foreground">Due date</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{task.estimatedHours}h</div>
                        <div className="text-xs text-muted-foreground">Est. time</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{task.progress}%</div>
                        <Progress value={task.progress} className="mt-1" />
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Contact</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Review</span>
                      </Button>
                      {task.status !== "completed" && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteTask(task.id);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Complete</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {filteredTasks.length === 0 && (
                  <div className="text-center py-10">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No tasks found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No tasks match your search." : "You have no tasks in your workload."}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setShowAddTaskDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Task
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advisor Capacity Overview</CardTitle>
                  <CardDescription>
                    Manage advisor workloads and student assignments
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <div className="space-y-4">
                    {advisors.map((advisor) => (
                      <div key={advisor.id} className="p-4 border rounded-lg">
                        {/* Top row - Name and Status */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                          <div className="flex items-start space-x-3 min-w-0 flex-1">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${advisor.name}&backgroundColor=c0f0fc&fontSize=32`} alt={advisor.name} />
                              <AvatarFallback>{advisor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{advisor.name}</div>
                              <div className="text-sm text-muted-foreground truncate">{advisor.department} • {advisor.specialization}</div>
                            </div>
                          </div>
                          <Badge className="flex-shrink-0" variant={advisor.status === "available" ? "default" :
                                         advisor.status === "busy" ? "secondary" :
                                         advisor.status === "overloaded" ? "destructive" : "outline"}>
                            {advisor.status.charAt(0).toUpperCase() + advisor.status.slice(1)}
                          </Badge>
                        </div>

                        {/* Metrics row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                          <div className="p-2 bg-muted/50 rounded">
                            <div className="font-medium">{advisor.currentStudents}/{advisor.maxStudents}</div>
                            <div className="text-xs text-muted-foreground">Students</div>
                          </div>
                          <div className="p-2 bg-muted/50 rounded">
                            <div className="font-medium">{advisor.currentWeeklyHours}/{advisor.maxWeeklyHours}h</div>
                            <div className="text-xs text-muted-foreground">Weekly hours</div>
                          </div>
                          <div className="p-2 bg-muted/50 rounded">
                            <div className="font-medium">{advisor.utilizationRate}%</div>
                            <Progress value={advisor.utilizationRate} className="mt-1" />
                          </div>
                          <div className="p-2 bg-muted/50 rounded">
                            <div className="font-medium">{advisor.performanceRating}/5</div>
                            <div className="text-xs text-muted-foreground">Rating</div>
                          </div>
                        </div>

                        {/* Actions row */}
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Capacity Planning</CardTitle>
                  <CardDescription>
                    Adjust your availability and workload limits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="maxWeeklyHours">Maximum Weekly Hours</Label>
                      <div className="mt-2 flex items-center gap-3">
                        <Input
                          id="maxWeeklyHours"
                          type="number"
                          value={currentAdvisor.maxWeeklyHours}
                          onChange={(e) => setCurrentAdvisor({...currentAdvisor, maxWeeklyHours: parseInt(e.target.value) || 0})}
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">hours</span>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="maxStudents">Maximum Students</Label>
                        <div className="mt-2 flex items-center gap-3">
                          <Input
                            id="maxStudents"
                            type="number"
                            value={currentAdvisor.maxStudents}
                            onChange={(e) => setCurrentAdvisor({...currentAdvisor, maxStudents: parseInt(e.target.value) || 0})}
                            className="w-32"
                          />
                          <span className="text-sm text-muted-foreground">students</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Availability Status</Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span>Monday-Friday</span>
                          <Switch
                            checked={availability.mondayToFriday}
                            onCheckedChange={(checked) => setAvailability({...availability, mondayToFriday: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span>Saturday</span>
                          <Switch
                            checked={availability.saturday}
                            onCheckedChange={(checked) => setAvailability({...availability, saturday: checked})}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <span>Sunday</span>
                          <Switch
                            checked={availability.sunday}
                            onCheckedChange={(checked) => setAvailability({...availability, sunday: checked})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Label>Preferred Meeting Times</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {['morning', 'afternoon', 'evening'].map((time) => (
                        <div key={time} className="flex items-center gap-2 p-3 border rounded-lg">
                          <Checkbox
                            checked={preferredTimes.includes(time)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setPreferredTimes([...preferredTimes, time]);
                              } else {
                                setPreferredTimes(preferredTimes.filter(t => t !== time));
                              }
                            }}
                          />
                          <span className="capitalize">{time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button onClick={handleUpdateCapacity}>
                      <Settings className="h-4 w-4 mr-2" />
                      Update Capacity
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workload Insights</CardTitle>
                  <CardDescription>
                    Key metrics about your workload
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Available Hours</span>
                      <span className="text-sm font-medium">{metrics.availableHours} / {metrics.totalCapacity}h</span>
                    </div>
                    <Progress value={(metrics.availableHours / metrics.totalCapacity) * 100} className="w-full" />
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Pending Tasks</span>
                      <span className="text-sm font-medium">{metrics.pendingTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Completed This Week</span>
                      <span className="text-sm font-medium">{metrics.completedTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg. Response Time</span>
                      <span className="text-sm font-medium">{metrics.averageCompletionTime}h</span>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Stress Level</span>
                        <div className="flex items-center gap-2">
                          {getStressLevelIcon(metrics.stressLevel)}
                          <span className={`capitalize text-sm ${getStressLevelColor(metrics.stressLevel)}`}>
                            {metrics.stressLevel}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Capacity Utilization</span>
                        <span className="text-sm font-medium">{metrics.utilizationRate}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overdue Tasks</span>
                        <span className={`text-sm font-medium ${metrics.overdueTasks > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {metrics.overdueTasks}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>
                    Suggestions to optimize your workload
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.utilizationRate > 85 && (
                      <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <div className="font-medium">High Utilization</div>
                          <div className="text-sm text-yellow-700">
                            Your workload is at {metrics.utilizationRate}%. Consider delegating tasks or increasing capacity.
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {metrics.overdueTasks > 0 && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <div className="font-medium">Overdue Tasks</div>
                          <div className="text-sm text-red-700">
                            You have {metrics.overdueTasks} overdue task{metrics.overdueTasks !== 1 ? 's' : ''}. Prioritize these to maintain student progress.
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Optimal Scheduling</div>
                        <div className="text-sm text-blue-700">
                          Schedule high-priority tasks during your peak productivity hours.
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Good Performance</div>
                        <div className="text-sm text-green-700">
                          Your average response time is excellent at {metrics.averageCompletionTime} hours.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Productivity Trends</CardTitle>
                <CardDescription>
                  Your task completion over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  completed: { label: "Completed Tasks" },
                  avgTime: { label: "Avg. Completion Time (hrs)" }
                }} className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { week: "Nov 18", completed: 12, avgTime: 22 },
                      { week: "Nov 25", completed: 15, avgTime: 20 },
                      { week: "Dec 2", completed: 10, avgTime: 24 },
                      { week: "Dec 9", completed: 18, avgTime: 18 },
                      { week: "Dec 16", completed: 14, avgTime: 20 },
                      { week: "Dec 23", completed: 16, avgTime: 19 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#8884d8" 
                        name="Completed Tasks" 
                        strokeWidth={2} 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="avgTime" 
                        stroke="#82ca9d" 
                        name="Avg. Time (hrs)" 
                        strokeWidth={2} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Task Type Distribution</CardTitle>
                <CardDescription>
                  Breakdown of your workload by task type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{
                  review: { label: "Reviews" },
                  meeting: { label: "Meetings" },
                  feedback: { label: "Feedback" },
                  evaluation: { label: "Evaluations" },
                  consultation: { label: "Consultations" },
                  defense: { label: "Defense Prep" },
                  grading: { label: "Grading" }
                }} className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { type: "Reviews", count: 24 },
                      { type: "Meetings", count: 18 },
                      { type: "Feedback", count: 32 },
                      { type: "Evaluations", count: 15 },
                      { type: "Consultations", count: 12 },
                      { type: "Defense Prep", count: 8 },
                      { type: "Grading", count: 10 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Task Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement Metrics</CardTitle>
              <CardDescription>
                How students interact with your feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">87%</div>
                  <div className="text-sm text-muted-foreground">Response Rate</div>
                  <div className="text-xs text-muted-foreground mt-1">to feedback</div>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">2.4d</div>
                  <div className="text-sm text-muted-foreground">Avg. Turnaround</div>
                  <div className="text-xs text-muted-foreground mt-1">for revisions</div>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">94%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction</div>
                  <div className="text-xs text-muted-foreground mt-1">rating</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Task Dialog */}
      <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Schedule a new meeting or assignment for a student
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskTitle">Task Title</Label>
                <Input
                  id="taskTitle"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="taskType">Task Type</Label>
                <Select value={newTask.type} onValueChange={(value) => setNewTask({...newTask, type: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="evaluation">Evaluation</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="defense-prep">Defense Preparation</SelectItem>
                    <SelectItem value="grading">Grading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea
                id="taskDescription"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Describe the task or meeting purpose"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  value={newTask.studentName}
                  onChange={(e) => setNewTask({...newTask, studentName: e.target.value})}
                  placeholder="Enter student name"
                />
              </div>
              <div>
                <Label htmlFor="studentEmail">Student Email</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={newTask.studentEmail}
                  onChange={(e) => setNewTask({...newTask, studentEmail: e.target.value})}
                  placeholder="Enter student email"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newTask.startTime}
                  onChange={(e) => setNewTask({...newTask, startTime: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newTask.endTime}
                  onChange={(e) => setNewTask({...newTask, endTime: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                value={newTask.estimatedHours}
                onChange={(e) => setNewTask({...newTask, estimatedHours: parseInt(e.target.value) || 1})}
                placeholder="Estimated time commitment"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={newTask.category}
                onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                placeholder="Enter category (e.g., Thesis Review, Methodology Check)"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newTask.notes}
                onChange={(e) => setNewTask({...newTask, notes: e.target.value})}
                placeholder="Any additional notes or requirements"
                rows={2}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="reminder"
                  checked={newTask.reminderEnabled}
                  onCheckedChange={(checked) => setNewTask({...newTask, reminderEnabled: checked})}
                />
                <Label htmlFor="reminder">Enable Reminder</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={newTask.isRecurring}
                  onCheckedChange={(checked) => setNewTask({...newTask, isRecurring: checked})}
                />
                <Label htmlFor="recurring">Recurring Task</Label>
              </div>
            </div>
            
            {newTask.isRecurring && (
              <div>
                <Label htmlFor="recurrence">Recurrence Pattern</Label>
                <Select value={newTask.recurrence} onValueChange={(value) => setNewTask({...newTask, recurrence: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={!newTask.title || !newTask.studentName || !newTask.studentEmail}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Schedule Task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkloadManagement;