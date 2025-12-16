'use client';

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { day: 'Mon', activity: 45 },
  { day: 'Tue', activity: 52 },
  { day: 'Wed', activity: 48 },
  { day: 'Thu', activity: 61 },
  { day: 'Fri', activity: 58 },
  { day: 'Sat', activity: 32 },
  { day: 'Sun', activity: 28 },
];

export function DailyActivityChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="activity" fill="#3b82f6" name="Learning Activity" />
      </BarChart>
    </ResponsiveContainer>
  );
}