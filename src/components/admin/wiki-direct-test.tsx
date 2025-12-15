"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * This component directly lists wiki files without API
 * It shows what files exist in the file system
 */
export function WikiDirectTest() {
  // These are the files we expect to exist
  const expectedFiles = [
    "Home.md",
    "Getting-Started.md",
    "Architecture-Overview.md",
    "Code-Standards.md",
    "Technology-Stack.md",
    "INDEX.md",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expected Wiki Files</CardTitle>
        <CardDescription>Files that should exist in /docs/wiki/</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-300 rounded text-blue-900">
          <p>These files should exist in the <code className="font-mono bg-blue-200 px-1 py-0.5 rounded text-blue-900">docs/wiki/</code> directory:</p>
        </div>
        <ul className="space-y-2 text-foreground">
          {expectedFiles.map((file) => (
            <li key={file} className="flex items-center gap-2">
              <span>📄</span>
              <code className="font-mono bg-muted px-2 py-1 rounded">{file}</code>
            </li>
          ))}
        </ul>
        <div className="p-4 bg-amber-50 border border-amber-300 rounded text-sm text-amber-900">
          <p><strong>To verify files exist:</strong></p>
          <p>Run: <code className="font-mono bg-amber-200 px-1 py-0.5 rounded text-amber-900">ls docs/wiki/</code></p>
        </div>
      </CardContent>
    </Card>
  );
}
