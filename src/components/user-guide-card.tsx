"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BookUser, ArrowRight } from "lucide-react";
import Link from "next/link";

export function UserGuideCard() {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <BookUser className="w-6 h-6 text-primary" />
          <span>New to ThesisAI?</span>
        </CardTitle>
        <CardDescription>
          Our comprehensive user guide will walk you through every feature to help you get the most out of the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/user-guide">
          <Button className="w-full">
            Open the User Guide
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}