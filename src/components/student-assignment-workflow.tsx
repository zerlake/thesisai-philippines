"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  UserPlus, 
  Users, 
  Search, 
  Filter, 
  Calendar,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Target,
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  Eye,
  Edit,
  Trash2,
  Plus,
  Copy,
  Send
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  thesisTitle: string;
  department: string;
  status: "active" | "inactive" | "on-leave" | "graduated";
  advisorId: string;
  enrollmentDate: string;
  expectedGraduation: string;
  lastActive: string;
  progress: number;
  phase: "proposal" | "research" | "writing" | "defense";
  notificationsEnabled: boolean;
}

const StudentAssignmentWorkflow = () => {
  const [students, setStudents] = useState<Student[]>([
    {
      id: "1",
      firstName: "Maria",
      lastName: "Santos",
      email: "maria.santos@up.edu.ph",
      thesisTitle: "Impact of Social Media on Academic Performance",
      department: "Computer Science",
      status: "active",
      advisorId: "advisor-1",
      enrollmentDate: "2023-09-01",
      expectedGraduation: "2025-05-01",
      lastActive: "2024-12-22",
      progress: 78,
      phase: "writing",
      notificationsEnabled: true
    },
    {
      id: "2",
      firstName: "Juan",
      lastName: "Dela Cruz",
      email: "juan.dc@up.edu.ph",
      thesisTitle: "Economic Impacts of Climate Change in Rural Philippines",
      department: "Economics",
      status: "active",
      advisorId: "advisor-1",
      enrollmentDate: "2023-09-01",
      expectedGraduation: "2025-05-01",
      lastActive: "2024-12-20",
      progress: 45,
      phase: "research",
      notificationsEnabled: true
    },
    {
      id: "3",
      firstName: "Ana",
      lastName: "Reyes",
      email: "ana.reyes@up.edu.ph",
      thesisTitle: "Digital Transformation in Philippine Banking",
      department: "Business Administration",
      status: "active",
      advisorId: "advisor-1",
      enrollmentDate: "2023-09-01",
      expectedGraduation: "2025-05-01",
      lastActive: "2024-12-21",
      progress: 62,
      phase: "writing",
      notificationsEnabled: false
    },
    {
      id: "4",
      firstName: "Carlos",
      lastName: "Gomez",
      email: "carlos.gomez@up.edu.ph",
      thesisTitle: "Sustainable Agriculture Practices in Mindanao",
      department: "Agricultural Sciences",
      status: "active",
      advisorId: "advisor-1",
      enrollmentDate: "2023-09-01",
      expectedGraduation: "2025-03-01",
      lastActive: "2024-12-22",
      progress: 89,
      phase: "defense",
      notificationsEnabled: true
    },
    {
      id: "5",
      firstName: "Isabel",
      lastName: "Lim",
      email: "isabel.lim@up.edu.ph",
      thesisTitle: "Urban Planning and Traffic Management in Metro Manila",
      department: "Urban Planning",
      status: "active",
      advisorId: "advisor-1",
      enrollmentDate: "2023-09-01",
      expectedGraduation: "2025-08-01",
      lastActive: "2024-12-18",
      progress: 38,
      phase: "research",
      notificationsEnabled: true
    }
  ]);
  
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    thesisTitle: "",
    department: "",
    expectedGraduation: ""
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          // In a real implementation, we would parse the CSV and add students
          setTimeout(() => {
            // Add mock students after "upload"
            const mockStudents: Student[] = [
              {
                id: `new-${Date.now()}`,
                firstName: "New",
                lastName: "Student",
                email: "new.student@up.edu.ph",
                thesisTitle: "Sample Thesis Title",
                department: "Computer Science",
                status: "active",
                advisorId: "advisor-1",
                enrollmentDate: new Date().toISOString().split('T')[0],
                expectedGraduation: "2025-05-01",
                lastActive: new Date().toISOString().split('T')[0],
                progress: 10,
                phase: "proposal",
                notificationsEnabled: true
              }
            ];
            setStudents([...students, ...mockStudents]);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleAddStudent = () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.email) return;

    const student: Student = {
      id: `student-${Date.now()}`,
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      email: newStudent.email,
      thesisTitle: newStudent.thesisTitle || "Thesis Title Pending",
      department: newStudent.department || "General Studies",
      status: "active",
      advisorId: "advisor-1", // Current advisor ID
      enrollmentDate: new Date().toISOString().split('T')[0],
      expectedGraduation: newStudent.expectedGraduation || "2025-05-01",
      lastActive: new Date().toISOString().split('T')[0],
      progress: 0,
      phase: "proposal",
      notificationsEnabled: true
    };

    setStudents([...students, student]);
    setNewStudent({
      firstName: "",
      lastName: "",
      email: "",
      thesisTitle: "",
      department: "",
      expectedGraduation: ""
    });
    setShowAddStudentDialog(false);
  };

  const handleRemoveStudent = (studentId: string) => {
    setStudents(students.filter(s => s.id !== studentId));
    setSelectedStudents(selectedStudents.filter(id => id !== studentId));
  };

  const handleBulkRemove = () => {
    setStudents(students.filter(s => !selectedStudents.includes(s.id)));
    setSelectedStudents([]);
    setShowBulkActions(false);
  };

  const handleToggleNotifications = (studentId: string) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s
    ));
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.thesisTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || student.department === departmentFilter;
    const matchesPhase = phaseFilter === "all" || student.phase === phaseFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesPhase;
  });

  const getPhaseBadge = (phase: string) => {
    switch (phase) {
      case "proposal":
        return <Badge variant="outline">Proposal</Badge>;
      case "research":
        return <Badge className="bg-blue-100 text-blue-800">Research</Badge>;
      case "writing":
        return <Badge className="bg-purple-100 text-purple-800">Writing</Badge>;
      case "defense":
        return <Badge className="bg-green-100 text-green-800">Defense</Badge>;
      default:
        return <Badge variant="outline">{phase}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "on-leave":
        return <Badge className="bg-yellow-500">On Leave</Badge>;
      case "graduated":
        return <Badge variant="secondary">Graduated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDepartmentBadge = (dept: string) => {
    return <Badge variant="secondary">{dept}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Assignment Workflow</h2>
          <p className="text-muted-foreground">
            Manage your assigned students, import in bulk, and organize by sections
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">AI Assignment Assistant: Active</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Assigned Students</CardTitle>
                  <CardDescription>
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} assigned to you
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Students
                      </>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".csv,.xlsx"
                      onChange={handleFileUpload}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Economics">Economics</SelectItem>
                    <SelectItem value="Business Administration">Business Administration</SelectItem>
                    <SelectItem value="Agricultural Sciences">Agricultural Sciences</SelectItem>
                    <SelectItem value="Urban Planning">Urban Planning</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="writing">Writing</SelectItem>
                    <SelectItem value="defense">Defense</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setDepartmentFilter("all"); setPhaseFilter("all"); }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>

              {/* Bulk Actions */}
              {selectedStudents.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
                  <span className="text-sm font-medium">
                    {selectedStudents.length} of {filteredStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                  </span>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="outline" size="sm" onClick={handleBulkRemove}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Selected
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send Announcement
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowBulkActions(!showBulkActions)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Section
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedStudents([])}>
                    Clear Selection
                  </Button>
                </div>
              )}

              {/* Students List */}
              <div className="space-y-4">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No students found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No students match your search." : "You have not been assigned any students yet."}
                    </p>
                    <div className="mt-6">
                      <Dialog open={showAddStudentDialog} onOpenChange={setShowAddStudentDialog}>
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add First Student
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Student</DialogTitle>
                            <DialogDescription>
                              Enter the student's information to add them to your roster
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                  id="firstName"
                                  value={newStudent.firstName}
                                  onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                                  placeholder="Enter first name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                  id="lastName"
                                  value={newStudent.lastName}
                                  onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                                  placeholder="Enter last name"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={newStudent.email}
                                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                                placeholder="Enter student email"
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="thesisTitle">Thesis Title</Label>
                              <Input
                                id="thesisTitle"
                                value={newStudent.thesisTitle}
                                onChange={(e) => setNewStudent({...newStudent, thesisTitle: e.target.value})}
                                placeholder="Enter thesis title (optional)"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="department">Department</Label>
                                <Input
                                  id="department"
                                  value={newStudent.department}
                                  onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                                  placeholder="Enter department"
                                />
                              </div>
                              <div>
                                <Label htmlFor="expectedGraduation">Expected Graduation</Label>
                                <Input
                                  id="expectedGraduation"
                                  type="date"
                                  value={newStudent.expectedGraduation}
                                  onChange={(e) => setNewStudent({...newStudent, expectedGraduation: e.target.value})}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowAddStudentDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddStudent} disabled={!newStudent.firstName || !newStudent.lastName || !newStudent.email}>
                              Add Student
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">
                        Showing {filteredStudents.length} of {students.length} students
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={toggleSelectAll}
                      >
                        {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    
                    {filteredStudents.map((student) => (
                      <div 
                        key={student.id} 
                        className={`flex items-center p-4 border rounded-lg transition-colors ${
                          selectedStudents.includes(student.id) ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                        }`}
                      >
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => toggleStudentSelection(student.id)}
                          className="mr-4"
                        />
                        
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.firstName}+${student.lastName}&backgroundColor=b6e6ff&fontSize=32`} alt={`${student.firstName} ${student.lastName}`} />
                          <AvatarFallback>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{student.firstName} {student.lastName}</h3>
                            {getStatusBadge(student.status)}
                            {getPhaseBadge(student.phase)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                          <p className="text-sm truncate">{student.thesisTitle}</p>
                        </div>
                        
                        <div className="hidden md:block w-1/4">
                          <div className="text-sm font-medium">{getDepartmentBadge(student.department)}</div>
                          <div className="text-xs text-muted-foreground">
                            Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="hidden lg:flex flex-col items-end w-1/6">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{student.progress}%</span>
                            <span className="text-xs text-muted-foreground">complete</span>
                          </div>
                          <Progress value={student.progress} className="w-32 mt-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            Last active: {new Date(student.lastActive).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleNotifications(student.id)}
                          >
                            {student.notificationsEnabled ? (
                              <Mail className="h-4 w-4 text-green-500" />
                            ) : (
                              <Mail className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRemoveStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Assignment Tools */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your student assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Student</DialogTitle>
                      <DialogDescription>
                        Enter the student's information to add them to your roster
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="addFirstName">First Name</Label>
                          <Input
                            id="addFirstName"
                            value={newStudent.firstName}
                            onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                            placeholder="Enter first name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="addLastName">Last Name</Label>
                          <Input
                            id="addLastName"
                            value={newStudent.lastName}
                            onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="addEmail">Email</Label>
                        <Input
                          id="addEmail"
                          type="email"
                          value={newStudent.email}
                          onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                          placeholder="Enter student email"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="addThesisTitle">Thesis Title</Label>
                        <Input
                          id="addThesisTitle"
                          value={newStudent.thesisTitle}
                          onChange={(e) => setNewStudent({...newStudent, thesisTitle: e.target.value})}
                          placeholder="Enter thesis title (optional)"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="addDepartment">Department</Label>
                          <Input
                            id="addDepartment"
                            value={newStudent.department}
                            onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                            placeholder="Enter department"
                          />
                        </div>
                        <div>
                          <Label htmlFor="addGraduation">Expected Graduation</Label>
                          <Input
                            id="addGraduation"
                            type="date"
                            value={newStudent.expectedGraduation}
                            onChange={(e) => setNewStudent({...newStudent, expectedGraduation: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddStudentDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddStudent} disabled={!newStudent.firstName || !newStudent.lastName || !newStudent.email}>
                        Add Student
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Students (CSV)
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Roster
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Section
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assignment Statistics</CardTitle>
              <CardDescription>
                Overview of your student assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total Students</span>
                  <span className="text-sm font-medium">{students.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Active Students</span>
                  <span className="text-sm font-medium">{students.filter(s => s.status === "active").length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">In Writing Phase</span>
                  <span className="text-sm font-medium">{students.filter(s => s.phase === "writing").length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Need Attention</span>
                  <span className="text-sm font-medium">{students.filter(s => s.progress < 50).length}</span>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Progress</span>
                  <span className="text-sm font-medium">
                    {Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length || 0)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm">Avg. Response Time</span>
                  <span className="text-sm font-medium">24h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest student interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarImage src="" alt="Maria Santos" />
                    <AvatarFallback>MS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Maria Santos</p>
                    <p className="text-sm text-muted-foreground">Submitted Chapter 2 draft</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarImage src="" alt="Juan Dela Cruz" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Juan Dela Cruz</p>
                    <p className="text-sm text-muted-foreground">Requested meeting for next week</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarImage src="" alt="Ana Reyes" />
                    <AvatarFallback>AR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Ana Reyes</p>
                    <p className="text-sm text-muted-foreground">Updated thesis title</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentAssignmentWorkflow;