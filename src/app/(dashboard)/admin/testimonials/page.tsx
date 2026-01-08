"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, X, Check, Edit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Testimonial = {
  id: string;
  content: string;
  created_at: string;
  status: string;
  full_name?: string;
  course?: string;
  institution?: string;
  profiles: { first_name: string | null; last_name: string | null; } | null;
};

export default function AdminTestimonialsPage() {
  const { session, supabase } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResponding, setIsResponding] = useState<string | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editForm, setEditForm] = useState({
    content: "",
    full_name: "",
    course: "",
    institution: ""
  });

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

  const handleEditClick = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setEditForm({
      content: testimonial.content,
      full_name: testimonial.full_name || "",
      course: testimonial.course || "",
      institution: testimonial.institution || ""
    });
  };

  const handleSaveEdit = async () => {
    if (!session || !editingTestimonial) return;
    setIsResponding(editingTestimonial.id);
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({
          content: editForm.content,
          full_name: editForm.full_name,
          course: editForm.course,
          institution: editForm.institution
        })
        .eq('id', editingTestimonial.id);

      if (error) throw error;

      setTestimonials(testimonials.map(t =>
        t.id === editingTestimonial.id
          ? { ...t, ...editForm }
          : t
      ));
      setEditingTestimonial(null);
      toast.success("Testimonial updated successfully.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsResponding(null);
    }
  };

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
                <TableHead>Details</TableHead>
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
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-24 float-right" /></TableCell>
                  </TableRow>
                ))
              ) : testimonials.length > 0 ? (
                testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{testimonial.full_name || `${testimonial.profiles?.first_name} ${testimonial.profiles?.last_name}`}</span>
                        {testimonial.profiles?.first_name && testimonial.full_name && (
                           <span className="text-xs text-muted-foreground">Auth: {testimonial.profiles.first_name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">{testimonial.institution || '-'}</span>
                        <span className="text-muted-foreground">{testimonial.course || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-sm">
                      <p className="truncate" title={testimonial.content}>{testimonial.content}</p>
                    </TableCell>
                    <TableCell>{formatDistanceToNow(new Date(testimonial.created_at), { addSuffix: true })}</TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditClick(testimonial)}
                        disabled={!!isResponding}
                        title="Edit testimonial"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestimonialResponse(testimonial.id, 'rejected')}
                        disabled={isResponding === testimonial.id}
                        title="Reject testimonial"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTestimonialResponse(testimonial.id, 'approved')}
                        disabled={isResponding === testimonial.id}
                        title="Approve testimonial"
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

      <Dialog open={!!editingTestimonial} onOpenChange={(open) => !open && setEditingTestimonial(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>
              Make changes to the testimonial before approving it. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="course" className="text-right">
                Course
              </Label>
              <Input
                id="course"
                value={editForm.course}
                onChange={(e) => setEditForm({...editForm, course: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="institution" className="text-right">
                School
              </Label>
              <Input
                id="institution"
                value={editForm.institution}
                onChange={(e) => setEditForm({...editForm, institution: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Content
              </Label>
              <Textarea
                id="content"
                value={editForm.content}
                onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setEditingTestimonial(null)}>Cancel</Button>
            <Button type="submit" onClick={handleSaveEdit} disabled={!!isResponding}>
               {isResponding === editingTestimonial?.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}