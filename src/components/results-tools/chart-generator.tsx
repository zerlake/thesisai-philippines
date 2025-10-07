"use client";

import { useRef, useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Plus, Trash2 } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ChartData = {
  name: string;
  value: number;
};

interface ChartGeneratorProps {
  uploadedData?: Record<string, any>[];
  columns?: string[];
}

export function ChartGenerator({ uploadedData = [], columns = [] }: ChartGeneratorProps) {
  const [title, setTitle] = useState("My Chart Title");
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [manualData, setManualData] = useState<ChartData[]>([
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
    { name: "Group C", value: 200 },
  ]);
  const [useUploadedData, setUseUploadedData] = useState(false);
  const [categoryColumn, setCategoryColumn] = useState<string | null>(null);
  const [valueColumn, setValueColumn] = useState<string | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (uploadedData.length > 0 && columns.length > 0) {
      setUseUploadedData(true);
      setCategoryColumn(columns[0]);
      setValueColumn(columns.length > 1 ? columns[1] : null);
    } else {
      setUseUploadedData(false);
    }
  }, [uploadedData, columns]);

  useEffect(() => {
    if (useUploadedData && categoryColumn && valueColumn && uploadedData.length > 0) {
      const newChartData: ChartData[] = uploadedData.map(row => ({
        name: String(row[categoryColumn]),
        value: parseFloat(row[valueColumn]) || 0,
      }));
      setChartData(newChartData);
    } else if (!useUploadedData) {
      setChartData(manualData);
    }
  }, [useUploadedData, categoryColumn, valueColumn, uploadedData, manualData]);

  const handleManualDataChange = (index: number, field: keyof ChartData, value: string | number) => {
    const newData = [...manualData];
    if (field === 'value') {
      newData[index][field] = Number(value);
    } else {
      newData[index][field] = String(value);
    }
    setManualData(newData);
  };

  const addRow = () => {
    setManualData([...manualData, { name: `Group ${String.fromCharCode(65 + manualData.length)}`, value: 0 }]);
  };

  const removeRow = (index: number) => {
    if (manualData.length <= 1) {
        toast.warning("You must have at least one data row.");
        return;
    }
    const newData = manualData.filter((_, i) => i !== index);
    setManualData(newData);
  };

  const handleDownload = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, { cacheBust: true, backgroundColor: 'white', pixelRatio: 2 });
      const link = document.createElement("a");
      const fileName = title ? `${title.replace(/ /g, "_")}.png` : "chart.png";
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      toast.success("Chart downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download chart.");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div>
          <Label htmlFor="chart-title">Chart Title</Label>
          <Input id="chart-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        {useUploadedData && uploadedData.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Using uploaded data from &quot;{columns.join(', ')}&quot;.</p>
            <div className="space-y-2">
              <Label>Category (X-axis) Column</Label>
              <Select value={categoryColumn || ""} onValueChange={setCategoryColumn}>
                <SelectTrigger><SelectValue placeholder="Select category column" /></SelectTrigger>
                <SelectContent>
                  {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Value (Y-axis) Column</Label>
              <Select value={valueColumn || ""} onValueChange={setValueColumn}>
                <SelectTrigger><SelectValue placeholder="Select value column" /></SelectTrigger>
                <SelectContent>
                  {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Manual Data Entry</Label>
            {manualData.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Label"
                  value={row.name}
                  onChange={(e) => handleManualDataChange(index, "name", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Value"
                  value={row.value}
                  onChange={(e) => handleManualDataChange(index, "value", e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={() => removeRow(index)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={addRow}>
              <Plus className="w-4 h-4 mr-2" /> Add Row
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-4">
        <Card ref={chartRef} className="p-4">
          <CardContent className="p-0">
            <h3 className="text-center font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Button onClick={handleDownload} className="w-full">
          <Download className="w-4 h-4 mr-2" /> Download as PNG
        </Button>
      </div>
    </div>
  );
}