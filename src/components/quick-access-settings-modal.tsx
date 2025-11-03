"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { quickAccessItems } from "../lib/quick-access-items"; // Assuming quickAccessItems is moved here

interface QuickAccessSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAccessSettingsModal({
  open,
  onOpenChange,
}: QuickAccessSettingsModalProps) {
  const { supabase, user, profile, fetchProfile } = useAuth();
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.user_preferences?.quick_access_tools) {
      setSelectedTools(profile.user_preferences.quick_access_tools);
    } else {
      // If no preferences, all are selected by default
      setSelectedTools(quickAccessItems.map((item) => item.title));
    }
  }, [profile]);

  const handleCheckboxChange = (title: string, checked: boolean) => {
    setSelectedTools((prev) =>
      checked ? [...prev, title] : prev.filter((item) => item !== title),
    );
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save preferences.");
      return;
    }
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        user_preferences: {
          ...profile?.user_preferences,
          quick_access_tools: selectedTools,
        },
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error saving quick access preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
    } else {
      toast.success("Quick access preferences saved!");
      fetchProfile(); // Refresh profile to update dashboard
      onOpenChange(false);
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Quick Access Tools</DialogTitle>
          <DialogDescription>
            Select the tools you want to see on your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {quickAccessItems.map((item) => (
            <div key={item.title} className="flex items-center space-x-2">
              <Checkbox
                id={item.title}
                checked={selectedTools.includes(item.title)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(item.title, checked as boolean)
                }
              />
              <Label htmlFor={item.title}>{item.title}</Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
