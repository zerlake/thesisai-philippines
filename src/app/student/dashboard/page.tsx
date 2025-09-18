import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StudentDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Dashboard</CardTitle>
        <CardDescription>
          Welcome! Here you can submit your manuscripts and view feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content for the student dashboard will be built here.</p>
      </CardContent>
    </Card>
  );
}