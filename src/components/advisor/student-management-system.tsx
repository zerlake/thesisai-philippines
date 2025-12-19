'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search,
  Filter,
  UserPlus,
  UserX,
  GraduationCap,
  Calendar,
  Target,
  FileText,
  MessageSquare,
  Settings,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Mail,
  Phone
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  thesis_title: string;
  thesis_topic: string;
  phase: number;
  phase_name: string;
  status: 'active' | 'on_hold' | 'completed' | 'withdrawn';
  start_date: string;
  expected_completion: string;
  assigned_advisor: string;
  advisor_name: string;
  documents_count: number;
  last_interaction: string;
  risk_level: 'low' | 'medium' | 'high';
  performance_score: number; // out of 100
  progress_percentage: number;
  next_meeting?: string;
  notes: string;
  department: string;
  year_level: number;
}

interface StudentGroup {
  id: string;
  name: string;
  description: string;
  student_ids: string[];
  created_at: string;
  advisor_id: string;
}

interface Meeting {
  id: string;
  student_id: string;
  student_name: string;
  title: string;
  scheduled_date: string;
  duration: number; // minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  advisor_notes?: string;
}

const mockStudents: Student[] = [
  {
    id: 'student1',
    first_name: 'Maria',
    last_name: 'Santos',
    email: 'maria.santos@university.edu',
    phone: '+63 912 345 6789',
    thesis_title: 'AI in Education: A Study of Personalized Learning Systems',
    thesis_topic: 'Educational Technology',
    phase: 2,
    phase_name: 'Literature Review',
    status: 'active',
    start_date: '2024-09-01',
    expected_completion: '2025-06-01',
    assigned_advisor: 'advisor1',
    advisor_name: 'Dr. Smith',
    documents_count: 3,
    last_interaction: '2024-12-15',
    risk_level: 'low',
    performance_score: 85,
    progress_percentage: 65,
    next_meeting: '2024-12-20T14:00:00Z',
    notes: 'Highly motivated student with clear research direction.',
    department: 'Computer Science',
    year_level: 4
  },
  {
    id: 'student2',
    first_name: 'Juan',
    last_name: 'Dela Cruz',
    email: 'juan.dela.cruz@university.edu',
    phone: '+63 923 456 7890',
    thesis_title: 'Blockchain Applications in Supply Chain Management',
    thesis_topic: 'Supply Chain',
    phase: 3,
    phase_name: 'Methodology',
    status: 'active',
    start_date: '2024-08-15',
    expected_completion: '2025-05-15',
    assigned_advisor: 'advisor1',
    advisor_name: 'Dr. Smith',
    documents_count: 4,
    last_interaction: '2024-12-12',
    risk_level: 'high',
    performance_score: 65,
    progress_percentage: 40,
    next_meeting: '2024-12-18T10:00:00Z',
    notes: 'Needs more guidance on research methodology. Falling behind schedule.',
    department: 'Business Admin',
    year_level: 4
  },
  {
    id: 'student3',
    first_name: 'Ana',
    last_name: 'Reyes',
    email: 'ana.reyes@university.edu',
    phone: '+63 934 567 8901',
    thesis_title: 'Sustainable Energy Solutions for Rural Philippines',
    thesis_topic: 'Renewable Energy',
    phase: 1,
    phase_name: 'Proposal',
    status: 'active',
    start_date: '2024-10-01',
    expected_completion: '2025-07-01',
    assigned_advisor: 'advisor1',
    advisor_name: 'Dr. Smith',
    documents_count: 2,
    last_interaction: '2024-12-14',
    risk_level: 'low',
    performance_score: 90,
    progress_percentage: 90,
    next_meeting: '2024-12-17T15:30:00Z',
    notes: 'Excellent progress on proposal. Well-organized and focused.',
    department: 'Environmental Sci',
    year_level: 4
  },
  {
    id: 'student4',
    first_name: 'Carlos',
    last_name: 'Garcia',
    email: 'carlos.garcia@university.edu',
    phone: '+63 945 678 9012',
    thesis_title: 'Impact of Social Media on Academic Performance',
    thesis_topic: 'Social Media',
    phase: 5,
    phase_name: 'Final Review',
    status: 'active',
    start_date: '2024-07-01',
    expected_completion: '2025-01-15',
    assigned_advisor: 'advisor1',
    advisor_name: 'Dr. Smith',
    documents_count: 7,
    last_interaction: '2024-12-10',
    risk_level: 'low',
    performance_score: 92,
    progress_percentage: 95,
    notes: 'Near completion. Excellent work throughout the process.',
    department: 'Psychology',
    year_level: 4
  }
];

const mockGroups: StudentGroup[] = [
  {
    id: 'group1',
    name: 'AI Research Group',
    description: 'Students working on AI-related thesis topics',
    student_ids: ['student1', 'student2'],
    created_at: '2024-09-15',
    advisor_id: 'advisor1'
  },
  {
    id: 'group2',
    name: 'Environmental Studies',
    description: 'Students researching environmental and sustainability topics',
    student_ids: ['student3'],
    created_at: '2024-10-01',
    advisor_id: 'advisor1'
  }
];

const mockMeetings: Meeting[] = [
  {
    id: 'meet1',
    student_id: 'student1',
    student_name: 'Maria Santos',
    title: 'Literature Review Feedback',
    scheduled_date: '2024-12-20T14:00:00Z',
    duration: 45,
    status: 'scheduled',
    notes: 'Review the literature review draft and provide feedback on methodology section.'
  },
  {
    id: 'meet2',
    student_id: 'student2',
    student_name: 'Juan Dela Cruz',
    title: 'Methodology Discussion',
    scheduled_date: '2024-12-18T10:00:00Z',
    duration: 60,
    status: 'scheduled',
    notes: 'Discuss research instruments and data collection methods.'
  },
  {
    id: 'meet3',
    student_id: 'student3',
    student_name: 'Ana Reyes',
    title: 'Proposal Final Review',
    scheduled_date: '2024-12-17T15:30:00Z',
    duration: 30,
    status: 'scheduled',
    notes: 'Review final proposal and ensure all requirements are met.'
  }
];

export function StudentManagementSystem() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [groups, setGroups] = useState<StudentGroup[]>(mockGroups);
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(mockStudents);
  const [activeTab, setActiveTab] = useState<'students' | 'groups' | 'meetings'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'on_hold' | 'completed' | 'withdrawn'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id' | 'documents_count' | 'last_interaction' | 'performance_score' | 'progress_percentage'>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    thesis_title: '',
    thesis_topic: '',
    phase: 1,
    phase_name: 'Proposal',
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    expected_completion: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assigned_advisor: user?.id || '',
    advisor_name: user?.email || '',
    risk_level: 'medium',
    notes: '',
    department: '',
    year_level: 4
  });

  // Apply filters
  useEffect(() => {
    let result = students;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(student => 
        student.first_name.toLowerCase().includes(term) ||
        student.last_name.toLowerCase().includes(term) ||
        student.thesis_title.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(student => student.status === statusFilter);
    }
    
    if (riskFilter !== 'all') {
      result = result.filter(student => student.risk_level === riskFilter);
    }
    
    if (departmentFilter !== 'all') {
      result = result.filter(student => student.department === departmentFilter);
    }
    
    setFilteredStudents(result);
  }, [searchTerm, statusFilter, riskFilter, departmentFilter, students]);

  const departments = [...new Set(students.map(s => s.department))];

  const handleAddStudent = () => {
    if (!newStudent.first_name.trim() || !newStudent.last_name.trim() || !newStudent.email.trim()) {
      alert('Please fill in required fields: First name, Last name, and Email');
      return;
    }
    
    const studentToAdd: Student = {
      ...newStudent,
      id: `student${students.length + 1}`,
      documents_count: 0,
      last_interaction: new Date().toISOString(),
      performance_score: 75, // default score
      progress_percentage: 0
    };
    
    setStudents([...students, studentToAdd]);
    setFilteredStudents([...filteredStudents, studentToAdd]);
    setShowAddStudent(false);
    setNewStudent({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      thesis_title: '',
      thesis_topic: '',
      phase: 1,
      phase_name: 'Proposal',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      expected_completion: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigned_advisor: user?.id || '',
      advisor_name: user?.email || '',
      risk_level: 'medium',
      notes: '',
      department: '',
      year_level: 4
    });
  };

  const handleRemoveStudent = (studentId: string) => {
    if (confirm('Are you sure you want to remove this student?')) {
      setStudents(students.filter(s => s.id !== studentId));
      setFilteredStudents(filteredStudents.filter(s => s.id !== studentId));
      if (selectedStudent?.id === studentId) setSelectedStudent(null);
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setFilteredStudents(filteredStudents.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setSelectedStudent(updatedStudent);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    }
  };

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Management System
            </CardTitle>
            <CardDescription>Manage your students, groups, and meetings efficiently</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setShowAddStudent(true)}>
              <UserPlus className="h-4 w-4 mr-1" />
              Add Student
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="border-b">
          <div className="flex">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'students' 
                  ? 'text-foreground border-b-2 border-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('students')}
            >
              Students
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'groups' 
                  ? 'text-foreground border-b-2 border-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('groups')}
            >
              Groups
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'meetings' 
                  ? 'text-foreground border-b-2 border-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('meetings')}
            >
              Meetings
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {activeTab === 'students' && (
            <div className="flex h-full">
              {/* Student List */}
              <div className="w-1/3 border-r flex flex-col">
                <div className="p-4 border-b">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={riskFilter} onValueChange={(value: any) => setRiskFilter(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Risk Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Risks</SelectItem>
                        <SelectItem value="low">Low Risk</SelectItem>
                        <SelectItem value="medium">Medium Risk</SelectItem>
                        <SelectItem value="high">High Risk</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-2">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                          selectedStudent?.id === student.id ? 'bg-accent' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarImage src={student.avatar_url} />
                            <AvatarFallback>
                              {student.first_name.charAt(0)}
                              {student.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate">{student.first_name} {student.last_name}</h4>
                              <Badge className={getRiskColor(student.risk_level)}>
                                {student.risk_level}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground truncate">{student.thesis_title}</p>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {student.phase_name}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {student.department}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <div className="w-full bg-secondary rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${student.progress_percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground w-10">{student.progress_percentage}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Student Details */}
              <div className="flex-1 flex flex-col">
                {selectedStudent ? (
                  <div className="flex flex-col h-full">
                    <div className="border-b p-4 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={selectedStudent.avatar_url} />
                            <AvatarFallback>
                              {selectedStudent.first_name.charAt(0)}
                              {selectedStudent.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h2 className="text-xl font-bold">{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                            <p className="text-muted-foreground">{selectedStudent.thesis_title}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline">
                            {selectedStudent.phase_name} (Phase {selectedStudent.phase})
                          </Badge>
                          <Badge variant="outline">
                            {selectedStudent.department}
                          </Badge>
                          <Badge variant="outline">
                            Year {selectedStudent.year_level}
                          </Badge>
                          <Badge className={getRiskColor(selectedStudent.risk_level)}>
                            {selectedStudent.risk_level} risk
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRemoveStudent(selectedStudent.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedStudent.email}</span>
                              </div>
                              {selectedStudent.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <span>{selectedStudent.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedStudent.department} - Year {selectedStudent.year_level}</span>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Thesis Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div>
                                <h4 className="text-sm font-medium">Thesis Topic</h4>
                                <p className="text-muted-foreground">{selectedStudent.thesis_topic}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Advisor</h4>
                                <p className="text-muted-foreground">{selectedStudent.advisor_name}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Start Date</h4>
                                <p className="text-muted-foreground">{new Date(selectedStudent.start_date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">Expected Completion</h4>
                                <p className="text-muted-foreground">{new Date(selectedStudent.expected_completion).toLocaleDateString()}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium">Overall Progress</span>
                                    <span className="text-sm font-medium">{selectedStudent.progress_percentage}%</span>
                                  </div>
                                  <div className="w-full bg-secondary rounded-full h-4">
                                    <div 
                                      className="bg-primary h-4 rounded-full flex items-center justify-center text-xs text-primary-foreground" 
                                      style={{ width: `${selectedStudent.progress_percentage}%` }}
                                    >
                                      {selectedStudent.progress_percentage > 20 ? `${selectedStudent.progress_percentage}%` : ''}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-center p-2 bg-muted rounded">
                                    <p className="text-lg font-semibold">{selectedStudent.performance_score}</p>
                                    <p className="text-xs text-muted-foreground">Performance</p>
                                  </div>
                                  <div className="text-center p-2 bg-muted rounded">
                                    <p className="text-lg font-semibold">{selectedStudent.documents_count}</p>
                                    <p className="text-xs text-muted-foreground">Documents</p>
                                  </div>
                                  <div className="text-center p-2 bg-muted rounded">
                                    <p className="text-lg font-semibold">{selectedStudent.year_level}</p>
                                    <p className="text-xs text-muted-foreground">Year</p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Notes & Feedback</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground">{selectedStudent.notes}</p>
                            </CardContent>
                          </Card>
                          
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Next Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Next: {selectedStudent.next_meeting ? 
                                  `Meeting on ${new Date(selectedStudent.next_meeting).toLocaleDateString()}` : 
                                  'No meeting scheduled'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Last interaction: {new Date(selectedStudent.last_interaction).toLocaleDateString()}</span>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                ) : showAddStudent ? (
                  <div className="flex-1 p-4">
                    <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">First Name *</label>
                        <Input
                          value={newStudent.first_name}
                          onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Name *</label>
                        <Input
                          value={newStudent.last_name}
                          onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})}
                          placeholder="Enter last name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email *</label>
                        <Input
                          type="email"
                          value={newStudent.email}
                          onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                          placeholder="student@university.edu"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          value={newStudent.phone}
                          onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                          placeholder="+63 912 345 6789"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Thesis Title *</label>
                        <Input
                          value={newStudent.thesis_title}
                          onChange={(e) => setNewStudent({...newStudent, thesis_title: e.target.value})}
                          placeholder="Thesis title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Thesis Topic *</label>
                        <Input
                          value={newStudent.thesis_topic}
                          onChange={(e) => setNewStudent({...newStudent, thesis_topic: e.target.value})}
                          placeholder="Research topic"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Department</label>
                        <Input
                          value={newStudent.department}
                          onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                          placeholder="Department"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Year Level</label>
                        <Select 
                          value={newStudent.year_level.toString()} 
                          onValueChange={(value) => setNewStudent({...newStudent, year_level: parseInt(value)})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1st Year</SelectItem>
                            <SelectItem value="2">2nd Year</SelectItem>
                            <SelectItem value="3">3rd Year</SelectItem>
                            <SelectItem value="4">4th Year</SelectItem>
                            <SelectItem value="5">Graduate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                          type="date"
                          value={newStudent.start_date}
                          onChange={(e) => setNewStudent({...newStudent, start_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Expected Completion</label>
                        <Input
                          type="date"
                          value={newStudent.expected_completion}
                          onChange={(e) => setNewStudent({...newStudent, expected_completion: e.target.value})}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea
                          value={newStudent.notes}
                          onChange={(e) => setNewStudent({...newStudent, notes: e.target.value})}
                          placeholder="Additional notes about the student..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowAddStudent(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddStudent}>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Student
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Select a student to view details</h3>
                    <p className="text-muted-foreground mb-4">
                      Choose a student from the list to view their information and manage their progress.
                    </p>
                    <Button onClick={() => setShowAddStudent(true)}>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add New Student
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'groups' && (
            <div className="flex h-full">
              <div className="w-1/3 border-r p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Student Groups</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Group
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {groups.map(group => (
                    <Card key={group.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {group.student_ids.length} students
                          </span>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 p-4">
                <h3 className="font-semibold mb-4">Group Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map(student => (
                    <Card key={student.id} className="flex items-center gap-3 p-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={student.avatar_url} />
                        <AvatarFallback>
                          {student.first_name.charAt(0)}
                          {student.last_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{student.first_name} {student.last_name}</h4>
                        <p className="text-sm text-muted-foreground">{student.thesis_topic}</p>
                      </div>
                      <Badge className={getRiskColor(student.risk_level)}>
                        {student.risk_level}
                      </Badge>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'meetings' && (
            <div className="flex h-full">
              <div className="w-1/3 border-r p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Upcoming Meetings</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {meetings.map(meeting => (
                    <Card key={meeting.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{meeting.title}</CardTitle>
                            <CardDescription>{meeting.student_name}</CardDescription>
                          </div>
                          <Badge variant={
                            meeting.status === 'scheduled' ? 'default' : 
                            meeting.status === 'completed' ? 'secondary' : 
                            'destructive'
                          }>
                            {meeting.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(meeting.scheduled_date).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {meeting.duration} min
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm">{meeting.notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 p-4">
                <h3 className="font-semibold mb-4">Meeting Calendar</h3>
                <Card className="h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h4 className="font-semibold mb-2">Calendar View</h4>
                    <p className="text-muted-foreground mb-4">
                      Interactive calendar showing all scheduled meetings with students
                    </p>
                    <Button variant="outline">View Calendar</Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}