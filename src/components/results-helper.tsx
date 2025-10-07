"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AlertTriangle, HelpCircle, BookOpen, BarChart3, Beaker, ClipboardCheck } from "lucide-react";
import { MethodologyToolCard } from "./methodology-tool-card";
import { ChartGenerator } from "./results-tools/chart-generator";
import { ResultsInterpreter } from "./results-tools/results-interpreter";
import { KappaCalculator } from "./results-tools/kappa-calculator";

const coreSections = [
  {
    title: "Presentation of Data",
    content: "Display your findings using tables, charts, and graphs. Each visual should have a number and a descriptive title (e.g., 'Table 1: Demographic Profile of Respondents'). Present data logically, following your research questions.",
  },
  {
    title: "Analysis of Data",
    content: "Describe the key points and trends shown in your data. For quantitative data, report statistical results. For qualitative data, identify key themes or patterns from your interviews or observations.",
  },
  {
    title: "Interpretation of Data (Discussion)",
    content: "Explain what your findings *mean*. How do they relate to your research questions and your literature review? Do your results support, contradict, or add a new perspective to existing knowledge?",
  },
];

const faqs = [
    {
        question: "How do I interpret a table of results?",
        answer: "First, present the table. Then, in the text, highlight the most significant findings. Don't just repeat every number. For example, point out the highest and lowest percentages, the overall mean, or any surprising patterns. Finally, explain what these key findings imply in relation to your study."
    },
    {
        question: "What if my findings are not statistically significant?",
        answer: "A non-significant result is still a result! It's an important finding. It might suggest that there is no relationship between the variables you studied. You should report this honestly and discuss possible reasons for it in your interpretation section. It could be a valuable insight for future research."
    },
    {
        question: "How do I connect my findings back to my literature review?",
        answer: "In your interpretation/discussion section, explicitly compare your results with the studies you cited in Chapter II. For example, you could write: 'This finding supports the work of Santos (2022), who also found that...'. Or, 'Contrary to the findings of Reyes (2021), this study did not find a significant correlation between...'"
    }
];

const glossaryTerms = [
    { term: "Data Analysis (Pagsusuri ng Datos)", definition: "The process of inspecting, cleaning, transforming, and modeling data to discover useful information." },
    { term: "Interpretation (Interpretasyon)", definition: "Explaining the meaning and significance of the findings." },
    { term: "Theme (Tema)", definition: "A recurring idea or pattern that emerges from qualitative data." },
    { term: "Mean (Karaniwan)", definition: "The average of a set of numbers, a common measure of central tendency." },
    { term: "Correlation (Kaugnayan)", definition: "A statistical measure that expresses the extent to which two variables are linearly related." },
];

export function ResultsHelper() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chapter IV: Results and Discussion Helper</CardTitle>
          <CardDescription>
            Guidance for presenting, analyzing, and interpreting your research data.
          </CardDescription>
        </CardHeader>
      </Card>

      <MethodologyToolCard
        title="Statistical Results Interpreter"
        description="Input your statistical test results (e.g., p-value, t-statistic) to generate a plain-language interpretation for your paper."
        icon={Beaker}
      >
        <ResultsInterpreter />
      </MethodologyToolCard>

      <MethodologyToolCard
        title="Chart Generator"
        description="Create and download simple bar charts for your data presentation."
        icon={BarChart3}
      >
        <ChartGenerator />
      </MethodologyToolCard>

      <MethodologyToolCard
        title="Kappa Calculator"
        description="Assess inter-rater reliability for two raters on a target."
        icon={ClipboardCheck}
      >
        <KappaCalculator />
      </MethodologyToolCard>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Core Components</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {coreSections.map((section, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-base font-semibold">{section.title}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Discipline-Specific Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quantitative">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="quantitative">Quantitative</TabsTrigger>
              <TabsTrigger value="qualitative">Qualitative</TabsTrigger>
            </TabsList>
            <TabsContent value="quantitative" className="mt-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Example Snippet (PH Context):</strong> &quot;Table 2 shows the respondents&apos; assessment of the new school portal. The overall weighted mean was 4.21, with a verbal interpretation of &apos;Very Satisfied&apos;. The indicator &apos;Ease of Navigation&apos; received the highest mean (4.52), while &apos;Mobile Accessibility&apos; received the lowest (3.89). This suggests that while users are generally pleased, improvements are needed for mobile users.&quot;
              </p>
            </TabsContent>
            <TabsContent value="qualitative" className="mt-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Example Snippet (PH Context):</strong> &quot;Three major themes emerged from the interviews with jeepney drivers regarding the PUV Modernization program: (1) Economic Anxiety (Pag-aalala sa Kita), (2) Cultural Identity (Kulturang Jeepney), and (3) Uncertainty about the Future (Kawalang-katiyakan). As one participant stated, &apos;Hindi lang ito sasakyan, buhay na namin ito&apos; (This isn&apos;t just a vehicle, this is our life).&quot;
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Common Pitfall: The Data Dump</AlertTitle>
        <AlertDescription>
          Avoid simply presenting tables and charts without explanation. Your job is to guide the reader. For every piece of data you show, you must follow up with analysis (what it shows) and interpretation (what it means).
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><BookOpen className="w-5 h-5" /> Key Terms & Glossary</CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {glossaryTerms.map((item, index) => (
                    <AccordionItem value={`glossary-${index}`} key={index}>
                        <AccordionTrigger>{item.term}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{item.definition}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`faq-${index}`} key={index}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}