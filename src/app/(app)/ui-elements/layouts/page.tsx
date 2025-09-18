"use client";

import { useState } from "react";
import { UIElementCard } from "@/components/ui-element-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Density = "compact" | "comfortable" | "spacious";

export default function LayoutsPage() {
  const [density, setDensity] = useState<Density>("comfortable");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Layouts & Spacing</CardTitle>
          <CardDescription>
            This page demonstrates the application's elevation system (shadows) and density variations for components.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Elevation System</CardTitle>
          <CardDescription>A consistent shadow hierarchy for creating depth.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-8 rounded-lg shadow-sm bg-card border flex items-center justify-center">sm</div>
          <div className="p-8 rounded-lg shadow-md bg-card border flex items-center justify-center">md</div>
          <div className="p-8 rounded-lg shadow-lg bg-card border flex items-center justify-center">lg</div>
          <div className="p-8 rounded-lg shadow-xl bg-card border flex items-center justify-center">xl</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Density Variations</CardTitle>
          <CardDescription>Adjust the spacing within components to suit different contexts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleGroup type="single" value={density} onValueChange={(value: Density) => value && setDensity(value)}>
            <ToggleGroupItem value="compact">Compact</ToggleGroupItem>
            <ToggleGroupItem value="comfortable">Comfortable</ToggleGroupItem>
            <ToggleGroupItem value="spacious">Spacious</ToggleGroupItem>
          </ToggleGroup>
          <UIElementCard
            title="Example Card"
            description="This card's content padding will change based on the selected density."
            density={density}
          >
            <div className="bg-muted h-full rounded-md flex items-center justify-center">
              <Button>Example Button</Button>
            </div>
          </UIElementCard>
        </CardContent>
      </Card>
    </div>
  );
}