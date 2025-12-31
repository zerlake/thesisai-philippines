import { Suspense } from "react";
import FeedbackManagementSystem from "@/components/feedback-management-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdvisorFeedbackPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback Management</h1>
          <p className="text-muted-foreground">
            Review and respond to student document feedback
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">AI Connection: Active</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Threads</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<FeedbackManagementSkeleton />}>
            <FeedbackManagementSystem />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function FeedbackManagementSkeleton() {
  return (
    <div className="flex h-[600px]">
      <div className="w-1/3 border-r p-4 flex flex-col">
        <div className="mb-4">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>

        <div className="relative mb-4">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="flex-1 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 border rounded-lg">
              <div className="flex justify-between">
                <div>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2 mt-1" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-3 w-2/3 mt-2" />
              <Skeleton className="h-3 w-1/3 mt-1" />
            </div>
          ))}
        </div>
      </div>

      <div className="w-2/3 p-4 flex flex-col">
        <div className="mb-4">
          <div className="flex justify-between">
            <div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-1" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-1/3 mt-2" />
        </div>

        <div className="flex-1 space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-20 mt-2" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                  
                  <div className="flex items-center gap-4 mt-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-4">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="flex-1 h-20" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}