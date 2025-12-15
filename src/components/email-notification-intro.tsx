'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageCircle, User, CheckCircle, XCircle, Eye, Send, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from './auth-provider';

interface EmailNotificationIntroProps {
  onDismiss?: () => void;
  documentId?: string;
}

export function EmailNotificationIntro({ onDismiss, documentId }: EmailNotificationIntroProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [step, setStep] = useState(0);
  const { session } = useAuth();
  const user = session?.user;
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Check if user has unread messages to determine if this intro is still relevant
  useEffect(() => {
    const checkUnreadMessages = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/messages/get?userId=${user.id}`);
        if (!response.ok) return;

        const { data } = await response.json();
        const unreadCount = (data || []).filter((msg: any) => !msg.is_read).length;
        setHasUnreadMessages(unreadCount > 0);
      } catch (error) {
        console.error('Error checking unread messages:', error);
      }
    };

    checkUnreadMessages();
  }, [user?.id]);

  const steps = [
    {
      title: "Welcome to Advisor Communication",
      description: "This system allows you to communicate directly with your advisor and critic about your thesis work.",
      icon: <MessageCircle className="h-8 w-8 text-blue-500" />,
      content: (
        <div className="space-y-3">
          <p>When working on your thesis, you'll receive feedback and messages from your:</p>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            <span className="text-sm"><strong>Advisor</strong> - Provides academic guidance</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-purple-500" />
            <span className="text-sm"><strong>Critic</strong> - Reviews final submissions</span>
          </div>
        </div>
      )
    },
    {
      title: "Getting Messages",
      description: "Advisors and critics will send feedback directly to this panel.",
      icon: <Mail className="h-8 w-8 text-green-500" />,
      content: (
        <div className="space-y-3">
          <p>Look for the <strong>Mail</strong> icon in the editor header:</p>
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded flex items-center justify-center">
            <Mail className="h-5 w-5 mr-2" />
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">2</span>
          </div>
          <p className="text-sm">When you have new messages, you'll see a notification badge.</p>
        </div>
      )
    },
    {
      title: "How to Reply",
      description: "Engage in conversations with your advisor and critic",
      icon: <Reply className="h-8 w-8 text-purple-500" />,
      content: (
        <div className="space-y-3">
          <p>When you receive a message:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Click the Mail icon to open the message panel</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Read the full message and context</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Use the reply box at the bottom to respond</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Best Practices",
      description: "Tips for effective communication",
      icon: <Eye className="h-8 w-8 text-cyan-500" />,
      content: (
        <div className="space-y-3">
          <p className="text-sm"><strong>Be respectful:</strong> Always address your advisor and critic professionally.</p>
          <p className="text-sm"><strong>Be specific:</strong> When asking for help, reference specific sections or issues.</p>
          <p className="text-sm"><strong>Respond promptly:</strong> Acknowledge messages within 24-48 hours when possible.</p>
          <p className="text-sm"><strong>Be clear:</strong> If you don't understand feedback, ask for clarification.</p>
        </div>
      )
    }
  ];

  if (!isVisible || hasUnreadMessages) {
    return null;
  }

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finishIntro();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const finishIntro = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {steps[step].icon}
        </div>
        <CardTitle className="text-xl text-blue-800 dark:text-blue-200">
          {steps[step].title}
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          {steps[step].description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          {steps[step].content}
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === step ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex space-x-2">
            {step > 0 && (
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
            )}
            <Button onClick={nextStep}>
              {step === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
            <Button variant="ghost" onClick={finishIntro}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}