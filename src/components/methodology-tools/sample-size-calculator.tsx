"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SampleSizeCalculator() {
  const [population, setPopulation] = useState("");
  const [margin, setMargin] = useState("0.05");
  const [sampleSize, setSampleSize] = useState<number | null>(null);

  const handleCalculateSample = () => {
    const N = parseInt(population);
    const e = parseFloat(margin);
    if (isNaN(N) || isNaN(e) || N <= 0 || e <= 0 || e >= 1) {
      toast.error("Please enter a valid population size and margin of error (0-1).");
      return;
    }
    const n = Math.ceil(N / (1 + N * e * e));
    setSampleSize(n);
    toast.success(`Calculated sample size is ${n}.`);
  };

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="population">Total Population (N)</Label>
          <Input id="population" type="number" placeholder="e.g., 1500" value={population} onChange={e => setPopulation(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="margin">Margin of Error (e)</Label>
          <Input id="margin" type="number" placeholder="e.g., 0.05 for 5%" value={margin} onChange={e => setMargin(e.target.value)} />
        </div>
      </div>
      <Button onClick={handleCalculateSample} className="mt-4">Calculate</Button>
      {sampleSize !== null && (
        <Alert className="mt-4">
          <AlertTitle>Required Sample Size: {sampleSize}</AlertTitle>
          <AlertDescription>
            Based on a population of {population} with a {parseFloat(margin) * 100}% margin of error, you need at least {sampleSize} respondents.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}