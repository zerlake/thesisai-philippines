"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function InstitutionRequestDialog() {
  const { session, supabase } = useAuth();
  const [open, setOpen] = useState(false);
  const [institutionName, setInstitutionName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!institutionName.trim() || !session) return;
    setIsSubmitting(true);

    const { error } = await supabase.from("institution_requests").insert({
      name: institutionName,
      requested_by: session.user.id,
    });

    if (error) {
      toast.error("Failed to submit request. Please try again.");
      console.error(error);
    } else {
      toast.success("Request submitted!", {
        description: "You will be notified once your institution has been reviewed.",
      });
      setInstitutionName("");
      setOpen(false);
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="h-auto p-1 text-sm">
          Can't find your school? Request to add it.
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a New Institution</DialogTitle>
          <DialogDescription>
            {session
              ? "If your school is not on the list, please enter its full official name below. We will review it and add it to our system."
              : "You must have an account to request a new institution. Please finish signing up, then you can request your institution from the settings page if needed."}
          </DialogDescription>
        </DialogHeader>
        {session ? (
          <>
            <div className="py-4">
              <Label htmlFor="institution-name">Institution Name</Label>
              <Input
                id="institution-name"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g., Philippine State College of Tomorrow"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !institutionName.trim()}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Request
              </Button>
            </DialogFooter>
          </>
        ) : (
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>OK</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}