'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Define types for chart data
type ChartData = {
  date: string;
  score: number;
};

export default function StudentPerformancePage() {
  const { session, profile, isLoading } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Sample student performance data
  const sampleStudents: {
    id: number;
    name: string;
    avgScore: number;
    assignments: number;
    improvement: string;
    status: string;
    major: string;
    institution: string;
    lastSubmission: string;
    engagement: number;
    completionRate: number;
    peerRank: number;
    totalReviews: number;
    avgReviewTime: string;
    feedbackQuality: number;
    history: ChartData[];
  }[] = [
    {
      id: 1,
      name: "John Smith",
      avgScore: 85,
      assignments: 12,
      improvement: "+5%",
      status: "Improving",
      major: "Environmental Science",
      institution: "University of California",
      lastSubmission: "2023-11-15",
      engagement: 82,
      completionRate: 95,
      peerRank: 24,
      totalReviews: 8,
      avgReviewTime: "2.3 days",
      feedbackQuality: 4.2,
      history: [
        { date: "2023-09-01", score: 78 },
        { date: "2023-09-15", score: 80 },
        { date: "2023-10-01", score: 82 },
        { date: "2023-10-15", score: 83 },
        { date: "2023-11-01", score: 84 },
        { date: "2023-11-15", score: 85 }
      ]
    },
    {
      id: 2,
      name: "Sarah Johnson",
      avgScore: 92,
      assignments: 10,
      improvement: "+12%",
      status: "Excellent",
      major: "Computer Science",
      institution: "Stanford University",
      lastSubmission: "2023-11-18",
      engagement: 95,
      completionRate: 100,
      peerRank: 3,
      totalReviews: 12,
      avgReviewTime: "1.8 days",
      feedbackQuality: 4.8,
      history: [
        { date: "2023-09-01", score: 85 },
        { date: "2023-09-15", score: 87 },
        { date: "2023-10-01", score: 89 },
        { date: "2023-10-15", score: 90 },
        { date: "2023-11-01", score: 91 },
        { date: "2023-11-18", score: 92 }
      ]
    },
    {
      id: 3,
      name: "Michael Chen",
      avgScore: 78,
      assignments: 15,
      improvement: "-2%",
      status: "Needs Attention",
      major: "Mechanical Engineering",
      institution: "MIT",
      lastSubmission: "2023-11-10",
      engagement: 68,
      completionRate: 87,
      peerRank: 42,
      totalReviews: 6,
      avgReviewTime: "3.1 days",
      feedbackQuality: 3.8,
      history: [
        { date: "2023-09-01", score: 82 },
        { date: "2023-09-15", score: 81 },
        { date: "2023-10-01", score: 80 },
        { date: "2023-10-15", score: 79 },
        { date: "2023-11-01", score: 78 },
        { date: "2023-11-10", score: 78 }
      ]
    },
    {
      id: 4,
      name: "Emma Rodriguez",
      avgScore: 88,
      assignments: 9,
      improvement: "+8%",
      status: "Improving",
      major: "Psychology",
      institution: "Harvard University",
      lastSubmission: "2023-11-20",
      engagement: 89,
      completionRate: 98,
      peerRank: 15,
      totalReviews: 7,
      avgReviewTime: "2.1 days",
      feedbackQuality: 4.5,
      history: [
        { date: "2023-09-01", score: 81 },
        { date: "2023-09-15", score: 82 },
        { date: "2023-10-01", score: 84 },
        { date: "2023-10-15", score: 85 },
        { date: "2023-11-01", score: 86 },
        { date: "2023-11-20", score: 88 }
      ]
    },
    {
      id: 5,
      name: "David Wilson",
      avgScore: 75,
      assignments: 11,
      improvement: "-5%",
      status: "Needs Attention",
      major: "Economics",
      institution: "University of Chicago",
      lastSubmission: "2023-11-05",
      engagement: 62,
      completionRate: 82,
      peerRank: 48,
      totalReviews: 5,
      avgReviewTime: "3.5 days",
      feedbackQuality: 3.5,
      history: [
        { date: "2023-09-01", score: 79 },
        { date: "2023-09-15", score: 78 },
        { date: "2023-10-01", score: 77 },
        { date: "2023-10-15", score: 76 },
        { date: "2023-11-01", score: 75 },
        { date: "2023-11-05", score: 75 }
      ]
    },
    {
      id: 6,
      name: "Priya Patel",
      avgScore: 94,
      assignments: 8,
      improvement: "+15%",
      status: "Excellent",
      major: "Biology",
      institution: "Johns Hopkins University",
      lastSubmission: "2023-11-22",
      engagement: 97,
      completionRate: 100,
      peerRank: 1,
      totalReviews: 10,
      avgReviewTime: "1.5 days",
      feedbackQuality: 4.9,
      history: [
        { date: "2023-09-01", score: 82 },
        { date: "2023-09-15", score: 85 },
        { date: "2023-10-01", score: 88 },
        { date: "2023-10-15", score: 90 },
        { date: "2023-11-01", score: 92 },
        { date: "2023-11-22", score: 94 }
      ]
    },
  ];

  useEffect(() => {
    // Load sample data on component mount
    setStudents(sampleStudents);
    setFilteredStudents(sampleStudents);
    setSelectedStudent(sampleStudents[0]);
  }, []);

  useEffect(() => {
    // Filter students based on selected filter and search term
    let result = students;

    if (selectedFilter !== "all") {
      result = result.filter(student =>
        selectedFilter === "improving" ? student.improvement.startsWith('+') :
        selectedFilter === "needs-attention" ? student.status === "Needs Attention" :
        selectedFilter === "excellent" ? student.status === "Excellent" : result
      );
    }

    if (searchTerm) {
      result = result.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(result);
  }, [selectedFilter, searchTerm, students]);

  // Check if user is authenticated and has critic role
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session || !profile || profile.role !== 'critic') {
    return <div>Please log in as a critic to access this page</div>;
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Student Performance</h1>
        <p className="text-muted-foreground">Track and analyze student performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.length}</div>
            <p className="text-sm text-muted-foreground">Under review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Avg. Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {students.length > 0
                ? Math.round(students.reduce((sum, s) => sum + s.avgScore, 0) / students.length)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Across all students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Improving</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{students.filter(s => s.improvement.startsWith('+')).length}</div>
            <p className="text-sm text-muted-foreground">Students showing progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Avg. Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {students.length > 0
                ? Math.round(students.reduce((sum, s) => sum + s.engagement, 0) / students.length)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Student activity level</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance Analytics</CardTitle>
              <CardDescription>Monitor academic progress and performance trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="improving">Improving</SelectItem>
                    <SelectItem value="needs-attention">Needs Attention</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Major</TableHead>
                      <TableHead>Avg. Score</TableHead>
                      <TableHead>Improvement</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        className={selectedStudent && selectedStudent.id === student.id ? "bg-muted" : ""}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.major}</TableCell>
                        <TableCell>{student.avgScore}%</TableCell>
                        <TableCell>
                          <Badge variant={student.improvement.startsWith('+') ? "default" : "destructive"}>
                            {student.improvement}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.status === "Excellent" ? "default" :
                              student.status === "Improving" ? "secondary" :
                              "destructive"
                            }
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{student.engagement}%</span>
                            <Progress value={student.engagement} className="w-20" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
            <CardDescription>Performance metrics for selected student</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                  <p className="text-muted-foreground">{selectedStudent.major} - {selectedStudent.institution}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-lg font-semibold">{selectedStudent.avgScore}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-lg font-semibold">{selectedStudent.completionRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement</p>
                    <p className="text-lg font-semibold">{selectedStudent.engagement}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Peer Rank</p>
                    <p className="text-lg font-semibold">#{selectedStudent.peerRank}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Last Submission</p>
                  <p className="font-medium">{selectedStudent.lastSubmission}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Performance Trend</p>
                  <div className="h-40 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedStudent.history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[70, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <p>Select a student to view details</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
          <CardDescription>Overview of student performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={students}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[70, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgScore" name="Average Score" fill="#8884d8" />
                <Bar dataKey="engagement" name="Engagement %" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}