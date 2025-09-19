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
import { BrainCircuit, ShieldCheck, UserCheck } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
}

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Tools",
    description: "Generate topic ideas, create outlines, and improve your writing.",
  },
  {
    icon: ShieldCheck,
    title: "Originality Checker",
    description: "Ensure your work is plagiarism-free before submission.",
  },
  {
    icon: UserCheck,
    title: "Advisor Collaboration",
    description: "Connect with your advisor to get feedback and track milestones.",
  },
];

export function WelcomeModal({ open, onOpenChange, name }: WelcomeModalProps) {
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
              Your AI-powered co-pilot for academic success is ready. Here's a quick look at what you can do:
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="p-2 bg-primary/10 rounded-md mt-1">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Let's Get Started
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}