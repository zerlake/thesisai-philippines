import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/integrations/supabase/client";

interface WritingGoal {
  id: string;
  user_id: string;
  type: 'word_count' | 'time_based' | 'task_based';
  target: number;
  achieved: number;
  deadline: string;
  completed: boolean;
}

export function useGoalTracking() {
  const { session } = useAuth();
  const [progress, setProgress] = useState(0);
  const [currentGoal, setCurrentGoal] = useState<WritingGoal | null>(null);

  useEffect(() => {
    if (!session?.user?.id || !session?.access_token) return;

    let isMounted = true;
    let channel: any = null;

    // Get today's active goal
    const fetchCurrentGoal = async () => {
      try {
        const { data, error } = await supabase
          .from('writing_goals')
          .select('*')
          .eq('user_id', session.user.id)
          .gte('deadline', new Date().toISOString().split('T')[0]) // Today or later
          .is('completed', false)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!isMounted) return;

        if (error) {
        } else if (data && data.length > 0) {
          setCurrentGoal(data[0]);
          setProgress(data[0].achieved);
        }
      } catch (err) {
        if (isMounted) {
        }
      }
    };

    const setupRealtime = async () => {
      try {
        await fetchCurrentGoal();

        // Verify user is still authenticated before subscribing
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user || !isMounted) {
          return;
        }

        // Set up real-time subscription to track goal updates
        channel = supabase
          .channel(`goal-tracking:${session.user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'writing_goals',
              filter: `user_id=eq.${session.user.id}`,
            },
            (payload) => {
              if (!isMounted) return;
              if (payload.new && (payload.new as WritingGoal).id === currentGoal?.id) {
                setProgress((payload.new as WritingGoal).achieved);
                setCurrentGoal(payload.new as WritingGoal);
              }
            }
          )
          .subscribe((status) => {
            if (!isMounted) return;

            if (status === 'CHANNEL_ERROR') {
            } else if (status === 'TIMED_OUT') {
            } else if (status === 'SUBSCRIBED') {
            }
          });
      } catch (err: any) {
        if (!isMounted) return;

        // Silently handle auth errors
        if (err?.message?.includes("Refresh Token") || err?.message?.includes("Invalid") || err?.message?.includes("JWT")) {
          return;
        }
      }
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel).catch((err) => {
        });
      }
    };
  }, [session?.user?.id, session?.access_token, currentGoal?.id]);

  // Function to update progress
  const updateProgress = async (wordsAdded: number) => {
    if (!session?.user.id || !currentGoal) return;

    // Update the goal with new progress
    const newAchieved = currentGoal.achieved + wordsAdded;
    const { error } = await supabase
      .from('writing_goals')
      .update({ achieved: newAchieved })
      .eq('id', currentGoal.id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error updating goal progress:', error);
    } else {
      setProgress(newAchieved);
    }
  };

  return { progress, currentGoal, updateProgress };
}