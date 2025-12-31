"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Video,
  MessageSquare,
  Repeat,
  Bell,
  CalendarPlus,
  CalendarClock,
  UserRound
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays, startOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  studentId: string;
  studentName: string;
  studentEmail: string;
  advisorId: string;
  advisorName: string;
  advisorEmail: string;
  type: "advisory" | "proposal-defense" | "midterm-defense" | "final-defense" | "consultation" | "orientation";
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "rescheduled";
  location: "online" | "in-person" | "hybrid";
  onlineLink?: string;
  inPersonAddress?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  reminderEnabled: boolean;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
}

const MeetingScheduler = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: "1",
      title: "Thesis Proposal Review",
      description: "Review Maria's thesis proposal and provide feedback",
      date: "2024-12-28",
      startTime: "10:00",
      endTime: "11:00",
      studentId: "student-1",
      studentName: "Maria Santos",
      studentEmail: "maria.santos@up.edu.ph",
      advisorId: "advisor-1",
      advisorName: "Dr. Juan Dela Cruz",
      advisorEmail: "juan.dc@thesisai.ph",
      type: "proposal-defense",
      status: "scheduled",
      location: "online",
      onlineLink: "https://thesisai.zoom.us/j/123456789",
      notes: "Student needs to prepare thesis proposal document",
      createdAt: "2024-12-20T09:30:00Z",
      updatedAt: "2024-12-20T09:30:00Z",
      reminderEnabled: true,
      recurrence: "none"
    },
    {
      id: "2",
      title: "Midterm Defense Preparation",
      description: "Prepare Juan for his midterm defense",
      date: "2024-12-30",
      startTime: "14:00",
      endTime: "15:30",
      studentId: "student-2",
      studentName: "Juan Dela Cruz",
      studentEmail: "juan.dc@up.edu.ph",
      advisorId: "advisor-1",
      advisorName: "Dr. Juan Dela Cruz",
      advisorEmail: "juan.dc@thesisai.ph",
      type: "midterm-defense",
      status: "scheduled",
      location: "online",
      onlineLink: "https://thesisai.zoom.us/j/987654321",
      notes: "Focus on methodology and results sections",
      createdAt: "2024-12-21T11:15:00Z",
      updatedAt: "2024-12-21T11:15:00Z",
      reminderEnabled: true,
      recurrence: "none"
    },
    {
      id: "3",
      title: "Final Defense",
      description: "Carlos's final thesis defense",
      date: "2025-01-15",
      startTime: "09:00",
      endTime: "10:30",
      studentId: "student-4",
      studentName: "Carlos Gomez",
      studentEmail: "carlos.gomez@up.edu.ph",
      advisorId: "advisor-1",
      advisorName: "Dr. Juan Dela Cruz",
      advisorEmail: "juan.dc@thesisai.ph",
      type: "final-defense",
      status: "scheduled",
      location: "in-person",
      inPersonAddress: "UP Diliman, Computer Science Building, Room 301",
      notes: "Committee members: Dr. Santos, Dr. Reyes, Dr. Dela Cruz",
      createdAt: "2024-12-18T16:45:00Z",
      updatedAt: "2024-12-18T16:45:00Z",
      reminderEnabled: true,
      recurrence: "none"
    }
  ]);
  
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showAddMeetingDialog, setShowAddMeetingDialog] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "10:00",
    endTime: "11:00",
    studentName: "",
    studentEmail: "",
    type: "advisory" as MeetingType,
    location: "online" as "online" | "in-person" | "hybrid",
    onlineLink: "",
    inPersonAddress: "",
    notes: "",
    reminderEnabled: true,
    recurrence: "none" as "none" | "daily" | "weekly" | "monthly"
  });
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday as first day
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  };

  const weekDays = getWeekDays(currentDate);
  const monthName = format(currentDate, "MMMM yyyy");

  const handleAddMeeting = () => {
    if (!newMeeting.title || !newMeeting.studentName || !newMeeting.studentEmail) return;

    const meeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title: newMeeting.title,
      description: newMeeting.description,
      date: newMeeting.date,
      startTime: newMeeting.startTime,
      endTime: newMeeting.endTime,
      studentId: `student-${Date.now()}`,
      studentName: newMeeting.studentName,
      studentEmail: newMeeting.studentEmail,
      advisorId: "advisor-1", // Current advisor
      advisorName: "Dr. Juan Dela Cruz", // Current advisor name
      advisorEmail: "juan.dc@thesisai.ph", // Current advisor email
      type: newMeeting.type,
      status: "scheduled",
      location: newMeeting.location,
      onlineLink: newMeeting.location === "online" ? newMeeting.onlineLink : undefined,
      inPersonAddress: newMeeting.location === "in-person" ? newMeeting.inPersonAddress : undefined,
      notes: newMeeting.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminderEnabled: newMeeting.reminderEnabled,
      recurrence: newMeeting.recurrence
    };

    setMeetings([...meetings, meeting]);
    setNewMeeting({
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "10:00",
      endTime: "11:00",
      studentName: "",
      studentEmail: "",
      type: "advisory",
      location: "online",
      onlineLink: "",
      inPersonAddress: "",
      notes: "",
      reminderEnabled: true,
      recurrence: "none"
    });
    setShowAddMeetingDialog(false);
  };

  const handleCancelMeeting = (meetingId: string) => {
    setMeetings(meetings.map(meeting => 
      meeting.id === meetingId 
        ? { ...meeting, status: "cancelled" } 
        : meeting
    ));
  };

  const getMeetingTypeBadge = (type: string) => {
    switch (type) {
      case "proposal-defense":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Proposal Defense</Badge>;
      case "midterm-defense":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Midterm Defense</Badge>;
      case "final-defense":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Final Defense</Badge>;
      case "advisory":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Advisory</Badge>;
      case "consultation":
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800">Consultation</Badge>;
      case "orientation":
        return <Badge variant="outline" className="bg-cyan-100 text-cyan-800">Orientation</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getLocationBadge = (location: string) => {
    switch (location) {
      case "online":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Online</Badge>;
      case "in-person":
        return <Badge variant="outline" className="bg-green-50 text-green-700">In-Person</Badge>;
      case "hybrid":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Hybrid</Badge>;
      default:
        return <Badge variant="outline">{location}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case "in-progress":
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "rescheduled":
        return <Badge className="bg-orange-500">Rescheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = 
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || meeting.status === statusFilter;
    const matchesType = typeFilter === "all" || meeting.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const meetingsForDate = (date: Date) => {
    return meetings.filter(meeting => 
      isSameDay(parseISO(meeting.date), date) && meeting.status !== "cancelled"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Meeting Scheduler</h2>
          <p className="text-muted-foreground">
            Schedule appointments with students and manage your calendar
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">AI Calendar Assistant: Active</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Upcoming Meetings</CardTitle>
                <CardDescription>
                  {filteredMeetings.filter(m => m.status === "scheduled").length} scheduled meeting{filteredMeetings.filter(m => m.status === "scheduled").length !== 1 ? 's' : ''} in the next 30 days
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search meetings..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Dialog open={showAddMeetingDialog} onOpenChange={setShowAddMeetingDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Schedule New Meeting</DialogTitle>
                      <DialogDescription>
                        Set up a new meeting with a student
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="title">Meeting Title</Label>
                          <Input
                            id="title"
                            value={newMeeting.title}
                            onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                            placeholder="Enter meeting title"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            value={newMeeting.description}
                            onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                            placeholder="Brief description of the meeting"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newMeeting.date}
                            onChange={(e) => setNewMeeting({...newMeeting, date: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="type">Meeting Type</Label>
                          <Select value={newMeeting.type} onValueChange={(value) => setNewMeeting({...newMeeting, type: value as any})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="advisory">Advisory Session</SelectItem>
                              <SelectItem value="proposal-defense">Proposal Defense</SelectItem>
                              <SelectItem value="midterm-defense">Midterm Defense</SelectItem>
                              <SelectItem value="final-defense">Final Defense</SelectItem>
                              <SelectItem value="consultation">Consultation</SelectItem>
                              <SelectItem value="orientation">Orientation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startTime">Start Time</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={newMeeting.startTime}
                            onChange={(e) => setNewMeeting({...newMeeting, startTime: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="endTime">End Time</Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={newMeeting.endTime}
                            onChange={(e) => setNewMeeting({...newMeeting, endTime: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Select value={newMeeting.location} onValueChange={(value) => setNewMeeting({...newMeeting, location: value as any})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Online Meeting</SelectItem>
                            <SelectItem value="in-person">In-Person Meeting</SelectItem>
                            <SelectItem value="hybrid">Hybrid Meeting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {newMeeting.location === "online" && (
                        <div>
                          <Label htmlFor="onlineLink">Meeting Link</Label>
                          <Input
                            id="onlineLink"
                            value={newMeeting.onlineLink}
                            onChange={(e) => setNewMeeting({...newMeeting, onlineLink: e.target.value})}
                            placeholder="https://zoom.us/j/..."
                          />
                        </div>
                      )}
                      
                      {newMeeting.location === "in-person" && (
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={newMeeting.inPersonAddress}
                            onChange={(e) => setNewMeeting({...newMeeting, inPersonAddress: e.target.value})}
                            placeholder="Enter meeting location"
                          />
                        </div>
                      )}
                      
                      <div>
                        <Label htmlFor="studentName">Student Name</Label>
                        <Input
                          id="studentName"
                          value={newMeeting.studentName}
                          onChange={(e) => setNewMeeting({...newMeeting, studentName: e.target.value})}
                          placeholder="Enter student name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="studentEmail">Student Email</Label>
                        <Input
                          id="studentEmail"
                          type="email"
                          value={newMeeting.studentEmail}
                          onChange={(e) => setNewMeeting({...newMeeting, studentEmail: e.target.value})}
                          placeholder="Enter student email"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          value={newMeeting.notes}
                          onChange={(e) => setNewMeeting({...newMeeting, notes: e.target.value})}
                          placeholder="Additional notes for the meeting"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="reminder"
                          checked={newMeeting.reminderEnabled}
                          onCheckedChange={(checked) => setNewMeeting({...newMeeting, reminderEnabled: Boolean(checked)})}
                        />
                        <Label htmlFor="reminder">Enable meeting reminder</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddMeetingDialog(false)}>Cancel</Button>
                      <Button onClick={handleAddMeeting} disabled={!newMeeting.title || !newMeeting.studentName || !newMeeting.studentEmail}>
                        Schedule Meeting
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="calendar" className="space-y-6 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{monthName}</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentDate(addDays(currentDate, -7))}
                      >
                        Prev Week
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentDate(new Date())}
                      >
                        Today
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCurrentDate(addDays(currentDate, 7))}
                      >
                        Next Week
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                    
                    {weekDays.map((day, index) => {
                      const dayMeetings = meetingsForDate(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isToday = isSameDay(day, new Date());
                      
                      return (
                        <div 
                          key={index} 
                          className={`min-h-24 p-2 border rounded ${
                            isToday ? 'bg-blue-50 border-blue-200' : 'border-border'
                          } ${!isCurrentMonth ? 'bg-muted/30' : ''}`}
                        >
                          <div className={`text-center text-sm font-medium ${
                            isToday ? 'text-blue-600' : isCurrentMonth ? '' : 'text-muted-foreground'
                          }`}>
                            {format(day, "d")}
                          </div>
                          <div className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                            {dayMeetings.slice(0, 3).map((meeting) => (
                              <div 
                                key={meeting.id} 
                                className="text-xs p-1 bg-blue-100 rounded truncate cursor-pointer hover:bg-blue-200"
                                onClick={() => setSelectedMeeting(meeting)}
                              >
                                {meeting.startTime} {meeting.title}
                              </div>
                            ))}
                            {dayMeetings.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{dayMeetings.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="list" className="space-y-4 mt-6">
                  <div className="flex flex-wrap gap-3 mb-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="advisory">Advisory</SelectItem>
                        <SelectItem value="proposal-defense">Proposal Defense</SelectItem>
                        <SelectItem value="midterm-defense">Midterm Defense</SelectItem>
                        <SelectItem value="final-defense">Final Defense</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="orientation">Orientation</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => { 
                        setSearchTerm(""); 
                        setStatusFilter("all"); 
                        setTypeFilter("all"); 
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Reset Filters
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {filteredMeetings.map((meeting) => (
                      <div 
                        key={meeting.id} 
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          meeting.status === "cancelled" ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium">{meeting.title}</div>
                            <div className="text-sm text-muted-foreground">{meeting.description}</div>
                            <div className="flex items-center gap-2 mt-1">
                              {getMeetingTypeBadge(meeting.type)}
                              {getLocationBadge(meeting.location)}
                              {getStatusBadge(meeting.status)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="hidden md:block">
                          <div className="font-medium">{meeting.studentName}</div>
                          <div className="text-sm text-muted-foreground">{meeting.studentEmail}</div>
                        </div>
                        
                        <div className="hidden lg:block text-right">
                          <div className="font-medium">{format(parseISO(meeting.date), "MMM d, yyyy")}</div>
                          <div className="text-sm text-muted-foreground">{meeting.startTime} - {meeting.endTime}</div>
                          {meeting.location === "online" && meeting.onlineLink && (
                            <div className="text-xs text-blue-600 truncate max-w-[120px]">{meeting.onlineLink}</div>
                          )}
                          {meeting.location === "in-person" && meeting.inPersonAddress && (
                            <div className="text-xs text-muted-foreground truncate max-w-[120px]">{meeting.inPersonAddress}</div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                          {meeting.status === "scheduled" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleCancelMeeting(meeting.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {filteredMeetings.length === 0 && (
                      <div className="text-center py-10">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-medium">No meetings found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {searchTerm ? "No meetings match your search." : "You have no scheduled meetings."}
                        </p>
                        <div className="mt-6">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button>
                                <CalendarPlus className="h-4 w-4 mr-2" />
                                Schedule Meeting
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Schedule New Meeting</DialogTitle>
                                <DialogDescription>
                                  Set up a new meeting with a student
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p>Use the Schedule Meeting button above to add a new appointment.</p>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Meeting Details & Quick Actions */}
        <div className="w-full md:w-80 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Details</CardTitle>
              <CardDescription>
                {selectedMeeting ? "Current selection" : "Select a meeting for details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedMeeting ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{selectedMeeting.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedMeeting.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getMeetingTypeBadge(selectedMeeting.type)}
                    {getLocationBadge(selectedMeeting.location)}
                    {getStatusBadge(selectedMeeting.status)}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Date</span>
                      <span className="text-sm">{format(parseISO(selectedMeeting.date), "MMMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Time</span>
                      <span className="text-sm">{selectedMeeting.startTime} - {selectedMeeting.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <span className="text-sm">1 hr</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Student</h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={selectedMeeting.studentName} />
                        <AvatarFallback>
                          {selectedMeeting.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedMeeting.studentName}</div>
                        <div className="text-sm text-muted-foreground">{selectedMeeting.studentEmail}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">Advisor</h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={selectedMeeting.advisorName} />
                        <AvatarFallback>
                          {selectedMeeting.advisorName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedMeeting.advisorName}</div>
                        <div className="text-sm text-muted-foreground">{selectedMeeting.advisorEmail}</div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedMeeting.location === "online" && selectedMeeting.onlineLink && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Meeting Link</h4>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </Button>
                          <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 truncate">{selectedMeeting.onlineLink}</p>
                      </div>
                    </>
                  )}
                  
                  {selectedMeeting.location === "in-person" && selectedMeeting.inPersonAddress && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Location</h4>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <p className="text-sm">{selectedMeeting.inPersonAddress}</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {selectedMeeting.notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Notes</h4>
                        <p className="text-sm">{selectedMeeting.notes}</p>
                      </div>
                    </>
                  )}
                  
                  <Separator />
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarClock className="h-12 w-12 mx-auto mb-3" />
                  <p>No meeting selected</p>
                  <p className="text-sm mt-1">Select a meeting to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your meeting schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Schedule Bulk Meeting
                </Button>
                <Button className="w-full" variant="outline">
                  <Repeat className="h-4 w-4 mr-2" />
                  Create Recurring Meeting
                </Button>
                <Button className="w-full" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Set Reminders
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Calendar
                </Button>
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Invite Students
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>
                Next 7 days of meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meetings
                  .filter(m => new Date(m.date) >= new Date() && m.status === "scheduled")
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map((meeting) => (
                    <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{meeting.title}</div>
                        <div className="text-sm text-muted-foreground">{meeting.studentName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{format(parseISO(meeting.date), "MMM dd")}</div>
                        <div className="text-sm text-muted-foreground">{meeting.startTime}</div>
                      </div>
                    </div>
                  ))}
                
                {meetings.filter(m => new Date(m.date) >= new Date() && m.status === "scheduled").length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No upcoming meetings
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeetingScheduler;