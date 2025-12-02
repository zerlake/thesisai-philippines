"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const designRationales = {
  quantitative:
    "This study will utilize a quantitative research design, specifically a [descriptive, correlational, quasi-experimental, etc.] approach. This design is appropriate as it allows for the statistical analysis of numerical data to identify patterns, relationships, and test hypotheses regarding [Your Variables]. By quantifying the problem, this approach will provide objective and generalizable results.",
  qualitative:
    "A qualitative research design, specifically a [phenomenological, case study, ethnographic, etc.] approach, will be employed in this study. This design is best suited for exploring the in-depth, nuanced perspectives and lived experiences of the participants concerning [Your Research Topic]. It will allow for a rich, contextual understanding of the phenomenon under investigation.",
  "mixed-methods":
    "This research will adopt a mixed-methods design, utilizing a [sequential explanatory, convergent parallel, etc.] approach. This design is optimal as it combines the strengths of both quantitative and qualitative data. The quantitative phase will provide a broad overview and statistical analysis of [Your Quantitative Aspect], while the qualitative phase will offer a deeper, contextual understanding of [Your Qualitative Aspect], leading to a more comprehensive set of findings.",
};

export function ResearchDesignSelector() {
  const [design, setDesign] = useState("quantitative");
  const [rationale, setRationale] = useState("");

  const handleGenerateRationale = () => {
    setRationale(designRationales[design as keyof typeof designRationales]);
    toast.success("Rationale generated!");
  };

  const handleCopyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleLoadSampleData = () => {
    const designs = Object.keys(designRationales);
    let randomDesign = designs[Math.floor(Math.random() * designs.length)];
    // Ensure it's different from current design if possible
    while (randomDesign === design && designs.length > 1) {
      randomDesign = designs[Math.floor(Math.random() * designs.length)];
    }
    setDesign(randomDesign);
    setRationale(designRationales[randomDesign as keyof typeof designRationales]);
    toast.info("Sample research design loaded and rationale generated!");
  };

  return (
    <div className="space-y-4">
      <RadioGroup value={design} onValueChange={setDesign}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="quantitative" id="quantitative" />
          <Label htmlFor="quantitative">Quantitative</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="qualitative" id="qualitative" />
          <Label htmlFor="qualitative">Qualitative</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="mixed-methods" id="mixed-methods" />
          <Label htmlFor="mixed-methods">Mixed-Methods</Label>
        </div>
      </RadioGroup>
      <div className="flex gap-2">
        <Button onClick={handleGenerateRationale}>
          <Wand2 className="w-4 h-4 mr-2" /> Generate Rationale
        </Button>
        <Button variant="outline" onClick={handleLoadSampleData}>
          Load Sample Data
        </Button>
      </div>
      {rationale && (
        <div className="relative">
          <Textarea value={rationale} readOnly rows={5} />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => handleCopyToClipboard(rationale)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}