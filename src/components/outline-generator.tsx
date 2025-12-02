"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FilePlus2, Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FieldOfStudySelector } from "./field-of-study-selector";
import { callPuterAI } from "@/lib/puter-ai-wrapper";
import { MarkdownRenderer } from "./markdown-renderer"; // Import MarkdownRenderer
import { usePuterContext } from "@/contexts/puter-context";

export function OutlineGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const { signIn: signInWithPuter } = usePuterContext();
  const [field, setField] = useState("");
  const [topic, setTopic] = useState("");
  const [outline, setOutline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPuterSignIn, setIsPuterSignIn] = useState(false);

  const sampleData = [
    {
      field: "Education",
      topic: "The Impact of AI on K-12 Education",
      outline: `
# The Impact of AI on K-12 Education

## Chapter 1: Introduction
### 1.1 Background of the Study
### 1.2 Statement of the Problem
### 1.3 Research Questions
### 1.4 Objectives of the Study
### 1.5 Significance of the Study
### 1.6 Scope and Delimitations
### 1.7 Definition of Terms

## Chapter 2: Review of Related Literature
### 2.1 Artificial Intelligence in Education: An Overview
### 2.2 Current Applications of AI in K-12 Settings
### 2.3 Benefits of AI in K-12 Education
### 2.4 Challenges and Ethical Concerns of AI in K-12 Education
### 2.5 Theoretical Framework
### 2.6 Conceptual Framework

## Chapter 3: Research Methodology
### 3.1 Research Design
### 3.2 Research Participants/Respondents
### 3.3 Research Locale
### 3.4 Research Instrument
### 3.5 Data Collection Procedure
### 3.6 Data Analysis

## Chapter 4: Presentation, Analysis, and Interpretation of Data
### 4.1 Presentation of Findings
### 4.2 Analysis of Quantitative Data
### 4.3 Interpretation of Qualitative Data
### 4.4 Discussion of Results

## Chapter 5: Summary, Conclusions, and Recommendations
### 5.1 Summary of Findings
### 5.2 Conclusions
### 5.3 Recommendations
### 5.4 Future Research Directions

## References

## Appendices
### Appendix A: Research Instrument
### Appendix B: Informed Consent Form
### Appendix C: Raw Data
`,
    },
    {
      field: "Environmental Science",
      topic: "Sustainable Waste Management Practices in Urban Areas",
      outline: `
# Sustainable Waste Management Practices in Urban Areas

## Chapter 1: Introduction
### 1.1 Background of Urban Waste Management
### 1.2 Problem Statement: Challenges in Urban Waste
### 1.3 Research Questions on Sustainable Practices
### 1.4 Objectives of Sustainable Waste Management Study
### 1.5 Significance of Research on Urban Sustainability
### 1.6 Scope and Limitations of the Study
### 1.7 Key Definitions in Waste Management

## Chapter 2: Literature Review
### 2.1 Overview of Urbanization and Waste Generation
### 2.2 Current Waste Management Strategies
### 2.3 Principles of Sustainable Waste Management
### 2.4 Case Studies of Successful Sustainable Waste Management
### 2.5 Barriers and Enablers for Adoption
### 2.6 Theoretical Foundations of Environmental Management
### 2.7 Conceptual Model for Urban Waste Sustainability

## Chapter 3: Methodology
### 3.1 Research Design: Mixed-Methods Approach
### 3.2 Study Area and Population
### 3.3 Sampling Strategy
### 3.4 Data Collection Instruments: Surveys and Interviews
### 3.5 Data Collection Procedures
### 3.6 Data Analysis Techniques: Statistical and Thematic

## Chapter 4: Results and Discussion
### 4.1 Current Waste Generation and Composition
### 4.2 Public Perception and Participation in Waste Segregation
### 4.3 Effectiveness of Existing Sustainable Practices
### 4.4 Challenges in Implementation of Sustainable Practices
### 4.5 Economic and Environmental Impacts

## Chapter 5: Conclusion and Recommendations
### 5.1 Summary of Findings
### 5.2 Conclusions on Sustainable Waste Management
### 5.3 Recommendations for Policy and Practice
### 5.4 Suggestions for Future Research

## References

## Appendices
### Appendix A: Survey Questionnaire
### Appendix B: Interview Protocol
### Appendix C: Waste Audit Data
`,
    },
    {
      field: "Business",
      topic: "The Impact of E-commerce on Small and Medium Enterprises (SMEs) in a Developing Economy",
      outline: `
# The Impact of E-commerce on Small and Medium Enterprises (SMEs) in a Developing Economy

## Chapter 1: Introduction
### 1.1 Background of SMEs and E-commerce in Developing Economies
### 1.2 Statement of the Problem: E-commerce Adoption Challenges for SMEs
### 1.3 Research Questions on E-commerce Impact
### 1.4 Objectives of the Study: Benefits and Challenges for SMEs
### 1.5 Significance of Research for SME Growth
### 1.6 Scope and Limitations of E-commerce Impact Study
### 1.7 Definition of Key Terms

## Chapter 2: Literature Review
### 2.1 E-commerce Growth and Trends Globally
### 2.2 SMEs in Developing Economies: Characteristics and Challenges
### 2.3 Theories of Technology Adoption (e.g., TAM, DOI)
### 2.4 Benefits of E-commerce for SMEs (Market Reach, Cost Reduction)
### 2.5 Challenges of E-commerce for SMEs (Logistics, Digital Skills)
### 2.6 Previous Studies on E-commerce Adoption by SMEs
### 2.7 Conceptual Framework: Factors Influencing E-commerce Impact

## Chapter 3: Research Methodology
### 3.1 Research Design: Survey and Case Study Approach
### 3.2 Population and Sampling: SMEs in [Specific Region/Country]
### 3.3 Data Collection Instruments: Questionnaires and Interview Guides
### 3.4 Data Collection Procedures
### 3.5 Data Analysis Methods: Descriptive Statistics, Regression, Thematic Analysis

## Chapter 4: Results and Discussion
### 4.1 Profile of Participating SMEs
### 4.2 E-commerce Adoption Rates and Platforms Used
### 4.3 Perceived Benefits of E-commerce for SMEs
### 4.4 Challenges Faced by SMEs in E-commerce Adoption
### 4.5 Relationship Between E-commerce Adoption and Business Performance
### 4.6 Discussion of Findings in Relation to Literature

## Chapter 5: Conclusion and Recommendations
### 5.1 Summary of Key Findings
### 5.2 Conclusions on E-commerce Impact
### 5.3 Recommendations for SMEs, Policymakers, and Support Organizations
### 5.4 Suggestions for Future Research

## References

## Appendices
### Appendix A: Survey Questionnaire
### Appendix B: Interview Transcripts (Excerpts)
### Appendix C: SME E-commerce Platform Usage Data
`,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !field) return;
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIsLoading(true);
    setOutline("");

    try {
      const prompt = `Generate a detailed thesis outline for "${topic}" in the field of "${field}".

Include introduction, literature review, methodology, results, discussion, and conclusion chapters.
Format the outline using Markdown headings (e.g., # Introduction, ## Background, ### Sub-point).

Make it suitable for a Philippine university thesis with proper academic structure.`;

      const outlineText = await callPuterAI(prompt, {
        temperature: 0.5,  // Balanced, structured
        max_tokens: 3000,
        timeout: 90000     // Increased timeout to 90 seconds for complex outline generation
      });
      
      setOutline(outlineText);
      toast.success("Outline generated successfully!");
    } catch (error: any) {
      const msg = error.message || "Failed to generate outline.";
      
      if (msg.includes("auth")) {
        toast.error("Please sign in to your Puter account to continue.", {
          action: {
            label: "Sign in",
            onClick: async () => {
              setIsPuterSignIn(true);
              try {
                await signInWithPuter();
                toast.success("Signed in successfully! Retrying...");
                handleSubmit(e);
              } catch (signInError) {
                toast.error("Failed to sign in. Please try again.");
                console.error(signInError);
              } finally {
                setIsPuterSignIn(false);
              }
            },
          },
        });
      } else {
        toast.error(msg);
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSampleData = () => {
    let newSample = sampleData[Math.floor(Math.random() * sampleData.length)];
    setField(newSample.field);
    setTopic(newSample.topic);
    setOutline(newSample.outline);
  };

  const handleSaveAsDraft = async () => {
    if (!user || !outline || !topic) return;
    setIsSaving(true);

    const htmlOutline = outline; 

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: `Outline: ${topic}`,
        content: htmlOutline, 
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save draft.");
      console.error(error);
    } else if (newDoc) {
      toast.success("Draft saved successfully!");
      router.push(`/drafts/${newDoc.id}`);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Project Outline Generator</CardTitle>
          <CardDescription>
            Enter your topic, and our AI will generate a structured
            outline for your thesis, dissertation, or paper.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Field of Study</Label>
              <FieldOfStudySelector
                value={field}
                onValueChange={setField}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Thesis Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., The Impact of AI on Higher Education"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading || isPuterSignIn || !topic || !field || !session}>
                <Wand2 className="w-4 h-4 mr-2" />
                {isPuterSignIn ? "Signing in..." : isLoading ? "Generating..." : "Generate Outline"}
              </Button>
              <Button variant="outline" onClick={handleLoadSampleData} disabled={isLoading}>
                Load Sample Data
              </Button>
            </div>
          </form>

          {(isLoading || outline) && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Outline</h3>
                {outline && !isLoading && (
                  <Button variant="outline" size="sm" onClick={handleSaveAsDraft} disabled={isSaving}>
                    <FilePlus2 className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save as Draft"}
                  </Button>
                )}
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-10/12" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                </div>
              ) : (
                <MarkdownRenderer content={outline} className="p-4 border rounded-md bg-tertiary" />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}