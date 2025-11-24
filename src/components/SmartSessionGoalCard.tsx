import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
;
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { SmartGoalEngine, type GoalRecommendation } from "@/lib/smartGoalEngine";
import { useAuth } from "./auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import { useGoalTracking } from "@/hooks/useGoalTracking";
import { supabase } from "@/integrations/supabase/client";
import { Target, Check, Loader2, Edit, ChevronDown, RefreshCw } from "lucide-react";

const LOCAL_STORAGE_KEY = "thesis-session-goal";

type Goal = {
  text: string;
  isCompleted: boolean;
  type: 'word_count' | 'time_based' | 'task_based';
  target?: number;
};

export function SmartSessionGoalCard() {
  const { session } = useAuth();
  const { progress, currentGoal } = useGoalTracking();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [recommendation, setRecommendation] = useState<GoalRecommendation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [activeRecommendation, setActiveRecommendation] = useState(false);

  const goalEngine = useMemo(() => new SmartGoalEngine(), []);

  const generateGoal = useCallback(async () => {
    if (!session?.user.id) return;
    
    setIsGenerating(true);
    try {
      const rec = await goalEngine.recommendGoal(session.user.id);
      setRecommendation(rec);
      setActiveRecommendation(true);
    } catch (error) {
      console.error('Failed to generate goal:', error);
      toast.error("Failed to generate a personalized goal. Using default goal instead.");
      // Set a default goal
      setRecommendation({
        type: 'word_count',
        target: 300,
        reasoning: "Set a daily goal to maintain writing momentum.",
        difficulty: 'moderate',
        estimatedCompletionTime: 45,
        alternativeGoals: [
          {
            type: 'word_count',
            target: 200,
            reasoning: 'A lighter goal for a quick win'
          },
          {
            type: 'time_based',
            target: 30,
            reasoning: 'Focus on time instead of word count'
          }
        ]
      });
      setActiveRecommendation(true);
    } finally {
      setIsGenerating(false);
    }
  }, [session, goalEngine]);

  useEffect(() => {
    const loadGoal = async () => {
      try {
        // Try to get today's goal from localStorage
        const storedGoal = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedGoal) {
          const parsedGoal = JSON.parse(storedGoal);
          // Check if it's from today
          const today = new Date().toDateString();
          const goalDate = new Date(parsedGoal.timestamp || '').toDateString();
          if (today === goalDate) {
            setGoal(parsedGoal);
            return;
          }
        }

        // If no goal for today, try to generate a recommendation
        if (session?.user.id) {
          await generateGoal();
        }
      } catch (error) {
        console.error("Failed to load goal from localStorage", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    };

    loadGoal();
  }, [session, generateGoal]);

  const acceptGoal = async (target: number, type: string) => {
    if (!session?.user.id) return;

    const goalText = type === 'word_count' 
      ? `Write ${target} words` 
      : type === 'time_based' 
        ? `Write for ${target} minutes` 
        : `Complete 1 writing task`;
    
    // Save to database
    const { data: _data, error } = await supabase
      .from('writing_goals')
      .insert([{
        user_id: session.user.id,
        type,
        target,
        achieved: 0,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        completed: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
      return;
    }

    const newGoal = { 
      text: goalText, 
      isCompleted: false, 
      type: type as 'word_count' | 'time_based' | 'task_based',
      target
    };
    
    setGoal(newGoal);
    setActiveRecommendation(false);
    
    // Save to localStorage with timestamp
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      ...newGoal,
      timestamp: new Date().toISOString()
    }));
    
    toast.success("Goal set successfully!");
  };

  const handleSetGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim()) return;

    // Validate goal length - keep it realistic
    const wordCount = editText.trim().split(/\s+/).length;
    if (wordCount > 10) {
      toast.warning("Please make your goal more specific and concise.");
      return;
    }

    const newGoal = { text: editText, isCompleted: false, type: 'task_based' as const };
    setGoal(newGoal);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      ...newGoal,
      timestamp: new Date().toISOString()
    }));
    setIsEditing(false);
    setEditText("");
    toast.success("Session goal set!");
  };

  const handleToggleCompletion = (isCompleted: boolean) => {
    if (!goal) return;
    const updatedGoal = { ...goal, isCompleted };
    setGoal(updatedGoal);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      ...updatedGoal,
      timestamp: new Date().toISOString()
    }));
  };

  const handleEdit = () => {
    if (!goal) return;
    setEditText(goal.text);
    setIsEditing(true);
  };

  // Use real progress from the hook instead of local state
  const currentTarget = goal?.target || currentGoal?.target || 0;
  const currentProgress = progress || 0;
  
  // Check if goal is complete based on real progress
  const isGoalComplete = !!(goal?.isCompleted || 
                        (currentGoal?.completed) || 
                        (goal?.type === 'word_count' && currentTarget && currentProgress >= currentTarget));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Today&apos;s Goal</CardTitle>
        <div className="p-2 bg-primary/10 rounded-md">
          <Target className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {activeRecommendation && recommendation ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Main Recommendation */}
            <div className="main-goal space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  Recommended
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  recommendation.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                  recommendation.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {recommendation.difficulty}
                </span>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {recommendation.target} 
                  {recommendation.type === 'word_count' ? ' words' : 
                   recommendation.type === 'time_based' ? ' min' : ' tasks'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ≈ {recommendation.estimatedCompletionTime} minutes
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {recommendation.reasoning}
              </p>

              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1" 
                  size="sm"
                  onClick={() => acceptGoal(recommendation.target, recommendation.type)}
                >
                  Accept Goal
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveRecommendation(false)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Alternative Goals Toggle */}
            <div className="border-t pt-3">
              <button
                onClick={() => setShowAlternatives(!showAlternatives)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <span>Other options</span>
                <ChevronDown 
                  className={`w-3 h-3 transition-transform ${showAlternatives ? 'rotate-180' : ''}`} 
                />
              </button>

              <AnimatePresence>
                {showAlternatives && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 mt-2">
                      {recommendation.alternativeGoals.map((alt, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <div className="text-sm font-medium">
                              {alt.target} {alt.type === 'time_based' ? 'min' : alt.type === 'word_count' ? 'words' : 'tasks'}
                            </div>
                            <div className="text-xs text-muted-foreground">{alt.reasoning}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => acceptGoal(alt.target, alt.type)}
                          >
                            Use
                          </Button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Regenerate Option */}
            <Button
              variant="ghost"
              size="sm"
              onClick={generateGoal}
              className="w-full mt-2"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="ml-2">Generating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span className="ml-2">New Recommendation</span>
                </>
              )}
            </Button>
          </motion.div>
        ) : !goal || isEditing ? (
          <form onSubmit={handleSetGoal} className="flex items-center gap-2 pt-2">
            <Input
              placeholder="e.g., Write 300 words..."
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <Button type="submit" size="icon">
              <Check className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="goal-checkbox"
                checked={isGoalComplete}
                onCheckedChange={(checked) => handleToggleCompletion(!!checked)}
              />
              <Label
                htmlFor="goal-checkbox"
                className={`text-base font-medium ${
                  isGoalComplete ? "line-through text-muted-foreground" : ""
                }`}
              >
                {goal.text}
              </Label>
            </div>
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Progress visualization when goal is active */}
        {goal && !activeRecommendation && currentTarget > 0 && goal.type === 'word_count' && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{currentProgress} / {currentTarget} words</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, (currentProgress / currentTarget) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}