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

export default function TurnaroundPage() {
  const { session, profile, isLoading } = useAuth();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [filteredMetrics, setFilteredMetrics] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("month");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [improvementNotes, setImprovementNotes] = useState("");

  // Sample turnaround metrics data
  const sampleMetrics = [
    {
      id: 1,
      type: "Initial Review",
      avgTime: 3.2,
      target: 5,
      status: "Good",
      completed: 24,
      pending: 5,
      performance: 78,
      trend: [
        { date: "2023-11-01", time: 3.5 },
        { date: "2023-11-05", time: 3.4 },
        { date: "2023-11-10", time: 3.3 },
        { date: "2023-11-15", time: 3.2 },
        { date: "2023-11-20", time: 3.2 }
      ]
    },
    {
      id: 2,
      type: "Revisions",
      avgTime: 2.1,
      target: 3,
      status: "Excellent",
      completed: 18,
      pending: 3,
      performance: 92,
      trend: [
        { date: "2023-11-01", time: 2.4 },
        { date: "2023-11-05", time: 2.3 },
        { date: "2023-11-10", time: 2.2 },
        { date: "2023-11-15", time: 2.1 },
        { date: "2023-11-20", time: 2.1 }
      ]
    },
    {
      id: 3,
      type: "Final Approval",
      avgTime: 1.5,
      target: 2,
      status: "Excellent",
      completed: 15,
      pending: 2,
      performance: 95,
      trend: [
        { date: "2023-11-01", time: 1.7 },
        { date: "2023-11-05", time: 1.6 },
        { date: "2023-11-10", time: 1.5 },
        { date: "2023-11-15", time: 1.5 },
        { date: "2023-11-20", time: 1.5 }
      ]
    },
    {
      id: 4,
      type: "Urgent Reviews",
      avgTime: 0.75,
      target: 1,
      status: "Good",
      completed: 8,
      pending: 1,
      performance: 82,
      trend: [
        { date: "2023-11-01", time: 0.8 },
        { date: "2023-11-05", time: 0.8 },
        { date: "2023-11-10", time: 0.75 },
        { date: "2023-11-15", time: 0.75 },
        { date: "2023-11-20", time: 0.75 }
      ]
    },
    {
      id: 5,
      type: "Standard Review",
      avgTime: 4.1,
      target: 5,
      status: "Good",
      completed: 32,
      pending: 7,
      performance: 76,
      trend: [
        { date: "2023-11-01", time: 4.3 },
        { date: "2023-11-05", time: 4.2 },
        { date: "2023-11-10", time: 4.1 },
        { date: "2023-11-15", time: 4.1 },
        { date: "2023-11-20", time: 4.1 }
      ]
    },
    {
      id: 6,
      type: "Complex Analysis",
      avgTime: 6.8,
      target: 7,
      status: "Excellent",
      completed: 9,
      pending: 2,
      performance: 97,
      trend: [
        { date: "2023-11-01", time: 7.1 },
        { date: "2023-11-05", time: 7.0 },
        { date: "2023-11-10", time: 6.9 },
        { date: "2023-11-15", time: 6.8 },
        { date: "2023-11-20", time: 6.8 }
      ]
    },
  ];

  useEffect(() => {
    // Load sample data on component mount
    setMetrics(sampleMetrics);
    setFilteredMetrics(sampleMetrics);
  }, []);

  useEffect(() => {
    // Filter metrics based on time range
    let result = sampleMetrics;

    // In a real app, this would filter based on time range
    // For now, we'll just update when time range changes
    setFilteredMetrics(result);
  }, [timeRange]);

  const handleSaveNotes = () => {
    // In a real app, this would save the improvement notes to a database
    alert("Improvement notes saved successfully!");
  };

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
        <h1 className="text-3xl font-bold">Turnaround Metrics</h1>
        <p className="text-muted-foreground">Track and optimize your review completion times</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Avg. Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics.length > 0
                ? (metrics.reduce((sum, m) => sum + m.avgTime, 0) / metrics.length).toFixed(1)
                : 0} days
            </div>
            <p className="text-sm text-muted-foreground">Across all review types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">On Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics.length > 0
                ? Math.round(metrics.filter(m => m.avgTime <= m.target).length / metrics.length * 100)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Reviews meeting targets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics.reduce((sum, m) => sum + m.completed, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Reviews finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Avg. Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {metrics.length > 0
                ? Math.round(metrics.reduce((sum, m) => sum + m.performance, 0) / metrics.length)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Overall efficiency</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Review Turnaround Analytics</CardTitle>
              <CardDescription>Monitor your efficiency and turnaround times for reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Filter review types..."
                  onChange={(e) => {
                    const term = e.target.value.toLowerCase();
                    setFilteredMetrics(
                      term
                        ? metrics.filter(m => m.type.toLowerCase().includes(term))
                        : metrics
                    );
                  }}
                />
              </div>

              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Review Type</TableHead>
                      <TableHead>Avg. Time</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMetrics.map((metric) => (
                      <TableRow
                        key={metric.id}
                        className={selectedMetric === metric.type ? "bg-muted" : ""}
                        onClick={() => setSelectedMetric(metric.type)}
                      >
                        <TableCell className="font-medium">{metric.type}</TableCell>
                        <TableCell>{metric.avgTime} days</TableCell>
                        <TableCell>{metric.target} days</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              metric.status === "Excellent" ? "default" :
                              metric.status === "Good" ? "secondary" :
                              "destructive"
                            }
                          >
                            {metric.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{metric.performance}%</span>
                            <Progress value={metric.performance} className="w-20" />
                          </div>
                        </TableCell>
                        <TableCell>{metric.completed}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Details</Button>
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
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Turnaround time trend for selected metric</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedMetric ? (
              <div className="space-y-4">
                <h3 className="font-semibold">{selectedMetric}</h3>
                <div className="h-64">
                  {(() => {
                    const metric = metrics.find(m => m.type === selectedMetric);
                    if (!metric || !metric.trend) return null;

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={metric.trend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, Math.max(8, Math.max(...metric.trend.map(d => d.time)) * 1.2)]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="time" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Avg:</span>
                    <span className="font-semibold">
                      {metrics.find(m => m.type === selectedMetric)?.avgTime || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-semibold">
                      {metrics.find(m => m.type === selectedMetric)?.target || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-semibold">
                      {metrics.find(m => m.type === selectedMetric)?.status || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p>Select a review type to view trend details</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
            <CardDescription>Compare turnaround times across review types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgTime" name="Avg. Time (days)" fill="#8884d8" />
                  <Bar dataKey="target" name="Target (days)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Efficiency Analysis</CardTitle>
            <CardDescription>Review completion rates and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Review Completion Status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="completed" name="Completed" fill="#82ca9d" />
                      <Bar dataKey="pending" name="Pending" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Improvement Recommendations</CardTitle>
          <CardDescription>Strategies to optimize your turnaround times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Top Priorities</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Focus on "Initial Review" which has the longest average time</li>
                <li>Consider delegating "Complex Analysis" reviews to specialists</li>
                <li>Implement template system to reduce review preparation time</li>
                <li>Set up automated reminders for pending reviews</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Performance Targets</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Reduce "Initial Review" time from 3.2 to 2.8 days</li>
                <li>Maintain "Revisions" at current excellent level</li>
                <li>Improve "Urgent Reviews" to sub 12-hour completion</li>
                <li>Keep overall on-time rate above 80%</li>
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Personal Notes</h3>
            <Textarea
              placeholder="Add notes about improving turnaround times..."
              rows={4}
              value={improvementNotes}
              onChange={(e) => setImprovementNotes(e.target.value)}
            />
            <Button onClick={handleSaveNotes} className="mt-2">Save Notes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}