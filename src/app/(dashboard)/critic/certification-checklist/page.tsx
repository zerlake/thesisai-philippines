'use client';

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import {
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  FileText,
  BookOpen,
  Award,
  Download
} from "lucide-react";

type ChecklistCategory = {
  id: string;
  title: string;
  description: string;
  items: {
    id: string;
    label: string;
    required: boolean;
    checked: boolean;
  }[];
};

const defaultChecklist: ChecklistCategory[] = [
  {
    id: 'format',
    title: 'Format & Structure',
    description: 'Document formatting and organizational requirements',
    items: [
      { id: 'f1', label: 'Title page follows university template', required: true, checked: false },
      { id: 'f2', label: 'Abstract is within word limit (250-300 words)', required: true, checked: false },
      { id: 'f3', label: 'Table of contents is properly formatted', required: true, checked: false },
      { id: 'f4', label: 'Page numbers are consistent throughout', required: true, checked: false },
      { id: 'f5', label: 'Margins follow institutional guidelines (1" or 1.5")', required: true, checked: false },
      { id: 'f6', label: 'Font and spacing are consistent (Times New Roman 12pt, double-spaced)', required: true, checked: false },
      { id: 'f7', label: 'Chapter headings follow hierarchy', required: false, checked: false },
    ],
  },
  {
    id: 'content',
    title: 'Content Quality',
    description: 'Academic content and research quality',
    items: [
      { id: 'c1', label: 'Research objectives are clearly stated', required: true, checked: false },
      { id: 'c2', label: 'Literature review is comprehensive and current', required: true, checked: false },
      { id: 'c3', label: 'Methodology is appropriate and well-explained', required: true, checked: false },
      { id: 'c4', label: 'Results are accurately presented', required: true, checked: false },
      { id: 'c5', label: 'Discussion connects findings to literature', required: true, checked: false },
      { id: 'c6', label: 'Conclusions address research questions', required: true, checked: false },
      { id: 'c7', label: 'Recommendations are practical and relevant', required: false, checked: false },
    ],
  },
  {
    id: 'citations',
    title: 'Citations & References',
    description: 'Citation format and reference accuracy',
    items: [
      { id: 'r1', label: 'All in-text citations have matching references', required: true, checked: false },
      { id: 'r2', label: 'Reference format is consistent (APA 7th)', required: true, checked: false },
      { id: 'r3', label: 'DOIs are included for journal articles', required: false, checked: false },
      { id: 'r4', label: 'References are within acceptable date range', required: true, checked: false },
      { id: 'r5', label: 'Direct quotes include page numbers', required: true, checked: false },
    ],
  },
  {
    id: 'language',
    title: 'Language & Grammar',
    description: 'Writing quality and clarity',
    items: [
      { id: 'l1', label: 'No significant grammatical errors', required: true, checked: false },
      { id: 'l2', label: 'Academic tone is maintained throughout', required: true, checked: false },
      { id: 'l3', label: 'Technical terms are properly defined', required: false, checked: false },
      { id: 'l4', label: 'Paragraphs are well-structured', required: true, checked: false },
      { id: 'l5', label: 'Transitions between sections are smooth', required: false, checked: false },
    ],
  },
  {
    id: 'integrity',
    title: 'Academic Integrity',
    description: 'Originality and ethical compliance',
    items: [
      { id: 'i1', label: 'Plagiarism check passed (<15% similarity)', required: true, checked: false },
      { id: 'i2', label: 'Proper attribution for all sources', required: true, checked: false },
      { id: 'i3', label: 'Data integrity verified', required: true, checked: false },
      { id: 'i4', label: 'Ethics approval documented (if applicable)', required: false, checked: false },
    ],
  },
];

export default function CertificationChecklistPage() {
  const authContext = useAuth();
  const [checklist, setChecklist] = useState<ChecklistCategory[]>(defaultChecklist);

  if (!authContext) {
    return <BrandedLoader />;
  }

  const { session, profile, isLoading } = authContext;

  if (!isLoading && (!session || profile?.role !== 'critic')) {
    redirect('/login');
  }

  if (isLoading) {
    return <BrandedLoader />;
  }

  const handleToggleItem = (categoryId: string, itemId: string) => {
    setChecklist(checklist.map(category =>
      category.id === categoryId
        ? {
            ...category,
            items: category.items.map(item =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          }
        : category
    ));
  };

  const totalItems = checklist.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = checklist.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.checked).length,
    0
  );
  const requiredItems = checklist.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.required).length,
    0
  );
  const requiredChecked = checklist.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.required && item.checked).length,
    0
  );

  const progress = Math.round((checkedItems / totalItems) * 100);
  const isReadyForCertification = requiredChecked === requiredItems;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ClipboardList className="h-8 w-8" />
            Certification Checklist
          </h1>
          <p className="text-muted-foreground">
            Standard criteria for thesis manuscript certification
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Checklist
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Certification Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-sm text-muted-foreground">{checkedItems}/{totalItems} items</span>
            </div>
            <Progress value={progress} className="h-3" />

            <div className="grid gap-4 md:grid-cols-3 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className={`h-8 w-8 ${isReadyForCertification ? 'text-green-500' : 'text-muted-foreground'}`} />
                <div>
                  <p className="text-sm font-medium">Required Items</p>
                  <p className="text-2xl font-bold">{requiredChecked}/{requiredItems}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Categories</p>
                  <p className="text-2xl font-bold">{checklist.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Award className={`h-8 w-8 ${isReadyForCertification ? 'text-green-500' : 'text-yellow-500'}`} />
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant={isReadyForCertification ? 'default' : 'secondary'}>
                    {isReadyForCertification ? 'Ready to Certify' : 'In Progress'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Categories */}
      <div className="grid gap-6">
        {checklist.map((category) => {
          const categoryChecked = category.items.filter(item => item.checked).length;
          const categoryTotal = category.items.length;
          const categoryProgress = Math.round((categoryChecked / categoryTotal) * 100);

          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                  <Badge variant={categoryProgress === 100 ? 'default' : 'secondary'}>
                    {categoryChecked}/{categoryTotal}
                  </Badge>
                </div>
                <Progress value={categoryProgress} className="h-2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleToggleItem(category.id, item.id)}
                    >
                      <Checkbox
                        id={item.id}
                        checked={item.checked}
                        onCheckedChange={() => handleToggleItem(category.id, item.id)}
                      />
                      <label
                        htmlFor={item.id}
                        className={`flex-1 text-sm cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.label}
                      </label>
                      {item.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Certification Actions */}
      <Card className={isReadyForCertification ? 'border-green-500/50 bg-green-500/5' : ''}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isReadyForCertification ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : (
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">
                  {isReadyForCertification
                    ? 'All required criteria met!'
                    : `${requiredItems - requiredChecked} required items remaining`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isReadyForCertification
                    ? 'This manuscript is ready for certification.'
                    : 'Complete all required items before certification.'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Request Revisions
              </Button>
              <Button disabled={!isReadyForCertification}>
                <Award className="mr-2 h-4 w-4" />
                Issue Certificate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
