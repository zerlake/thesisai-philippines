"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { type LucideIcon } from "lucide-react";

interface MethodologyToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function MethodologyToolCard({ title, description, icon: Icon, children }: MethodologyToolCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-md flex-shrink-0 mt-1">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}