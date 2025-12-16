'use client';

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { day: 1, retention: 95 },
  { day: 3, retention: 88 },
  { day: 7, retention: 78 },
  { day: 14, retention: 65 },
  { day: 30, retention: 42 },
  { day: 60, retention: 25 },
];

export function RetentionCurveChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottomRight', offset: -5 }} />
        <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="retention" 
          stroke="#ef4444" 
          name="Retention Rate" 
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}