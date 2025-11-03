import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ConclusionSynthesisTool: React.FC = () => {
  const [summaryOfResearch, setSummaryOfResearch] = useState('');
  const [implicationsOfFindings, setImplicationsOfFindings] = useState('');
  const [futureResearch, setFutureResearch] = useState('');

  const generateConclusion = () => {
    const conclusion = `**1. Summary of Research:**
${summaryOfResearch}

**2. Implications of Findings:**
${implicationsOfFindings}

**3. Directions for Future Research:**
${futureResearch}`;
    return conclusion;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chapter V: Conclusion Synthesis Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="summary-of-research">Summary of Research</Label>
            <Textarea
              id="summary-of-research"
              value={summaryOfResearch}
              onChange={(e) => setSummaryOfResearch(e.target.value)}
              rows={5}
              placeholder="Briefly summarize your research question, methodology, and key findings."
            />
          </div>
          <div>
            <Label htmlFor="implications-of-findings">Implications of Findings</Label>
            <Textarea
              id="implications-of-findings"
              value={implicationsOfFindings}
              onChange={(e) => setImplicationsOfFindings(e.target.value)}
              rows={5}
              placeholder="What are the theoretical and practical implications of your findings? How does your research contribute to the existing literature?"
            />
          </div>
          <div>
            <Label htmlFor="future-research">Directions for Future Research</Label>
            <Textarea
              id="future-research"
              value={futureResearch}
              onChange={(e) => setFutureResearch(e.target.value)}
              rows={5}
              placeholder="What are the limitations of your study? What are some unanswered questions that could be addressed in future research?"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium">Generated Conclusion Outline</h3>
            <Textarea
              value={generateConclusion()}
              rows={15}
              className="mt-2"
              readOnly
            />
          </div>
          <Button>Generate Conclusion</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConclusionSynthesisTool;
