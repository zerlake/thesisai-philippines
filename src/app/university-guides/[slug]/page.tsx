"use client";

import { UniversityGuideDetail } from "@/components/university-guide-detail";
import { universityGuides, type UniversityGuide } from "@/lib/guides";
import { notFound, useParams } from "next/navigation";
import { useEffect } from "react";

export default function UniversityGuideDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const guide = universityGuides.find((g: UniversityGuide) => g.slug === slug);

  if (!slug) {
    // Params are not available on initial render, return null or a loader
    return null; 
  }

  if (!guide) {
    notFound();
  }

  useEffect(() => {
    if (guide) {
      document.title = `${guide.school} | University Guide`;
    } else if (slug) {
      document.title = "Guide Not Found | ThesisAI";
    }
  }, [guide, slug]);

  return <div className="p-4"><UniversityGuideDetail guide={guide} /></div>;
}