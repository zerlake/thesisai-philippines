"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FilePlus2 } from "lucide-react";

export function TitlePageGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    department: "",
    university: "",
    degree: "",
    date: "",
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    }));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatedHtml = `
    <div style="text-align: center; line-height: 2;">
      <p style="font-weight: bold; text-transform: uppercase; font-size: 1.2em;">${formData.title || "[YOUR PROJECT TITLE IN ALL CAPS]"}</p>
      <br /><br />
      <p>A Paper Presented to the Faculty of the</p>
      <p>${formData.department || "[Your Department]"}</p>
      <p>${formData.university || "[Your University]"}</p>
      <br /><br />
      <p>In Partial Fulfillment</p>
      <p>of the Requirements for the Degree</p>
      <p>${formData.degree || "[Your Degree, e.g., Bachelor of Science in Computer Science]"}</p>
      <br /><br />
      <p>by</p>
      <br /><br />
      <p>${formData.author || "[Your Full Name]"}</p>
      <br />
      <p>${formData.date || "[Date of Completion, e.g., May 2024]"}</p>
    </div>
  `;

  const handleSaveAsDraft = async () => {
    if (!user || !formData.title) {
      toast.error("Please enter a title before saving.");
      return;
    }
    setIsSaving(true);

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: `Title Page: ${formData.title}`,
        content: generatedHtml,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save draft.");
    } else if (newDoc) {
      toast.success("Title page saved as a new draft!");
      router.push(`/drafts/${newDoc.id}`);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Title Page Generator</CardTitle>
          <CardDescription>
            Fill in the details to generate a standard title page for your paper.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author&apos;s Full Name</Label>
              <Input id="author" name="author" value={formData.author} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Input id="university" name="university" value={formData.university} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department / College</Label>
              <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree">Degree</Label>
              <Input id="degree" name="degree" value={formData.degree} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date of Completion</Label>
              <Input id="date" name="date" value={formData.date} onChange={handleInputChange} />
            </div>
          </div>
          <div className="space-y-4">
            <Label>Preview</Label>
            <div className="p-4 border rounded-md bg-tertiary min-h-[400px] flex items-center justify-center">
              <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: generatedHtml }} />
            </div>
            <Button onClick={handleSaveAsDraft} disabled={isSaving || !formData.title}>
              <FilePlus2 className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save as Draft"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}