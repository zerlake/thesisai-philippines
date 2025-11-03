import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const introductionTemplates = [
  {
    id: 'problem-solution',
    name: 'Problem-Solution',
    description: 'Start by presenting a compelling problem and then introduce your research as the solution.',
    template: `**1. The Hook:** Start with a compelling statistic, a thought-provoking question, or a powerful anecdote related to your research topic.
    
**2. Background:** Briefly provide the necessary context for your readers to understand the problem. What is the history of this issue? Why is it important now?

**3. The Problem/Gap:** Clearly state the problem that your research addresses. What is missing in the current literature? What issue needs to be resolved?

**4. The Solution (Your Research):** Introduce your thesis as the solution to this problem. State your research question and hypothesis.

**5. The Roadmap:** Briefly outline the structure of your thesis. What will you cover in each chapter?`,
  },
  {
    id: 'funnel',
    name: 'Funnel',
    description: 'Start broad and then narrow down to your specific research question.',
    template: `**1. Broad Context:** Begin with a general statement about the broader field of your research.

**2. Narrowing Down:** Gradually narrow your focus to the specific area of your research.

**3. The Gap:** Identify a specific gap in the literature that your research will fill.

**4. Research Question/Hypothesis:** State your specific research question and hypothesis.

**5. Thesis Statement:** Present your thesis statement, which is the main argument of your research.

**6. Roadmap:** Briefly outline the structure of your thesis.`,
  },
  {
    id: 'narrative',
    name: 'Narrative',
    description: 'Tell a story that leads to your research question.',
    template: `**1. The Story:** Start with a compelling story or anecdote that illustrates the importance of your research topic.

**2. The Problem:** From the story, extract the underlying problem or question that your research will address.

**3. The Literature:** Briefly discuss how other researchers have approached this problem.

**4. The Gap:** Identify what is still missing in the literature.

**5. Your Contribution:** Explain how your research will contribute to filling this gap.

**6. Roadmap:** Briefly outline the structure of your thesis.`,
  },
];

const IntroductionGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(introductionTemplates[0]);
  const [generatedIntroduction, setGeneratedIntroduction] = useState(selectedTemplate.template);

  const handleTemplateChange = (templateId: string) => {
    const template = introductionTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setGeneratedIntroduction(template.template);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chapter I: Introduction Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">
              Select a template
            </label>
            <Select onValueChange={handleTemplateChange} defaultValue={selectedTemplate.id}>
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {introductionTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <h3 className="text-lg font-medium">Generated Introduction Outline</h3>
            <Textarea
              value={generatedIntroduction}
              onChange={(e) => setGeneratedIntroduction(e.target.value)}
              rows={15}
              className="mt-2"
            />
          </div>
          <Button>Generate Introduction</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntroductionGenerator;
