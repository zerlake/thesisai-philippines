import { UIElementCard } from "@/components/ui-element-card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Mail } from "lucide-react";

export default function ButtonsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <UIElementCard
        title="Buttons"
        description="Displays a button or a link."
      >
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button>
            <Mail className="mr-2 h-4 w-4" /> Login with Email
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </UIElementCard>
    </div>
  );
}