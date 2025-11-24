"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Testimonial = { 
  id: string; 
  content: string; 
  created_at: string; 
  status: string; 
  profiles: { first_name: string | null; last_name: string | null; } | null; 
};

export default function AdminTestimonialsPage() {
  const { session, supabase } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      setIsLoading(true);
      try {
        const testimonialsRes = await supabase
          .from("testimonials")
          .select("*, profiles:user_id(first_name, last_name)")
          .eq("status", "pending");

        if (testimonialsRes.error) {
          toast.error("Failed to fetch testimonials.");
          throw new Error(testimonialsRes.error.message);
        }
        
        setTestimonials(testimonialsRes.data as Testimonial[] || []);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        toast.error("Failed to fetch testimonials");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session, supabase]);

  const handleTestimonialResponse = async (testimonialId: string, newStatus: 'approved' | 'rejected') => {
    if (!session) return;
    setIsResponding(testimonialId);
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ status: newStatus })
        .eq('id', testimonialId);
      if (error) throw error;
      setTestimonials(testimonials.filter(t => t.id !== testimonialId));
      toast.success(`Testimonial ${newStatus}.`);
    } catch (error: any) { 
      toast.error(error.message); 
    } finally { 
      setIsResponding(null); 
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Testimonials</h1>
        <p className="text-muted-foreground">Approve or reject user-submitted testimonials for the landing page.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Testimonials</CardTitle>
          <CardDescription>Approve or reject user-submitted testimonials for the landing page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Testimonial</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 1 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 float-right" /></TableCell>
                  </TableRow>
                ))
              ) : testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>{testimonial.profiles?.first_name} {testimonial.profiles?.last_name}</TableCell>
                    <TableCell className="max-w-sm">
                      <p className="truncate">{testimonial.content}</p>
                    </TableCell>
                    <TableCell>{formatDistanceToNow(new Date(testimonial.created_at), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleTestimonialResponse(testimonial.id, 'rejected')} 
                        disabled={isResponding === testimonial.id}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleTestimonialResponse(testimonial.id, 'approved')} 
                        disabled={isResponding === testimonial.id}
                      >
                        {isResponding === testimonial.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">No pending testimonials.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}