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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export default function PeerComparisonPage() {
  const { session, profile, isLoading } = useAuth();
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [filteredComparisons, setFilteredComparisons] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserData, setCurrentUserData] = useState<any>(null);

  // Sample peer comparison data
  const sampleComparisons = [
    {
      id: 1,
      reviewer: "Dr. Anderson",
      avgRating: 4.2,
      reviewsCompleted: 24,
      accuracy: 92,
      turnaroundTime: 2.8,
      engagement: 85,
      specialization: "Social Sciences",
      institution: "Stanford University",
      ranking: 12,
      qualityScore: 87,
      consistency: 89,
      feedbackDepth: 4.3
    },
    {
      id: 2,
      reviewer: "Prof. Williams",
      avgRating: 4.7,
      reviewsCompleted: 38,
      accuracy: 96,
      turnaroundTime: 1.9,
      engagement: 94,
      specialization: "Computer Science",
      institution: "MIT",
      ranking: 3,
      qualityScore: 94,
      consistency: 95,
      feedbackDepth: 4.8
    },
    {
      id: 3,
      reviewer: "Dr. Thompson",
      avgRating: 3.9,
      reviewsCompleted: 19,
      accuracy: 88,
      turnaroundTime: 3.2,
      engagement: 78,
      specialization: "Engineering",
      institution: "Caltech",
      ranking: 28,
      qualityScore: 82,
      consistency: 84,
      feedbackDepth: 4.0
    },
    {
      id: 4,
      reviewer: "Dr. Lee",
      avgRating: 4.5,
      reviewsCompleted: 31,
      accuracy: 94,
      turnaroundTime: 2.3,
      engagement: 91,
      specialization: "Biology",
      institution: "Harvard University",
      ranking: 7,
      qualityScore: 91,
      consistency: 92,
      feedbackDepth: 4.6
    },
    {
      id: 5,
      reviewer: "Dr. Rodriguez",
      avgRating: 4.1,
      reviewsCompleted: 27,
      accuracy: 90,
      turnaroundTime: 2.5,
      engagement: 83,
      specialization: "Psychology",
      institution: "University of California",
      ranking: 18,
      qualityScore: 86,
      consistency: 88,
      feedbackDepth: 4.2
    },
    {
      id: 6,
      reviewer: "Prof. Johnson",
      avgRating: 4.8,
      reviewsCompleted: 42,
      accuracy: 97,
      turnaroundTime: 1.7,
      engagement: 96,
      specialization: "Mathematics",
      institution: "Princeton University",
      ranking: 2,
      qualityScore: 96,
      consistency: 97,
      feedbackDepth: 4.9
    },
    {
      id: 7,
      reviewer: "Dr. Chen",
      avgRating: 4.0,
      reviewsCompleted: 22,
      accuracy: 89,
      turnaroundTime: 3.0,
      engagement: 80,
      specialization: "Physics",
      institution: "University of Chicago",
      ranking: 25,
      qualityScore: 84,
      consistency: 86,
      feedbackDepth: 4.1
    },
    {
      id: 8,
      reviewer: "Dr. Kim",
      avgRating: 4.6,
      reviewsCompleted: 35,
      accuracy: 95,
      turnaroundTime: 2.1,
      engagement: 92,
      specialization: "Chemistry",
      institution: "Caltech",
      ranking: 5,
      qualityScore: 93,
      consistency: 94,
      feedbackDepth: 4.7
    },
  ];

  useEffect(() => {
    // Load sample data on component mount
    setComparisons(sampleComparisons);
    setFilteredComparisons(sampleComparisons);

    // Set current user data (simulated)
    setCurrentUserData({
      reviewer: "You",
      avgRating: 4.4,
      reviewsCompleted: 29,
      accuracy: 93,
      turnaroundTime: 2.2,
      engagement: 88,
      specialization: "Multiple Fields",
      institution: "Various",
      ranking: 9,
      qualityScore: 89,
      consistency: 91,
      feedbackDepth: 4.5
    });
  }, []);

  useEffect(() => {
    // Filter comparisons based on selected filter and search term
    let result = comparisons;

    if (selectedFilter !== "all") {
      result = result.filter(comparison =>
        selectedFilter === "top" ? comparison.ranking <= 5 :
        selectedFilter === "similar" ? Math.abs(comparison.avgRating - (currentUserData?.avgRating || 0)) <= 0.3 : result
      );
    }

    if (searchTerm) {
      result = result.filter(comparison =>
        comparison.reviewer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comparison.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comparison.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredComparisons(result);
  }, [selectedFilter, searchTerm, comparisons, currentUserData]);

  // Check if user is authenticated and has critic role
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session || !profile || profile.role !== 'critic') {
    return <div>Please log in as a critic to access this page</div>;
  }

  // Data for radar chart comparison
  const comparisonData = currentUserData ? [
    { subject: 'Quality', A: currentUserData.qualityScore, B: 94, fullMark: 100 },
    { subject: 'Accuracy', A: currentUserData.accuracy, B: 96, fullMark: 100 },
    { subject: 'Consistency', A: currentUserData.consistency, B: 95, fullMark: 100 },
    { subject: 'Engagement', A: currentUserData.engagement, B: 94, fullMark: 100 },
    { subject: 'Turnaround', A: 100 - (currentUserData.turnaroundTime * 10), B: 81, fullMark: 100 }, // Inverted scale for turnaround time
    { subject: 'Feedback Depth', A: currentUserData.feedbackDepth * 10, B: 48, fullMark: 50 },
  ] : [];

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Peer Comparison</h1>
        <p className="text-muted-foreground">Compare your review performance against peers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Your Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">#{currentUserData?.ranking || 0}</div>
            <p className="text-sm text-muted-foreground">Out of {comparisons.length} reviewers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Your Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentUserData?.avgRating || 0}</div>
            <p className="text-sm text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentUserData?.reviewsCompleted || 0}</div>
            <p className="text-sm text-muted-foreground">Completed reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentUserData?.accuracy || 0}%</div>
            <p className="text-sm text-muted-foreground">Review accuracy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Comparison</CardTitle>
            <CardDescription>Compare your metrics with other reviewers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="You" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Radar name="Top Reviewer" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Performance</CardTitle>
            <CardDescription>Detailed metrics for your review performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Average Rating</span>
                <span className="font-semibold">{currentUserData?.avgRating || 0}/5.0</span>
              </div>
              <Progress value={currentUserData?.avgRating * 20} className="w-full" />

              <div className="flex justify-between">
                <span>Accuracy</span>
                <span className="font-semibold">{currentUserData?.accuracy || 0}%</span>
              </div>
              <Progress value={currentUserData?.accuracy} className="w-full" />

              <div className="flex justify-between">
                <span>Quality Score</span>
                <span className="font-semibold">{currentUserData?.qualityScore || 0}/100</span>
              </div>
              <Progress value={currentUserData?.qualityScore} className="w-full" />

              <div className="flex justify-between">
                <span>Consistency</span>
                <span className="font-semibold">{currentUserData?.consistency || 0}/100</span>
              </div>
              <Progress value={currentUserData?.consistency} className="w-full" />

              <div className="flex justify-between">
                <span>Engagement</span>
                <span className="font-semibold">{currentUserData?.engagement || 0}%</span>
              </div>
              <Progress value={currentUserData?.engagement} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reviewer Performance Comparison</CardTitle>
          <CardDescription>Compare your metrics with other reviewers in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter reviewers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviewers</SelectItem>
                <SelectItem value="top">Top 5 Reviewers</SelectItem>
                <SelectItem value="similar">Similar Performers</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Search reviewers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[400px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Avg. Rating</TableHead>
                  <TableHead>Reviews</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Turnaround</TableHead>
                  <TableHead>Ranking</TableHead>
                  <TableHead>Specialization</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComparisons.map((comparison) => (
                  <TableRow key={comparison.id}>
                    <TableCell className="font-medium">{comparison.reviewer}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">{comparison.avgRating}/5.0</span>
                        <Progress value={comparison.avgRating * 20} className="w-20" />
                      </div>
                    </TableCell>
                    <TableCell>{comparison.reviewsCompleted}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">{comparison.accuracy}%</span>
                        <Progress value={comparison.accuracy} className="w-20" />
                      </div>
                    </TableCell>
                    <TableCell>{comparison.turnaroundTime} days</TableCell>
                    <TableCell>
                      <Badge variant={comparison.ranking <= 5 ? "default" : comparison.ranking <= 10 ? "secondary" : "outline"}>
                        #{comparison.ranking}
                      </Badge>
                    </TableCell>
                    <TableCell>{comparison.specialization}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Performance Analysis</CardTitle>
          <CardDescription>Areas for improvement and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Strengths</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>High accuracy rate of {currentUserData?.accuracy || 0}%</li>
                <li>Good engagement level of {currentUserData?.engagement || 0}%</li>
                <li>Consistent feedback quality (score: {currentUserData?.qualityScore || 0})</li>
                <li>Efficient turnaround time of {currentUserData?.turnaroundTime || 0} days</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Areas for Improvement</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Consider increasing feedback depth to {currentUserData?.feedbackDepth ? (currentUserData.feedbackDepth + 0.3).toFixed(1) : 0}</li>
                <li>Target accuracy of 95%+ for top performance</li>
                <li>Focus on maintaining consistency score above 92%</li>
                <li>Compare with top reviewer's rating of 4.8</li>
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Personalized Recommendations</h3>
            <Textarea
              placeholder="Analyze your peer comparison results and areas for improvement..."
              rows={4}
              defaultValue="Based on your performance, consider focusing on increasing feedback depth by providing more detailed comments. Your accuracy is already strong, but aim to reach the top reviewer's level of 96%+ by double-checking citations and formatting issues. Consider specializing in a particular field to increase your ranking."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}