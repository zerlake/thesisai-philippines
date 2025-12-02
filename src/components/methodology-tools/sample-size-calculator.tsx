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

  const sampleData = [
    { population: "1500", margin: "0.05" }, // 5% margin of error
    { population: "5000", margin: "0.03" }, // 3% margin of error
    { population: "10000", margin: "0.01" }, // 1% margin of error
    { population: "500", margin: "0.10" }, // 10% margin of error
  ];

  const handleCalculateSample = () => {
    const N = parseInt(population);
    const e = parseFloat(margin);
    if (isNaN(N) || isNaN(e) || N <= 0 || e <= 0 || e >= 1) {
      toast.error("Please enter a valid population size and margin of error (0-1).");
      setSampleSize(null);
      return;
    }
    const n = Math.ceil(N / (1 + N * e * e));
    setSampleSize(n);
    toast.success(`Calculated sample size is ${n}.`);
  };

  const handleLoadSampleData = () => {
    let newSample = sampleData[Math.floor(Math.random() * sampleData.length)];
    // Ensure the new sample is different from current if possible
    while (newSample.population === population && newSample.margin === margin && sampleData.length > 1) {
      newSample = sampleData[Math.floor(Math.random() * sampleData.length)];
    }
    setPopulation(newSample.population);
    setMargin(newSample.margin);
    // Automatically calculate after loading sample data
    setTimeout(handleCalculateSample, 0); 
    toast.info("Sample data loaded and calculated!");
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
          <Input id="margin" type="number" step="0.01" placeholder="e.g., 0.05 for 5%" value={margin} onChange={e => setMargin(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={handleCalculateSample}>Calculate</Button>
        <Button variant="outline" onClick={handleLoadSampleData}>
          Load Sample Data
        </Button>
      </div>
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