import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BotMessageSquare, User, GraduationCap, Briefcase, Shield } from "lucide-react";

const roles = [
  {
    name: "Manuscript Critic",
    description: "Review and provide feedback on manuscripts.",
    href: "/critic/dashboard",
    icon: <User className="h-8 w-8" />,
  },
  {
    name: "Student",
    description: "Submit your thesis for review and track progress.",
    href: "/student/dashboard",
    icon: <GraduationCap className="h-8 w-8" />,
  },
  {
    name: "Thesis Advisor",
    description: "Oversee student submissions and manage reviews.",
    href: "/advisor/dashboard",
    icon: <Briefcase className="h-8 w-8" />,
  },
  {
    name: "Admin",
    description: "Manage users, settings, and system operations.",
    href: "/admin/dashboard",
    icon: <Shield className="h-8 w-8" />,
  },
];

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <BotMessageSquare className="h-8 w-8" />
            <h1 className="text-3xl font-bold">ThesisAI</h1>
          </div>
          <p className="text-muted-foreground">Select a role to enter the demo dashboard.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => (
            <Link href={role.href} key={role.name}>
              <Card className="hover:bg-accent hover:border-primary transition-colors h-full">
                <CardHeader className="flex flex-col items-center text-center">
                  {role.icon}
                  <CardTitle className="mt-4">{role.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">{role.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}