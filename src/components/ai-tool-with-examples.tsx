"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lightbulb } from "lucide-react";

interface AIToolExampleProps {
  title: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  exampleInput: string;
  exampleOutput: string;
  isRequired?: boolean;
  optionalFields?: {
    label: string;
    placeholder: string;
    key: string;
  }[];
  onGenerate: (input: string, optional?: Record<string, string>) => Promise<void>;
  isLoading?: boolean;
}

export function AIToolWithExamples({
  title,
  description,
  inputLabel,
  inputPlaceholder,
  exampleInput,
  exampleOutput,
  isRequired = false,
  optionalFields = [],
  onGenerate,
  isLoading = false,
}: AIToolExampleProps) {
  const [input, setInput] = useState("");
  const [optionalValues, setOptionalValues] = useState<Record<string, string>>({});
  const [showExample, setShowExample] = useState(false);

  const handleOptionalChange = (key: string, value: string) => {
    setOptionalValues(prev => ({ ...prev, [key]: value }));
  };

  const canSubmit = input.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enter Your Input</CardTitle>
          <CardDescription>
            {isRequired ? "This field is required." : "Provide as much detail as you'd like for better results."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Required Input */}
          <div className="space-y-2">
            <Label htmlFor="main-input">{inputLabel}</Label>
            <Textarea
              id="main-input"
              placeholder={inputPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {input.length} characters
            </p>
          </div>

          {/* Optional Fields */}
          {optionalFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                placeholder={field.placeholder}
                value={optionalValues[field.key] || ""}
                onChange={(e) => handleOptionalChange(field.key, e.target.value)}
                disabled={isLoading}
              />
            </div>
          ))}

          {/* Submit Button */}
          <Button
            onClick={() => onGenerate(input, optionalValues)}
            disabled={!canSubmit || isLoading}
            size="lg"
            className="w-full"
          >
            {isLoading ? "Generating..." : "Generate"}
          </Button>
        </CardContent>
      </Card>

      {/* Example Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <button
            type="button"
            onClick={() => setShowExample(!showExample)}
            className="text-left w-full flex items-center justify-between hover:opacity-80 transition"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Example Input & Output</span>
            </div>
            <span className="text-lg">{showExample ? "▼" : "▶"}</span>
          </button>
        </CardHeader>

        {showExample && (
          <CardContent className="space-y-4 border-t border-blue-200 pt-4">
            {/* Example Input */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-blue-900">Example Input:</p>
              <div className="bg-white rounded p-3 border border-blue-100 text-sm text-gray-700 whitespace-pre-wrap">
                {exampleInput}
              </div>
            </div>

            {/* Example Output */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-blue-900">Example Output:</p>
              <div className="bg-white rounded p-3 border border-blue-100 text-sm text-gray-700 whitespace-pre-wrap">
                {exampleOutput}
              </div>
            </div>

            {/* Quality Indicator */}
            <div className="bg-white rounded p-3 border border-blue-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-900">
                Quality depends on the detail and clarity of your input. More context = better results.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
