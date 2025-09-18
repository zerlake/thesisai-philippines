import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const manuscripts = [
  {
    id: "M001",
    title: "The Impact of AI on Academic Research",
    author: "John Doe",
    dueDate: "2024-08-15",
    status: "In Progress",
  },
  {
    id: "M002",
    title: "Quantum Computing: A Primer for the Modern Era",
    author: "Jane Smith",
    dueDate: "2024-08-20",
    status: "To Review",
  },
  {
    id: "M003",
    title: "A Study of Southeast Asian Economic Policies",
    author: "Ahmad Ibrahim",
    dueDate: "2024-09-01",
    status: "Completed",
  },
  {
    id: "M004",
    title: "The Role of Renewable Energy in Developing Nations",
    author: "Maria Garcia",
    dueDate: "2024-08-25",
    status: "Revision Needed",
  },
  {
    id: "M005",
    title: "Advances in Machine Learning for Medical Diagnosis",
    author: "Chen Wei",
    dueDate: "2024-09-10",
    status: "Awaiting Payment",
  },
];

export default function Dashboard() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "In Progress":
        return "default";
      case "Completed":
        return "secondary";
      case "Revision Needed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Manuscripts</CardTitle>
            <CardDescription>
              Manage your assigned manuscripts and track their progress.
            </CardDescription>
          </div>
          <Button>Add Manuscript</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Due Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {manuscripts.map((manuscript) => (
              <TableRow key={manuscript.id}>
                <TableCell className="font-medium">{manuscript.title}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {manuscript.author}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(manuscript.status)}>
                    {manuscript.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {manuscript.dueDate}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}