"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { InstitutionSelector } from "./institution-selector";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { PasswordStrengthIndicator } from "./password-strength-indicator";

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["user", "advisor", "critic"]),
  institution_id: z.string().uuid("Please select your institution.").or(z.literal("not-in-list")).optional(),
  institution_name: z.string().optional(),
  
  // Student fields
  student_id_number: z.string().optional(),
  program: z.string().optional(),
  year_level: z.coerce.number().optional(),

  // Advisor/Critic fields
  department: z.string().optional(),
  faculty_id_number: z.string().optional(),
  field_of_expertise: z.string().optional(),
  referral_code: z.string().optional(),
}).superRefine((data, ctx) => {
  if ((data.role === 'user' || data.role === 'advisor') && !data.institution_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please select your institution.",
      path: ["institution_id"],
    });
  }
  if (data.institution_id === 'not-in-list') {
    if (!data.institution_name || data.institution_name.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter your institution's name.",
        path: ["institution_name"],
      });
    }
  }
  if (data.role === 'advisor') {
    if (!data.department || data.department.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Department is required for advisors.",
        path: ["department"],
      });
    }
  }
});

type FormData = z.infer<typeof formSchema>;

export function SignUpFormWizard() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "user",
      referral_code: "",
    },
  });

  useEffect(() => {
    if (refCode) {
      form.setValue('referral_code', refCode, { shouldValidate: true });
    }
  }, [refCode, form]);

  const role = form.watch("role");
  const institutionId = form.watch("institution_id");
  const password = form.watch("password");

  const totalSteps = 3;
  const progressPercentage = (step / totalSteps) * 100;

  const validateStep = async (stepNum: number) => {
    const fieldsToValidate = {
      1: ["role", "email", "password", "first_name", "last_name"],
      2: ["institution_id", "institution_name", "student_id_number", "program", "year_level", "department", "faculty_id_number", "field_of_expertise"],
      3: ["referral_code"],
    }[stepNum] || [];

    const result = await form.trigger(fieldsToValidate as any);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      if (!completedSteps.includes(step)) {
        setCompletedSteps([...completedSteps, step]);
      }
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  async function onSubmit(values: FormData) {
    const { 
      institution_id, 
      institution_name, 
      role,
      student_id_number,
      program,
      year_level,
      department,
      faculty_id_number,
      field_of_expertise,
      referral_code,
      first_name,
      last_name,
      email,
      password
    } = values;

    const roleSpecificData = role === 'user' 
      ? { student_id_number, program, year_level }
      : { department, faculty_id_number, field_of_expertise };

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name,
          last_name,
          role,
          ...roleSpecificData,
          institution_id: institution_id === 'not-in-list' ? null : institution_id,
          institution_name: institution_id === 'not-in-list' ? institution_name : (role === 'critic' ? institution_name : undefined),
          referral_code,
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      if (data.user && institution_id === 'not-in-list' && institution_name) {
        const { error: requestError } = await supabase
          .from('institution_requests')
          .insert({ name: institution_name, requested_by: data.user.id });
        
        if (requestError) {
          toast.error("Account created, but failed to submit institution request. You can request it again from your settings.");
        }
      }
      
      form.reset();
      // Redirect to email confirmation page
      window.location.href = `/email-confirmation?email=${encodeURIComponent(email)}`;
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Step {step} of {totalSteps}</span>
            <span className="text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step 1: Account Basics */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Create Your Account</h3>
              <p className="text-sm text-muted-foreground">Let's get started with your basic information</p>
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>I am a...</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-x-4 gap-y-2"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="user" />
                        </FormControl>
                        <FormLabel className="font-normal">Student</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="advisor" />
                        </FormControl>
                        <FormLabel className="font-normal">Thesis Advisor</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="critic" />
                        </FormControl>
                        <FormLabel className="font-normal">Manuscript Critic</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Juan" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Dela Cruz" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <FormField 
              control={form.control} 
              name="password" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                  {field.value && <PasswordStrengthIndicator password={field.value} />}
                </FormItem>
              )} 
            />
          </div>
        )}

        {/* Step 2: Institution & Role-Specific Info */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Institution & Profile</h3>
              <p className="text-sm text-muted-foreground">Help us personalize your experience</p>
            </div>

            {(role === 'user' || role === 'advisor') && (
              <>
                <FormField control={form.control} name="institution_id" render={({ field }) => (<FormItem><FormLabel>Institution</FormLabel><FormControl><InstitutionSelector value={field.value || ""} onValueChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                
                {institutionId === "not-in-list" && (
                  <FormField control={form.control} name="institution_name" render={({ field }) => (<FormItem><FormLabel>Institution Name</FormLabel><FormControl><Input placeholder="Enter your school's full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                )}
              </>
            )}

            {role === 'critic' && (
              <FormField
                control={form.control}
                name="institution_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., University of the Philippines" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {role === 'user' && (
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="student_id_number" render={({ field }) => (<FormItem><FormLabel>Student ID (Optional)</FormLabel><FormControl><Input placeholder="" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="program" render={({ field }) => (<FormItem><FormLabel>Program (Optional)</FormLabel><FormControl><Input placeholder="" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            )}

            {(role === 'advisor' || role === 'critic') && (
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="department" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department{role === 'critic' && ' (Optional)'}</FormLabel>
                    <FormControl><Input placeholder="e.g., College of Engineering" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="faculty_id_number" render={({ field }) => (<FormItem><FormLabel>Faculty ID (Optional)</FormLabel><FormControl><Input placeholder="" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            )}
            
            {role === 'critic' && (
              <FormField control={form.control} name="field_of_expertise" render={({ field }) => (<FormItem><FormLabel>Field of Expertise</FormLabel><FormControl><Input placeholder="e.g., Qualitative Research, Statistics" {...field} /></FormControl><FormMessage /></FormItem>)} />
            )}
          </div>
        )}

        {/* Step 3: Optional Info */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Referral Code</h3>
              <p className="text-sm text-muted-foreground">Complete your registration</p>
            </div>

            <FormField
              control={form.control}
              name="referral_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Code (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter code from a friend" {...field} disabled={!!refCode} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                ✓ Your account is ready! Click "Create Account" to verify your email and complete registration.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={handlePrev} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          {step < totalSteps ? (
            <Button type="button" onClick={handleNext} className="flex-1">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" className="flex-1" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
