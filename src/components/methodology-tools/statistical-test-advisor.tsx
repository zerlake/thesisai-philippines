"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const statisticalTests = {
  "Independent Samples T-test": {
    definition: "Used to compare the means of two independent groups to determine if there is a statistically significant difference between them.",
    assumptions: [
      "Independence of observations.",
      "The dependent variable is approximately normally distributed for each group.",
      "Homogeneity of variances (the variances of the dependent variable are equal across groups).",
    ],
    rationale: "An independent samples t-test will be conducted to compare the mean [Your Dependent Variable, e.g., test scores] between the [Group 1, e.g., experimental group] and the [Group 2, e.g., control group]. This test is appropriate as the two groups are independent of each other."
  },
  "Paired Samples T-test": {
    definition: "Used to compare the means of two related groups (e.g., the same group tested twice) to see if there is a significant difference.",
    assumptions: [
      "The observations are dependent (paired or matched).",
      "The differences between the paired values are approximately normally distributed.",
      "The dependent variable is continuous.",
    ],
    rationale: "A paired samples t-test will be used to determine if there is a significant difference in [Your Dependent Variable, e.g., knowledge level] before and after the [Your Intervention, e.g., training program]. This test is suitable as the data consists of paired observations from the same subjects."
  },
  "ANOVA": {
    definition: "Stands for Analysis of Variance. It's used to compare the means of three or more groups to see if at least one group is different from the others.",
    assumptions: [
      "Independence of observations.",
      "The dependent variable is approximately normally distributed for each group.",
      "Homogeneity of variances across all groups.",
    ],
    rationale: "An Analysis of Variance (ANOVA) will be performed to compare the mean [Your Dependent Variable, e.g., performance scores] across the [Number] groups: [List your groups]. This statistical tool is chosen to determine if there are any statistically significant differences between the means of these groups."
  },
  "Chi-Square Test": {
    definition: "Used to examine the relationship between two categorical variables. It checks if the observed distribution of data differs from what would be expected by chance.",
    assumptions: [
      "The variables are categorical (nominal or ordinal).",
      "The observations are independent.",
      "The expected frequency for each cell in the contingency table is at least 5.",
    ],
    rationale: "A Chi-Square test for independence will be utilized to examine the association between [Your First Categorical Variable, e.g., gender] and [Your Second Categorical Variable, e.g., preferred learning style]. This test is appropriate for determining if a statistically significant relationship exists between these two categorical variables."
  },
  "Pearson Correlation": {
    definition: "Measures the strength and direction of the linear relationship between two continuous variables.",
    assumptions: [
      "Both variables are continuous (interval or ratio level).",
      "There is a linear relationship between the two variables.",
      "The data follows a bivariate normal distribution.",
      "There are no significant outliers.",
    ],
    rationale: "A Pearson product-moment correlation will be calculated to assess the relationship between [Your First Continuous Variable, e.g., hours spent studying] and [Your Second Continuous Variable, e.g., final exam scores]. This analysis will determine the strength and direction of the linear association between these two variables."
  },
  "Regression Analysis": {
    definition: "A statistical method used to model the relationship between a dependent variable and one or more independent variables. It's often used for prediction.",
    assumptions: [
      "There is a linear relationship between the independent and dependent variables.",
      "The residuals (errors) are independent.",
      "The residuals are normally distributed.",
      "The residuals have constant variance (homoscedasticity).",
    ],
    rationale: "Regression analysis will be employed to determine if [Your Independent Variable(s), e.g., attendance and quiz scores] can significantly predict [Your Dependent Variable, e.g., final grades]. This method is chosen for its ability to model and predict relationships between variables."
  }
};

export function StatisticalTestAdvisor() {
  const [stq1, setStq1] = useState<string | null>(null);
  const [stq2, setStq2] = useState<string | null>(null);
  const [stq3, setStq3] = useState<string | null>(null);
  const [recommendedTest, setRecommendedTest] = useState<string | null>(null);

  const handleCopyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleStatsAdvisor = (question: 'stq1' | 'stq2' | 'stq3', value: string) => {
    setRecommendedTest(null);
    if (question === 'stq1') {
      setStq1(value);
      setStq2(null);
      setStq3(null);
      if (value === 'predict') setRecommendedTest('Regression Analysis');
    }
    if (question === 'stq2') {
      setStq2(value);
      setStq3(null);
      if (stq1 === 'compare') {
        if (value === 'more_than_two') setRecommendedTest('ANOVA');
      } else if (stq1 === 'relate') {
        if (value === 'categorical') setRecommendedTest('Chi-Square Test');
        if (value === 'continuous') setRecommendedTest('Pearson Correlation');
      }
    }
    if (question === 'stq3') {
      setStq3(value);
      if (stq1 === 'compare' && stq2 === 'two') {
        setRecommendedTest(value === 'independent' ? 'Independent Samples T-test' : 'Paired Samples T-test');
      }
    }
  };

  const resetStatsAdvisor = () => {
    setStq1(null);
    setStq2(null);
    setStq3(null);
    setRecommendedTest(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="font-semibold">1. What is the main goal of your analysis?</Label>
        <RadioGroup value={stq1 || ""} onValueChange={(v) => handleStatsAdvisor('stq1', v)} className="mt-2">
          <div className="flex items-center space-x-2"><RadioGroupItem value="compare" id="stq1-compare" /><Label htmlFor="stq1-compare">Comparing averages between groups</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="relate" id="stq1-relate" /><Label htmlFor="stq1-relate">Examining the relationship between variables</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="predict" id="stq1-predict" /><Label htmlFor="stq1-predict">Predicting an outcome</Label></div>
        </RadioGroup>
      </div>

      {stq1 === 'compare' && (
        <div>
          <Label className="font-semibold">2. How many groups are you comparing?</Label>
          <RadioGroup value={stq2 || ""} onValueChange={(v) => handleStatsAdvisor('stq2', v)} className="mt-2">
            <div className="flex items-center space-x-2"><RadioGroupItem value="two" id="stq2-two" /><Label htmlFor="stq2-two">Two groups</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="more_than_two" id="stq2-more" /><Label htmlFor="stq2-more">More than two groups</Label></div>
          </RadioGroup>
        </div>
      )}

      {stq1 === 'compare' && stq2 === 'two' && (
        <div>
          <Label className="font-semibold">3. Are the groups independent or related (e.g., pre-test/post-test)?</Label>
          <RadioGroup value={stq3 || ""} onValueChange={(v) => handleStatsAdvisor('stq3', v)} className="mt-2">
            <div className="flex items-center space-x-2"><RadioGroupItem value="independent" id="stq3-independent" /><Label htmlFor="stq3-independent">Independent</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="paired" id="stq3-paired" /><Label htmlFor="stq3-paired">Paired / Related</Label></div>
          </RadioGroup>
        </div>
      )}

      {stq1 === 'relate' && (
        <div>
          <Label className="font-semibold">2. What type of variables are you analyzing?</Label>
          <RadioGroup value={stq2 || ""} onValueChange={(v) => handleStatsAdvisor('stq2', v)} className="mt-2">
            <div className="flex items-center space-x-2"><RadioGroupItem value="categorical" id="stq2-categorical" /><Label htmlFor="stq2-categorical">Both are categorical (e.g., gender, course)</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="continuous" id="stq2-continuous" /><Label htmlFor="stq2-continuous">Both are continuous/numerical (e.g., age, test score)</Label></div>
          </RadioGroup>
        </div>
      )}

      {recommendedTest && (
        <>
          <Separator />
          <Alert>
            <AlertTitle>Recommendation: {recommendedTest}</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>{statisticalTests[recommendedTest as keyof typeof statisticalTests].definition}</p>
              <div>
                <h4 className="font-semibold text-foreground">Key Assumptions:</h4>
                <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
                  {(statisticalTests[recommendedTest as keyof typeof statisticalTests].assumptions as string[]).map((assumption, index) => (
                    <li key={index}>{assumption}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
          <div className="relative">
            <Label className="text-xs font-semibold text-muted-foreground">RATIONALE TEMPLATE</Label>
            <Textarea value={statisticalTests[recommendedTest as keyof typeof statisticalTests].rationale} readOnly rows={5} className="mt-1" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-2"
              onClick={() => handleCopyToClipboard(statisticalTests[recommendedTest as keyof typeof statisticalTests].rationale)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
      
      {(stq1 || recommendedTest) && <Button variant="outline" onClick={resetStatsAdvisor}>Start Over</Button>}
    </div>
  );
}