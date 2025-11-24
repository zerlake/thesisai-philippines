'use client';

import { UniversityGuideDetail } from "@/components/university-guide-detail";
import { universityGuides, type UniversityGuide } from "@/lib/guides";
// @ts-ignore - useParams is available in client components in Next.js 15
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function UniversityGuideDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const guide = universityGuides.find((g: UniversityGuide) => g.slug === slug);

  useEffect(() => {
    if (guide) {
      document.title = `${guide.school} | University Guide`;
    } else if (slug) {
      document.title = "Guide Not Found | ThesisAI";
    }
  }, [guide, slug]);

  if (!slug) {
    // Params are not available on initial render, return null or a loader
    return null; 
  }

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Guide Not Found</h1>
          <p className="text-muted-foreground">The guide you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return <div className="p-4"><UniversityGuideDetail guide={guide as UniversityGuide} /></div>;
}