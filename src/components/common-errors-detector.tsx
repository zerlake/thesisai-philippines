"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface CommonErrorsDetectorProps {
  analysisResults: {
    test: string;
    statistic: string;
    p_value: number;
    interpretation: string;
    details: Record<string, any>;
  } | null;
}

export function CommonErrorsDetector({ analysisResults }: CommonErrorsDetectorProps) {
  const errors: string[] = [];

  if (analysisResults) {
    if (analysisResults.p_value > 0.05) {
      errors.push("Non-significant result: Consider discussing potential reasons (e.g., small sample size, weak effect) or exploring alternative analyses if appropriate.");
    }
    // Example of a more specific check (requires more detailed 'details' in analysisResults)
    if (analysisResults.test === "Pearson Correlation" && analysisResults.details?.correlation_coefficient && Math.abs(analysisResults.details.correlation_coefficient) < 0.1 && analysisResults.p_value < 0.05) {
      errors.push("Small effect size with significant p-value: While statistically significant, the practical significance of a very weak correlation should be carefully considered.");
    }
    // Add more rules here based on common statistical pitfalls
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Common Errors Detector</CardTitle>
        <CardDescription>Identifies potential pitfalls in your statistical analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        {analysisResults ? (
          errors.length > 0 ? (
            <div className="space-y-3">
              {errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>No obvious errors detected!</AlertTitle>
              <AlertDescription>Your analysis appears to be sound based on common pitfalls. Always consult your advisor for expert review.</AlertDescription>
            </Alert>
          )
        ) : (
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertTitle>Run an analysis first</AlertTitle>
            <AlertDescription>Perform a statistical analysis to check for common errors.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}