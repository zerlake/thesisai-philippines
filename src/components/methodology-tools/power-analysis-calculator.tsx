"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Wand2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const powerAnalysisData = {
  't-test': {
    label: 'T-test (Independent Samples)',
    effectMeasure: "Cohen's d",
    effectSizes: { small: 0.2, medium: 0.5, large: 0.8 },
    sampleSizes: { small: 788, medium: 128, large: 52 },
    writeUp: (sizes: any, effects: any) => `A priori power analysis was conducted to determine a sufficient sample size for a two-tailed independent samples t-test. Using an alpha of .05 and a power of .80, the projected sample size needed to detect a small effect size (d = ${effects.small}) is approximately N = ${sizes.small}. To detect a medium effect size (d = ${effects.medium}), N = ${sizes.medium} is required, and for a large effect size (d = ${effects.large}), N = ${sizes.large} is required (Cohen, 1988).`,
  },
  'correlation': {
    label: 'Correlation (Pearson r)',
    effectMeasure: "Correlation coeff. (r)",
    effectSizes: { small: 0.1, medium: 0.3, large: 0.5 },
    sampleSizes: { small: 782, medium: 84, large: 28 },
    writeUp: (sizes: any, effects: any) => `A priori power analysis was conducted to determine a sufficient sample size for a Pearson correlation analysis. Using an alpha of .05 and a power of .80, the projected sample size needed to detect a small effect size (r = ${effects.small}) is approximately N = ${sizes.small}. To detect a medium effect size (r = ${effects.medium}), N = ${sizes.medium} is required, and for a large effect size (r = ${effects.large}), N = ${sizes.large} is required (Cohen, 1988).`,
  },
  'anova-3': {
    label: 'ANOVA (3 Groups)',
    effectMeasure: "Cohen's f",
    effectSizes: { small: 0.1, medium: 0.25, large: 0.4 },
    sampleSizes: { small: 969, medium: 159, large: 66 },
    writeUp: (sizes: any, effects: any) => `A priori power analysis was conducted for a one-way ANOVA with three groups. Using an alpha of .05 and a power of .80, the projected total sample size needed to detect a small effect size (f = ${effects.small}) is approximately N = ${sizes.small}. To detect a medium effect size (f = ${effects.medium}), N = ${sizes.medium} is required, and for a large effect size (f = ${effects.large}), N = ${sizes.large} is required (Cohen, 1988).`,
  },
  'chi-square-1': {
    label: 'Chi-Square (df=1)',
    effectMeasure: "Effect size (w)",
    effectSizes: { small: 0.1, medium: 0.3, large: 0.5 },
    sampleSizes: { small: 785, medium: 88, large: 32 },
    writeUp: (sizes: any, effects: any) => `A priori power analysis was conducted for a chi-square test with one degree of freedom. Using an alpha of .05 and a power of .80, the projected sample size needed to detect a small effect size (w = ${effects.small}) is approximately N = ${sizes.small}. To detect a medium effect size (w = ${effects.medium}), N = ${sizes.medium} is required, and for a large effect size (w = ${effects.large}), N = ${sizes.large} is required (Cohen, 1988).`,
  },
};

export function PowerAnalysisCalculator() {
  const [testType, setTestType] = useState('t-test');
  const [results, setResults] = useState<any>(null);
  const [writeUp, setWriteUp] = useState("");

  const currentTest = useMemo(() => (powerAnalysisData as any)[testType], [testType]);

  const handleCalculate = () => {
    setResults(currentTest);
    setWriteUp(currentTest.writeUp(currentTest.sampleSizes, currentTest.effectSizes));
    toast.success("Sample sizes calculated!");
  };

  const handleCopyToClipboard = () => {
    if (!writeUp) return;
    navigator.clipboard.writeText(writeUp);
    toast.success("Write-up copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-2">
          <Label>Select Statistical Test</Label>
          <Select value={testType} onValueChange={setTestType}>
            <SelectTrigger>
              <SelectValue placeholder="Select a test" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(powerAnalysisData).map(([key, value]) => (
                <SelectItem key={key} value={key}>{(value as any).label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCalculate}>
          <Wand2 className="w-4 h-4 mr-2" /> Calculate
        </Button>
      </div>

      {results && (
        <div className="space-y-4 pt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Effect Size</TableHead>
                    <TableHead>Value ({results.effectMeasure})</TableHead>
                    <TableHead className="text-right">Required Sample Size (N)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Small</TableCell>
                    <TableCell>{results.effectSizes.small}</TableCell>
                    <TableCell className="text-right font-bold">{results.sampleSizes.small}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Medium</TableCell>
                    <TableCell>{results.effectSizes.medium}</TableCell>
                    <TableCell className="text-right font-bold">{results.sampleSizes.medium}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Large</TableCell>
                    <TableCell>{results.effectSizes.large}</TableCell>
                    <TableCell className="text-right font-bold">{results.sampleSizes.large}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="relative">
            <Label className="text-xs font-semibold text-muted-foreground">GENERATED WRITE-UP</Label>
            <Textarea value={writeUp} readOnly rows={5} className="mt-1" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-2"
              onClick={handleCopyToClipboard}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}