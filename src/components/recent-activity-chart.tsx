"use client";

import { useEffect, useState } from "react";
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
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

type ChartData = {
  name: string;
  words: number;
};

export function RecentActivityChart() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRecentDocuments = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select("title, content")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (error) {
        toast.error("Failed to load recent activity data.");
        console.error("RecentActivityChart: Error fetching documents.", error);
        setIsLoading(false);
        return;
      }

      if (data) {
        const formattedData = data.map((doc) => {
          const text = (doc.content || "").replace(/<[^>]*>?/gm, "");
          const words = text.split(/\s+/).filter(Boolean).length;
          const name = doc.title || "Untitled";
          // Truncate long titles for better chart display
          const displayName = name.length > 20 ? `${name.substring(0, 20)}...` : name;
          return { name: displayName, words };
        }).reverse(); // Reverse to show oldest of the 5 on the left

        setChartData(formattedData);
      }
      setIsLoading(false);
    };

    fetchRecentDocuments();
  }, [user, supabase]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Word count of your last 5 documents.</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
       <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Word count of your last 5 documents.</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-muted-foreground">No document activity to display yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Word count of your last 5 documents.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar dataKey="words" fill="var(--color-primary)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}