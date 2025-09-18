"use client";

import { useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Plus, Trash2 } from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

type ChartData = {
  name: string;
  value: number;
};

export function ChartGenerator() {
  const [title, setTitle] = useState("My Chart Title");
  const [data, setData] = useState<ChartData[]>([
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
    { name: "Group C", value: 200 },
  ]);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDataChange = (index: number, field: keyof ChartData, value: string | number) => {
    const newData = [...data];
    if (field === 'value') {
      newData[index][field] = Number(value);
    } else {
      newData[index][field] = String(value);
    }
    setData(newData);
  };

  const addRow = () => {
    setData([...data, { name: `Group ${String.fromCharCode(65 + data.length)}`, value: 0 }]);
  };

  const removeRow = (index: number) => {
    if (data.length <= 1) {
        toast.warning("You must have at least one data row.");
        return;
    }
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
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
        <div className="space-y-2">
          <Label>Data</Label>
          {data.map((row, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Label"
                value={row.name}
                onChange={(e) => handleDataChange(index, "name", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Value"
                value={row.value}
                onChange={(e) => handleDataChange(index, "value", e.target.value)}
              />
              <Button variant="ghost" size="icon" onClick={() => removeRow(index)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="outline" onClick={addRow}>
          <Plus className="w-4 h-4 mr-2" /> Add Row
        </Button>
      </div>
      <div className="space-y-4">
        <Card ref={chartRef} className="p-4">
          <CardContent className="p-0">
            <h3 className="text-center font-semibold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
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