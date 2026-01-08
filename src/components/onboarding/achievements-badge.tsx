"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/contexts/onboarding-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

const badgeEmojis: Record<string, string> = {
  explorer: "🔍",
  "grammar-master": "✍️",
  "paper-researcher": "📚",
  "power-user": "⚡",
  "thesis-finisher": "🎓",
  "community-contributor": "👥",
};

export function AchievementsBadge() {
  const { state } = useOnboarding();
  const [newAchievement, setNewAchievement] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (state.achievements.length > 0) {
      const latest = state.achievements[state.achievements.length - 1];
      setNewAchievement(latest.id);

      const timer = setTimeout(() => {
        setNewAchievement(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state.achievements]);

  return (
    <>
      {/* New Achievement Toast */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-20 right-4 z-[9998]"
          >
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-lg shadow-lg border border-yellow-600">
              <p className="font-bold text-lg mb-1">
                🏆 Achievement Unlocked!
              </p>
              <p className="text-sm">
                You earned the <span className="font-semibold">"Explorer"</span> badge
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Dialog */}
      {state.achievements.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="View achievements"
            >
              <Trophy className="w-5 h-5 text-yellow-500" />
              {state.achievements.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {state.achievements.length}
                </motion.span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Your Achievements
              </DialogTitle>
              <DialogDescription>
                Collect badges as you explore ThesisAI's features
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 mt-6">
              {state.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 text-center hover:border-yellow-500/50 transition-colors"
                >
                  <div className="text-4xl mb-2">
                    {badgeEmojis[achievement.id] || achievement.icon}
                  </div>
                  <p className="font-semibold text-sm">{achievement.label}</p>
                  {achievement.unlockedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-blue-500">Tip:</span> Complete mini-tours on
                different features to unlock more badges!
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
