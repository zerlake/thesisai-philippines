import { UIElementCard } from "@/components/ui-element-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, AlertTriangle } from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <UIElementCard
        title="Alerts"
        description="Displays a callout for user attention."
      >
        <div className="w-full space-y-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can add components to your app using the cli.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Your session has expired. Please log in again.
            </AlertDescription>
          </Alert>
        </div>
      </UIElementCard>
    </div>
  );
}