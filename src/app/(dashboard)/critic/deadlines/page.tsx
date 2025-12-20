'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import { format, addDays, differenceInDays, isPast, isToday } from "date-fns";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2
} from "lucide-react";

type Deadline = {
  id: string;
  student_name: string;
  student_avatar?: string;
  document_title: string;
  document_id: string;
  due_date: Date;
  type: 'review' | 'certification' | 'revision_check';
  status: 'overdue' | 'today' | 'upcoming' | 'completed';
};

export default function DeadlinesPage() {
  const authContext = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading deadlines
    setTimeout(() => {
      const mockDeadlines: Deadline[] = [
        {
          id: '1',
          student_name: 'Maria Santos',
          document_title: 'Impact of AI on Philippine Higher Education',
          document_id: 'doc1',
          due_date: addDays(new Date(), -2),
          type: 'review',
          status: 'overdue',
        },
        {
          id: '2',
          student_name: 'Juan Dela Cruz',
          document_title: 'Sustainable Tourism Development Framework',
          document_id: 'doc2',
          due_date: new Date(),
          type: 'certification',
          status: 'today',
        },
        {
          id: '3',
          student_name: 'Ana Reyes',
          document_title: 'Digital Marketing Strategies for SMEs',
          document_id: 'doc3',
          due_date: addDays(new Date(), 3),
          type: 'review',
          status: 'upcoming',
        },
        {
          id: '4',
          student_name: 'Pedro Garcia',
          document_title: 'Climate Change Adaptation in Agriculture',
          document_id: 'doc4',
          due_date: addDays(new Date(), 5),
          type: 'revision_check',
          status: 'upcoming',
        },
        {
          id: '5',
          student_name: 'Lisa Cruz',
          document_title: 'Mobile Banking Adoption Study',
          document_id: 'doc5',
          due_date: addDays(new Date(), 7),
          type: 'certification',
          status: 'upcoming',
        },
      ];
      setDeadlines(mockDeadlines);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (!authContext) {
    return <BrandedLoader />;
  }

  const { session, profile, isLoading: authLoading } = authContext;

  if (!authLoading && (!session || profile?.role !== 'critic')) {
    redirect('/login');
  }

  if (authLoading || isLoading) {
    return <BrandedLoader />;
  }

  const overdueDeadlines = deadlines.filter(d => d.status === 'overdue');
  const todayDeadlines = deadlines.filter(d => d.status === 'today');
  const upcomingDeadlines = deadlines.filter(d => d.status === 'upcoming');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'today':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Due Today</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Completed</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'review':
        return <Badge variant="outline">Initial Review</Badge>;
      case 'certification':
        return <Badge variant="outline">Certification</Badge>;
      case 'revision_check':
        return <Badge variant="outline">Revision Check</Badge>;
      default:
        return null;
    }
  };

  const getDaysText = (date: Date) => {
    const days = differenceInDays(date, new Date());
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  const renderDeadlineCard = (deadline: Deadline) => (
    <Card key={deadline.id} className={deadline.status === 'overdue' ? 'border-red-500/50' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={deadline.student_avatar} />
              <AvatarFallback>
                {deadline.student_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-medium">{deadline.student_name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{deadline.document_title}</p>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(deadline.status)}
                {getTypeBadge(deadline.type)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4" />
              {format(deadline.due_date, 'MMM d, yyyy')}
            </div>
            <p className={`text-sm mt-1 ${deadline.status === 'overdue' ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
              {getDaysText(deadline.due_date)}
            </p>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Link href={`/drafts/${deadline.document_id}`}>
            <Button size="sm">
              {deadline.type === 'certification' ? 'Certify' : 'Review'} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CalendarDays className="h-8 w-8" />
            Deadlines
          </h1>
          <p className="text-muted-foreground">
            Track review and certification deadlines
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={overdueDeadlines.length > 0 ? 'border-red-500/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-red-500">{overdueDeadlines.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className={todayDeadlines.length > 0 ? 'border-yellow-500/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due Today</p>
                <p className="text-2xl font-bold text-yellow-500">{todayDeadlines.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingDeadlines.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Section */}
      {overdueDeadlines.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            Overdue ({overdueDeadlines.length})
          </h2>
          <div className="grid gap-4">
            {overdueDeadlines.map(renderDeadlineCard)}
          </div>
        </div>
      )}

      {/* Today Section */}
      {todayDeadlines.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-yellow-500">
            <Clock className="h-5 w-5" />
            Due Today ({todayDeadlines.length})
          </h2>
          <div className="grid gap-4">
            {todayDeadlines.map(renderDeadlineCard)}
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      {upcomingDeadlines.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Upcoming ({upcomingDeadlines.length})
          </h2>
          <div className="grid gap-4">
            {upcomingDeadlines.map(renderDeadlineCard)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {deadlines.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium">All caught up!</h3>
            <p className="text-muted-foreground">You have no pending deadlines.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
