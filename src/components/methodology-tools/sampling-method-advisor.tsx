"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const samplingMethods = {
  "Simple Random": {
    definition: "Every member of the population has an equal chance of being selected. This is like drawing names from a hat. It is the most basic probability sampling method.",
    rationale: "The researchers will employ simple random sampling. This technique is appropriate as it ensures that every member of the [Your Population] has an equal and independent chance of being selected, thereby minimizing bias and enhancing the generalizability of the findings."
  },
  "Stratified Random": {
    definition: "The population is divided into subgroups (strata) based on shared characteristics (e.g., year level, department). A random sample is then taken from each stratum. This ensures representation from all key groups.",
    rationale: "Stratified random sampling will be utilized in this study. The population will first be divided into [Number] strata based on [e.g., course, gender]. Proportional samples will then be drawn from each stratum using a simple random technique. This method is chosen to ensure adequate representation of all subgroups, which is crucial for [mention why it's important for your study]."
  },
  "Purposive": {
    definition: "Participants are selected based on the researcher's judgment and the purpose of the study. You choose individuals who you believe can provide the most valuable and relevant information.",
    rationale: "This study will use purposive sampling. Participants will be selected based on a specific set of criteria, namely: [List your inclusion criteria, e.g., must be a small business owner for at least 5 years]. This non-probability technique is suitable as it allows the researchers to deliberately select individuals who are most knowledgeable and experienced with the phenomenon being investigated."
  },
  "Snowball": {
    definition: "Used for hard-to-reach populations. You start with a few participants and then ask them to refer others who fit the study's criteria. It's useful when you don't have a list of the entire population.",
    rationale: "Snowball sampling will be employed to recruit participants. Initial contact will be made with a small number of [Your Target Group]. These participants will then be asked to refer other individuals from their network who meet the study's criteria. This non-probability method is appropriate for accessing a hard-to-reach or specialized population for which no formal list exists."
  },
  "Convenience": {
    definition: "Participants are selected based on their availability and willingness to take part. It is the easiest method but also the most prone to bias and has limited generalizability.",
    rationale: "The study will utilize convenience sampling due to [e.g., time and resource constraints]. Participants will be selected based on their immediate availability and proximity to the researchers. While this method is practical, the researchers acknowledge its limitations regarding generalizability and potential for sampling bias."
  }
};

export function SamplingMethodAdvisor() {
  const [smq1, setSmq1] = useState<string | null>(null);
  const [smq2, setSmq2] = useState<string | null>(null);
  const [smq3, setSmq3] = useState<string | null>(null);
  const [recommendedSamplingMethod, setRecommendedSamplingMethod] = useState<string | null>(null);

  const handleCopyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSamplingAdvisor = (question: 'smq1' | 'smq2' | 'smq3', value: string) => {
    setRecommendedSamplingMethod(null);
    if (question === 'smq1') {
      setSmq1(value);
      setSmq2(null);
      setSmq3(null);
      if (value === 'no') setRecommendedSamplingMethod(null);
    }
    if (question === 'smq2') {
      setSmq2(value);
      setSmq3(null);
      if (smq1 === 'yes') {
        setRecommendedSamplingMethod(value === 'yes' ? 'Stratified Random' : 'Simple Random');
      } else if (smq1 === 'no') {
        if (value === 'yes') setRecommendedSamplingMethod('Snowball');
      }
    }
    if (question === 'smq3') {
      setSmq3(value);
      setRecommendedSamplingMethod(value === 'yes' ? 'Purposive' : 'Convenience');
    }
  };

  const resetSamplingAdvisor = () => {
    setSmq1(null);
    setSmq2(null);
    setSmq3(null);
    setRecommendedSamplingMethod(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="font-semibold">1. Do you have access to a complete list of every individual in your target population?</Label>
        <RadioGroup value={smq1 || ""} onValueChange={(v) => handleSamplingAdvisor('smq1', v)} className="mt-2">
          <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="smq1-yes" /><Label htmlFor="smq1-yes">Yes</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="smq1-no" /><Label htmlFor="smq1-no">No</Label></div>
        </RadioGroup>
      </div>

      {smq1 === 'yes' && (
        <div>
          <Label className="font-semibold">2. Does your population have distinct subgroups (e.g., different grade levels, departments) that you need to ensure are represented proportionally?</Label>
          <RadioGroup value={smq2 || ""} onValueChange={(v) => handleSamplingAdvisor('smq2', v)} className="mt-2">
            <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="smq2-yes-a" /><Label htmlFor="smq2-yes-a">Yes</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="smq2-no-a" /><Label htmlFor="smq2-no-a">No</Label></div>
          </RadioGroup>
        </div>
      )}

      {smq1 === 'no' && (
        <div>
          <Label className="font-semibold">2. Are you studying a hard-to-reach or specific, niche group (e.g., street vendors, specific online community members)?</Label>
          <RadioGroup value={smq2 || ""} onValueChange={(v) => handleSamplingAdvisor('smq2', v)} className="mt-2">
            <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="smq2-yes-b" /><Label htmlFor="smq2-yes-b">Yes</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="smq2-no-b" /><Label htmlFor="smq2-no-b">No</Label></div>
          </RadioGroup>
        </div>
      )}

      {smq1 === 'no' && smq2 === 'no' && (
        <div>
          <Label className="font-semibold">3. Are you selecting participants based on your expert judgment of who would be most informative for the study?</Label>
          <RadioGroup value={smq3 || ""} onValueChange={(v) => handleSamplingAdvisor('smq3', v)} className="mt-2">
            <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="smq3-yes" /><Label htmlFor="smq3-yes">Yes</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="smq3-no" /><Label htmlFor="smq3-no">No</Label></div>
          </RadioGroup>
        </div>
      )}

      {recommendedSamplingMethod && (
        <>
          <Separator />
          <Alert>
            <AlertTitle>Recommendation: {recommendedSamplingMethod} Sampling</AlertTitle>
            <AlertDescription className="mt-2">
              {samplingMethods[recommendedSamplingMethod as keyof typeof samplingMethods].definition}
            </AlertDescription>
          </Alert>
          <div className="relative">
            <Label className="text-xs font-semibold text-muted-foreground">RATIONALE TEMPLATE</Label>
            <Textarea value={samplingMethods[recommendedSamplingMethod as keyof typeof samplingMethods].rationale} readOnly rows={5} className="mt-1" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-2"
              onClick={() => handleCopyToClipboard(samplingMethods[recommendedSamplingMethod as keyof typeof samplingMethods].rationale)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
      
      {(smq1 || recommendedSamplingMethod) && <Button variant="outline" onClick={resetSamplingAdvisor}>Start Over</Button>}
    </div>
  );
}