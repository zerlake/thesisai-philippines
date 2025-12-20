"use client";

import { StudentDetailView } from "@/components/student-detail-view";
// @ts-ignore - useParams is available in client components in Next.js 15
import { useParams } from "next/navigation";

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = Array.isArray(params.studentId) ? params.studentId[0] : params.studentId;

  if (!studentId) {
    return <div>Loading...</div>;
  }

  return <StudentDetailView studentId={studentId} />;
}