'use client';

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { week: 'W1', flashcards: 85, defense: 70, study: 75 },
  { week: 'W2', flashcards: 88, defense: 72, study: 78 },
  { week: 'W3', flashcards: 90, defense: 75, study: 80 },
  { week: 'W4', flashcards: 92, defense: 78, study: 82 },
];

export function WeeklyTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="flashcards" stroke="#3b82f6" name="Flashcards" />
        <Line type="monotone" dataKey="defense" stroke="#10b981" name="Defense Q&A" />
        <Line type="monotone" dataKey="study" stroke="#8b5cf6" name="Study Guides" />
      </LineChart>
    </ResponsiveContainer>
  );
}