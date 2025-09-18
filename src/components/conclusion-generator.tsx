"use client";

import { useState } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

export function ConclusionGenerator() {
  const [findings, setFindings] = useState("");

  const handleGenerate = () => {
    toast.info("This feature requires an AI backend, which is not set up yet.");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="findings">
          Summarize your key findings from Chapter IV
        </Label>
        <Textarea
          id="findings"
          placeholder="e.g., The study found a significant positive correlation between study hours and exam scores. 75% of students reported using AI tools for research..."
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          rows={5}
        />
      </div>
      <Button onClick={handleGenerate} disabled={!findings}>
        <Wand2 className="w-4 h-4 mr-2" />
        Generate Conclusion Sections
      </Button>
    </div>
  );
}