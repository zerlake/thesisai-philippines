"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "./auth-provider";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  onUpload: (url: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, onUpload }: AvatarUploadProps) {
  const { profile } = useAuth();

  const getInitials = () => {
    if (!profile) return "?";
    const firstNameInitial = profile.first_name ? profile.first_name[0] : "";
    const lastNameInitial = profile.last_name ? profile.last_name[0] : "";
    return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
  };

  return (
    <Avatar className="h-24 w-24 border-4 border-background">
      <AvatarImage src={currentAvatarUrl || undefined} />
      <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
    </Avatar>
  );
}