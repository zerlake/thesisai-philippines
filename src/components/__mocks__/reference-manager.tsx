import React from "react";

export function ReferenceManager({
  flaggedCitations,
}: {
  flaggedCitations?: Array<{ id: string; reason: string }>;
}) {
  return (
    <div>
      {flaggedCitations &&
        flaggedCitations.map((citation) => (
          <div key={citation.id}>
            <span>{citation.reason}</span>
          </div>
        ))}
      {/* Add other mock UI elements if needed for the test */}
      Reference Manager Mock
    </div>
  );
}
