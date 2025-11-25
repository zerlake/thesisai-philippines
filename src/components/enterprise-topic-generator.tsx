"use client";

import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  BrainCircuit,
  FilePlus2,
  Wand2,
  Star,
  Download,
  Share2,
  Settings,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  BarChart3,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { FieldOfStudySelector } from "./field-of-study-selector";
import { useRouter } from "next/navigation";
import { getSupabaseFunctionUrl } from "@/integrations/supabase/client";
import { useApiCall } from "@/hooks/use-api-call";

type TopicIdea = {
  title: string;
  description: string;
  feasibilityScore?: number;
  innovationScore?: number;
  estimatedDuration?: string;
  resourceRequirements?: string;
  researchGap?: string;
};

type FilterOptions = {
  feasibilityMin: number;
  innovationMin: number;
  duration: string;
  sortBy: "relevance" | "feasibility" | "innovation" | "duration";
};

export function EnterpriseTopicGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();

  const [field, setField] = useState("");
  const [ideas, setIdeas] = useState<TopicIdea[]>([]);
  // const [isLoading, setIsLoading] = useState(false); // Replaced by useApiCall's loading state
  const [isSaving, setIsSaving] = useState(false);

  const { execute: generateTopics, loading: isGenerating } = useApiCall<any>({
    onSuccess: (data) => {
      if (!data.topicIdeas) {
        throw new Error("API returned no topic ideas data.");
      }
      setIdeas(data.topicIdeas);
      toast.success(`Generated ${data.topicIdeas.length} topic ideas`);
    },
    onError: (error) => {
      toast.error(error.message || "An unexpected error occurred.");
      console.error(error);
    },
    autoErrorToast: false,
  });
  const [savedTopics, setSavedTopics] = useState<TopicIdea[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    feasibilityMin: 0,
    innovationMin: 0,
    duration: "all",
    sortBy: "relevance",
  });

  // Filter and sort ideas
  const filteredIdeas = useMemo(() => {
    let filtered = ideas.filter((idea) => {
      if (filters.feasibilityMin > 0 && (idea.feasibilityScore || 0) < filters.feasibilityMin) {
        return false;
      }
      if (filters.innovationMin > 0 && (idea.innovationScore || 0) < filters.innovationMin) {
        return false;
      }
      if (filters.duration !== "all") {
        const duration = idea.estimatedDuration?.toLowerCase() || "";
        if (filters.duration === "short" && !duration.includes("3-6")) return false;
        if (filters.duration === "medium" && !duration.includes("6-12")) return false;
        if (filters.duration === "long" && !duration.includes("12+")) return false;
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "feasibility":
          return (b.feasibilityScore || 0) - (a.feasibilityScore || 0);
        case "innovation":
          return (b.innovationScore || 0) - (a.innovationScore || 0);
        case "duration":
          return (a.estimatedDuration || "").localeCompare(b.estimatedDuration || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [ideas, filters]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!field) {
        toast.error("Please select a field of study.");
        return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIdeas([]); // Clear previous ideas

    try {
      await generateTopics(
        getSupabaseFunctionUrl("generate-topic-ideas-enterprise"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ field }),
        }
      );
    } catch (error: any) {
        // Errors are already handled by useApiCall's onError
        console.error("Local error before API call in handleGenerate:", error);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!user || filteredIdeas.length === 0 || !field) return;
    setIsSaving(true);

    let content = `<h1>Enterprise Research Topic Analysis: ${field}</h1><hr>`;
    content += `<h2>Generated Topics: ${filteredIdeas.length}</h2>`;

    filteredIdeas.forEach((idea, index) => {
      content += `<h3>Topic ${index + 1}: ${idea.title}</h3>`;
      content += `<p><strong>Description:</strong> ${idea.description}</p>`;
      if (idea.feasibilityScore) {
        content += `<p><strong>Feasibility Score:</strong> ${idea.feasibilityScore}/10</p>`;
      }
      if (idea.innovationScore) {
        content += `<p><strong>Innovation Score:</strong> ${idea.innovationScore}/10</p>`;
      }
      if (idea.estimatedDuration) {
        content += `<p><strong>Estimated Duration:</strong> ${idea.estimatedDuration}</p>`;
      }
      if (idea.resourceRequirements) {
        content += `<p><strong>Resource Requirements:</strong> ${idea.resourceRequirements}</p>`;
      }
      if (idea.researchGap) {
        content += `<p><strong>Research Gap:</strong> ${idea.researchGap}</p>`;
      }
      content += `<hr>`;
    });

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: `Enterprise Topic Analysis: ${field}`,
        content: content,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save draft.");
      console.error(error);
    } else if (newDoc) {
      toast.success("Draft saved successfully!");
      router.push(`/drafts/${newDoc.id}`);
    }
    setIsSaving(false);
  };

  const handleExportPDF = () => {
    if (filteredIdeas.length === 0) return;
    toast.success("PDF export feature coming soon!");
  };

  const handleAddToFavorites = (topic: TopicIdea) => {
    setSavedTopics([...savedTopics, topic]);
    toast.success("Topic added to favorites");
  };

  const handleRemoveFromFavorites = (index: number) => {
    setSavedTopics(savedTopics.filter((_, i) => i !== index));
    toast.success("Topic removed from favorites");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl flex items-center gap-2">
                <BrainCircuit className="w-8 h-8 text-primary" />
                Enterprise Topic Generator
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Advanced thesis topic research and analysis platform with feasibility assessment, innovation scoring, and comprehensive planning tools
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Settings className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Generation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Topic Ideas</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field">Field of Study</Label>
              <FieldOfStudySelector
                value={field}
                onValueChange={setField}
                disabled={isGenerating}
              />
            </div>
            <Button type="submit" disabled={isLoading || !field || !session} size="lg" className="w-full">
              <Wand2 className="w-4 h-4 mr-2" />
              {isGenerating ? "Analyzing Topics..." : "Generate & Analyze Ideas"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="border-secondary">
          <CardHeader>
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm">Min Feasibility</Label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.feasibilityMin}
                  onChange={(e) => setFilters({ ...filters, feasibilityMin: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{filters.feasibilityMin}/10</span>
              </div>
              <div>
                <Label className="text-sm">Min Innovation</Label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.innovationMin}
                  onChange={(e) => setFilters({ ...filters, innovationMin: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{filters.innovationMin}/10</span>
              </div>
              <div>
                <Label className="text-sm">Duration</Label>
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  <option value="all">All Durations</option>
                  <option value="short">3-6 Months</option>
                  <option value="medium">6-12 Months</option>
                  <option value="long">12+ Months</option>
                </select>
              </div>
              <div>
                <Label className="text-sm">Sort By</Label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                  className="w-full px-2 py-1 border rounded text-sm"
                >
                  <option value="relevance">Relevance</option>
                  <option value="feasibility">Feasibility</option>
                  <option value="innovation">Innovation</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {ideas.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Total Ideas</span>
                </div>
                <p className="text-2xl font-bold">{ideas.length}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Avg Feasibility</span>
                </div>
                <p className="text-2xl font-bold">
                  {(ideas.reduce((acc, i) => acc + (i.feasibilityScore || 0), 0) / ideas.length).toFixed(1)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium">Avg Innovation</span>
                </div>
                <p className="text-2xl font-bold">
                  {(ideas.reduce((acc, i) => acc + (i.innovationScore || 0), 0) / ideas.length).toFixed(1)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Saved Favorites</span>
                </div>
                <p className="text-2xl font-bold">{savedTopics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Ideas */}
      {(isGenerating || filteredIdeas.length > 0) && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Research Topics {filteredIdeas.length > 0 && `(${filteredIdeas.length})`}
            </h3>
            {filteredIdeas.length > 0 && !isGenerating && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" onClick={handleSaveAsDraft} disabled={isSaving}>
                  <FilePlus2 className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Draft"}
                </Button>
              </div>
            )}
          </div>

          {isGenerating ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIdeas.map((idea, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div
                    className="cursor-pointer"
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-start gap-3">
                            <BrainCircuit className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                            <span>{idea.title}</span>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-2">{idea.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites(idea);
                          }}
                        >
                          <Star className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {idea.feasibilityScore !== undefined && (
                          <div className="bg-blue-50 rounded p-2">
                            <p className="text-xs text-muted-foreground">Feasibility</p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(idea.feasibilityScore / 10) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold">{idea.feasibilityScore}/10</span>
                            </div>
                          </div>
                        )}
                        {idea.innovationScore !== undefined && (
                          <div className="bg-purple-50 rounded p-2">
                            <p className="text-xs text-muted-foreground">Innovation</p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full"
                                  style={{ width: `${(idea.innovationScore / 10) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold">{idea.innovationScore}/10</span>
                            </div>
                          </div>
                        )}
                        {idea.estimatedDuration && (
                          <div className="bg-green-50 rounded p-2">
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="text-sm font-semibold mt-1">{idea.estimatedDuration}</p>
                          </div>
                        )}
                        {idea.resourceRequirements && (
                          <div className="bg-orange-50 rounded p-2">
                            <p className="text-xs text-muted-foreground">Resources</p>
                            <p className="text-sm font-semibold mt-1">{idea.resourceRequirements}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  {expandedIndex === index && (
                    <CardContent className="border-t pt-4">
                      {idea.researchGap && (
                        <div className="mb-4">
                          <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4" />
                            Research Gap
                          </h4>
                          <p className="text-sm text-muted-foreground">{idea.researchGap}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => {}}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Literature
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {}}>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Detailed Analysis
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Saved Favorites */}
      {savedTopics.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Saved Favorites ({savedTopics.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedTopics.map((topic, index) => (
                <div key={index} className="flex items-start justify-between bg-white p-3 rounded">
                  <div className="flex-1">
                    <p className="font-medium">{topic.title}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromFavorites(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
