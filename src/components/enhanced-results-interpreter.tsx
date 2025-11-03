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
import { Copy, Wand2, Languages, GraduationCap, User, Globe, CheckCircle, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "./auth-provider";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

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

type InterpretationLevel = "beginner" | "intermediate" | "advanced" | "academic";

type PlainLanguageTranslation = {
  beginner: string;
  intermediate: string;
  advanced: string;
  academic: string;
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
  anova: {
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
  wilcoxon: {
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
    inputs: [{ name: "p", label: "p-value", placeholder: "e.g., 0.045" }],
  },
  regression: {
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
  mcnemar: {
    label: "McNemar’s Test",
    inputs: [
      { name: "chi2", label: "Chi-Square (χ²)", placeholder: "e.g., 5.44" },
      { name: "p", label: "p-value", placeholder: "e.g., 0.020" },
    ],
  },
};

const testOrder = [
  "pearson-correlation",
  "spearman-correlation",
  "independent-t-test",
  "paired-t-test",
  "one-sample-t-test",
  "anova",
  "kruskal-wallis",
  "mann-whitney",
  "wilcoxon",
  "chi-square",
  "fishers-exact",
  "regression",
  "z-test",
  "mcnemar",
];

export function EnhancedResultsInterpreter() {
  const { session } = useAuth();
  const [testType, setTestType] = useState("pearson-correlation");
  const [values, setValues] = useState<Record<string, string>>({});
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [plainLanguageTranslations, setPlainLanguageTranslations] = useState<PlainLanguageTranslation | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<InterpretationLevel>("beginner");
  const [includeContext, setIncludeContext] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);

  useEffect(() => {
    setValues({});
    setInterpretation("");
    setPlainLanguageTranslations(null);
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
    setPlainLanguageTranslations(null);
    
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
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify({
            testLabel: currentTest.label,
            values,
            isSignificant,
            interpretationLevel: selectedLevel,
            includeContext,
            includeExamples,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setInterpretation(data.interpretation);
      
      // Generate mock plain language translations for different levels
      // In a real implementation, this would come from the API
      const mockTranslations: PlainLanguageTranslation = {
        beginner: `Your ${currentTest.label} shows ${isSignificant ? 'a meaningful' : 'no meaningful'} relationship between your variables. ${isSignificant ? 'This means the variables are connected in a way that probably isn\'t just random chance.' : 'This suggests the variables don\'t seem to be strongly connected.'}`,
        intermediate: `The ${currentTest.label} indicates ${isSignificant ? 'a statistically significant' : 'no statistically significant'} association. ${isSignificant ? 'With a p-value of ${pValue.toFixed(3)}, there is less than a 5% chance this result happened randomly.' : 'The p-value of ${pValue.toFixed(3)} suggests this could reasonably be explained by random variation.'}`,
        advanced: `Results from the ${currentTest.label} reveal ${isSignificant ? 'a significant' : 'an insignificant'} effect at α = 0.05. ${values.p ? `The observed p-value (${parseFloat(values.p).toFixed(3)}) falls ${isSignificant ? 'below' : 'above'} the significance threshold.` : ''} ${isSignificant ? 'Reject the null hypothesis in favor of the alternative.' : 'Fail to reject the null hypothesis.'}`,
        academic: `The ${currentTest.label} yielded ${isSignificant ? 'significant' : 'insignificant'} results ${values.p ? `(p = ${parseFloat(values.p).toFixed(3)})` : ''}, ${isSignificant ? 'indicating rejection of H₀ at the predetermined α level.' : 'suggesting insufficient evidence to reject H₀.'} ${isSignificant ? 'These findings support the research hypothesis.' : 'These findings do not support the research hypothesis.'}`
      };
      
      setPlainLanguageTranslations(mockTranslations);
      toast.success("Interpretation generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate interpretation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getLevelIcon = (level: InterpretationLevel) => {
    switch (level) {
      case "beginner": return <User className="w-4 h-4" />;
      case "intermediate": return <GraduationCap className="w-4 h-4" />;
      case "advanced": return <Languages className="w-4 h-4" />;
      case "academic": return <Globe className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getLevelDescription = (level: InterpretationLevel) => {
    switch (level) {
      case "beginner": return "Simple explanations for those new to statistics";
      case "intermediate": return "Clear explanations with some technical terms";
      case "advanced": return "Detailed explanations with statistical terminology";
      case "academic": return "Formal academic language for research papers";
      default: return "Simple explanations";
    }
  };

  return 
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Enhanced Results Interpreter
          </CardTitle>
          <CardDescription>
            Translate complex statistical results into clear, understandable language for any audience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Statistical Test</Label>
            <Select value={testType} onValueChange={setTestType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a test" />
              </SelectTrigger>
              <SelectContent>
                {testOrder.map((key) => (
                  <SelectItem key={key} value={key}>
                    {testConfig[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTest.inputs.map((input) => (
              <div key={input.name} className="space-y-2">
                <Label htmlFor={input.name}>{input.label}</Label>
                <Input
                  id={input.name}
                  placeholder={input.placeholder}
                  value={values[input.name] || ""}
                  onChange={(e) => handleInputChange(input.name, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Interpretation Level</Label>
              <Tabs value={selectedLevel} onValueChange={(value) => setSelectedLevel(value as InterpretationLevel)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="beginner" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Beginner</span>
                  </TabsTrigger>
                  <TabsTrigger value="intermediate" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span className="hidden sm:inline">Intermediate</span>
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    <span className="hidden sm:inline">Advanced</span>
                  </TabsTrigger>
                  <TabsTrigger value="academic" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="hidden sm:inline">Academic</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-sm text-muted-foreground">
                {getLevelDescription(selectedLevel)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-context"
                  checked={includeContext}
                  onCheckedChange={setIncludeContext}
                />
                <Label htmlFor="include-context">Include Context</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-examples"
                  checked={includeExamples}
                  onCheckedChange={setIncludeExamples}
                />
                <Label htmlFor="include-examples">Include Examples</Label>
              </div>
            </div>
          </div>

          <Button onClick={generateInterpretation} disabled={isLoading} className="w-full">
            <Wand2 className="w-4 h-4 mr-2" />
            {isLoading ? "Generating Interpretation..." : "Generate Plain Language Interpretation"}
          </Button>
        </CardContent>
      </Card>

      {/* Plain Language Translations */}
      {plainLanguageTranslations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Plain Language Translations
            </CardTitle>
            <CardDescription>
              Understand your results at different levels of complexity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="beginner">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="beginner" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Beginner
                </TabsTrigger>
                <TabsTrigger value="intermediate" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Intermediate
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  Advanced
                </TabsTrigger>
                <TabsTrigger value="academic" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Academic
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="beginner" className="mt-4">
                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          Beginner Explanation
                        </h4>
                        <p className="text-sm">{plainLanguageTranslations.beginner}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopyToClipboard(plainLanguageTranslations.beginner)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="intermediate" className="mt-4">
                <Card className="bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <GraduationCap className="w-4 h-4" />
                          Intermediate Explanation
                        </h4>
                        <p className="text-sm">{plainLanguageTranslations.intermediate}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopyToClipboard(plainLanguageTranslations.intermediate)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="advanced" className="mt-4">
                <Card className="bg-purple-50 dark:bg-purple-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Languages className="w-4 h-4" />
                          Advanced Explanation
                        </h4>
                        <p className="text-sm">{plainLanguageTranslations.advanced}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopyToClipboard(plainLanguageTranslations.advanced)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="academic" className="mt-4">
                <Card className="bg-orange-50 dark:bg-orange-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4" />
                          Academic Explanation
                        </h4>
                        <p className="text-sm">{plainLanguageTranslations.academic}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopyToClipboard(plainLanguageTranslations.academic)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Original Interpretation */}
      {interpretation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Technical Interpretation
            </CardTitle>
            <CardDescription>
              Detailed statistical interpretation of your results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Textarea value={interpretation} readOnly rows={6} />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => handleCopyToClipboard(interpretation)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interpretation Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Interpretation Guide
          </CardTitle>
          <CardDescription>
            Understanding statistical results for different audiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="beginner-audience">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Beginner Audience (Friends & Family)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>When explaining to beginners, focus on the big picture:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Use everyday language instead of statistical terms</li>
                    <li>Explain what the result means in practical terms</li>
                    <li>Use analogies and real-life examples</li>
                    <li>Avoid jargon like "p-value" or "statistical significance"</li>
                    <li>Focus on whether the finding matters in real life</li>
                  </ul>
                  <p className="mt-2"><strong>Example:</strong> "We found that people who exercise regularly tend to be happier. This means staying active might help boost your mood!"</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="intermediate-audience">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Intermediate Audience (Classmates & Colleagues)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>For intermediate audiences, balance clarity with technical detail:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Include some statistical terminology with explanations</li>
                    <li>Explain the meaning and importance of key statistics</li>
                    <li>Connect results to research questions or hypotheses</li>
                    <li>Address practical significance, not just statistical significance</li>
                    <li>Compare findings to previous research when relevant</li>
                  </ul>
                  <p className="mt-2"><strong>Example:</strong> {"\"Our correlation analysis showed a moderate positive relationship (r = 0.45) between exercise frequency and happiness scores. This suggests that as exercise increases, happiness tends to increase as well, and this relationship is statistically significant (p < 0.05).\""}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="advanced-audience">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  <span>Advanced Audience (Advisors & Committee Members)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>For advanced audiences, provide comprehensive technical details:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Use precise statistical terminology appropriately</li>
                    <li>Include effect sizes and confidence intervals</li>
                    <li>Address assumptions and limitations of the analysis</li>
                    <li>Discuss implications for theory and future research</li>
                    <li>Reference relevant literature to support interpretations</li>
                    <li>Explain methodological choices and their rationale</li>
                  </ul>
                  <p className="mt-2"><strong>Example:</strong> {"\"The independent samples t-test revealed a significant difference in happiness scores between exercisers (M = 7.2, SD = 1.4) and non-exercisers (M = 5.8, SD = 1.7), t(78) = 3.82, p < 0.001, d = 0.85. This large effect size indicates a meaningful practical difference, though potential confounding variables should be considered.\""}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="academic-audience">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Academic Audience (Publishers & Researchers)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <p>For academic audiences, maintain formal precision and scholarly standards:</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Follow APA or discipline-specific reporting standards</li>
                    <li>Include all relevant statistics and effect sizes</li>
                    <li>Address theoretical and methodological implications</li>
                    <li>Connect findings to broader literature and research gaps</li>
                    <li>Acknowledge limitations and alternative explanations</li>
                    <li>Provide specific recommendations for future research</li>
                  </ul>
                  <p className="mt-2"><strong>Example:</strong> "These findings indicate a significant positive association between physical activity frequency and subjective well-being, r(48) = .45, p = .001, 95% CI [.21, .64]. This moderate effect supports prior research (Smith et al., 2020) and suggests that interventions promoting physical activity may enhance psychological well-being. Future research should examine potential mediators of this relationship and test the efficacy of targeted interventions in diverse populations."</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Interpretation Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Do's
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Always report effect sizes alongside p-values</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Explain what your results mean in practical terms</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Acknowledge the limitations of your study</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Compare your findings to previous research</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Distinguish between statistical and practical significance</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Don'ts
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Never claim causation from correlational data</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Don't ignore effect sizes and focus only on p-values</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Avoid making claims beyond what your data supports</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Don't oversimplify complex statistical concepts</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Never cherry-pick results that support your hypothesis</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}