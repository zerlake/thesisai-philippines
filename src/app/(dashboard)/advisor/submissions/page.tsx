import { Suspense } from "react";
import SubmissionWorkflow from "@/components/submission-workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdvisorSubmissionsPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Submission Workflow</h1>
          <p className="text-muted-foreground">
            Manage student submissions and review process
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
          <CardTitle>Submission Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<SubmissionWorkflowSkeleton />}>
            <SubmissionWorkflow />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function SubmissionWorkflowSkeleton() {
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
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  <Skeleton className="h-6 w-24" />
                </CardTitle>
                <Skeleton className="h-10 w-40" />
              </div>
              <CardDescription>
                <Skeleton className="h-4 w-32" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-40 mt-1" />
                        <Skeleton className="h-4 w-32 mt-1" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-6 w-20" />
                        <div className="text-xs text-muted-foreground mt-1">
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="text-xs text-muted-foreground">
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-8" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Skeleton className="h-6 w-64" />
                  <Skeleton className="h-4 w-48 mt-1" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-5 w-24 mb-4" />
                  
                  <div className="space-y-4">
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <div className="flex items-center gap-2 mt-1">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-9 w-32" />
                      </div>
                    </div>
                    
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <div className="mt-1">
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                    
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <div className="mt-1">
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    
                    <div>
                      <Skeleton className="h-4 w-20 mb-1" />
                      <div className="mt-1">
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <div className="mt-1">
                        <Skeleton className="h-16 w-full bg-muted p-3 rounded" />
                      </div>
                    </div>
                    
                    <div>
                      <Skeleton className="h-4 w-16 mb-1" />
                      <div className="flex gap-2 mt-1">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-5 w-24" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-20" />
                      <Skeleton className="h-9 w-16" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-4 w-32 mt-1" />
                          </div>
                          <div className="text-right">
                            <Skeleton className="h-6 w-16" />
                            <div className="text-xs text-muted-foreground mt-1">
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <Skeleton className="h-4 w-16 mb-1" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Skeleton className="h-5 w-16 mb-4" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-32" />
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}