import { UIElementCard } from "@/components/ui-element-card";
import { Badge } from "@/components/ui/badge";

export default function BadgesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <UIElementCard
        title="Badges"
        description="Displays a small amount of information."
      >
        <div className="flex gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </UIElementCard>
    </div>
  );
}