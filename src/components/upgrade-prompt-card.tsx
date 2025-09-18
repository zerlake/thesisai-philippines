"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function UpgradePromptCard() {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="items-center text-center">
        <div className="p-3 bg-primary/10 rounded-full w-fit">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="mt-4">Unlock Your Full Potential</CardTitle>
        <CardDescription>
          Upgrade to a Pro plan to get unlimited documents, advanced AI assistance, and unlimited originality checks.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Link href="/settings/billing">
          <Button>Upgrade to Pro</Button>
        </Link>
      </CardContent>
    </Card>
  );
}