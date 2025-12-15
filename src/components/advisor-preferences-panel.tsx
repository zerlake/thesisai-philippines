"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Save, RotateCcw } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

type SuggestionPreferences = {
  advisor_id: string;
  focus_areas: string[];
  suggestion_tone: "formal" | "encouraging" | "balanced";
  detail_level: "brief" | "moderate" | "comprehensive";
  frequency_days: number;
  auto_generate: boolean;
  include_research_guidance: boolean;
  include_writing_tips: boolean;
  include_methodology_advice: boolean;
  include_presentation_help: boolean;
  custom_instructions: string;
};

const focusAreaOptions = [
  { id: "research_gap", label: "Research Gap" },
  { id: "literature_review", label: "Literature Review" },
  { id: "methodology", label: "Methodology" },
  { id: "writing_quality", label: "Writing Quality" },
  { id: "data_analysis", label: "Data Analysis" },
  { id: "presentation", label: "Presentation" },
  { id: "timeline", label: "Timeline" },
  { id: "student_engagement", label: "Engagement" },
];

const defaultPreferences: SuggestionPreferences = {
  advisor_id: "",
  focus_areas: ["research_gap", "literature_review", "methodology", "writing_quality"],
  suggestion_tone: "balanced",
  detail_level: "moderate",
  frequency_days: 7,
  auto_generate: true,
  include_research_guidance: true,
  include_writing_tips: true,
  include_methodology_advice: true,
  include_presentation_help: false,
  custom_instructions: "",
};

interface AdvisorPreferencesPanelProps {
  isEmbedded?: boolean; // true = integrate into existing sidebar, false = floating button
}

export function AdvisorPreferencesPanel({ isEmbedded = true }: AdvisorPreferencesPanelProps = {}) {
  const { session, supabase } = useAuth();
  const [preferences, setPreferences] = useState<SuggestionPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isOpen, setIsOpen] = useState(isEmbedded); // Embedded = open by default

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem(`advisor-suggestions-${session.user.id}`);
        if (stored) {
          setPreferences(JSON.parse(stored));
          setIsLoading(false);
          return;
        }

        if (supabase) {
          try {
            const { data, error } = await supabase
              .from("advisor_suggestion_preferences")
              .select("*")
              .eq("advisor_id", session.user.id)
              .single();

            if (data) {
              setPreferences(data);
            } else {
              setPreferences({
                ...defaultPreferences,
                advisor_id: session.user.id,
              });
            }
          } catch (err) {
            setPreferences({
              ...defaultPreferences,
              advisor_id: session.user.id,
            });
          }
        } else {
          setPreferences({
            ...defaultPreferences,
            advisor_id: session.user.id,
          });
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [session, supabase]);

  const handleSave = async () => {
    if (!session?.user?.id) return;

    setIsSaving(true);
    try {
      localStorage.setItem(`advisor-suggestions-${session.user.id}`, JSON.stringify(preferences));

      if (supabase) {
        await supabase.from("advisor_suggestion_preferences").upsert({
          advisor_id: session.user.id,
          focus_areas: preferences.focus_areas,
          suggestion_tone: preferences.suggestion_tone,
          detail_level: preferences.detail_level,
          frequency_days: preferences.frequency_days,
          auto_generate: preferences.auto_generate,
          include_research_guidance: preferences.include_research_guidance,
          include_writing_tips: preferences.include_writing_tips,
          include_methodology_advice: preferences.include_methodology_advice,
          include_presentation_help: preferences.include_presentation_help,
          custom_instructions: preferences.custom_instructions,
          updated_at: new Date().toISOString(),
        });
      }

      toast.success("Preferences saved");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFocusArea = (areaId: string) => {
    setPreferences((prev) => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(areaId)
        ? prev.focus_areas.filter((id) => id !== areaId)
        : [...prev.focus_areas, areaId],
    }));
    setHasChanges(true);
  };

  // Floating mode (not embedded)
  if (!isEmbedded) {
    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-3 rounded-l-lg shadow-lg transition-all z-40"
          title="Suggestion Preferences"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      );
    }

    return (
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-950 border-l border-gray-200 dark:border-gray-800 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-sm">Suggestion Preferences</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="text-sm text-gray-500 text-center py-4">Loading...</div>
          ) : (
            <>
              {/* Tone */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Tone</Label>
                <Select
                  value={preferences.suggestion_tone}
                  onValueChange={(value) => {
                    setPreferences({
                      ...preferences,
                      suggestion_tone: value as any,
                    });
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="encouraging">Encouraging</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Detail Level */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Detail Level</Label>
                <Select
                  value={preferences.detail_level}
                  onValueChange={(value) => {
                    setPreferences({
                      ...preferences,
                      detail_level: value as any,
                    });
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Focus Areas */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Focus Areas</Label>
                <div className="space-y-2">
                  {focusAreaOptions.map((area) => (
                    <div key={area.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={area.id}
                        checked={preferences.focus_areas.includes(area.id)}
                        onCheckedChange={() => toggleFocusArea(area.id)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor={area.id} className="text-xs font-normal cursor-pointer">
                        {area.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Auto-generate */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-gen"
                  checked={preferences.auto_generate}
                  onCheckedChange={(checked) => {
                    setPreferences({
                      ...preferences,
                      auto_generate: checked as boolean,
                    });
                    setHasChanges(true);
                  }}
                  className="w-4 h-4"
                />
                <Label htmlFor="auto-gen" className="text-xs font-normal cursor-pointer">
                  Auto-generate
                </Label>
              </div>

              {/* Custom Instructions */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Notes</Label>
                <Textarea
                  placeholder="Any specific preferences..."
                  value={preferences.custom_instructions}
                  onChange={(e) => {
                    setPreferences({
                      ...preferences,
                      custom_instructions: e.target.value,
                    });
                    setHasChanges(true);
                  }}
                  className="text-xs h-20 resize-none"
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-2">
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs flex-1">
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Reset Preferences?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              <div className="flex gap-3 justify-end">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setPreferences({
                      ...defaultPreferences,
                      advisor_id: session?.user?.id || "",
                    });
                    setHasChanges(false);
                  }}
                >
                  Reset
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            size="sm"
            className="text-xs flex-1"
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </div>
    );
  }

  // Embedded mode (integrated into sidebar)
  return (
    <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
      <div className="px-4 pb-4">
        <h4 className="font-semibold text-sm mb-4">Suggestion Preferences</h4>
        
        {isLoading ? (
          <div className="text-xs text-gray-500 text-center py-2">Loading...</div>
        ) : (
          <div className="space-y-3">
            {/* Tone */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tone</Label>
              <Select
                value={preferences.suggestion_tone}
                onValueChange={(value) => {
                  setPreferences({
                    ...preferences,
                    suggestion_tone: value as any,
                  });
                  setHasChanges(true);
                }}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="encouraging">Encouraging</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Detail Level */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Detail</Label>
              <Select
                value={preferences.detail_level}
                onValueChange={(value) => {
                  setPreferences({
                    ...preferences,
                    detail_level: value as any,
                  });
                  setHasChanges(true);
                }}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto-generate */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-gen-embedded"
                checked={preferences.auto_generate}
                onCheckedChange={(checked) => {
                  setPreferences({
                    ...preferences,
                    auto_generate: checked as boolean,
                  });
                  setHasChanges(true);
                }}
                className="w-3 h-3"
              />
              <Label htmlFor="auto-gen-embedded" className="text-xs font-normal cursor-pointer">
                Auto-generate
              </Label>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          size="sm"
          className="w-full text-xs"
        >
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
}
