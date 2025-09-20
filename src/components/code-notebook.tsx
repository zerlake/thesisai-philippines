"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Play, Code, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Label } from "./ui/label";

export function CodeNotebook() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error("Please enter some code to run.");
      return;
    }

    setIsLoading(true);
    setOutput("");

    // Simulate code execution
    await new Promise(resolve => setTimeout(resolve, 1500));

    let simulatedOutput = "";
    if (language === "python") {
      if (code.includes("print(")) {
        simulatedOutput = "Simulated Python Output: Hello, World! (or similar)";
      } else if (code.includes("import pandas")) {
        simulatedOutput = "Simulated Python Output: Dataframe loaded (or similar)";
      } else {
        simulatedOutput = "Simulated Python Output: Code executed successfully.";
      }
    } else if (language === "r") {
      if (code.includes("print(")) {
        simulatedOutput = "Simulated R Output: [1] \"Hello, R!\" (or similar)";
      } else if (code.includes("library(ggplot2)")) {
        simulatedOutput = "Simulated R Output: ggplot2 loaded (or similar)";
      } else {
        simulatedOutput = "Simulated R Output: Code executed successfully.";
      }
    }
    
    setOutput(simulatedOutput + "\n\nNote: This is a simulated output. Full in-browser execution is a complex feature under development.");
    setIsLoading(false);
    toast.success("Code execution simulated!");
  };

  const handleCopyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-6 h-6" />
          In-Browser Code Notebook
        </CardTitle>
        <CardDescription>
          Write and execute R or Python code directly in your browser. (Simulated execution)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language-select">Language</Label>
          <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
            <SelectTrigger id="language-select" className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="r">R</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="code-input">Code Editor</Label>
          <Textarea
            id="code-input"
            placeholder={`Write your ${language} code here...`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={10}
            className="font-mono"
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleRunCode} disabled={isLoading || !code.trim()} className="w-full">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          Run Code
        </Button>
        {output && (
          <div className="relative space-y-2">
            <Label>Output</Label>
            <Textarea value={output} readOnly rows={8} className="font-mono bg-muted" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-8 right-2"
              onClick={() => handleCopyToClipboard(output)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}