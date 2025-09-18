"use client";

import { Editor } from "@/components/editor";
import { useParams } from "next/navigation";

export default function DocumentPage() {
  const params = useParams();
  const documentId = Array.isArray(params.documentId) ? params.documentId[0] : params.documentId;

  if (!documentId) {
    return <div>Loading...</div>;
  }

  return <Editor documentId={documentId} />;
}