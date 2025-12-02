"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Upload, RotateCcw } from "lucide-react";
import { AvatarSelector } from "./avatar-selector";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  onUpload: (url: string) => void;
}

export function AvatarUpload({ currentAvatarUrl, onUpload }: AvatarUploadProps) {
  const { supabase, profile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedPredefinedAvatar, setSelectedPredefinedAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    if (!profile) return "?";
    const firstNameInitial = profile.first_name ? profile.first_name[0] : "";
    const lastNameInitial = profile.last_name ? profile.last_name[0] : "";
    return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match("image.*")) {
      toast.error("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setUploading(true);

    try {
      // Upload to Supabase storage
      const fileName = `${profile?.id}/avatar-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      if (profile?.id) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq("id", profile.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Update parent state
      onUpload(publicUrl);
      toast.success("Avatar uploaded successfully!");
      await refreshProfile();
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(`Failed to upload avatar: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.id) return;

    try {
      // If there's an existing avatar in storage, try to remove it
      if (currentAvatarUrl) {
        const avatarPath = currentAvatarUrl.split('/').slice(-2).join('/');
        if (avatarPath && !avatarPath.includes('placeholder')) {
          const { error: deleteError } = await supabase
            .storage
            .from("avatars")
            .remove([avatarPath]);

          if (deleteError) {
            console.error("Error removing avatar from storage:", deleteError);
          }
        }
      }

      // Update profile with null avatar
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", profile.id);

      if (error) {
        throw error;
      }

      // Update parent state
      onUpload(null);
      toast.success("Avatar removed successfully!");
      await refreshProfile();
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      toast.error(`Failed to remove avatar: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24 border-4 border-background">
          <AvatarImage src={currentAvatarUrl || undefined} />
          <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
        </Avatar>
        <p className="mt-2 text-sm text-muted-foreground">
          Click below to change
        </p>
      </div>

      {/* Predefined Avatar Selector */}
      <div>
        <h3 className="text-lg font-medium mb-2">Select Predefined Avatar</h3>
        <AvatarSelector
          currentAvatar={currentAvatarUrl}
        />
      </div>

      {/* Custom Upload Section */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-medium mb-2">Upload Custom Avatar</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={uploading}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            {uploading ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>
          {currentAvatarUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemoveAvatar}
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              Remove Avatar
            </Button>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          JPG, PNG, or GIF up to 5MB
        </p>
      </div>
    </div>
  );
}