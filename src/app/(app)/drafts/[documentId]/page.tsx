"use client";

import { Editor } from "@/components/editor";
// @ts-ignore - useParams is available in client components in Next.js 15
import { useParams } from "next/navigation";

export default function NewDocumentPage() {
  const params = useParams();
  const documentId = Array.isArray(params.documentId) ? params.documentId[0] : params.documentId;

  if (!documentId) {
    return <div>Loading...</div>;
  }

  return <Editor documentId={documentId} />;
}