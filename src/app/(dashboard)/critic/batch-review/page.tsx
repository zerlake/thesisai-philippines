'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function BatchReviewPage() {
  const { session, profile, isLoading } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [batchStatus, setBatchStatus] = useState("idle");
  const [progress, setProgress] = useState(0);

  // Sample batch review data
  const sampleBatchReviews = [
    { id: 1, title: "The Impact of Climate Change on Biodiversity", student: "John Smith", status: "Completed", score: 85, issues: 3, completedAt: "2023-11-15" },
    { id: 2, title: "Machine Learning in Healthcare Diagnostics", student: "Sarah Johnson", status: "In Progress", score: 0, issues: 0, completedAt: "N/A" },
    { id: 3, title: "Sustainable Architecture in Urban Planning", student: "Michael Chen", status: "Pending", score: 0, issues: 0, completedAt: "N/A" },
    { id: 4, title: "Neuroplasticity and Cognitive Rehabilitation", student: "Emma Rodriguez", status: "Completed", score: 92, issues: 1, completedAt: "2023-11-18" },
  ];

  useEffect(() => {
    // Load sample data on component mount
    setReviews(sampleBatchReviews);
  }, []);

  const handleBatchUpload = () => {
    setBatchStatus("processing");
    setProgress(0);

    // Simulate batch processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBatchStatus("completed");
          return 100;
        }
        return prev + 10;
      });
    }, 300);
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
        <h1 className="text-3xl font-bold">Batch Review</h1>
        <p className="text-muted-foreground">Process multiple manuscripts simultaneously</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reviews.length}</div>
            <p className="text-sm text-muted-foreground">Manuscripts in queue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reviews.filter(r => r.status === "Completed").length}</div>
            <p className="text-sm text-muted-foreground">Successfully reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Avg. Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {reviews.filter(r => r.status === "Completed").length > 0
                ? Math.round(reviews.filter(r => r.status === "Completed").reduce((sum, r) => sum + r.score, 0) / reviews.filter(r => r.status === "Completed").length)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Across completed reviews</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Batch Documents</CardTitle>
          <CardDescription>Upload multiple documents for simultaneous review and feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input type="file" multiple placeholder="Select documents to review" />
              <Button onClick={handleBatchUpload} disabled={batchStatus === "processing"}>Upload & Process</Button>
            </div>

            {batchStatus === "processing" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Processing batch...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Batch Review Queue</CardTitle>
          <CardDescription>Current status of batch reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Issues</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.student}</TableCell>
                        <TableCell>{review.title}</TableCell>
                        <TableCell>
                          <Badge variant={review.status === "Completed" ? "default" : review.status === "In Progress" ? "secondary" : "outline"}>
                            {review.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{review.score > 0 ? `${review.score}%` : "N/A"}</TableCell>
                        <TableCell>{review.issues}</TableCell>
                        <TableCell>{review.completedAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="details">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Batch Processing Details</h3>
                  <div className="text-sm">
                    <p><span className="font-medium">Total Documents:</span> {reviews.length}</p>
                    <p><span className="font-medium">Completed Reviews:</span> {reviews.filter(r => r.status === "Completed").length}</p>
                    <p><span className="font-medium">Average Processing Time:</span> 2.3 days</p>
                    <p><span className="font-medium">Most Common Issues:</span> Citation formatting, Methodology clarity</p>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Processing Log</h4>
                    <div className="text-xs bg-muted p-3 rounded">
                      <p>[2023-11-20 09:15:00] Batch processing started</p>
                      <p>[2023-11-20 09:15:03] Document 1 analyzed - 85% match</p>
                      <p>[2023-11-20 09:15:08] Document 2 analyzed - 92% match</p>
                      <p>[2023-11-20 09:15:12] Issues detected in 3 documents</p>
                      <p>[2023-11-20 09:15:15] Batch processing completed</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="reports">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Batch Review Reports</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Quality Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Overall Quality</span>
                            <span>87%</span>
                          </div>
                          <Progress value={87} />
                        </div>
                        <div className="space-y-2 mt-3">
                          <div className="flex justify-between">
                            <span>Formatting Compliance</span>
                            <span>92%</span>
                          </div>
                          <Progress value={92} />
                        </div>
                        <div className="space-y-2 mt-3">
                          <div className="flex justify-between">
                            <span>Citation Accuracy</span>
                            <span>84%</span>
                          </div>
                          <Progress value={84} />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Issue Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Citation Issues</span>
                            <span>35%</span>
                          </div>
                          <Progress value={35} />
                        </div>
                        <div className="space-y-2 mt-3">
                          <div className="flex justify-between">
                            <span>Methodology Issues</span>
                            <span>28%</span>
                          </div>
                          <Progress value={28} />
                        </div>
                        <div className="space-y-2 mt-3">
                          <div className="flex justify-between">
                            <span>Structure Issues</span>
                            <span>22%</span>
                          </div>
                          <Progress value={22} />
                        </div>
                        <div className="space-y-2 mt-3">
                          <div className="flex justify-between">
                            <span>Other Issues</span>
                            <span>15%</span>
                          </div>
                          <Progress value={15} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}