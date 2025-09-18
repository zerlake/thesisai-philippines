"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

interface StudentProgressOverviewChartProps {
  students: { progress: number }[];
}

export function StudentProgressOverviewChart({ students }: StudentProgressOverviewChartProps) {
  const progressBins = [
    { name: "0-25%", count: 0 },
    { name: "26-50%", count: 0 },
    { name: "51-75%", count: 0 },
    { name: "76-100%", count: 0 },
  ];

  students.forEach(student => {
    const progress = student.progress;
    if (progress <= 25) progressBins[0].count++;
    else if (progress <= 50) progressBins[1].count++;
    else if (progress <= 75) progressBins[2].count++;
    else progressBins[3].count++;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Progress Overview</CardTitle>
        <CardDescription>Distribution of students based on checklist completion.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={progressBins} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-primary)" radius={4}>
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}