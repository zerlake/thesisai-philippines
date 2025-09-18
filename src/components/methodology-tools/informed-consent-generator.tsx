"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sampleTemplates = {
  survey: {
    purpose: "This research aims to [briefly state your goal, e.g., understand the perceptions of students regarding online learning]. The data collected will be used to [e.g., provide recommendations for improving the online learning experience].",
    procedure: "You will be asked to complete an online questionnaire that will take approximately [e.g., 10-15] minutes. The questions will ask about your experiences and opinions on [your topic].",
  },
  interview: {
    purpose: "The purpose of this study is to explore [briefly state your goal, e.g., the lived experiences of working students]. The insights from this study will contribute to a deeper understanding of [your topic].",
    procedure: "You will participate in a one-on-one interview that is expected to last for [e.g., 30-45] minutes. The interview will be audio-recorded with your permission. You will be asked questions about [your topic].",
  },
  experiment: {
    purpose: "This study aims to investigate [briefly state your goal, e.g., the effect of a new teaching method on student performance]. The results will help determine the effectiveness of [the intervention].",
    procedure: "You will be randomly assigned to one of two groups. You will be asked to participate in a [e.g., one-hour session] where you will [describe the task, e.g., complete a learning module]. You may also be asked to complete a short test before and after the session.",
  },
};

export function InformedConsentGenerator() {
  const [consentData, setConsentData] = useState({
    title: "",
    researcher: "",
    purpose: "",
    procedure: "",
  });
  const [generatedForm, setGeneratedForm] = useState("");
  const [templateType, setTemplateType] = useState("");

  const handleCopyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleTemplateChange = (type: string) => {
    setTemplateType(type);
    if (type in sampleTemplates) {
      const template = sampleTemplates[type as keyof typeof sampleTemplates];
      setConsentData(prev => ({
        ...prev,
        purpose: template.purpose,
        procedure: template.procedure,
      }));
      toast.info("Sample text has been added. Please edit the bracketed information.");
    } else {
      setConsentData(prev => ({
        ...prev,
        purpose: "",
        procedure: "",
      }));
    }
  };

  const handleGenerateConsent = () => {
    const { title, researcher, purpose, procedure } = consentData;
    if (!title || !researcher || !purpose || !procedure) {
      toast.error("Please fill in all fields to generate the consent form.");
      return;
    }
    const formText = `
      INFORMED CONSENT FORM (Pahintulot na Form)

      Research Title (Pamagat ng Pananaliksik): ${title}
      Researcher (Mananaliksik): ${researcher}

      ---

      Purpose of the Study (Layunin ng Pag-aaral):
      ${purpose}

      Procedure (Pamamaraan):
      ${procedure}

      ---

      Voluntary Participation (Boluntaryong Partisipasyon):
      Your participation is completely voluntary. You can withdraw at any time without penalty.
      (Ang iyong partisipasyon ay boluntaryo. Maaari kang umayaw anumang oras nang walang anumang parusa.)

      Confidentiality (Pagiging Kumpidensyal):
      All information you provide will be kept confidential and used only for this research. Your name will not be mentioned in the final paper.
      (Ang lahat ng impormasyong iyong ibibigay ay mananatiling kumpidensyal at gagamitin lamang para sa pananaliksik na ito. Ang iyong pangalan ay hindi babanggitin sa pinal na papel.)

      ---

      By signing below, I agree to participate in this study.
      (Sa paglagda sa ibaba, ako ay sumasang-ayon na makilahok sa pag-aaral na ito.)

      _________________________
      Participant's Signature over Printed Name (Lagda ng Kalahok sa Ibabaw ng Nakalimbag na Pangalan)

      _________________________
      Date (Petsa)
    `;
    setGeneratedForm(formText.trim());
    toast.success("Consent form generated!");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Load a Sample Template (Optional)</Label>
        <Select value={templateType} onValueChange={handleTemplateChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a study type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="survey">Survey / Questionnaire Study</SelectItem>
            <SelectItem value="interview">Interview Study</SelectItem>
            <SelectItem value="experiment">Experimental Study</SelectItem>
            <SelectItem value="clear">Clear Form</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Research Title</Label>
          <Input value={consentData.title} onChange={e => setConsentData({...consentData, title: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Researcher(s) Name</Label>
          <Input value={consentData.researcher} onChange={e => setConsentData({...consentData, researcher: e.target.value})} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Purpose of the Study</Label>
        <Textarea rows={3} value={consentData.purpose} onChange={e => setConsentData({...consentData, purpose: e.target.value})} />
      </div>
      <div className="space-y-2">
        <Label>Procedure (What will participants do?)</Label>
        <Textarea rows={3} value={consentData.procedure} onChange={e => setConsentData({...consentData, procedure: e.target.value})} />
      </div>
      <Button onClick={handleGenerateConsent}>
        <Wand2 className="w-4 h-4 mr-2" /> Generate Form
      </Button>
      {generatedForm && (
        <>
          <Separator />
          <div className="relative">
            <div className="p-4 border rounded-md bg-tertiary whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
              {generatedForm}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => handleCopyToClipboard(generatedForm)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}