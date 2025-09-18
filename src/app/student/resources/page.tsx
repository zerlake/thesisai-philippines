import { InteractiveStyleGuide } from "@/components/interactive-style-guide";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2 } from "lucide-react";

export default function ResourcesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>
            Tools and guides to help with your research and writing.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5" /> Interactive Citation Formatter</CardTitle>
          <CardDescription>Select a style and source type, then fill in the fields to generate a formatted citation.</CardDescription>
        </CardHeader>
        <CardContent>
          <InteractiveStyleGuide />
        </CardContent>
      </Card>
    </div>
  );
}