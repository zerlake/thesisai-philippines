"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function KappaCalculator() {
  const [matrix, setMatrix] = useState({ a: "", b: "", c: "", d: "" });
  const [kappa, setKappa] = useState<number | null>(null);
  const [interpretation, setInterpretation] = useState("");

  const handleInputChange = (cell: keyof typeof matrix, value: string) => {
    setMatrix(prev => ({ ...prev, [cell]: value }));
  };

  const getInterpretation = (k: number): string => {
    if (k < 0) return "Poor";
    if (k <= 0.20) return "Slight";
    if (k <= 0.40) return "Fair";
    if (k <= 0.60) return "Moderate";
    if (k <= 0.80) return "Substantial";
    return "Almost perfect";
  };

  const handleCalculate = () => {
    const a = parseInt(matrix.a);
    const b = parseInt(matrix.b);
    const c = parseInt(matrix.c);
    const d = parseInt(matrix.d);

    if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) {
      toast.error("Please fill in all cells with valid numbers.");
      return;
    }

    const n = a + b + c + d;
    if (n === 0) {
      toast.error("Total observations cannot be zero.");
      return;
    }

    const po = (a + d) / n;
    const p_yes = ((a + b) / n) * ((a + c) / n);
    const p_no = ((c + d) / n) * ((b + d) / n);
    const pe = p_yes + p_no;

    if (pe === 1) {
      toast.warning("Perfect agreement by chance, Kappa is undefined.");
      setKappa(null);
      setInterpretation("");
      return;
    }

    const k = (po - pe) / (1 - pe);
    setKappa(k);
    setInterpretation(getInterpretation(k));
    toast.success(`Kappa coefficient calculated: ${k.toFixed(3)}`);
  };

  const sampleWriteUp = `Thirty-four themes were identified. All of the kappa coefficients were evaluated using the guideline outlined by Landis and Koch (1977), where the strength of the kappa coefficients =0.01-0.20 slight; 0.21-0.40 fair; 0.41-0.60 moderate; 0.61-0.80 substantial; 0.81-1.00 almost perfect, according to Landis & Koch (1977). Of the thirty-four themes, 11 had fair agreement, five had moderate agreement, four had substantial agreement, and four themes had almost perfect agreement.

Reference
Landis, J. R., & Koch, G. G. (1977). The measurement of observer agreement for categorical data. Biometrics, 33, 159-174`;

  const handleCopyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">Enter the frequencies into the 2x2 table below to calculate the inter-rater reliability.</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead className="text-center">Rater 2: Yes</TableHead>
            <TableHead className="text-center">Rater 2: No</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableHead>Rater 1: Yes</TableHead>
            <TableCell><Input type="number" placeholder="A" value={matrix.a} onChange={e => handleInputChange('a', e.target.value)} className="text-center" /></TableCell>
            <TableCell><Input type="number" placeholder="B" value={matrix.b} onChange={e => handleInputChange('b', e.target.value)} className="text-center" /></TableCell>
          </TableRow>
          <TableRow>
            <TableHead>Rater 1: No</TableHead>
            <TableCell><Input type="number" placeholder="C" value={matrix.c} onChange={e => handleInputChange('c', e.target.value)} className="text-center" /></TableCell>
            <TableCell><Input type="number" placeholder="D" value={matrix.d} onChange={e => handleInputChange('d', e.target.value)} className="text-center" /></TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button onClick={handleCalculate} className="mt-4">Calculate Kappa</Button>
      {kappa !== null && (
        <div className="space-y-4 mt-4">
          <Alert>
            <AlertTitle>Result: Kappa (κ) = {kappa.toFixed(3)}</AlertTitle>
            <AlertDescription>
              The level of agreement is considered <strong>{interpretation}</strong>.
            </AlertDescription>
          </Alert>
          <div className="relative">
            <Label className="text-xs font-semibold text-muted-foreground">SAMPLE WRITE-UP</Label>
            <Textarea value={sampleWriteUp} readOnly rows={8} className="mt-1" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-6 right-2"
              onClick={() => handleCopyToClipboard(sampleWriteUp)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}