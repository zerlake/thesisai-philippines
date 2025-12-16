'use client';

import React from 'react';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Generate mock data for heatmap
const generateData = () => {
  const data: number[][] = [];
  for (let d = 0; d < days.length; d++) {
    const row: number[] = [];
    for (let m = 0; m < months.length; m++) {
      // Random values between 0 and 10
      row.push(Math.floor(Math.random() * 11));
    }
    data.push(row);
  }
  return data;
};

const heatmapData = generateData();

export function SkillMasteryHeatmap() {
  // Function to get background color based on value
  const getBgColor = (value: number) => {
    if (value === 0) return 'bg-gray-200';
    if (value < 3) return 'bg-green-200';
    if (value < 6) return 'bg-green-400';
    if (value < 9) return 'bg-green-600';
    return 'bg-green-800';
  };

  return (
    <div className="w-full">
      <div className="flex">
        {/* Empty corner for alignment */}
        <div className="w-16" />
        {/* Month labels */}
        <div className="flex">
          {months.map((month, index) => (
            <div key={index} className="w-8 h-6 flex items-center justify-center text-xs">
              {month}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="flex items-center">
            <div className="w-16 text-xs text-left pr-2">{day}</div>
            <div className="flex">
              {heatmapData[dayIndex].map((value, monthIndex) => (
                <div
                  key={monthIndex}
                  className={`w-8 h-8 border ${getBgColor(value)}`}
                  title={`${day}, ${months[monthIndex]}: ${value}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}