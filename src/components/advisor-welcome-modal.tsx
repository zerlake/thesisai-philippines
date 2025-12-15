"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Users, ClipboardCheck, MessageSquare, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

interface AdvisorWelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
}

const advisorFeatures = [
  {
    icon: Users,
    title: "Student Management",
    description: "Track and manage all assigned students in one centralized dashboard.",
  },
  {
    icon: ClipboardCheck,
    title: "Document Review",
    description: "Review, approve, and provide detailed feedback on student thesis documents.",
  },
  {
    icon: MessageSquare,
    title: "AI Suggestions",
    description: "Generate customized suggestions and guidance for your students' work.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Monitor student progress, milestones, and thesis phase completion.",
  },
];

export function AdvisorWelcomeModal({ open, onOpenChange, name }: AdvisorWelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">Welcome to ThesisAI Philippines, {name}!</DialogTitle>
            <DialogDescription>
              Your AI-powered advisor toolkit is ready. Here&apos;s what you can do to support your students:
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {advisorFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="p-2 bg-primary/10 rounded-md mt-1">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Start Managing Students
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
