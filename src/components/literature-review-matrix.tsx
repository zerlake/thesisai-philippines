"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { PlusCircle, FileDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";

type MatrixEntry = {
  id: number;
  author: string;
  title: string;
  year: number;
  purpose: string;
  framework: string;
  methods: string;
  results: string;
  conclusions: string;
  relevance: string;
  notes: string;
};

const mockData: MatrixEntry[] = [
  {
    id: 1,
    author: "Smith et al.",
    title: "Impact of X on Y",
    year: 2022,
    purpose: "To investigate the effect of X on Y.",
    framework: "Social Learning Theory",
    methods: "Survey",
    results: "Positive correlation found between X and Y.",
    conclusions: "X is a significant predictor of Y.",
    relevance: "Directly supports my thesis argument about the importance of X.",
    notes: "Key article for chapter 2.",
  },
  {
    id: 2,
    author: "Chan & Wang",
    title: "A review of Z",
    year: 2023,
    purpose: "To synthesize existing literature on Z.",
    framework: "N/A",
    methods: "Meta-analysis",
    results: "Z shows a weak but consistent effect.",
    conclusions: "Further research is needed to understand the moderators of Z's effect.",
    relevance: "Provides background context for my study.",
    notes: "Useful for the introduction.",
  },
];

export function LiteratureReviewMatrix() {
  const [entries, setEntries] = useState<MatrixEntry[]>(mockData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newEntry: MatrixEntry = {
      id: entries.length + 1,
      author: formData.get("author") as string,
      title: formData.get("title") as string,
      year: parseInt(formData.get("year") as string),
      purpose: formData.get("purpose") as string,
      framework: formData.get("framework") as string,
      methods: formData.get("methods") as string,
      results: formData.get("results") as string,
      conclusions: formData.get("conclusions") as string,
      relevance: formData.get("relevance") as string,
      notes: formData.get("notes") as string,
    };
    setEntries([...entries, newEntry]);
    setIsAddDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Literature Review Matrix</CardTitle>
            <CardDescription>
              Organize and synthesize your research sources.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Source</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEntry} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="author" className="text-right">Author</Label>
                    <Input id="author" name="author" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Title</Label>
                    <Input id="title" name="title" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="year" className="text-right">Year</Label>
                    <Input id="year" name="year" type="number" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="purpose" className="text-right">Purpose</Label>
                    <Textarea id="purpose" name="purpose" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="framework" className="text-right">Framework</Label>
                    <Textarea id="framework" name="framework" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="methods" className="text-right">Methods</Label>
                    <Textarea id="methods" name="methods" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="results" className="text-right">Results</Label>
                    <Textarea id="results" name="results" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="conclusions" className="text-right">Conclusions</Label>
                    <Textarea id="conclusions" name="conclusions" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="relevance" className="text-right">Relevance to Thesis</Label>
                    <Textarea id="relevance" name="relevance" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">Notes</Label>
                    <Textarea id="notes" name="notes" className="col-span-3" />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <FileDown className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Methods</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Conclusions</TableHead>
                <TableHead>Relevance to Thesis</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.author}</TableCell>
                  <TableCell>{entry.title}</TableCell>
                  <TableCell>{entry.year}</TableCell>
                  <TableCell>{entry.purpose}</TableCell>
                  <TableCell>{entry.framework}</TableCell>
                  <TableCell>{entry.methods}</TableCell>
                  <TableCell>{entry.results}</TableCell>
                  <TableCell>{entry.conclusions}</TableCell>
                  <TableCell>{entry.relevance}</TableCell>
                  <TableCell>{entry.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
