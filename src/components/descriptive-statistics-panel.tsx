"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
;
import { BarChart3, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface DescriptiveStatisticsPanelProps {
  uploadedData: Record<string, any>[];
  columns: string[];
}

// Define specific types for each stats result
type NumericalStatsResult = {
  type: 'numerical';
  count: number;
  mean: string;
  median: string;
  mode: string;
  stdDev: string;
  min: string;
  max: string;
};

type CategoricalStatsResult = {
  type: 'categorical';
  counts: [string, number][];
};

type EmptyStatsResult = {
  type: 'empty';
};

// Union type for all possible stats results
type StatsResult = NumericalStatsResult | CategoricalStatsResult | EmptyStatsResult;

// Type for an individual column's stats
type ColumnStatsEntry = {
  column: string;
  stats: StatsResult;
};

export function DescriptiveStatisticsPanel({ uploadedData, columns }: DescriptiveStatisticsPanelProps) {
  if (uploadedData.length === 0) {
    return (
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle>No Data for Descriptive Statistics</AlertTitle>
        <AlertDescription>
          Upload a CSV or XLSX file in the &quot;Data Management&quot; tab to see descriptive statistics.
        </AlertDescription>
      </Alert>
    );
  }

  const calculateDescriptiveStats = (column: string): StatsResult => {
    const values = uploadedData.map(row => parseFloat(row[column])).filter(val => !isNaN(val));

    if (values.length === 0) {
      // Check if it's a categorical column
      const nonNumericValues = uploadedData.map(row => String(row[column])).filter(val => val.trim() !== '');
      if (nonNumericValues.length > 0) {
        const counts: { [key: string]: number } = {};
        nonNumericValues.forEach(val => {
          counts[val] = (counts[val] || 0) + 1;
        });
        const sortedCounts = Object.entries(counts).sort(([, countA], [, countB]) => countB - countA) as [string, number][];
        return { type: 'categorical', counts: sortedCounts };
      }
      return { type: 'empty' };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sortedValues.length / 2);
    const median = sortedValues.length % 2 === 0
      ? (sortedValues[mid - 1] + sortedValues[mid]) / 2
      : sortedValues[mid];

    const modeMap: { [key: number]: number } = {};
    let maxCount = 0;
    let modes: number[] = [];
    values.forEach(val => {
      modeMap[val] = (modeMap[val] || 0) + 1;
      if (modeMap[val] > maxCount) {
        maxCount = modeMap[val];
        modes = [val];
      } else if (modeMap[val] === maxCount && !modes.includes(val)) {
        modes.push(val);
      }
    });
    const mode = modes.length === values.length ? 'N/A (all unique)' : modes.join(', ');

    const stdDev = values.length > 1 ? Math.sqrt(values.reduce((sumSq, val) => sumSq + Math.pow(val - mean, 2), 0) / (values.length - 1)) : 0;

    return {
      type: 'numerical',
      count: values.length,
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      mode: mode,
      stdDev: stdDev.toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
    };
  };

  const allStats: ColumnStatsEntry[] = columns.map(col => ({
    column: col,
    stats: calculateDescriptiveStats(col),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Descriptive Statistics
        </CardTitle>
        <CardDescription>Summary statistics for each column in your dataset.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Mean</TableHead>
                <TableHead>Median</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Std. Dev.</TableHead>
                <TableHead>Min</TableHead>
                <TableHead>Max</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStats.map((colStats, index) => {
                const { stats } = colStats; // Destructure stats here for type narrowing
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{colStats.column}</TableCell>
                    {stats.type === 'numerical' ? (
                      <>
                        <TableCell>Numerical</TableCell>
                        <TableCell>{stats.count}</TableCell>
                        <TableCell>{stats.mean}</TableCell>
                        <TableCell>{stats.median}</TableCell>
                        <TableCell>{stats.mode}</TableCell>
                        <TableCell>{stats.stdDev}</TableCell>
                        <TableCell>{stats.min}</TableCell>
                        <TableCell>{stats.max}</TableCell>
                      </>
                    ) : stats.type === 'categorical' ? (
                      <>
                        <TableCell>Categorical</TableCell>
                        <TableCell colSpan={8}>
                          <ul className="list-disc list-inside text-sm">
                            {stats.counts.map(([val, count]) => (
                              <li key={val}>{val}: {count}</li>
                            ))}
                          </ul>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>Empty/Invalid</TableCell>
                        <TableCell colSpan={8}>N/A</TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}