"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

interface UIElementCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  density?: "compact" | "comfortable" | "spacious";
}

export function UIElementCard({ title, description, children, density = "comfortable" }: UIElementCardProps) {
  const densityClasses = {
    compact: "p-4",
    comfortable: "p-6",
    spacious: "p-8",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={cn("min-h-[10rem] flex items-center justify-center bg-muted/30 rounded-b-lg", densityClasses[density])}>
        {children}
      </CardContent>
    </Card>
  );
}