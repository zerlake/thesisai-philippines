"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const assignments = [
  { id: "1", student: "Maria Santos", program: "MS Computer Science", assignedDate: "2024-09-01", status: "active" },
  { id: "2", student: "Juan Dela Cruz", program: "MS Economics", assignedDate: "2024-09-01", status: "active" },
  { id: "3", student: "Ana Reyes", program: "MBA", assignedDate: "2024-09-15", status: "active" },
  { id: "4", student: "Carlos Gomez", program: "MS Agriculture", assignedDate: "2024-06-01", status: "completing" },
];

export default function StudentAssignmentsPage() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Assignments</h1>
          <p className="text-muted-foreground">Manage your student advisory assignments</p>
        </div>
        <Button><UserPlus className="w-4 h-4 mr-2" />Request New Assignment</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Current Assignments</CardTitle>
          <CardDescription>{assignments.length} students assigned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar><AvatarFallback>{item.student.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                  <div>
                    <div className="font-medium">{item.student}</div>
                    <div className="text-sm text-muted-foreground">{item.program}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status}</Badge>
                  <div className="text-sm text-muted-foreground">Since {new Date(item.assignedDate).toLocaleDateString()}</div>
                  <Button size="sm" variant="outline"><UserMinus className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
