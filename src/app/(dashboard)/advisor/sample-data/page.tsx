"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStudentsForAdvisor, getDocumentsForStudent, getMockRelationshipData } from "@/lib/mock-relationships";
import { Progress } from "@/components/ui/progress";

export default function AdvisorSampleDataPage() {
  const mockData = getMockRelationshipData();
  const students = mockData.users.students;
  const advisors = mockData.users.advisors;
  const currentAdvisor = advisors[0]; // First advisor for demo

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Sample Student Data</h1>
        <p className="text-muted-foreground">
          Example data showing how student-advisor relationships work in the system
        </p>
      </div>

      {/* Advisor Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Sample Profile</CardTitle>
          <CardDescription>Example advisor information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{currentAdvisor.first_name} {currentAdvisor.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-lg font-semibold">{currentAdvisor.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="text-lg font-semibold">{currentAdvisor.department}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Students Assigned</p>
              <p className="text-lg font-semibold">{currentAdvisor.total_students}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Reviews</p>
              <p className="text-lg font-semibold">{currentAdvisor.pending_reviews}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Availability</p>
              <Badge variant={currentAdvisor.availability === 'high' ? 'default' : 'secondary'}>
                {currentAdvisor.availability.charAt(0).toUpperCase() + currentAdvisor.availability.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Students</CardTitle>
          <CardDescription>Sample students connected to this advisor account</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Thesis Title</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students
                .filter(s => currentAdvisor.students_assigned.includes(s.id))
                .map(student => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell className="max-w-xs truncate">{student.thesis_title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="w-20" />
                        <span className="text-xs font-medium">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.documents_count}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {student.last_active.toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Documents Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Student Documents</CardTitle>
          <CardDescription>Sample documents from your assigned students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students
              .filter(s => currentAdvisor.students_assigned.includes(s.id))
              .map(student => {
                const docs = getDocumentsForStudent(student.id);
                return (
                  <div key={student.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">
                      {student.first_name} {student.last_name}'s Documents
                    </h4>
                    <div className="space-y-2">
                      {docs.map(doc => (
                        <div key={doc.id} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">Document</p>
                          </div>
                          <Badge variant={doc.status === 'submitted' ? 'default' : 'secondary'}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">About Sample Data</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p className="mb-2">
            This page displays sample/mock data to demonstrate how the advisor dashboard works with real student relationships.
          </p>
          <p>
            When you connect with actual students in the system, their data will appear in your main Dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
