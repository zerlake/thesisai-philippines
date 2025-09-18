"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useAuth } from "./auth-provider";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { AvatarUpload } from "./avatar-upload";

const formSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email(),
});

export function SettingsForm() {
  const { session, supabase, profile } = useAuth();
  const user = session?.user;
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: user?.email || "",
    },
  });

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: row not found
        toast.error("Failed to load profile.");
        console.error(error);
      } else if (data) {
        form.reset({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: user.email,
        });
        setAvatarUrl(data.avatar_url);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [user, supabase, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: values.first_name,
        last_name: values.last_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile.");
      console.error(error);
    } else {
      toast.success("Profile updated successfully!");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center -mt-16">
          <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
        </div>
        <div className="space-y-4 pt-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative -mt-20 flex justify-center">
        <AvatarUpload currentAvatarUrl={avatarUrl} onUpload={setAvatarUrl} />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="user@example.com" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
}