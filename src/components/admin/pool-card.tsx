// components/admin/pool-card.tsx
import { Card, Metric, Flex, Text } from '@tremor/react';

interface PoolCardProps {
  title: string;
  remaining: number;
  total: number;
  utilization?: number;
}

export function PoolCard({ title, remaining, total, utilization }: PoolCardProps) {
  const used = total - remaining;
  const percentUsed = utilization !== undefined ? utilization : (used / total) * 100;
  
  let statusColor = 'bg-emerald-500';
  if (percentUsed > 85) {
    statusColor = 'bg-red-500';
  } else if (percentUsed > 65) {
    statusColor = 'bg-yellow-500';
  }

  return (
    <Card 
      decoration="top" 
      decorationColor={
        percentUsed > 85 ? 'red' : 
        percentUsed > 65 ? 'yellow' : 'emerald'
      }
    >
      <Flex align="start">
        <Text>{title}</Text>
        <Metric>₱{remaining.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Metric>
      </Flex>
      <Flex className="mt-2 space-x-2">
        <Text className="text-sm font-medium text-gray-500">
          {percentUsed.toFixed(1)}% used (₱{used.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} of ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
        </Text>
      </Flex>
      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${statusColor}`} 
          style={{ width: `${Math.min(100, percentUsed)}%` }}
        ></div>
      </div>
    </Card>
  );
}