import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const ResultsAnalysisPlanner: React.FC = () => {
  const [dataPresentation, setDataPresentation] = useState('');
  const [statisticalAnalysis, setStatisticalAnalysis] = useState('');
  const [interpretationOfResults, setInterpretationOfResults] = useState('');

  const generatePlan = () => {
    const plan = `**1. Data Presentation:**
${dataPresentation}

**2. Statistical Analysis:**
${statisticalAnalysis}

**3. Interpretation of Results:**
${interpretationOfResults}`;
    return plan;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chapter IV: Results Analysis Planner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="data-presentation">Data Presentation</Label>
            <Textarea
              id="data-presentation"
              value={dataPresentation}
              onChange={(e) => setDataPresentation(e.target.value)}
              rows={5}
              placeholder="How will you present your data? What tables and figures will you use? How will you organize your results section?"
            />
          </div>
          <div>
            <Label htmlFor="statistical-analysis">Statistical Analysis</Label>
            <Textarea
              id="statistical-analysis"
              value={statisticalAnalysis}
              onChange={(e) => setStatisticalAnalysis(e.target.value)}
              rows={5}
              placeholder="What are the main findings of your statistical analysis? What are the key statistics that you will report?"
            />
          </div>
          <div>
            <Label htmlFor="interpretation-of-results">Interpretation of Results</Label>
            <Textarea
              id="interpretation-of-results"
              value={interpretationOfResults}
              onChange={(e) => setInterpretationOfResults(e.target.value)}
              rows={5}
              placeholder="What do your results mean? How do they relate to your research question and hypothesis? What are the implications of your findings?"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium">Generated Results Analysis Plan</h3>
            <Textarea
              value={generatePlan()}
              rows={15}
              className="mt-2"
              readOnly
            />
          </div>
          <Button>Generate Plan</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsAnalysisPlanner;
