import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface UIElementCardProps {
  title: string;
  children: React.ReactNode;
}

export function UIElementCard({ title, children }: UIElementCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}