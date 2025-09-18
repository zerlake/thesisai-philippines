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

type InputField = {
  name: string;
  label: string;
  placeholder: string;
};

type TestConfig = {
  [key: string]: {
    label: string;
    inputs: InputField[];
    template: (values: Record<string, string>, isSignificant: boolean) => string;
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
    template: (v, sig) => `A Pearson product-moment correlation was run to determine the relationship between [variable 1] and [variable 2]. There was a ${sig ? "" : "non-"}significant, ${parseFloat(v.r || '0') >= 0 ? "positive" : "negative"} correlation between the two variables, r(${v.n ? parseInt(v.n) - 2 : 'N-2'}) = ${v.r || '[r]'}, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
  },
  "spearman-correlation": {
    label: "Spearman Rank Correlation",
    inputs: [
      { name: "rho", label: "Spearman's rho (ρ)", placeholder: "e.g., 0.61" },
      { name: "n", label: "Sample Size (N)", placeholder: "e.g., 50" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.001" },
    ],
    template: (v, sig) => `A Spearman's rank-order correlation was run to determine the relationship between [variable 1] and [variable 2]. There was a ${sig ? "" : "non-"}significant, ${parseFloat(v.rho || '0') >= 0 ? "positive" : "negative"} correlation between the two variables, rs(${v.n || 'N'}) = ${v.rho || '[rho]'}, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
  },
  "independent-t-test": {
    label: "Independent Samples T-test",
    inputs: [
      { name: "t", label: "t-statistic", placeholder: "e.g., 2.34" },
      { name: "df", label: "Degrees of Freedom (df)", placeholder: "e.g., 48" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.021" },
    ],
    template: (v, sig) => `An independent samples t-test was conducted to compare the [dependent variable] between [group 1] and [group 2]. There was a ${sig ? "significant" : "non-significant"} difference in the scores for [group 1] (M=[mean], SD=[SD]) and [group 2] (M=[mean], SD=[SD]); t(${v.df || '[df]'}) = ${v.t || '[t]'}, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
  },
  "paired-t-test": {
    label: "Paired Samples T-test",
    inputs: [
      { name: "t", label: "t-statistic", placeholder: "e.g., 3.12" },
      { name: "df", label: "Degrees of Freedom (df)", placeholder: "e.g., 29" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.004" },
    ],
    template: (v, sig) => `A paired samples t-test was conducted to compare [e.g., pre-test scores] and [e.g., post-test scores]. There was a ${sig ? "significant" : "non-significant"} difference in the scores for [condition 1] (M=[mean], SD=[SD]) and [condition 2] (M=[mean], SD=[SD]); t(${v.df || '[df]'}) = ${v.t || '[t]'}, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
  },
  "one-sample-t-test": {
    label: "One-sample T-test",
    inputs: [
      { name: "t", label: "t-statistic", placeholder: "e.g., 2.89" },
      { name: "df", label: "Degrees of Freedom (df)", placeholder: "e.g., 25" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.008" },
      { name: "known_mean", label: "Known Mean (μ)", placeholder: "e.g., 50" },
    ],
    template: (v, sig) => `A one-sample t-test was run to determine whether the [e.g., average student score] was different from the known population mean of ${v.known_mean || '[μ]'}. The sample mean (M=[mean], SD=[SD]) was found to be ${sig ? "significantly" : "not significantly"} different from the population mean, t(${v.df || '[df]'}) = ${v.t || '[t]'}, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
  },
  "anova": {
    label: "ANOVA",
    inputs: [
      { name: "F", label: "F-statistic", placeholder: "e.g., 4.51" },
      { name: "df1", label: "df (between-groups)", placeholder: "e.g., 2" },
      { name: "df2", label: "df (within-groups)", placeholder: "e.g., 87" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.014" },
    ],
    template: (v, sig) => `A one-way analysis of variance (ANOVA) was conducted to determine if there were differences in [dependent variable] between [number] groups: ([group 1], [group 2], and [group 3]). The results indicated a ${sig ? "significant" : "non-significant"} effect of [independent variable] on [dependent variable], F(${v.df1 || '[df1]'}, ${v.df2 || '[df2]'}) = ${v.F || '[F]'}, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
  },
  "kruskal-wallis": {
    label: "Kruskal–Wallis Test",
    inputs: [
      { name: "H", label: "H-statistic (or χ²)", placeholder: "e.g., 7.82" },
      { name: "df", label: "Degrees of Freedom (df)", placeholder: "e.g., 2" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.020" },
    ],
    template: (v, sig) => `A Kruskal-Wallis H test showed that there was a ${sig ? "statistically significant" : "non-significant"} difference in [dependent variable] between the different [groups], χ²(${v.df || '[df]'}) = ${v.H || '[H]'}, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
  },
  "mann-whitney": {
    label: "Mann-Whitney U Test",
    inputs: [
      { name: "U", label: "U-statistic", placeholder: "e.g., 123.5" },
      { name: "n1", label: "Sample Size (n1)", placeholder: "e.g., 20" },
      { name: "n2", label: "Sample Size (n2)", placeholder: "e.g., 22" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.031" },
    ],
    template: (v, sig) => `A Mann-Whitney U test was run to determine if there were differences in [dependent variable] between [group 1] and [group 2]. The results indicate that [dependent variable] for [group 1] (Mdn = [median]) and [group 2] (Mdn = [median]) were ${sig ? "statistically significantly" : "not statistically significantly"} different, U = ${v.U || '[U]'}, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
  },
  "wilcoxon": {
    label: "Wilcoxon Signed-rank Test",
    inputs: [
      { name: "Z", label: "Z-statistic", placeholder: "e.g., -2.54" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.011" },
    ],
    template: (v, sig) => `A Wilcoxon signed-rank test showed that the [intervention] elicited a ${sig ? "statistically significant" : "non-significant"} change in [dependent variable], Z = ${v.Z || '[Z]'}, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
  },
  "chi-square": {
    label: "Chi-Square Test",
    inputs: [
      { name: "chi2", label: "Chi-Square (χ²)", placeholder: "e.g., 9.21" },
      { name: "df", label: "Degrees of Freedom (df)", placeholder: "e.g., 1" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.002" },
    ],
    template: (v, sig) => `A chi-square test of independence was performed to examine the relation between [variable 1] and [variable 2]. The relation between these variables was ${sig ? "significant" : "not significant"}, χ²(${v.df || '[df]'}, N = [sample size]) = ${v.chi2 || '[χ²]'}, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
  },
  "fishers-exact": {
    label: "Fisher’s Exact Test",
    inputs: [
      { name: "p", label: "p-value", placeholder: "e.g., 0.045" },
    ],
    template: (v, sig) => `Fisher's exact test was used to determine if there was a significant association between [variable 1] and [variable 2]. The results indicate a ${sig ? "significant" : "non-significant"} association between the variables, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
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
    template: (v, sig) => `A multiple regression was run to predict [dependent variable] from [independent variable 1] and [independent variable 2]. These variables statistically ${sig ? "significantly" : "non-significantly"} predicted [dependent variable], F(${v.df1 || '[df1]'}, ${v.df2 || '[df2]'}) = ${v.F || '[F]'}, p = ${parseFloat(v.p || '1').toFixed(3)}, R² = ${v.R2 || '[R²]'}.`,
  },
  "z-test": {
    label: "Z-test",
    inputs: [
      { name: "Z", label: "Z-statistic", placeholder: "e.g., 2.58" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.010" },
    ],
    template: (v, sig) => `A z-test was used to compare the sample mean to the population mean. The results indicate that the sample mean (M=[mean]) was ${sig ? "significantly" : "not significantly"} different from the population mean (μ=[population mean]), Z = ${v.Z || '[Z]'}, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
  },
  "mcnemar": {
    label: "McNemar’s Test",
    inputs: [
      { name: "chi2", label: "Chi-Square (χ²)", placeholder: "e.g., 5.44" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.020" },
    ],
    template: (v, sig) => `McNemar's test was used to determine if there was a significant change in the proportion of [e.g., 'yes' responses] before and after the [intervention]. The results showed a ${sig ? "statistically significant" : "non-significant"} change in proportions, χ²(1, N = [sample size]) = ${v.chi2 || '[χ²]'}, p = ${parseFloat(v.p || '1').toFixed(3)}.`,
  },
};

const testOrder = [
  "pearson-correlation", "spearman-correlation", "independent-t-test", "paired-t-test",
  "one-sample-t-test", "anova", "kruskal-wallis", "mann-whitney", "wilcoxon",
  "chi-square", "fishers-exact", "regression", "z-test", "mcnemar"
];

export function ResultsInterpreter() {
  const [testType, setTestType] = useState("pearson-correlation");
  const [values, setValues] = useState<Record<string, string>>({});
  const [interpretation, setInterpretation] = useState("");

  useEffect(() => {
    setValues({});
    setInterpretation("");
  }, [testType]);

  const currentTest = useMemo(() => testConfig[testType], [testType]);

  const handleInputChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const generateInterpretation = () => {
    const pValue = parseFloat(values.p || "1");
    const isSignificant = pValue < 0.05;
    const result = currentTest.template(values, isSignificant);
    setInterpretation(result);
    toast.success("Interpretation generated!");
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

      <Button onClick={generateInterpretation}>
        <Wand2 className="w-4 h-4 mr-2" /> Generate Interpretation
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