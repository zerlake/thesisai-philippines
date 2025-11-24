"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { secureRandom } from "@/lib/crypto-utils";
import { 
  BarChart3, 
  Bot, 
  Upload, 
  Calculator, 
  FileSpreadsheet,
  TrendingUp,
  Info,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { useContext7 } from "@/contexts/context7-provider";

interface StatisticalAnalysisState {
  dataset: any[][] | null;
  selectedTest: string;
  variable1: string;
  variable2: string;
  results: any;
  documentation: string;
  isAnalyzing: boolean;
  isFetchingDocs: boolean;
}

interface Context7StatisticalAnalysisProps {
  className?: string;
}

export function Context7StatisticalAnalysis({ className }: Context7StatisticalAnalysisProps) {
  const { getDocumentation } = useContext7();
  const [state, setState] = useState<StatisticalAnalysisState>({
    dataset: null,
    selectedTest: "t-test",
    variable1: "",
    variable2: "",
    results: null,
    documentation: "",
    isAnalyzing: false,
    isFetchingDocs: false,
  });

  const [sampleDatasets] = useState([
    { name: "Student Performance Data", id: "perf-1" },
    { name: "Survey Responses", id: "survey-1" },
    { name: "Research Variables", id: "research-1" },
  ]);

  // Function to fetch statistical documentation from Context7
  const fetchStatisticalDocs = React.useCallback(async (testType: string) => {
    try {
      setState(prev => ({ ...prev, isFetchingDocs: true }));
      
      const docs = await getDocumentation(`statistical test ${testType} guide`, "statistics");
      
      if (docs.length > 0) {
        setState(prev => ({
          ...prev,
          documentation: docs[0].content,
        }));
      } else {
        setState(prev => ({
          ...prev,
          documentation: `Context7 documentation for "${testType}" would be available here. This would include:
- When to use this test
- Assumptions of the test
- How to interpret results
- Example implementations
- Common pitfalls to avoid

In a full implementation, Context7 would fetch real-time statistical documentation from the official sources based on your current analysis context.`
        }));
      }
    } catch (error) {
      console.error("Error fetching statistical documentation:", error);
      setState(prev => ({
        ...prev,
        documentation: "Failed to fetch documentation from Context7. Please check your connection."
      }));
    } finally {
      setState(prev => ({ ...prev, isFetchingDocs: false }));
    }
    }, [getDocumentation]);

  // Update documentation when test selection changes
  React.useEffect(() => {
    if (state.selectedTest) {
      fetchStatisticalDocs(state.selectedTest);
    }
  }, [state.selectedTest, fetchStatisticalDocs]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // Simulate reading the file data
          const _content = e.target?.result as string;
          // In a real implementation, we would parse the CSV/Excel file
          const mockDataset = [
            ["Variable A", "Variable B"],
            [1, 2],
            [2, 4],
            [3, 6],
            [4, 8]
          ];
          
          setState(prev => ({
            ...prev,
            dataset: mockDataset,
            results: null
          }));
          
          toast.success("Dataset loaded successfully");
        } catch (error) {
          console.error("Error parsing file:", error);
          toast.error("Failed to parse the file");
        }
      };
      
      reader.readAsText(file);
    }
  };

  const runStatisticalAnalysis = async () => {
    if (!state.dataset) {
      toast.error("Please upload a dataset first");
      return;
    }
    
    if (!state.variable1 || (!state.variable2 && state.selectedTest !== "descriptive")) {
      toast.error("Please select the required variables");
      return;
    }
    
    setState(prev => ({ ...prev, isAnalyzing: true }));
    
    try {
      // Simulate statistical analysis
      // In a real implementation, this would call statistical functions
      // and potentially use Context7 for result interpretation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock analysis results that incorporate Context7 guidance
      const mockResults = {
        test: state.selectedTest,
        variables: [state.variable1, state.variable2],
        pValue: secureRandom() * 0.1, // Simulate significance
        coefficient: secureRandom() * 2 - 1, // Simulate correlation
        interpretation: `Based on the ${state.selectedTest} results, the p-value indicates statistical significance at the 0.05 level. This suggests a meaningful relationship between the variables. Context7 documentation recommends considering effect size and practical significance in addition to statistical significance.`,
        context7Guidance: `According to Context7 statistical documentation: 
- ${state.selectedTest === 't-test' ? 'A t-test compares means between two groups' : 
  state.selectedTest === 'correlation' ? 'Correlation measures the strength of linear relationship' : 
  state.selectedTest === 'chi-square' ? 'Chi-square tests association in categorical variables' : 
  'Descriptive statistics summarize your data'}
- Check assumptions before interpreting results
- Report effect size alongside p-values`
      };
      
      setState(prev => ({
        ...prev,
        results: mockResults
      }));
      
      toast.success("Analysis completed with Context7 guidance!");
    } catch (error) {
      console.error("Error running analysis:", error);
      toast.error("Failed to run statistical analysis");
    } finally {
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  // Get available variables from the dataset
  const variables = state.dataset && state.dataset.length > 0 
    ? state.dataset[0].map((_, index) => ({ 
        id: index.toString(), 
        name: state.dataset![0][index]?.toString() || `Variable ${index + 1}` 
      })) 
    : [];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Context7 Statistical Analysis
            </CardTitle>
            <CardDescription>
              Perform statistical analysis with real-time statistical documentation from Context7
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bot className="h-3 w-3" />
            MCP Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Dataset
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="text-sm"
                    />
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label>Sample Datasets</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {sampleDatasets.map(dataset => (
                        <Button
                          key={dataset.id}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Load sample dataset
                            const mockDataset = [
                              ["Variable A", "Variable B"],
                              [1, 2],
                              [2, 4],
                              [3, 6],
                              [4, 8]
                            ];
                            
                            setState(prev => ({
                              ...prev,
                              dataset: mockDataset,
                              results: null
                            }));
                          }}
                        >
                          {dataset.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {state.dataset && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Preview</h3>
                      <div className="border rounded-md p-2 max-h-40 overflow-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr>
                              {state.dataset[0].map((header, idx) => (
                                <th key={idx} className="border p-1 text-left">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {state.dataset.slice(1, 4).map((row, rowIndex) => (
                              <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="border p-1 text-left">{cell}</td>
                                ))}
                              </tr>
                            ))}
                            {state.dataset.length > 4 && (
                              <tr>
                                <td colSpan={state.dataset[0].length} className="text-center text-sm text-muted-foreground">
                                  ... and {state.dataset.length - 4} more rows
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Analysis Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stat-test">Statistical Test</Label>
                    <Select value={state.selectedTest} onValueChange={(value) => setState(prev => ({ ...prev, selectedTest: value }))}>
                      <SelectTrigger id="stat-test">
                        <SelectValue placeholder="Select a test" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="descriptive">Descriptive Statistics</SelectItem>
                        <SelectItem value="t-test">T-Test</SelectItem>
                        <SelectItem value="correlation">Pearson Correlation</SelectItem>
                        <SelectItem value="chi-square">Chi-Square Test</SelectItem>
                        <SelectItem value="anova">ANOVA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="var1">Variable 1</Label>
                    <Select value={state.variable1} onValueChange={(value) => setState(prev => ({ ...prev, variable1: value }))}>
                      <SelectTrigger id="var1">
                        <SelectValue placeholder="Select variable" />
                      </SelectTrigger>
                      <SelectContent>
                        {variables.map(varObj => (
                          <SelectItem key={varObj.id} value={varObj.id}>
                            {varObj.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {state.selectedTest !== 'descriptive' && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="var2">Variable 2</Label>
                      <Select value={state.variable2} onValueChange={(value) => setState(prev => ({ ...prev, variable2: value }))}>
                        <SelectTrigger id="var2">
                          <SelectValue placeholder="Select variable" />
                        </SelectTrigger>
                        <SelectContent>
                          {variables.map(varObj => (
                            <SelectItem key={varObj.id} value={varObj.id}>
                              {varObj.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="md:col-span-2">
                    <Button 
                      onClick={runStatisticalAnalysis} 
                      disabled={state.isAnalyzing || !state.dataset}
                      className="w-full"
                    >
                      {state.isAnalyzing ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Analyzing with Context7...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Run Analysis with Context7
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {state.results && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">p-value</p>
                        <p className={`text-lg font-semibold ${state.results.pValue < 0.05 ? 'text-green-600' : 'text-red-600'}`}>
                          {state.results.pValue.toFixed(6)}
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">Coefficient</p>
                        <p className="text-lg font-semibold">
                          {state.results.coefficient.toFixed(4)}
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">Test</p>
                        <p className="text-lg font-semibold capitalize">
                          {state.results.test.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4" />
                        Context7 Interpretation
                      </h4>
                      <p className="text-sm">{state.results.interpretation}</p>
                    </div>
                    
                    <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <BookOpen className="h-4 w-4" />
                        Statistical Guidance
                      </h4>
                      <p className="text-sm">{state.results.context7Guidance}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Statistical Documentation
                </CardTitle>
                <CardDescription>
                  Real-time statistical documentation from Context7
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {state.isFetchingDocs ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="h-64 overflow-y-auto p-2 border rounded-md bg-muted/50 text-sm">
                      {state.documentation ? (
                        <div className="whitespace-pre-line">
                          {state.documentation}
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <Bot className="h-8 w-8 mx-auto mb-2 text-muted" />
                            <p>Select a statistical test to get documentation from Context7</p>
                            <p className="text-xs mt-2">Context7 provides real-time, version-specific statistical guidance</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button variant="outline" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Full Docs
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tips for Statistical Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Check assumptions before running tests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Report effect sizes alongside p-values</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Consider practical significance, not just statistical</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>Use Context7 documentation for test interpretation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}