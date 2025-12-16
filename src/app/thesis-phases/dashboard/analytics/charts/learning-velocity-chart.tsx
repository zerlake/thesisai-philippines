'use client';

import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { week: 'W1', velocity: 1.2 },
  { week: 'W2', velocity: 1.8 },
  { week: 'W3', velocity: 2.1 },
  { week: 'W4', velocity: 2.3 },
  { week: 'W5', velocity: 2.0 },
  { week: 'W6', velocity: 2.5 },
];

export function LearningVelocityChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="velocity" 
          stroke="#8b5cf6" 
          fill="#8b5cf6" 
          fillOpacity={0.3} 
          name="Learning Velocity (%/week)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}