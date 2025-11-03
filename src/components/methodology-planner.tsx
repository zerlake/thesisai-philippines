import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MethodologyPlanner: React.FC = () => {
  const [researchDesign, setResearchDesign] = useState('');
  const [dataCollection, setDataCollection] = useState('');
  const [dataAnalysis, setDataAnalysis] = useState('');
  const [ethicalConsiderations, setEthicalConsiderations] = useState('');

  const generatePlan = () => {
    const plan = `**1. Research Design:**
${researchDesign}

**2. Data Collection:**
${dataCollection}

**3. Data Analysis:**
${dataAnalysis}

**4. Ethical Considerations:**
${ethicalConsiderations}`;
    return plan;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chapter III: Methodology Planner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="research-design">Research Design</Label>
            <Textarea
              id="research-design"
              value={researchDesign}
              onChange={(e) => setResearchDesign(e.target.value)}
              rows={5}
              placeholder="Describe your overall research design (e.g., qualitative, quantitative, mixed-methods). What is your research approach (e.g., case study, experiment, survey)?"
            />
          </div>
          <div>
            <Label htmlFor="data-collection">Data Collection</Label>
            <Textarea
              id="data-collection"
              value={dataCollection}
              onChange={(e) => setDataCollection(e.target.value)}
              rows={5}
              placeholder="How will you collect your data? What instruments will you use (e.g., interviews, questionnaires, observation)? What is your sampling strategy?"
            />
          </div>
          <div>
            <Label htmlFor="data-analysis">Data Analysis</Label>
            <Textarea
              id="data-analysis"
              value={dataAnalysis}
              onChange={(e) => setDataAnalysis(e.target.value)}
              rows={5}
              placeholder="How will you analyze your data? What statistical tests will you use? What software will you use?"
            />
          </div>
          <div>
            <Label htmlFor="ethical-considerations">Ethical Considerations</Label>
            <Textarea
              id="ethical-considerations"
              value={ethicalConsiderations}
              onChange={(e) => setEthicalConsiderations(e.target.value)}
              rows={5}
              placeholder="What ethical issues do you need to consider? How will you ensure the confidentiality and anonymity of your participants? How will you obtain informed consent?"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium">Generated Methodology Plan</h3>
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

export default MethodologyPlanner;
