"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "h-full",
  {
    variants: {
      density: {
        compact: "p-2",
        comfortable: "p-4",
        spacious: "p-6",
      },
    },
    defaultVariants: {
      density: "comfortable",
    },
  }
);

interface UIElementCardProps extends VariantProps<typeof cardVariants> {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function UIElementCard({ title, description, children, density, className }: UIElementCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className={cn(cardVariants({ density }))}>
        {children}
      </CardContent>
    </Card>
  );
}