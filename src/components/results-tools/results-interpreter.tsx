"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Wand2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "../auth-provider";

type InputField = {
  name: string;
  label: string;
  placeholder: string;
};

type TestConfig = {
  [key: string]: {
    label: string;
    inputs: InputField[];
  };
};

const testConfig: TestConfig = {
  "pearson-correlation": {
    label: "Pearson Correlation",
    inputs: [
      { name: "r", label: "Correlation (r)", placeholder: "e.g., 0.54" },
      { name: "n", label: "Sample Size (N)", placeholder: "e.g., 50" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.001" },
    ],
  },
  "spearman-correlation": {
    label: "Spearman Rank Correlation",
    inputs: [
      { name: "rho", label: "Spearman's rho (ρ)", placeholder: "e.g., 0.61" },
      { name: "n", label: "Sample Size (N)", placeholder: "e.g., 50" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.001" },
    ],
  },
  "independent-t-test": {
    label: "Independent Samples T-test",
    inputs: [
      { name: "t", label: "t-statistic", placeholder: "e.g., 2.34" },
      { name: "df", label: "Degrees of Freedom (df)", placeholder: "e.g., 48" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.021" },
    ],
  },
  "paired-t-test": {
    label: "Paired Samples T-test",
    inputs: [
      { name: "t", label: "t-statistic", placeholder: "e.g., 3.12" },
      { name: "df", label: "Degrees of Freedom (df)", placeholder: "e.g., 29" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.004" },
    ],
  },
  "one-sample-t-test": {
    label: "One-sample T-test",
    inputs: [
      { name: "t", label: "t-statistic", placeholder: "e.g., 2.89" },
      { name: "df", label: "Degrees of Freedom (df)", placeholder: "e.g., 25" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.008" },
      { name: "known_mean", label: "Known Mean (μ)", placeholder: "e.g., 50" },
    ],
  },
  "anova": {
    label: "ANOVA",
    inputs: [
      { name: "F", label: "F-statistic", placeholder: "e.g., 4.51" },
      { name: "df1", label: "df (between-groups)", placeholder: "e.g., 2" },
      { name: "df2", label: "df (within-groups)", placeholder: "e.g., 87" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.014" },
    ],
  },
  "kruskal-wallis": {
    label: "Kruskal–Wallis Test",
    inputs: [
      { name: "H", label: "H-statistic (or χ²)", placeholder: "e.g., 7.82" },
      { name: "df", label: "Degrees of Freedom (df)", placeholder: "e.g., 2" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.020" },
    ],
  },
  "mann-whitney": {
    label: "Mann-Whitney U Test",
    inputs: [
      { name: "U", label: "U-statistic", placeholder: "e.g., 123.5" },
      { name: "n1", label: "Sample Size (n1)", placeholder: "e.g., 20" },
      { name: "n2", label: "Sample Size (n2)", placeholder: "e.g., 22" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.031" },
    ],
  },
  "wilcoxon": {
    label: "Wilcoxon Signed-rank Test",
    inputs: [
      { name: "Z", label: "Z-statistic", placeholder: "e.g., -2.54" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.011" },
    ],
  },
  "chi-square": {
    label: "Chi-Square Test",
    inputs: [
      { name: "chi2", label: "Chi-Square (χ²)", placeholder: "e.g., 9.21" },
      { name: "df", label: "Degrees of Freedom (df)", placeholder: "e.g., 1" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.002" },
    ],
  },
  "fishers-exact": {
    label: "Fisher’s Exact Test",
    inputs: [
      { name: "p", label: "p-value", placeholder: "e.g., 0.045" },
    ],
  },
  "regression": {
    label: "Regression Analysis",
    inputs: [
      { name: "R2", label: "R-squared (R²)", placeholder: "e.g., 0.35" },
      { name: "F", label: "F-statistic", placeholder: "e.g., 5.12" },
      { name: "df1", label: "df (regression)", placeholder: "e.g., 2" },
      { name: "df2", label: "df (residual)", placeholder: "e.g., 97" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.008" },
    ],
  },
  "z-test": {
    label: "Z-test",
    inputs: [
      { name: "Z", label: "Z-statistic", placeholder: "e.g., 2.58" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.010" },
    ],
  },
  "mcnemar": {
    label: "McNemar’s Test",
    inputs: [
      { name: "chi2", label: "Chi-Square (χ²)", placeholder: "e.g., 5.44" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.020" },
    ],
  },
};

const testOrder = [
  "pearson-correlation", "spearman-correlation", "independent-t-test", "paired-t-test",
  "one-sample-t-test", "anova", "kruskal-wallis", "mann-whitney", "wilcoxon",
  "chi-square", "fishers-exact", "regression", "z-test", "mcnemar"
];

export function ResultsInterpreter() {
  const { session } = useAuth();
  const [testType, setTestType] = useState("pearson-correlation");
  const [values, setValues] = useState<Record<string, string>>({});
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setValues({});
    setInterpretation("");
  }, [testType]);

  const currentTest = useMemo(() => testConfig[testType], [testType]);

  const handleInputChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const generateInterpretation = async () => {
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }
    setIsLoading(true);
    setInterpretation("");
    try {
      const pValue = parseFloat(values.p || "1");
      const isSignificant = pValue < 0.05;

      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/interpret-results",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({
            testLabel: currentTest.label,
            values,
            isSignificant,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setInterpretation(data.interpretation);
      toast.success("Interpretation generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate interpretation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!interpretation) return;
    navigator.clipboard.writeText(interpretation);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Statistical Test</Label>
        <Select value={testType} onValueChange={setTestType}>
          <SelectTrigger>
            <SelectValue placeholder="Select a test" />
          </SelectTrigger>
          <SelectContent>
            {testOrder.map(key => (
              <SelectItem key={key} value={key}>{testConfig[key].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentTest.inputs.map(input => (
          <div key={input.name} className="space-y-2">
            <Label htmlFor={input.name}>{input.label}</Label>
            <Input id={input.name} placeholder={input.placeholder} value={values[input.name] || ""} onChange={(e) => handleInputChange(input.name, e.target.value)} />
          </div>
        ))}
      </div>

      <Button onClick={generateInterpretation} disabled={isLoading}>
        <Wand2 className="w-4 h-4 mr-2" /> {isLoading ? "Generating..." : "Generate Interpretation"}
      </Button>

      {interpretation && (
        <div className="relative">
          <Textarea value={interpretation} readOnly rows={4} />
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
    </div>
  );
}