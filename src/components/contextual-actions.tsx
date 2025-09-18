"use client";

import { Button } from "./ui/button";
import { ArrowRight, CheckSquare, FileText, Timer } from "lucide-react";
import Link from "next/link";
import { useFocusMode } from "@/contexts/focus-mode-context";
import { useRouter } from "next/navigation";

type Action = {
  type: 'feedback' | 'milestone' | 'task';
  href: string;
  [key: string]: any;
};

type Document = {
  id: string;
  [key: string]: any;
};

interface ContextualActionsProps {
  nextAction: Action | null;
  latestDocument: Document | null;
}

export function ContextualActions({ nextAction, latestDocument }: ContextualActionsProps) {
  const { startTimer } = useFocusMode();
  const router = useRouter();

  const handleStartSession = (href: string) => {
    startTimer(900); // 15 minutes
    router.push(href);
  };

  const actions = [];

  if (nextAction?.type === 'task' && nextAction.href) {
    actions.push({
      label: 'Go to Next Task',
      href: nextAction.href,
      icon: CheckSquare,
    });
  }

  if (latestDocument) {
    actions.push({
      label: 'Continue Writing',
      href: `/drafts/${latestDocument.id}`,
      icon: FileText,
    });
    actions.push({
      label: 'Start 15-min Session',
      onClick: () => handleStartSession(`/drafts/${latestDocument.id}`),
      icon: Timer,
    });
  }

  const uniqueActions = actions.filter((action, index, self) =>
    index === self.findIndex((a) => (a.href || a.label) === (action.href || action.label))
  );

  if (uniqueActions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {uniqueActions.map(action => 
        action.href ? (
          <Link href={action.href} key={action.label}>
            <Button variant="outline">
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" key={action.label} onClick={action.onClick}>
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )
      )}
    </div>
  );
}