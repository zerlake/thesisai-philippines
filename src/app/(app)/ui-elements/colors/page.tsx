import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const colorGroups = [
  {
    name: "Primary",
    description: "Used for main actions, links, and highlights.",
    bg: "bg-primary",
    text: "text-primary-foreground",
  },
  {
    name: "Secondary",
    description: "Used for less prominent elements and backgrounds.",
    bg: "bg-secondary",
    text: "text-secondary-foreground",
  },
  {
    name: "Tertiary",
    description: "Used for subtle backgrounds and dividers.",
    bg: "bg-tertiary",
    text: "text-tertiary-foreground",
  },
  {
    name: "Destructive / Error",
    description: "Used for error messages and destructive actions.",
    bg: "bg-destructive",
    text: "text-destructive-foreground",
  },
  {
    name: "Success",
    description: "Used for success messages and positive feedback.",
    bg: "bg-success",
    text: "text-success-foreground",
  },
  {
    name: "Warning",
    description: "Used for warnings and non-critical alerts.",
    bg: "bg-warning",
    text: "text-warning-foreground",
  },
  {
    name: "Info",
    description: "Used for informational messages and highlights.",
    bg: "bg-info",
    text: "text-info-foreground",
  },
  {
    name: "Card / Background",
    description: "The base colors for content areas and the page.",
    bg: "bg-card",
    text: "text-card-foreground",
    border: "border-2 border-border",
  },
];

export default function ColorsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Color System</CardTitle>
          <CardDescription>
            This page demonstrates the semantic color tokens used throughout the application.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colorGroups.map((group) => (
          <Card key={group.name}>
            <CardContent className="p-0">
              <div className={`h-24 flex items-center justify-center rounded-t-lg ${group.bg} ${group.text} ${group.border}`}>
                <span className="font-bold text-lg">Aa</span>
              </div>
            </CardContent>
            <CardHeader>
              <CardTitle className="text-lg">{group.name}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}