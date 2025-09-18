import { UIElementCard } from "@/components/ui-element-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AvatarsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <UIElementCard
        title="Avatars"
        description="An image element with a fallback for representing a user."
      >
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="/non-existent-image.png" alt="Fallback" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </UIElementCard>
    </div>
  );
}