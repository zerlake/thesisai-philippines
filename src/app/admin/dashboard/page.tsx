import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>
          Oversee the platform, manage users, and configure system settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content for the admin dashboard will be built here.</p>
      </CardContent>
    </Card>
  );
}