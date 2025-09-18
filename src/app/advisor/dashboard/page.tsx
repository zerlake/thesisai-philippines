import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdvisorDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thesis Advisor Dashboard</CardTitle>
        <CardDescription>
          Manage your students' submissions and track their review progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content for the advisor dashboard will be built here.</p>
      </CardContent>
    </Card>
  );
}