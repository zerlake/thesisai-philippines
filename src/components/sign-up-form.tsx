"use client";

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
import { Loader2 } from "lucide-react";
import { InstitutionSelector } from "./institution-selector";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

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
  if (data.institution_id === 'not-in-list') {
    if (!data.institution_name || data.institution_name.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter your institution's name.",
        path: ["institution_name"],
      });
    }
  }
  if (data.role === 'advisor' || data.role === 'critic') {
    if (!data.department || data.department.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Department is required for advisors and critics.",
        path: ["department"],
      });
    }
  }
});

export function SignUpForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');

  const form = useForm<z.infer<typeof formSchema>>({
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
      ...commonValues 
    } = values;

    const roleSpecificData = role === 'user' 
      ? { student_id_number, program, year_level }
      : { department, faculty_id_number, field_of_expertise };

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          ...commonValues,
          role,
          ...roleSpecificData,
          institution_id: institution_id === 'not-in-list' ? null : institution_id,
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
      
      toast.success("Check your email for a confirmation link to complete your registration.");
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="institution_id" render={({ field }) => (<FormItem><FormLabel>Institution</FormLabel><FormControl><InstitutionSelector value={field.value || ""} onValueChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
        
        {institutionId === "not-in-list" && (
          <FormField control={form.control} name="institution_name" render={({ field }) => (<FormItem><FormLabel>Institution Name</FormLabel><FormControl><Input placeholder="Enter your school's full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
        )}

        {role === 'user' && (
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="student_id_number" render={({ field }) => (<FormItem><FormLabel>Student ID</FormLabel><FormControl><Input placeholder="(Optional)" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="program" render={({ field }) => (<FormItem><FormLabel>Program</FormLabel><FormControl><Input placeholder="(Optional)" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
        )}

        {(role === 'advisor' || role === 'critic') && (
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="department" render={({ field }) => (<FormItem><FormLabel>Department</FormLabel><FormControl><Input placeholder="e.g., College of Engineering" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="faculty_id_number" render={({ field }) => (<FormItem><FormLabel>Faculty ID</FormLabel><FormControl><Input placeholder="(Optional)" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
        )}
        
        {role === 'critic' && (
          <FormField control={form.control} name="field_of_expertise" render={({ field }) => (<FormItem><FormLabel>Field of Expertise</FormLabel><FormControl><Input placeholder="e.g., Qualitative Research, Statistics" {...field} /></FormControl><FormMessage /></FormItem>)} />
        )}

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

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </Form>
  );
}