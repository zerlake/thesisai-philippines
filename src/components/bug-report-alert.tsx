"use client";

import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Bug } from "lucide-react";

export function BugReportAlert() {
  return (
    <Alert>
      <Bug className="h-4 w-4" />
      <AlertTitle>Spotted a Bug?</AlertTitle>
      <AlertDescription>
        This application is in active development. If you encounter any issues or have feedback, please{" "}
        <a href="mailto:support@app:thesisai.com?subject=Bug%20Report" className="font-semibold underline">
          let us know
        </a>
        . Your help is appreciated!
      </AlertDescription>
    </Alert>
  );
}