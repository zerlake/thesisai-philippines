"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { advisorCompetencies } from "@/lib/competencies";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Calculator, Printer } from "lucide-react";
import { toast } from "sonner";
import { CompetencyResultsCard } from "./competency-results-card";

type Results = {
  overall: number;
  competencies: {
    id: string;
    title: string;
    score: number;
  }[];
};

export function AdvisorCompetencyAssessment() {
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [results, setResults] = useState<Results | null>(null);

  const totalQuestions = useMemo(() => advisorCompetencies.reduce((acc, comp) => acc + comp.items.length, 0), []);
  const allQuestionsAnswered = Object.keys(answers).length === totalQuestions;

  const handleAnswerChange = (itemId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [itemId]: Number(value) }));
  };

  const handleCalculateResults = () => {
    const competencyScores = advisorCompetencies.map(competency => {
      const itemScores = competency.items.map(item => answers[item.id] || 0);
      const total = itemScores.reduce((sum, score) => sum + score, 0);
      const score = total / itemScores.length;
      return { id: competency.id, title: competency.title, score };
    });

    const overallTotal = competencyScores.reduce((sum, comp) => sum + comp.score, 0);
    const overall = overallTotal / competencyScores.length;

    setResults({ overall, competencies: competencyScores });
    toast.success("Results calculated!");
  };

  const handleReset = () => {
    setAnswers({});
    setResults(null);
  };

  const handlePrint = () => {
    window.print();
    toast.info("Use your browser's print dialog to save as PDF or print.");
  };

  if (results) {
    return <CompetencyResultsCard results={results} onReset={handleReset} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Advisor Competency Self-Assessment</CardTitle>
          <CardDescription>
            This tool is for your personal reflection and professional development. It helps you identify your strengths and areas for growth as a mentor. Your responses are not saved or tracked.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleCalculateResults} disabled={!allQuestionsAnswered}>
            <Calculator className="w-4 h-4 mr-2" />
            Calculate My Results
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" /> Print or Save as PDF
          </Button>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["subject-expertise"]} className="w-full space-y-4">
        {advisorCompetencies.map((competency) => (
          <AccordionItem value={competency.id} key={competency.id} className="border rounded-lg px-4">
            <AccordionTrigger className="text-lg font-semibold">
              <div className="flex items-center gap-3">
                <competency.icon className="w-6 h-6 text-primary" />
                {competency.title}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <p className="text-muted-foreground mb-6">{competency.description}</p>
              <div className="space-y-6">
                {competency.items.map((item, index) => (
                  <div key={index} className="space-y-3">
                    <Label>{item.text}</Label>
                    <RadioGroup 
                      className="flex flex-wrap gap-x-4 gap-y-2"
                      value={answers[item.id]?.toString() || ""}
                      onValueChange={(value) => handleAnswerChange(item.id, value)}
                    >
                      <div className="flex items-center space-x-2"><RadioGroupItem value="1" id={`${item.id}-1`} /><Label htmlFor={`${item.id}-1`}>Developing</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="2" id={`${item.id}-2`} /><Label htmlFor={`${item.id}-2`}>Proficient</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="3" id={`${item.id}-3`} /><Label htmlFor={`${item.id}-3`}>Advanced</Label></div>
                      <div className="flex items-center space-x-2"><RadioGroupItem value="4" id={`${item.id}-4`} /><Label htmlFor={`${item.id}-4`}>Expert</Label></div>
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}