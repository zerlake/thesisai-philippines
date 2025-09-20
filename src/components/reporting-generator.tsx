"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Copy, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "./ui/label";

interface ReportingGeneratorProps {
  analysisResults: {
    test: string;
    statistic: string;
    p_value: number;
    interpretation: string;
    details: Record<string, any>;
  } | null;
}

const reportTemplates = {
  "apa-7th": {
    name: "APA 7th Edition",
    generate: (results: any) => {
      if (!results) return "No analysis results to report.";
      const pValueText = results.p_value < 0.001 ? "p < .001" : `p = ${results.p_value.toFixed(3)}`;
      let report = `\n\n**Results**\n\n`;
      report += `A ${results.test} was conducted. The results indicated ${results.interpretation.replace(/(\(.*\))/, `(${results.statistic}, ${pValueText})`)}.`;
      
      if (results.details) {
        report += ` Further details: `;
        report += Object.entries(results.details).map(([key, value]) => 
          `${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} = ${String(value)}`
        ).join(', ');
        report += `.`;
      }
      return report;
    },
  },
  "harvard": {
    name: "Harvard Style",
    generate: (results: any) => {
      if (!results) return "No analysis results to report.";
      const pValueText = results.p_value < 0.001 ? "p < 0.001" : `p = ${results.p_value.toFixed(3)}`;
      let report = `\n\n**Findings**\n\n`;
      report += `The application of a ${results.test} demonstrated that ${results.interpretation.replace(/(\(.*\))/, `(${results.statistic}, ${pValueText})`)}.`;
      
      if (results.details) {
        report += ` Additional data showed: `;
        report += Object.entries(results.details).map(([key, value]) => 
          `${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} = ${String(value)}`
        ).join('; ');
        report += `.`;
      }
      return report;
    },
  },
};

export function ReportingGenerator({ analysisResults }: ReportingGeneratorProps) {
  const [selectedStyle, setSelectedStyle] = useState<keyof typeof reportTemplates>("apa-7th");
  const [generatedReport, setGeneratedReport] = useState("");

  useEffect(() => {
    if (analysisResults) {
      setGeneratedReport(reportTemplates[selectedStyle].generate(analysisResults));
    } else {
      setGeneratedReport("");
    }
  }, [analysisResults, selectedStyle]);

  const handleGenerateReport = () => {
    if (!analysisResults) {
      toast.error("Run an analysis first to generate a report.");
      return;
    }
    setGeneratedReport(reportTemplates[selectedStyle].generate(analysisResults));
    toast.success("Report generated!");
  };

  const handleCopyToClipboard = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
    toast.success("Report copied to clipboard!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reporting Generator</CardTitle>
        <CardDescription>Generate a formatted report of your analysis results.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Reporting Style</Label>
          <Select value={selectedStyle} onValueChange={(value) => setSelectedStyle(value as keyof typeof reportTemplates)}>
            <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
            <SelectContent>
              {Object.entries(reportTemplates).map(([key, template]) => (
                <SelectItem key={key} value={key}>{template.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerateReport} disabled={!analysisResults} className="w-full">
          <Wand2 className="w-4 h-4 mr-2" /> Generate Report
        </Button>
        {generatedReport && (
          <div className="relative">
            <Textarea value={generatedReport} readOnly rows={8} className="font-mono" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleCopyToClipboard}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}