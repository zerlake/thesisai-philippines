import { Suspense } from "react";
import InstitutionalManagement from "@/components/institutional-management";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdvisorInstitutionalPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institutional Management</h1>
          <p className="text-muted-foreground">
            Manage departments, faculties, and institutional settings
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
          <CardTitle>Institutional Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<InstitutionalManagementSkeleton />}>
            <InstitutionalManagement />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function InstitutionalManagementSkeleton() {
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
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-24" />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-1/3" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-2/3" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
            
            <div className="mt-4">
              <Skeleton className="h-10" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-40 mt-1" />
                    </div>
                  </div>
                  
                  <div className="hidden md:block">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-32 mt-1" />
                  </div>
                  
                  <div className="hidden lg:block">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32 mt-1" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
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

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-1/3" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-2/3" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Skeleton className="h-5 w-1/4 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              
              <div>
                <Skeleton className="h-5 w-1/3 mb-2" />
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </div>
              
              <div>
                <Skeleton className="h-5 w-1/4 mb-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-5 w-1/2 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-5 w-1/2 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
              
              <div>
                <Skeleton className="h-5 w-1/4 mb-2" />
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 text-center">
                <Skeleton className="h-10 w-10 mx-auto rounded-full" />
                <Skeleton className="h-4 w-16 mt-2" />
                <Skeleton className="h-3 w-20 mt-1" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <Skeleton className="h-10 w-10 mx-auto rounded-full" />
                <Skeleton className="h-4 w-16 mt-2" />
                <Skeleton className="h-3 w-20 mt-1" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
              
              <div className="border rounded-lg p-4 text-center">
                <Skeleton className="h-10 w-10 mx-auto rounded-full" />
                <Skeleton className="h-4 w-16 mt-2" />
                <Skeleton className="h-3 w-20 mt-1" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}