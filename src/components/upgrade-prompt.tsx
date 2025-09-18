"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
  featureName: string;
  description: string;
}

export function UpgradePrompt({ featureName, description }: UpgradePromptProps) {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="mt-4">Upgrade to Pro to Use {featureName}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/settings/billing">
          <Button>Upgrade Your Plan</Button>
        </Link>
      </CardContent>
    </Card>
  );
}