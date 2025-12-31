import { Suspense } from "react";
import MeetingScheduler from "@/components/meeting-scheduler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdvisorMeetingsPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meeting Scheduler</h1>
          <p className="text-muted-foreground">
            Schedule and manage meetings with your students
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
          <CardTitle>Meeting Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<MeetingSchedulerSkeleton />}>
            <MeetingScheduler />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function MeetingSchedulerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <Skeleton className="h-5 w-48 mt-4 md:mt-0" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-1/3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>

            <Skeleton className="h-10 mt-4" />

            <Skeleton className="h-20 mt-4" />

            <div className="mt-4 flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>

            <div className="mt-4 flex items-center">
              <Skeleton className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 w-48" />
            </div>

            <div className="mt-6">
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-1/3 mt-2" />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-3 md:mt-0">
                <div className="relative">
                  <Skeleton className="h-10 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="text-center">
                      <Skeleton className="h-6 w-8 mx-auto" />
                      <Skeleton className="h-4 w-8 mx-auto mt-1" />
                    </div>
                    <div>
                      <Skeleton className="h-5 w-64" />
                      <Skeleton className="h-4 w-80 mt-1" />
                      <div className="flex items-center gap-2 mt-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4 ml-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden md:block">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16 mt-2" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}