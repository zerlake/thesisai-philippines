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
import { type UniversityGuide, type GuideItem } from "@/lib/guides";
import { University, BookCopy, UserCheck, type LucideIcon } from "lucide-react";

const iconMap: { [key: string]: LucideIcon } = {
  BookCopy,
  UserCheck,
};

interface UniversityGuideDetailProps {
  guide: UniversityGuide;
}

export function UniversityGuideDetail({ guide }: UniversityGuideDetailProps) {
  const StudentIcon = iconMap[guide.studentDashboard.icon];
  const AdvisorIcon = iconMap[guide.advisorDashboard.icon];

  const renderContent = (content: GuideItem['content']) => {
    switch (content.type) {
      case 'list':
        return (
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            {content.items?.map((point: string, pIndex: number) => (
              <li key={pIndex}>{point}</li>
            ))}
          </ul>
        );
      case 'visual-sample':
        return (
          <div className="p-4 bg-white border shadow-sm mt-2">
            <div className="p-8 bg-white font-serif text-black text-sm leading-loose whitespace-pre-wrap">
              {content.text}
            </div>
          </div>
        );
      case 'before-after':
        return (
          <div className="grid sm:grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-sm font-semibold mb-2">Before (Informal):</p>
              <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-800 rounded">
                <p className="italic">&quot;{content.before}&quot;</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">After (Academic Tone):</p>
              <div className="p-3 bg-green-50 border-l-4 border-green-400 text-green-800 rounded">
                <p>&quot;{content.after}&quot;</p>
              </div>
            </div>
          </div>
        );
      case 'paragraph-example':
        return (
          <div className="mt-2">
            <p className="text-sm font-semibold mb-2">Example Paragraph:</p>
            <div className="p-3 bg-muted/50 rounded">
              <p className="text-muted-foreground">{content.text}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <University className="w-8 h-8 text-primary" />
            {guide.school}
          </CardTitle>
          <CardDescription>
            Detailed guidelines, templates, and workflows from {guide.school} to ensure compliance and streamline your submission process.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            {StudentIcon && <StudentIcon className="w-5 h-5" />}
            {guide.studentDashboard.title}
          </h3>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={[`student-0`]} className="w-full space-y-2">
            {guide.studentDashboard.items.map((item: GuideItem, index: number) => (
              <AccordionItem value={`student-${index}`} key={index} className="border rounded-md px-4">
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>
                  {renderContent(item.content)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            {AdvisorIcon && <AdvisorIcon className="w-5 h-5" />}
            {guide.advisorDashboard.title}
          </h3>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={[`advisor-0`]} className="w-full space-y-2">
            {guide.advisorDashboard.items.map((item: GuideItem, index: number) => (
              <AccordionItem value={`advisor-${index}`} key={index} className="border rounded-md px-4">
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>
                  {renderContent(item.content)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}