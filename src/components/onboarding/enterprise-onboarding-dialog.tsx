'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

// Validation Schemas
const step1Schema = z.object({
  role: z.enum(['student', 'advisor', 'critic']),
});

const step2Schema = z.object({
  thesis_title: z.string().min(3, 'Title must be at least 3 characters'),
  institution: z.string().min(2, 'Institution is required'),
  degree_level: z.string().optional(),
  field_of_study: z.string().optional(),
});

const step3Schema = z.object({
  target_defense_semester: z.string().min(1, 'Please select a semester'),
  language: z.string().default('en'),
});

const step4Schema = z.object({
  guidance_intensity: z.enum(['hands-on', 'self-guided']),
  help_topics: z.array(z.string()).min(1, 'Select at least one topic'),
});

const fullSchema = step1Schema
  .and(step2Schema)
  .and(step3Schema)
  .and(step4Schema);

type FormData = z.infer<typeof fullSchema>;

const DEGREE_LEVELS = [
  { value: 'undergrad', label: 'Undergraduate' },
  { value: 'masters', label: "Master's" },
  { value: 'doctoral', label: 'Doctoral' },
];

const DEFENSE_SEMESTERS = [
  'spring-2025',
  'summer-2025',
  'fall-2025',
  'spring-2026',
  'summer-2026',
  'fall-2026',
  'spring-2027',
];

const HELP_TOPICS = [
  { id: 'topic-refinement', label: 'Topic Refinement' },
  { id: 'literature-review', label: 'Literature Review' },
  { id: 'methodology', label: 'Methodology' },
  { id: 'defense-prep', label: 'Defense Prep' },
  { id: 'writing-support', label: 'Writing Support' },
];

interface EnterpriseOnboardingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export function EnterpriseOnboardingDialog({
  isOpen,
  onClose,
  onComplete,
}: EnterpriseOnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: 'onChange',
    defaultValues: {
      role: 'student',
      thesis_title: '',
      institution: '',
      degree_level: 'masters',
      field_of_study: '',
      target_defense_semester: 'spring-2026',
      language: 'en',
      guidance_intensity: 'hands-on',
      help_topics: [],
    },
  });

  const formValues = watch();

  // Calculate setup score
  const setupScore = React.useMemo(() => {
    let score = 0;
    if (formValues.role) score += 25;
    if (formValues.thesis_title) score += 15;
    if (formValues.institution) score += 15;
    if (formValues.target_defense_semester) score += 15;
    if (formValues.help_topics?.length > 0) {
      score += Math.min(formValues.help_topics.length * 5, 15);
    }
    return Math.min(score, 100);
  }, [formValues]);

  // Validate current step
  const validateStep = async () => {
    const stepSchemas = {
      1: step1Schema,
      2: step2Schema,
      3: step3Schema,
      4: step4Schema,
    };
    const schema = stepSchemas[currentStep as keyof typeof stepSchemas];
    return await trigger(
      Object.keys(schema.shape) as Array<keyof FormData>
    );
  };

  const handleNext = async () => {
    if (await validateStep()) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    try {
      await fetch('/api/onboarding/skip', { method: 'POST' });
      onClose();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          setupScore,
          completedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      setShowConfetti(true);
      setTimeout(() => {
        onComplete(data);
        setShowConfetti(false);
        setCurrentStep(1);
        reset();
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        {showConfetti && (
          <Confetti
            width={800}
            height={600}
            recycle={false}
            numberOfPieces={100}
          />
        )}

        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-t-lg p-6 -m-6 mb-0">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">
              {currentStep === 1 && 'Welcome to ThesisAI'}
              {currentStep === 2 && 'Let\'s Set Up Your Thesis'}
              {currentStep === 3 && 'Timeline & Preferences'}
              {currentStep === 4 && 'Personalization'}
            </DialogTitle>
            <p className="text-slate-200 text-sm mt-2">
              Step {currentStep} of 4 • {Math.round((currentStep / 4) * 100)}% complete
            </p>
          </DialogHeader>

          <div className="mt-4">
            <Progress value={(currentStep / 4) * 100} className="h-2" />
          </div>

          <div className="mt-4 bg-slate-700/50 rounded p-3">
            <p className="text-slate-100 font-semibold">
              Setup progress: {setupScore}%
            </p>
            <p className="text-slate-300 text-xs mt-1">
              {setupScore < 50
                ? 'Great start! Keep filling in your details.'
                : setupScore < 80
                  ? 'Almost there! Just a few more fields.'
                  : 'Nearly complete! Click finish when ready.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <p className="text-slate-600">
                    What best describes your role?
                  </p>

                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup value={field.value} onValueChange={field.onChange}>
                        {[
                          { value: 'student', label: 'Student', icon: '👨‍🎓' },
                          { value: 'advisor', label: 'Thesis Advisor', icon: '👨‍🏫' },
                          { value: 'critic', label: 'Critic/Reviewer', icon: '👁️' },
                        ].map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50"
                          >
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                              <span className="text-lg mr-2">{option.icon}</span>
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  />

                  {errors.role && (
                    <p className="text-red-500 text-sm">{errors.role.message}</p>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="thesis_title">Thesis Title</Label>
                    <Controller
                      name="thesis_title"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="e.g., AI Applications in Education"
                          className="mt-1"
                        />
                      )}
                    />
                    {errors.thesis_title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.thesis_title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="institution">Institution</Label>
                    <Controller
                      name="institution"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="e.g., University of California, Berkeley"
                          className="mt-1"
                        />
                      )}
                    />
                    {errors.institution && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.institution.message}
                      </p>
                    )}
                  </div>

                  {formValues.role === 'student' && (
                    <>
                      <div>
                        <Label htmlFor="degree_level">Degree Level</Label>
                        <Controller
                          name="degree_level"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DEGREE_LEVELS.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    {level.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="field_of_study">Field of Study</Label>
                    <Controller
                      name="field_of_study"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="e.g., Computer Science"
                          className="mt-1"
                        />
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target_defense_semester">
                      Expected Defense Semester
                    </Label>
                    <Controller
                      name="target_defense_semester"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DEFENSE_SEMESTERS.map((semester) => (
                              <SelectItem key={semester} value={semester}>
                                {semester.replace('-', ' ').toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.target_defense_semester && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.target_defense_semester.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Controller
                      name="language"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="tl">Tagalog</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-4">
                  <div>
                    <Label>How would you like guidance?</Label>
                    <Controller
                      name="guidance_intensity"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                            <RadioGroupItem value="hands-on" id="hands-on" />
                            <Label htmlFor="hands-on" className="flex-1 cursor-pointer">
                              <span className="font-semibold">Hands-On</span>
                              <p className="text-sm text-slate-600">
                                I want step-by-step guidance
                              </p>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                            <RadioGroupItem value="self-guided" id="self-guided" />
                            <Label htmlFor="self-guided" className="flex-1 cursor-pointer">
                              <span className="font-semibold">Self-Guided</span>
                              <p className="text-sm text-slate-600">
                                I prefer resources on my own time
                              </p>
                            </Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </div>

                  <div>
                    <Label>What topics interest you? (select all that apply)</Label>
                    <div className="space-y-3 mt-3">
                      <Controller
                        name="help_topics"
                        control={control}
                        render={({ field }) => (
                          <>
                            {HELP_TOPICS.map((topic) => (
                              <div key={topic.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={topic.id}
                                  checked={field.value.includes(topic.id)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...field.value, topic.id]
                                      : field.value.filter((t) => t !== topic.id);
                                    field.onChange(newValue);
                                  }}
                                />
                                <Label htmlFor={topic.id} className="cursor-pointer">
                                  {topic.label}
                                </Label>
                              </div>
                            ))}
                          </>
                        )}
                      />
                    </div>
                    {errors.help_topics && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.help_topics.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <div className="flex justify-between gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip for now
          </Button>

          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || setupScore < 60}
              >
                {isSubmitting ? 'Completing...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
