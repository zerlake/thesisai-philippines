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

type CriticSuggestionPreferences = {
  critic_id: string;
  review_focus_areas: string[];
  feedback_style: "constructive" | "critical" | "supportive";
  review_depth: "surface_level" | "moderate" | "deep_analysis";
  turnaround_expectation_days: number;
  auto_generate_feedback: boolean;
  include_content_review: boolean;
  include_structure_review: boolean;
  include_methodology_review: boolean;
  include_presentation_review: boolean;
  include_originality_concerns: boolean;
  custom_review_guidelines: string;
};

const reviewFocusOptions = [
  { id: "conceptual_clarity", label: "Conceptual" },
  { id: "literature_coverage", label: "Literature" },
  { id: "methodological_soundness", label: "Methodology" },
  { id: "results_interpretation", label: "Results" },
  { id: "academic_writing", label: "Writing" },
  { id: "argument_strength", label: "Argument" },
  { id: "data_quality", label: "Data Quality" },
  { id: "contribution_significance", label: "Contribution" },
];

const defaultPreferences: CriticSuggestionPreferences = {
  critic_id: "",
  review_focus_areas: [
    "conceptual_clarity",
    "methodological_soundness",
    "results_interpretation",
    "academic_writing",
  ],
  feedback_style: "constructive",
  review_depth: "moderate",
  turnaround_expectation_days: 5,
  auto_generate_feedback: true,
  include_content_review: true,
  include_structure_review: true,
  include_methodology_review: true,
  include_presentation_review: false,
  include_originality_concerns: true,
  custom_review_guidelines: "",
};

interface CriticPreferencesPanelProps {
  isEmbedded?: boolean; // true = integrate into existing sidebar, false = floating button
}

export function CriticPreferencesPanel({ isEmbedded = true }: CriticPreferencesPanelProps = {}) {
  const { session, supabase } = useAuth();
  const [preferences, setPreferences] = useState<CriticSuggestionPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isOpen, setIsOpen] = useState(isEmbedded); // Embedded = open by default

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadPreferences = async () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem(`critic-suggestions-${session.user.id}`);
        if (stored) {
          setPreferences(JSON.parse(stored));
          setIsLoading(false);
          return;
        }

        if (supabase) {
          try {
            const { data, error } = await supabase
              .from("critic_suggestion_preferences")
              .select("*")
              .eq("critic_id", session.user.id)
              .single();

            if (data) {
              setPreferences(data);
            } else {
              setPreferences({
                ...defaultPreferences,
                critic_id: session.user.id,
              });
            }
          } catch (err) {
            setPreferences({
              ...defaultPreferences,
              critic_id: session.user.id,
            });
          }
        } else {
          setPreferences({
            ...defaultPreferences,
            critic_id: session.user.id,
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
      localStorage.setItem(`critic-suggestions-${session.user.id}`, JSON.stringify(preferences));

      if (supabase) {
        await supabase.from("critic_suggestion_preferences").upsert({
          critic_id: session.user.id,
          review_focus_areas: preferences.review_focus_areas,
          feedback_style: preferences.feedback_style,
          review_depth: preferences.review_depth,
          turnaround_expectation_days: preferences.turnaround_expectation_days,
          auto_generate_feedback: preferences.auto_generate_feedback,
          include_content_review: preferences.include_content_review,
          include_structure_review: preferences.include_structure_review,
          include_methodology_review: preferences.include_methodology_review,
          include_presentation_review: preferences.include_presentation_review,
          include_originality_concerns: preferences.include_originality_concerns,
          custom_review_guidelines: preferences.custom_review_guidelines,
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

  const toggleReviewArea = (areaId: string) => {
    setPreferences((prev) => ({
      ...prev,
      review_focus_areas: prev.review_focus_areas.includes(areaId)
        ? prev.review_focus_areas.filter((id) => id !== areaId)
        : [...prev.review_focus_areas, areaId],
    }));
    setHasChanges(true);
  };

  // Floating mode (not embedded)
  if (!isEmbedded) {
    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white px-2 py-3 rounded-l-lg shadow-lg transition-all z-40"
          title="Review Preferences"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      );
    }

    return (
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-950 border-l border-gray-200 dark:border-gray-800 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="font-semibold text-sm">Review Preferences</h3>
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
              {/* Feedback Style */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Feedback Style</Label>
                <Select
                  value={preferences.feedback_style}
                  onValueChange={(value) => {
                    setPreferences({
                      ...preferences,
                      feedback_style: value as any,
                    });
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="constructive">Constructive</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="supportive">Supportive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Review Depth */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Review Depth</Label>
                <Select
                  value={preferences.review_depth}
                  onValueChange={(value) => {
                    setPreferences({
                      ...preferences,
                      review_depth: value as any,
                    });
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="surface_level">Surface</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="deep_analysis">Deep</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Review Focus Areas */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Focus Areas</Label>
                <div className="space-y-2">
                  {reviewFocusOptions.map((area) => (
                    <div key={area.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={area.id}
                        checked={preferences.review_focus_areas.includes(area.id)}
                        onCheckedChange={() => toggleReviewArea(area.id)}
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
                  checked={preferences.auto_generate_feedback}
                  onCheckedChange={(checked) => {
                    setPreferences({
                      ...preferences,
                      auto_generate_feedback: checked as boolean,
                    });
                    setHasChanges(true);
                  }}
                  className="w-4 h-4"
                />
                <Label htmlFor="auto-gen" className="text-xs font-normal cursor-pointer">
                  Auto-generate
                </Label>
              </div>

              {/* Custom Guidelines */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Guidelines</Label>
                <Textarea
                  placeholder="Review criteria..."
                  value={preferences.custom_review_guidelines}
                  onChange={(e) => {
                    setPreferences({
                      ...preferences,
                      custom_review_guidelines: e.target.value,
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
                      critic_id: session?.user?.id || "",
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
        <h4 className="font-semibold text-sm mb-4">Review Preferences</h4>
        
        {isLoading ? (
          <div className="text-xs text-gray-500 text-center py-2">Loading...</div>
        ) : (
          <div className="space-y-3">
            {/* Feedback Style */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Style</Label>
              <Select
                value={preferences.feedback_style}
                onValueChange={(value) => {
                  setPreferences({
                    ...preferences,
                    feedback_style: value as any,
                  });
                  setHasChanges(true);
                }}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="constructive">Constructive</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="supportive">Supportive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Review Depth */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Depth</Label>
              <Select
                value={preferences.review_depth}
                onValueChange={(value) => {
                  setPreferences({
                    ...preferences,
                    review_depth: value as any,
                  });
                  setHasChanges(true);
                }}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="surface_level">Surface</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="deep_analysis">Deep</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto-generate */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-gen-critic"
                checked={preferences.auto_generate_feedback}
                onCheckedChange={(checked) => {
                  setPreferences({
                    ...preferences,
                    auto_generate_feedback: checked as boolean,
                  });
                  setHasChanges(true);
                }}
                className="w-3 h-3"
              />
              <Label htmlFor="auto-gen-critic" className="text-xs font-normal cursor-pointer">
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
