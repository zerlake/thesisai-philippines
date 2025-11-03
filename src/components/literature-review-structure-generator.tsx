import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const structureTemplates = [
  {
    id: 'thematic',
    name: 'Thematic',
    description: 'Organize your literature review around key themes or topics.',
    template: `**Introduction:**
- Introduce the broad topic of your literature review.
- State the purpose of your review.
- Briefly outline the themes you will be discussing.

**Theme 1: [Name of Theme 1]**
- Discuss the key concepts and theories related to this theme.
- Synthesize the findings of the studies you have read.
- Identify the strengths and weaknesses of the research.
- Discuss any gaps in the literature.

**Theme 2: [Name of Theme 2]**
- Discuss the key concepts and theories related to this theme.
- Synthesize the findings of the studies you have read.
- Identify the strengths and weaknesses of the research.
- Discuss any gaps in the literature.

**Theme 3: [Name of Theme 3]**
- Discuss the key concepts and theories related to this theme.
- Synthesize the findings of the studies you have read.
- Identify the strengths and weaknesses of the research.
- Discuss any gaps in the literature.

**Conclusion:**
- Summarize the main findings of your review.
- Identify the key research gaps.
- Suggest directions for future research.`,
  },
  {
    id: 'chronological',
    name: 'Chronological',
    description: 'Organize your literature review by the date of publication.',
    template: `**Introduction:**
- Introduce the broad topic of your literature review.
- State the purpose of your review.
- Briefly outline the time periods you will be discussing.

**Time Period 1: [e.g., Early Research]**
- Discuss the foundational studies in your field.
- Identify the key debates and controversies.

**Time Period 2: [e.g., Mid-20th Century]**
- Discuss how the research in your field evolved.
- Identify any major breakthroughs or turning points.

**Time Period 3: [e.g., Contemporary Research]**
- Discuss the current state of the research in your field.
- Identify the key debates and controversies.

**Conclusion:**
- Summarize the main trends in the research over time.
- Identify the key research gaps.
- Suggest directions for future research.`,
  },
  {
    id: 'methodological',
    name: 'Methodological',
    description: 'Organize your literature review by the research methods used.',
    template: `**Introduction:**
- Introduce the broad topic of your literature review.
- State the purpose of your review.
- Briefly outline the research methods you will be discussing.

**Methodology 1: [e.g., Qualitative Research]**
- Discuss the key studies that have used this methodology.
- Identify the strengths and weaknesses of this methodology.

**Methodology 2: [e.g., Quantitative Research]**
- Discuss the key studies that have used this methodology.
- Identify the strengths and weaknesses of this methodology.

**Methodology 3: [e.g., Mixed-Methods Research]**
- Discuss the key studies that have used this methodology.
- Identify the strengths and weaknesses of this methodology.

**Conclusion:**
- Summarize the main findings of your review.
- Discuss the strengths and weaknesses of the different methodologies.
- Suggest directions for future research.`,
  },
];

const LiteratureReviewStructureGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(structureTemplates[0]);
  const [generatedStructure, setGeneratedStructure] = useState(selectedTemplate.template);

  const handleTemplateChange = (templateId: string) => {
    const template = structureTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setGeneratedStructure(template.template);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chapter II: Literature Review Structure Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">
              Select a structure
            </label>
            <Select onValueChange={handleTemplateChange} defaultValue={selectedTemplate.id}>
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Select a structure" />
              </SelectTrigger>
              <SelectContent>
                {structureTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <h3 className="text-lg font-medium">Generated Literature Review Structure</h3>
            <Textarea
              value={generatedStructure}
              onChange={(e) => setGeneratedStructure(e.target.value)}
              rows={15}
              className="mt-2"
            />
          </div>
          <Button>Generate Structure</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiteratureReviewStructureGenerator;
