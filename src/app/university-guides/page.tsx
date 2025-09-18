"use client";

import { useState, useMemo } from "react";
import { universityGuides, type UniversityGuide, type GuideItem } from "@/lib/guides";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, University, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UniversityGuidesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGuides = useMemo(() => {
    if (!searchTerm.trim()) {
      return universityGuides;
    }
    const lowercasedTerm = searchTerm.toLowerCase();

    return universityGuides.filter((guide: UniversityGuide) => {
      // Check school name
      if (guide.school.toLowerCase().includes(lowercasedTerm)) {
        return true;
      }

      const checkItems = (items: GuideItem[]) => {
        for (const item of items) {
          if (item.title.toLowerCase().includes(lowercasedTerm)) {
            return true;
          }
          const content = item.content;
          if (content.text && content.text.toLowerCase().includes(lowercasedTerm)) {
            return true;
          }
          if (content.before && content.before.toLowerCase().includes(lowercasedTerm)) {
            return true;
          }
          if (content.after && content.after.toLowerCase().includes(lowercasedTerm)) {
            return true;
          }
          if (content.items) {
            for (const listItem of content.items) {
              if (listItem.toLowerCase().includes(lowercasedTerm)) {
                return true;
              }
            }
          }
        }
        return false;
      };

      // Check student and advisor dashboards
      if (checkItems(guide.studentDashboard.items) || checkItems(guide.advisorDashboard.items)) {
        return true;
      }

      return false;
    });
  }, [searchTerm]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">University-Specific Guides</CardTitle>
          <CardDescription>
            Select your institution or search for keywords (e.g., "APA", "margins") to find relevant guidelines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search guides by school or keyword..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {filteredGuides.length > 0 ? (
          filteredGuides.map((guide: UniversityGuide) => (
            <Link key={guide.slug} href={`/university-guides/${guide.slug}`}>
              <Card className="hover:bg-accent hover:border-primary transition-colors">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <University className="w-8 h-8 text-primary" />
                    <div>
                      <CardTitle>{guide.school}</CardTitle>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No guides found for "{searchTerm}".</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}