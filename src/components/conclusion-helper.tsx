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
import { AlertTriangle, HelpCircle, BookOpen, Wand2 } from "lucide-react";
import { MethodologyToolCard } from "./methodology-tool-card";
import { ConclusionGenerator } from "./conclusion-generator";

const coreSections = [
  {
    title: "Summary of Findings",
    content: "Briefly restate the most important findings from Chapter IV. This section should be concise and directly answer your research questions. Do not introduce new data here.",
  },
  {
    title: "Conclusions",
    content: "Based on your findings, what conclusions can you draw? Go beyond summarizing and explain what your results mean in the broader context of your research topic. Each conclusion must be directly supported by your data.",
  },
  {
    title: "Recommendations",
    content: "Provide specific, practical, and actionable recommendations based on your conclusions. These can be for future researchers, practitioners in your field, or policymakers.",
  },
];

const faqs = [
    {
        question: "What is the difference between 'Summary of Findings' and 'Conclusions'?",
        answer: "The 'Summary of Findings' is a factual restatement of your key results (the 'what'). For example: 'The study found that 75% of students use AI tools.' The 'Conclusions' section is an interpretation of those findings (the 'so what'). For example: 'Based on the high usage rate, it is concluded that AI tools are becoming integral to the modern learning process.'"
    },
    {
        question: "How specific should my recommendations be?",
        answer: "As specific as possible! A weak recommendation is 'Schools should improve teacher training.' A strong, actionable recommendation is 'The Department of Education should develop a 3-day mandatory seminar for all public high school teachers on integrating AI-powered writing assistants into the English curriculum.'"
    },
    {
        question: "Can I mention the limitations of my study here?",
        answer: "While the main 'Scope and Limitations' section is in Chapter I, it's good practice to briefly acknowledge key limitations when making recommendations for future research. For example: 'Since this study was limited to urban areas, future research should investigate this phenomenon in rural contexts.'"
    }
];

const glossaryTerms = [
    { term: "Summary of Findings (Buod ng mga Natuklasan)", definition: "A concise restatement of the key results." },
    { term: "Conclusion (Konklusyon)", definition: "A judgment or decision reached by reasoning, based on the findings." },
    { term: "Recommendation (Rekomendasyon)", definition: "A suggestion or proposal as to the best course of action, based on the conclusions." },
    { term: "Implication (Implikasyon)", definition: "The conclusion that can be drawn from something, although it is not explicitly stated; the future effect of something." },
    { term: "Sanggunian (References)", definition: "A list of all the sources cited in the research." },
];

export function ConclusionHelper() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chapter V: Summary, Conclusion, and Recommendations Helper</CardTitle>
          <CardDescription>
            Guidance and tools for writing the powerful final chapter of your thesis.
          </CardDescription>
        </CardHeader>
      </Card>

      <MethodologyToolCard
        title="AI Conclusion Generator"
        description="Input your key findings to generate a draft of your summary, conclusion, and recommendations."
        icon={Wand2}
      >
        <ConclusionGenerator />
      </MethodologyToolCard>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Core Components Guide</CardTitle>
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
          <CardTitle className="text-xl">Example Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="for-researchers">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="for-researchers">For Researchers</TabsTrigger>
              <TabsTrigger value="for-practitioners">For Practitioners</TabsTrigger>
              <TabsTrigger value="for-policy">For Policy</TabsTrigger>
            </TabsList>
            <TabsContent value="for-researchers" className="mt-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Example Snippet:</strong> "Future researchers are encouraged to conduct a longitudinal study to track the long-term effects of social media usage on the political engagement of Filipino youth. A comparative study between urban and rural areas is also recommended."
              </p>
            </TabsContent>
            <TabsContent value="for-practitioners" className="mt-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Example Snippet:</strong> "It is recommended that school counselors and psychologists integrate modules on digital wellness and critical media consumption into their student guidance programs to mitigate the risks of misinformation."
              </p>
            </TabsContent>
            <TabsContent value="for-policy" className="mt-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Example Snippet:</strong> "The findings suggest that the Commission on Higher Education (CHED) may consider reviewing and updating the curriculum for journalism and communication programs to include mandatory courses on digital fact-checking and verification."
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Critical Rule: No New Data!</AlertTitle>
        <AlertDescription>
          Chapter V is for summarizing and interpreting the data you already presented in Chapter IV. Never introduce new findings, statistics, or quotes in this final chapter. Your conclusions must flow directly from your results.
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