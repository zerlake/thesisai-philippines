"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function WikiTest() {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log("WikiTest: Fetching /api/wiki");
        const response = await fetch("/api/wiki");
        console.log("WikiTest: Response status:", response.status);

        const data = await response.json();
        console.log("WikiTest: Response data:", data);

        setApiData(data);
        setError(null);
      } catch (err) {
        console.error("WikiTest: Error:", err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wiki API Test</CardTitle>
        <CardDescription>Testing wiki functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-300 rounded text-red-900">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-300 rounded text-green-900">
              <p className="font-bold">✅ API Working</p>
            </div>
            <div>
              <p className="font-bold text-foreground">Pages returned: {apiData?.count || apiData?.pages?.length || 0}</p>
            </div>
            <div>
              <p className="font-bold text-foreground">Response:</p>
              <pre className="bg-muted p-4 rounded overflow-auto text-sm text-foreground border border-muted-foreground/20">
                {JSON.stringify(apiData, null, 2)}
              </pre>
            </div>
            {apiData?.pages && apiData.pages.length > 0 && (
              <div>
                <p className="font-bold text-foreground">Pages:</p>
                <ul className="list-disc list-inside text-foreground">
                  {apiData.pages.map((page: any) => (
                    <li key={page.slug}>
                      {page.title} ({page.slug})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
