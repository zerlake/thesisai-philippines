"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Loader2, Play, Info } from "lucide-react";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";

interface StatisticalAnalysisPanelProps {
  uploadedData: Record<string, any>[];
  columns: string[];
  setAnalysisResults: (results: AnalysisResult | null) => void;
  analysisResults: AnalysisResult | null;
}

export type AnalysisResult = {
  test: string;
  statistic: string;
  p_value: number;
  interpretation: string;
  details: Record<string, any>;
};

const availableTests = [
  { id: "independent-t-test", name: "Independent Samples T-test" },
  { id: "pearson-correlation", name: "Pearson Correlation" },
  { id: "chi-square", name: "Chi-Square Test" },
  // Add more tests as needed
];

export function StatisticalAnalysisPanel({ uploadedData, columns, setAnalysisResults, analysisResults }: StatisticalAnalysisPanelProps) {
  const { session, supabase } = useAuth();
  const [selectedIV, setSelectedIV] = useState<string | null>(null);
  const [selectedDV, setSelectedDV] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  useEffect(() => {
    if (columns.length > 0) {
      setSelectedIV(columns[0]);
      if (columns.length > 1) {
        setSelectedDV(columns[1]);
      }
    }
  }, [columns]);

  const runAnalysis = async () => {
    if (!selectedIV || !selectedDV || !selectedTest || uploadedData.length === 0) {
      toast.error("Please select variables and a test, and ensure data is uploaded.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to run an analysis.");
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisResults(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('run-statistical-analysis', {
        body: {
          data: uploadedData,
          iv: selectedIV,
          dv: selectedDV,
          testType: selectedTest,
        }
      });

      if (functionError) throw new Error(functionError.message);
      if (data.error) throw new Error(data.error);

      setAnalysisResults(data);
      toast.success("Analysis complete!");

    } catch (err: any) {
      toast.error(err.message || "Failed to run analysis.");
      console.error(err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Point-and-Click Analysis</CardTitle>
        <CardDescription>Select variables and a statistical test to run an analysis on your uploaded data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadedData.length === 0 ? (
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertTitle>No Data Uploaded</AlertTitle>
            <AlertDescription>Please upload a CSV or XLSX file in the &quot;Data Management&quot; tab to begin analysis.</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <h4 className="font-semibold">Data Preview (First 5 Rows)</h4>
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map(col => <TableHead key={col}>{col}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedData.slice(0, 5).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {columns.map(col => <TableCell key={`${rowIndex}-${col}`}>{String(row[col])}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Independent Variable (IV)</Label>
                <Select value={selectedIV || ""} onValueChange={setSelectedIV}>
                  <SelectTrigger><SelectValue placeholder="Select IV" /></SelectTrigger>
                  <SelectContent>
                    {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dependent Variable (DV)</Label>
                <Select value={selectedDV || ""} onValueChange={setSelectedDV}>
                  <SelectTrigger><SelectValue placeholder="Select DV" /></SelectTrigger>
                  <SelectContent>
                    {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Statistical Test</Label>
              <Select value={selectedTest || ""} onValueChange={setSelectedTest}>
                <SelectTrigger><SelectValue placeholder="Select a test" /></SelectTrigger>
                <SelectContent>
                  {availableTests.map(test => <SelectItem key={test.id} value={test.id}>{test.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={runAnalysis} disabled={isLoadingAnalysis || !selectedIV || !selectedDV || !selectedTest} className="w-full">
              {isLoadingAnalysis ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Run Analysis
            </Button>

            {analysisResults && (
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold">Analysis Results: {analysisResults.test}</h3>
                <Alert>
                  <AlertTitle>Key Findings</AlertTitle>
                  <AlertDescription>
                    <p className="font-medium">{analysisResults.interpretation}</p>
                    <p className="mt-2"><strong>Statistic:</strong> {analysisResults.statistic}</p>
                    <p><strong>p-value:</strong> {analysisResults.p_value.toFixed(3)}</p>
                    {Object.entries(analysisResults.details).map(([key, value]) => (
                      <p key={key}><strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {String(value)}</p>
                    ))}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}