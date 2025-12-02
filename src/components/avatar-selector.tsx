"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  UserRound,
  CircleUser,
  User2,
  Bot,
  Brain,
  GraduationCap,
  UserIcon,
  Eye,
  Star,
  Heart,
  Moon,
  Sun,
  Flower,
  Mountain,
  Globe
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";

type AvatarOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

const avatarOptions: AvatarOption[] = [
  { id: "default", label: "Default", icon: <User className="h-8 w-8" /> },
  { id: "user-round", label: "User Round", icon: <UserRound className="h-8 w-8" /> },
  { id: "circle-user", label: "Circle User", icon: <CircleUser className="h-8 w-8" /> },
  { id: "user-2", label: "User 2", icon: <User2 className="h-8 w-8" /> },
  { id: "bot", label: "Robot", icon: <Bot className="h-8 w-8" /> },
  { id: "brain", label: "Brain", icon: <Brain className="h-8 w-8" /> },
  { id: "graduation-cap", label: "Graduation Cap", icon: <GraduationCap className="h-8 w-8" /> },
  { id: "user-icon", label: "User Icon", icon: <UserIcon className="h-8 w-8" /> },
  { id: "eye", label: "Eye", icon: <Eye className="h-8 w-8" /> },
  { id: "star", label: "Star", icon: <Star className="h-8 w-8" /> },
  { id: "heart", label: "Heart", icon: <Heart className="h-8 w-8" /> },
  { id: "moon", label: "Moon", icon: <Moon className="h-8 w-8" /> },
  { id: "sun", label: "Sun", icon: <Sun className="h-8 w-8" /> },
  { id: "flower", label: "Flower", icon: <Flower className="h-8 w-8" /> },
  { id: "mountain", label: "Mountain", icon: <Mountain className="h-8 w-8" /> },
  { id: "globe", label: "Globe", icon: <Globe className="h-8 w-8" /> },
];

export function AvatarSelector({
  currentAvatar
}: {
  currentAvatar: string | null;
}) {
  const { supabase, profile, refreshProfile } = useAuth();
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  // Initialize with the current avatar or find matching predefined avatar
  useEffect(() => {
    if (currentAvatar) {
      // Extract avatar ID from current avatar URL if it's a predefined one
      const urlParts = currentAvatar.split('/');
      const idFromUrl = urlParts[urlParts.length - 1]; // Last part of the URL

      if (idFromUrl && avatarOptions.some(opt => opt.id === idFromUrl)) {
        setSelectedAvatarId(idFromUrl);
      }
    }
  }, [currentAvatar]);

  const handleSelectAvatar = async (avatarId: string) => {
    // Generate URL for the selected avatar (this uses the new ImageResponse API)
    const avatarUrl = `/api/avatar/${avatarId}`;

    // Update the profile in the database
    if (profile?.id) {
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) {
        toast.error("Failed to update avatar.");
        console.error(error);
      } else {
        toast.success("Avatar updated successfully!");
        setSelectedAvatarId(avatarId);
        await refreshProfile();
      }
    }
  };

  // Find the selected avatar option for display
  const selectedOption = avatarOptions.find(opt => opt.id === selectedAvatarId);

  return (
    <div className="mt-4">
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-3">
        {avatarOptions.map((option) => (
          <Button
            key={option.id}
            type="button"
            variant={selectedAvatarId === option.id ? "secondary" : "outline"}
            size="icon"
            className="h-16 w-16 p-2"
            onClick={() => handleSelectAvatar(option.id)}
            aria-label={`Select ${option.label} avatar`}
          >
            <div className="flex flex-col items-center">
              {option.icon}
              <span className="text-xs mt-1 truncate">{option.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}