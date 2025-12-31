import { Suspense } from "react";
import WorkloadManagement from "@/components/workload-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdvisorWorkloadPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workload Management</h1>
          <p className="text-muted-foreground">
            Plan and manage your advisor capacity and tasks
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
          <CardTitle>Capacity Planning</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<WorkloadManagementSkeleton />}>
            <WorkloadManagement />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function WorkloadManagementSkeleton() {
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
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Skeleton className="h-6 w-12" />
              </div>
              <Skeleton className="h-4 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-1/3" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-1/2" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div>
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-64 mt-1" />
                      </div>
                    </div>
                    
                    <div className="hidden md:block">
                      <Skeleton className="h-4 w-80" />
                      <Skeleton className="h-3 w-40 mt-1" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    
                    <div className="hidden lg:block">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-3 w-32 mt-1" />
                      <Skeleton className="h-2 w-32 mt-1" />
                    </div>
                    
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-1/2" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-2/3" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <Skeleton className="h-6 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto mt-1" />
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <Skeleton className="h-6 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto mt-1" />
                  </div>
                </div>
                
                <div className="pt-2">
                  <Skeleton className="h-5 w-1/2 mb-2" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                    <div className="flex justify-between text-sm">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <CardTitle>
                  <Skeleton className="h-6 w-1/4" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-1/3 mt-2" />
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-3 md:mt-0">
                <div className="relative">
                  <Skeleton className="h-10 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64 mt-1" />
                    </div>
                  </div>
                  
                  <div className="hidden md:block">
                    <Skeleton className="h-4 w-80" />
                    <Skeleton className="h-3 w-40 mt-1" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  
                  <div className="hidden lg:block">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-32 mt-1" />
                    <Skeleton className="h-2 w-32 mt-1" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-1/3" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-1/2" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-5 w-1/2 mb-4" />
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Skeleton className="h-5 w-1/2 mb-4" />
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <div className="flex justify-between font-medium">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Skeleton className="h-5 w-1/2 mb-2" />
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Skeleton className="h-4 w-4 mr-2 mt-0.5" />
                      <Skeleton className="h-4 w-64" />
                    </li>
                    <li className="flex items-start">
                      <Skeleton className="h-4 w-4 mr-2 mt-0.5" />
                      <Skeleton className="h-4 w-64" />
                    </li>
                    <li className="flex items-start">
                      <Skeleton className="h-4 w-4 mr-2 mt-0.5" />
                      <Skeleton className="h-4 w-64" />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-1/4" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-1/3" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            
            <div className="mt-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="mt-4">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            
            <div className="mt-6">
              <Skeleton className="h-10 w-28" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-1/4" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-1/3" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-1">
              <div>
                <Skeleton className="h-8 w-12" />
              </div>
              {[...Array(7)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-8 w-12" />
                </div>
              ))}
              
              <div>
                <Skeleton className="h-16" />
              </div>
              {[...Array(7)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-16" />
                </div>
              ))}
              
              <div>
                <Skeleton className="h-16" />
              </div>
              {[...Array(7)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}