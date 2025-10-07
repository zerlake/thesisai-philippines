"use client";

import { useState } from "react";
import { BarChart, Upload, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { StatisticalAnalysisPanel, type AnalysisResult } from "@/components/statistical-analysis-panel";
import { ReportingGenerator } from "@/components/reporting-generator";
import { CommonErrorsDetector } from "@/components/common-errors-detector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartGenerator } from "@/components/results-tools/chart-generator";
import { ResultsInterpreter } from "@/components/results-tools/results-interpreter";
import { StatisticalTestAdvisor } from "@/components/methodology-tools/statistical-test-advisor";
import { SampleSizeCalculator } from "@/components/methodology-tools/sample-size-calculator";
import { PowerAnalysisCalculator } from "@/components/methodology-tools/power-analysis-calculator";
import { KappaCalculator } from "@/components/results-tools/kappa-calculator";
import { DescriptiveStatisticsPanel } from "@/components/descriptive-statistics-panel"; // Import the new component

export default function StatisticalAnalysisPage() {
  const [uploadedData, setUploadedData] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (json.length === 0) {
          toast.error("Uploaded file is empty or could not be parsed.");
          setUploadedData([]);
          setColumns([]);
          return;
        }

        const parsedColumns = Object.keys(json[0] as Record<string, any>);
        setColumns(parsedColumns);
        setUploadedData(json as Record<string, any>[]);
        toast.success("File uploaded and parsed successfully!");
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error("Failed to parse file. Please ensure it's a valid CSV or XLSX.");
        setUploadedData([]);
        setColumns([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart className="w-8 h-8 text-primary" />
          Statistical Analysis & Tools
        </h1>
        <p className="text-muted-foreground">
          Your comprehensive hub for data management, statistical analysis, and visualization.
        </p>
      </div>

      <Tabs defaultValue="data-management">
        <TabsList className="grid w-full grid-cols-5"> {/* Adjusted grid-cols to 5 */}
          <TabsTrigger value="data-management">Data Management</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="tools">Other Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="data-management" className="mt-4 space-y-6"> {/* Added space-y-6 here */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Data</CardTitle>
              <CardDescription>Upload CSV or XLSX files for analysis.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="data-file">Data File (CSV or XLSX)</Label>
                <Input id="data-file" type="file" accept=".csv, .xlsx" onChange={handleFileUpload} />
                {fileName && <p className="text-sm text-muted-foreground">Uploaded: {fileName}</p>}
              </div>
              {uploadedData.length > 0 && (
                <Alert variant="info">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Data Loaded</AlertTitle>
                  <AlertDescription>
                    {uploadedData.length} rows and {columns.length} columns loaded. You can now proceed to the &quot;Analysis&quot; tab.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          <DescriptiveStatisticsPanel uploadedData={uploadedData} columns={columns} /> {/* New component here */}
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <div className="space-y-6">
            <StatisticalAnalysisPanel 
              uploadedData={uploadedData} 
              columns={columns} 
              setAnalysisResults={setAnalysisResults} 
              analysisResults={analysisResults} 
            />
            <ReportingGenerator analysisResults={analysisResults} />
            <CommonErrorsDetector analysisResults={analysisResults} />
          </div>
        </TabsContent>

        <TabsContent value="visualization" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Data Visualization</CardTitle>
              <CardDescription>Generate charts from your data.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartGenerator uploadedData={uploadedData} columns={columns} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistical Test Recommender</CardTitle>
              <CardDescription>Find the most appropriate statistical test for your research.</CardDescription>
            </CardHeader>
            <CardContent>
              <StatisticalTestAdvisor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Results Interpreter</CardTitle>
                <CardDescription>Input your statistical test results to generate a plain-language interpretation.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResultsInterpreter />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sample Size & Power Calculator</CardTitle>
                <CardDescription>Determine the required sample size for your study.</CardDescription>
              </CardHeader>
              <CardContent>
                <PowerAnalysisCalculator />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Kappa Calculator</CardTitle>
                <CardDescription>Assess inter-rater reliability for two raters on a target.</CardDescription>
              </CardHeader>
              <CardContent>
                <KappaCalculator />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}