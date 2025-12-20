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

export default function RubricsPage() {
  const { session, profile, isLoading } = useAuth();
  const [rubrics, setRubrics] = useState<any[]>([]);
  const [activeRubric, setActiveRubric] = useState<any>(null);
  const [newRubric, setNewRubric] = useState({
    name: "",
    criteria: "",
    scoreRange: "1-10",
    weight: "20",
    description: ""
  });

  // Sample rubric data
  const sampleRubrics = [
    { id: 1, name: "Research Quality", criteria: "Assesses depth of research, use of credible sources, and evidence quality", scoreRange: "1-10", weight: "25%", description: "Evaluates the quality and depth of research conducted for the thesis", lastUpdated: "2023-11-15", status: "Active" },
    { id: 2, name: "Writing Clarity", criteria: "Measures clarity of expression, grammar, and coherence", scoreRange: "1-10", weight: "20%", description: "Assesses how clearly ideas are communicated in writing", lastUpdated: "2023-11-10", status: "Active" },
    { id: 3, name: "Methodology", criteria: "Evaluates research methods, design, and implementation", scoreRange: "1-10", weight: "30%", description: "Reviews the appropriateness and execution of research methods", lastUpdated: "2023-11-05", status: "Active" },
    { id: 4, name: "Analysis", criteria: "Reviews analytical depth, critical thinking, and interpretation", scoreRange: "1-10", weight: "25%", description: "Examines the depth of analysis and critical thinking applied", lastUpdated: "2023-11-12", status: "Active" },
    { id: 5, name: "Citation & References", criteria: "Checks accuracy, completeness, and formatting of citations", scoreRange: "1-10", weight: "15%", description: "Verifies proper citation format and reference accuracy", lastUpdated: "2023-10-28", status: "Active" },
    { id: 6, name: "Structure & Organization", criteria: "Evaluates logical flow and organization of content", scoreRange: "1-10", weight: "20%", description: "Reviews how well the content is organized and flows logically", lastUpdated: "2023-11-18", status: "Active" },
  ];

  useEffect(() => {
    // Load sample data on component mount
    setRubrics(sampleRubrics);
    setActiveRubric(sampleRubrics[0]);
  }, []);

  const handleAddRubric = () => {
    if (!newRubric.name || !newRubric.criteria) return;

    const newRubricObj = {
      id: rubrics.length + 1,
      name: newRubric.name,
      criteria: newRubric.criteria,
      scoreRange: newRubric.scoreRange,
      weight: `${newRubric.weight}%`,
      description: newRubric.description,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: "Active"
    };

    setRubrics([...rubrics, newRubricObj]);
    setNewRubric({
      name: "",
      criteria: "",
      scoreRange: "1-10",
      weight: "20",
      description: ""
    });
  };

  const handleEditRubric = (id: number) => {
    const rubric = rubrics.find(r => r.id === id);
    if (rubric) {
      setActiveRubric(rubric);
    }
  };

  const handleDeleteRubric = (id: number) => {
    setRubrics(rubrics.filter(r => r.id !== id));
    if (activeRubric && activeRubric.id === id) {
      setActiveRubric(rubrics.length > 1 ? rubrics[0] : null);
    }
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
        <h1 className="text-3xl font-bold">Evaluation Rubrics</h1>
        <p className="text-muted-foreground">Manage and customize evaluation rubrics for manuscript reviews</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Rubrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rubrics.length}</div>
            <p className="text-sm text-muted-foreground">Active evaluation criteria</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Avg. Weight</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {rubrics.length > 0
                ? Math.round(rubrics.reduce((sum, r) => sum + parseInt(r.weight), 0) / rubrics.length)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Average rubric weight</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {rubrics.length > 0
                ? new Date(Math.max(...rubrics.map(r => new Date(r.lastUpdated).getTime()))).toLocaleDateString()
                : "N/A"}
            </div>
            <p className="text-sm text-muted-foreground">Most recent modification</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Rubrics</CardTitle>
            <CardDescription>Configure scoring criteria for manuscript evaluations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Rubric Categories</h3>
              <Button onClick={() => setNewRubric({
                name: "",
                criteria: "",
                scoreRange: "1-10",
                weight: "20",
                description: ""
              })}>Add New Rubric</Button>
            </div>

            <ScrollArea className="h-[300px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Score Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rubrics.map((rubric) => (
                    <TableRow key={rubric.id}>
                      <TableCell className="font-medium">{rubric.name}</TableCell>
                      <TableCell>{rubric.weight}</TableCell>
                      <TableCell>{rubric.scoreRange}</TableCell>
                      <TableCell>
                        <Badge variant={rubric.status === "Active" ? "default" : "secondary"}>
                          {rubric.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditRubric(rubric.id)}>Edit</Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteRubric(rubric.id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {newRubric.name === "" && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Add New Rubric</h3>
                <div className="space-y-4">
                  <Input
                    placeholder="Rubric name"
                    value={newRubric.name}
                    onChange={(e) => setNewRubric({...newRubric, name: e.target.value})}
                  />
                  <Textarea
                    placeholder="Criteria description"
                    value={newRubric.criteria}
                    onChange={(e) => setNewRubric({...newRubric, criteria: e.target.value})}
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Score Range</label>
                      <Select value={newRubric.scoreRange} onValueChange={(value) => setNewRubric({...newRubric, scoreRange: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="1-5">1-5</SelectItem>
                          <SelectItem value="Pass/Fail">Pass/Fail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Weight (%)</label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={newRubric.weight}
                        onChange={(e) => setNewRubric({...newRubric, weight: e.target.value})}
                      />
                    </div>
                  </div>
                  <Textarea
                    placeholder="Additional description"
                    value={newRubric.description}
                    onChange={(e) => setNewRubric({...newRubric, description: e.target.value})}
                    rows={2}
                  />
                  <Button onClick={handleAddRubric}>Add Rubric</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rubric Details</CardTitle>
            <CardDescription>Review and edit specific rubric criteria</CardDescription>
          </CardHeader>
          <CardContent>
            {activeRubric ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{activeRubric.name}</h3>
                  <p className="text-muted-foreground">{activeRubric.description}</p>
                </div>

                <div className="space-y-2">
                  <p><span className="font-medium">Criteria:</span> {activeRubric.criteria}</p>
                  <p><span className="font-medium">Score Range:</span> {activeRubric.scoreRange}</p>
                  <p><span className="font-medium">Weight:</span> {activeRubric.weight}</p>
                  <p><span className="font-medium">Status:</span> {activeRubric.status}</p>
                  <p><span className="font-medium">Last Updated:</span> {activeRubric.lastUpdated}</p>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Rubric Scoring Guidelines</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>10 - Exceptional</span>
                      <span>Outstanding performance, exceeds expectations</span>
                    </div>
                    <div className="flex justify-between">
                      <span>8-9 - Proficient</span>
                      <span>Strong performance, meets expectations</span>
                    </div>
                    <div className="flex justify-between">
                      <span>6-7 - Satisfactory</span>
                      <span>Adequate performance, basic requirements met</span>
                    </div>
                    <div className="flex justify-between">
                      <span>4-5 - Developing</span>
                      <span>Below expectations, needs improvement</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1-3 - Beginning</span>
                      <span>Significant improvement needed</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p>Select a rubric to view details</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Complete Rubric Criteria</CardTitle>
          <CardDescription>Detailed breakdown of all evaluation criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            <div className="space-y-4">
              {rubrics.map((rubric) => (
                <div key={rubric.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{rubric.name} <span className="text-muted-foreground text-sm">({rubric.weight})</span></h3>
                    <Badge variant={rubric.status === "Active" ? "default" : "secondary"}>{rubric.status}</Badge>
                  </div>
                  <p className="text-sm mt-1">{rubric.criteria}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Last updated: {rubric.lastUpdated} | Score Range: {rubric.scoreRange}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}