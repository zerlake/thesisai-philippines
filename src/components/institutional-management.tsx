"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  GraduationCap,
  Settings,
  Plus,
  Search,
  Filter,
  UserPlus,
  Mail,
  Calendar,
  FileText,
  BarChart,
  Target,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Copy,
  Archive,
  Unarchive,
  Download,
  Upload,
  UserCheck,
  BookOpen,
  User,
  UserRound,
  UsersRound,
  School,
  Landmark,
  UserCog,
  BookText,
  FileSignature,
  FileSpreadsheet,
  FileQuestion,
  FileClock,
  FileArchive,
  FileCode,
  FileDiff,
  FileLock,
  FileWarning,
  FileX,
  FileCheck,
  FileEdit,
  FileHeart,
  FileImage,
  FileInput,
  FileJson,
  FileKey,
  FileLock2,
  FileMinus,
  FileOutput,
  FilePenLine,
  FilePlus,
  FileScan,
  FileSearch,
  FileSliders,
  FileSymlink,
  FileTerminal,
  FileType,
  FileVideo,
  FileVolume,
  MessageSquare
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface Institution {
  id: string;
  name: string;
  acronym: string;
  type: "university" | "college" | "institute" | "polytechnic" | "school";
  country: string;
  region: string;
  city: string;
  address: string;
  website: string;
  established: number;
  accreditation: "level-1" | "level-2" | "level-3" | "level-4" | "international";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  departments: Department[];
  advisors: Advisor[];
  students: Student[];
}

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  institutionId: string;
  headId: string;
  headName: string;
  headEmail: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  studentCount: number;
  advisorCount: number;
  thesisCount: number;
  policies: Policy[];
}

interface Advisor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  departmentName: string;
  role: "advisor" | "co-advisor" | "chair" | "member";
  specialization: string;
  status: "active" | "inactive" | "on-leave";
  joinDate: string;
  studentCapacity: number;
  currentStudents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  departmentId: string;
  departmentName: string;
  advisorId: string;
  advisorName: string;
  thesisTitle: string;
  status: "active" | "on-leave" | "graduated" | "withdrawn";
  enrollmentDate: string;
  expectedGraduation: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Policy {
  id: string;
  title: string;
  description: string;
  category: "thesis" | "research" | "ethics" | "format" | "submission";
  documentUrl: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
  isRequired: boolean;
}

const InstitutionalManagement = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([
    {
      id: "1",
      name: "University of the Philippines",
      acronym: "UP",
      type: "university",
      country: "Philippines",
      region: "NCR",
      city: "Quezon City",
      address: "Diliman, Quezon City",
      website: "https://up.edu.ph",
      established: 1908,
      accreditation: "international",
      isActive: true,
      createdAt: "2024-01-15",
      updatedAt: "2024-12-20",
      departments: [
        {
          id: "dept-1",
          name: "Computer Science",
          code: "CS",
          description: "Department of Computer Science and Information Technology",
          institutionId: "1",
          headId: "head-1",
          headName: "Dr. Maria Santos",
          headEmail: "maria.santos@up.edu.ph",
          isActive: true,
          createdAt: "2024-01-15",
          updatedAt: "2024-12-20",
          studentCount: 420,
          advisorCount: 25,
          thesisCount: 180,
          policies: [
            {
              id: "pol-1",
              title: "Thesis Format Guidelines",
              description: "Standard format requirements for thesis documents",
              category: "format",
              documentUrl: "/policies/cs-thesis-format.pdf",
              version: "v2.3",
              effectiveDate: "2024-09-01",
              lastUpdated: "2024-11-15",
              isRequired: true
            },
            {
              id: "pol-2",
              title: "Research Ethics Policy",
              description: "Ethical guidelines for research conduct",
              category: "ethics",
              documentUrl: "/policies/cs-research-ethics.pdf",
              version: "v1.7",
              effectiveDate: "2024-08-01",
              lastUpdated: "2024-10-20",
              isRequired: true
            }
          ]
        },
        {
          id: "dept-2",
          name: "Mathematics",
          code: "MATH",
          description: "Department of Mathematics and Statistics",
          institutionId: "1",
          headId: "head-2",
          headName: "Dr. Juan Dela Cruz",
          headEmail: "juan.dc@up.edu.ph",
          isActive: true,
          createdAt: "2024-01-15",
          updatedAt: "2024-12-18",
          studentCount: 380,
          advisorCount: 20,
          thesisCount: 150,
          policies: [
            {
              id: "pol-3",
              title: "Mathematical Methods Standards",
              description: "Standard methods for mathematical analysis",
              category: "thesis",
              documentUrl: "/policies/math-methods-standards.pdf",
              version: "v1.2",
              effectiveDate: "2024-07-01",
              lastUpdated: "2024-09-10",
              isRequired: true
            }
          ]
        }
      ],
      advisors: [
        {
          id: "adv-1",
          firstName: "Maria",
          lastName: "Santos",
          email: "maria.santos@up.edu.ph",
          departmentId: "dept-1",
          departmentName: "Computer Science",
          role: "advisor",
          specialization: "AI and Machine Learning",
          status: "active",
          joinDate: "2020-09-01",
          studentCapacity: 8,
          currentStudents: 6,
          isActive: true,
          createdAt: "2024-01-15",
          updatedAt: "2024-12-20"
        },
        {
          id: "adv-2",
          firstName: "Juan",
          lastName: "Dela Cruz",
          email: "juan.dc@up.edu.ph",
          departmentId: "dept-2",
          departmentName: "Mathematics",
          role: "advisor",
          specialization: "Applied Mathematics",
          status: "active",
          joinDate: "2019-08-15",
          studentCapacity: 10,
          currentStudents: 8,
          isActive: true,
          createdAt: "2024-01-15",
          updatedAt: "2024-12-18"
        }
      ],
      students: [
        {
          id: "stud-1",
          firstName: "Ana",
          lastName: "Reyes",
          email: "ana.reyes@up.edu.ph",
          studentId: "2021-0001",
          departmentId: "dept-1",
          departmentName: "Computer Science",
          advisorId: "adv-1",
          advisorName: "Dr. Maria Santos",
          thesisTitle: "AI Applications in Education",
          status: "active",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-05-01",
          isActive: true,
          createdAt: "2024-01-15",
          updatedAt: "2024-12-20"
        },
        {
          id: "stud-2",
          firstName: "Carlos",
          lastName: "Gomez",
          email: "carlos.gomez@up.edu.ph",
          studentId: "2021-0002",
          departmentId: "dept-2",
          departmentName: "Mathematics",
          advisorId: "adv-2",
          advisorName: "Dr. Juan Dela Cruz",
          thesisTitle: "Statistical Models for Climate Prediction",
          status: "active",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-05-01",
          isActive: true,
          createdAt: "2024-01-15",
          updatedAt: "2024-12-18"
        }
      ]
    },
    {
      id: "2",
      name: "Ateneo de Manila University",
      acronym: "ADMU",
      type: "university",
      country: "Philippines",
      region: "NCR",
      city: "Quezon City",
      address: "Loyola Heights, Quezon City",
      website: "https://adm.edu.ph",
      established: 1859,
      accreditation: "level-3",
      isActive: true,
      createdAt: "2024-02-10",
      updatedAt: "2024-12-15",
      departments: [
        {
          id: "dept-3",
          name: "School of Engineering",
          code: "SOE",
          description: "School of Engineering and Architecture",
          institutionId: "2",
          headId: "head-3",
          headName: "Dr. Ana Reyes",
          headEmail: "ana.reyes@adm.edu.ph",
          isActive: true,
          createdAt: "2024-02-10",
          updatedAt: "2024-12-15",
          studentCount: 510,
          advisorCount: 30,
          thesisCount: 220,
          policies: []
        }
      ],
      advisors: [
        {
          id: "adv-3",
          firstName: "Ana",
          lastName: "Reyes",
          email: "ana.reyes@adm.edu.ph",
          departmentId: "dept-3",
          departmentName: "School of Engineering",
          role: "advisor",
          specialization: "Computer Engineering",
          status: "active",
          joinDate: "2021-07-01",
          studentCapacity: 7,
          currentStudents: 5,
          isActive: true,
          createdAt: "2024-02-10",
          updatedAt: "2024-12-15"
        }
      ],
      students: [
        {
          id: "stud-3",
          firstName: "Isabel",
          lastName: "Lim",
          email: "isabel.lim@adm.edu.ph",
          studentId: "2022-0001",
          departmentId: "dept-3",
          departmentName: "School of Engineering",
          advisorId: "adv-3",
          advisorName: "Dr. Ana Reyes",
          thesisTitle: "Smart City Infrastructure Development",
          status: "active",
          enrollmentDate: "2023-09-01",
          expectedGraduation: "2025-08-01",
          isActive: true,
          createdAt: "2024-02-10",
          updatedAt: "2024-12-15"
        }
      ]
    }
  ]);
  
  const [activeTab, setActiveTab] = useState<"institutions" | "departments" | "advisors" | "students" | "policies">("institutions");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showAddInstitutionDialog, setShowAddInstitutionDialog] = useState(false);
  const [showAddDepartmentDialog, setShowAddDepartmentDialog] = useState(false);
  const [showAddAdvisorDialog, setShowAddAdvisorDialog] = useState(false);
  const [newInstitution, setNewInstitution] = useState({
    name: "",
    acronym: "",
    type: "university" as "university" | "college" | "institute" | "polytechnic" | "school",
    country: "Philippines",
    region: "",
    city: "",
    address: "",
    website: "",
    established: new Date().getFullYear(),
    accreditation: "level-1" as "level-1" | "level-2" | "level-3" | "level-4" | "international"
  });
  
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    code: "",
    description: "",
    institutionId: "",
    headName: "",
    headEmail: ""
  });
  
  const [newAdvisor, setNewAdvisor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    departmentId: "",
    specialization: "",
    role: "advisor" as "advisor" | "co-advisor" | "chair" | "member"
  });

  const handleAddInstitution = () => {
    if (!newInstitution.name || !newInstitution.acronym) return;

    const institution: Institution = {
      id: `inst-${Date.now()}`,
      name: newInstitution.name,
      acronym: newInstitution.acronym,
      type: newInstitution.type,
      country: newInstitution.country,
      region: newInstitution.region,
      city: newInstitution.city,
      address: newInstitution.address,
      website: newInstitution.website,
      established: newInstitution.established,
      accreditation: newInstitution.accreditation,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      departments: [],
      advisors: [],
      students: []
    };

    setInstitutions([...institutions, institution]);
    setNewInstitution({
      name: "",
      acronym: "",
      type: "university",
      country: "Philippines",
      region: "",
      city: "",
      address: "",
      website: "",
      established: new Date().getFullYear(),
      accreditation: "level-1"
    });
    setShowAddInstitutionDialog(false);
  };

  const handleAddDepartment = () => {
    if (!newDepartment.name || !newDepartment.code || !newDepartment.institutionId) return;

    const department: Department = {
      id: `dept-${Date.now()}`,
      name: newDepartment.name,
      code: newDepartment.code,
      description: newDepartment.description,
      institutionId: newDepartment.institutionId,
      headId: `head-${Date.now()}`,
      headName: newDepartment.headName,
      headEmail: newDepartment.headEmail,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      studentCount: 0,
      advisorCount: 0,
      thesisCount: 0,
      policies: []
    };

    setInstitutions(institutions.map(inst => 
      inst.id === newDepartment.institutionId 
        ? { ...inst, departments: [...inst.departments, department] } 
        : inst
    ));
    
    setNewDepartment({
      name: "",
      code: "",
      description: "",
      institutionId: "",
      headName: "",
      headEmail: ""
    });
    setShowAddDepartmentDialog(false);
  };

  const handleAddAdvisor = () => {
    if (!newAdvisor.firstName || !newAdvisor.lastName || !newAdvisor.email || !newAdvisor.departmentId) return;

    // Find department name
    const department = institutions
      .flatMap(inst => inst.departments)
      .find(dept => dept.id === newAdvisor.departmentId);

    const advisor: Advisor = {
      id: `adv-${Date.now()}`,
      firstName: newAdvisor.firstName,
      lastName: newAdvisor.lastName,
      email: newAdvisor.email,
      departmentId: newAdvisor.departmentId,
      departmentName: department?.name || "",
      role: newAdvisor.role,
      specialization: newAdvisor.specialization,
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
      studentCapacity: 8, // Default capacity
      currentStudents: 0,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setInstitutions(institutions.map(inst => ({
      ...inst,
      advisors: [...inst.advisors, advisor]
    })));
    
    setNewAdvisor({
      firstName: "",
      lastName: "",
      email: "",
      departmentId: "",
      specialization: "",
      role: "advisor"
    });
    setShowAddAdvisorDialog(false);
  };

  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = 
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || (statusFilter === "active") === inst.isActive;
    const matchesType = typeFilter === "all" || inst.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getInstitutionTypeBadge = (type: string) => {
    switch (type) {
      case "university":
        return <Badge className="bg-blue-100 text-blue-800">University</Badge>;
      case "college":
        return <Badge className="bg-green-100 text-green-800">College</Badge>;
      case "institute":
        return <Badge className="bg-purple-100 text-purple-800">Institute</Badge>;
      case "polytechnic":
        return <Badge className="bg-yellow-100 text-yellow-800">Polytechnic</Badge>;
      case "school":
        return <Badge className="bg-red-100 text-red-800">School</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getAccreditationBadge = (level: string) => {
    switch (level) {
      case "level-1":
        return <Badge variant="outline">Level 1</Badge>;
      case "level-2":
        return <Badge variant="secondary">Level 2</Badge>;
      case "level-3":
        return <Badge className="bg-blue-500">Level 3</Badge>;
      case "level-4":
        return <Badge className="bg-green-500">Level 4</Badge>;
      case "international":
        return <Badge className="bg-purple-500">International</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge className="bg-green-500">Active</Badge> : 
      <Badge variant="outline">Inactive</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Institutional Management</h2>
          <p className="text-muted-foreground">
            Configure departments, manage advisors, and set institutional policies
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm">AI Institution Assistant: Active</span>
          </div>
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="institutions">
            <Building2 className="h-4 w-4 mr-2" />
            Institutions
          </TabsTrigger>
          <TabsTrigger value="departments">
            <GraduationCap className="h-4 w-4 mr-2" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="advisors">
            <UserCog className="h-4 w-4 mr-2" />
            Advisors
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="policies">
            <FileText className="h-4 w-4 mr-2" />
            Policies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="institutions" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Institution Directory</CardTitle>
                <CardDescription>
                  {filteredInstitutions.length} institution{filteredInstitutions.length !== 1 ? 's' : ''} configured
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search institutions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="institute">Institute</SelectItem>
                    <SelectItem value="polytechnic">Polytechnic</SelectItem>
                    <SelectItem value="school">School</SelectItem>
                  </SelectContent>
                </Select>
                
                <Dialog open={showAddInstitutionDialog} onOpenChange={setShowAddInstitutionDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Institution
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Institution</DialogTitle>
                      <DialogDescription>
                        Configure a new institution in the system
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="instName">Institution Name</Label>
                          <Input
                            id="instName"
                            value={newInstitution.name}
                            onChange={(e) => setNewInstitution({...newInstitution, name: e.target.value})}
                            placeholder="Enter institution name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="instAcronym">Acronym</Label>
                          <Input
                            id="instAcronym"
                            value={newInstitution.acronym}
                            onChange={(e) => setNewInstitution({...newInstitution, acronym: e.target.value})}
                            placeholder="Enter acronym (e.g., UP, ADMU)"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="instType">Institution Type</Label>
                        <Select value={newInstitution.type} onValueChange={(value) => setNewInstitution({...newInstitution, type: value as any})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="university">University</SelectItem>
                            <SelectItem value="college">College</SelectItem>
                            <SelectItem value="institute">Institute</SelectItem>
                            <SelectItem value="polytechnic">Polytechnic</SelectItem>
                            <SelectItem value="school">School</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="instCountry">Country</Label>
                        <Input
                          id="instCountry"
                          value={newInstitution.country}
                          onChange={(e) => setNewInstitution({...newInstitution, country: e.target.value})}
                          placeholder="Enter country"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="instRegion">Region</Label>
                          <Input
                            id="instRegion"
                            value={newInstitution.region}
                            onChange={(e) => setNewInstitution({...newInstitution, region: e.target.value})}
                            placeholder="Enter region"
                          />
                        </div>
                        <div>
                          <Label htmlFor="instCity">City</Label>
                          <Input
                            id="instCity"
                            value={newInstitution.city}
                            onChange={(e) => setNewInstitution({...newInstitution, city: e.target.value})}
                            placeholder="Enter city"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="instAddress">Address</Label>
                        <Input
                          id="instAddress"
                          value={newInstitution.address}
                          onChange={(e) => setNewInstitution({...newInstitution, address: e.target.value})}
                          placeholder="Enter full address"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="instWebsite">Website</Label>
                        <Input
                          id="instWebsite"
                          type="url"
                          value={newInstitution.website}
                          onChange={(e) => setNewInstitution({...newInstitution, website: e.target.value})}
                          placeholder="https://example.edu.ph"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="instEstablished">Established Year</Label>
                          <Input
                            id="instEstablished"
                            type="number"
                            value={newInstitution.established}
                            onChange={(e) => setNewInstitution({...newInstitution, established: parseInt(e.target.value) || new Date().getFullYear()})}
                            placeholder="Enter year established"
                          />
                        </div>
                        <div>
                          <Label htmlFor="instAccreditation">Accreditation Level</Label>
                          <Select value={newInstitution.accreditation} onValueChange={(value) => setNewInstitution({...newInstitution, accreditation: value as any})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="level-1">Level 1</SelectItem>
                              <SelectItem value="level-2">Level 2</SelectItem>
                              <SelectItem value="level-3">Level 3</SelectItem>
                              <SelectItem value="level-4">Level 4</SelectItem>
                              <SelectItem value="international">International</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddInstitutionDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddInstitution} disabled={!newInstitution.name || !newInstitution.acronym}>
                        Add Institution
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <div className="space-y-4">
                {filteredInstitutions.map((institution) => (
                  <div
                    key={institution.id}
                    className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      selectedInstitution?.id === institution.id ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''
                    }`}
                    onClick={() => setSelectedInstitution(institution)}
                  >
                    {/* Top row - Name and Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg flex-shrink-0">
                          <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{institution.name} ({institution.acronym})</div>
                          <div className="text-sm text-muted-foreground truncate">{institution.city}, {institution.region}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        {getInstitutionTypeBadge(institution.type)}
                        {getAccreditationBadge(institution.accreditation)}
                        {getStatusBadge(institution.isActive)}
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{institution.departments.length}</div>
                        <div className="text-xs text-muted-foreground">Departments</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{institution.advisors.length}</div>
                        <div className="text-xs text-muted-foreground">Advisors</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">
                          {institution.departments.reduce((sum, dept) => sum + dept.studentCount, 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Export</span>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredInstitutions.length === 0 && (
                  <div className="text-center py-10">
                    <Building2 className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No institutions found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No institutions match your search." : "No institutions have been configured yet."}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setShowAddInstitutionDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Institution
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Management</CardTitle>
              <CardDescription>
                Manage academic departments and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search departments..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={() => setShowAddDepartmentDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </div>
              
              <div className="space-y-4">
                {institutions.flatMap(inst => 
                  inst.departments.map(dept => ({
                    ...dept,
                    institutionName: inst.name,
                    institutionAcronym: inst.acronym
                  }))
                ).filter(dept => {
                  const matchesSearch = 
                    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    dept.headName.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  const matchesStatus = statusFilter === "all" || (statusFilter === "active") === dept.isActive;
                  
                  return matchesSearch && matchesStatus;
                }).map((dept) => (
                  <div key={dept.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    {/* Top row - Name and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg flex-shrink-0">
                          <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{dept.name} ({dept.code})</div>
                          <div className="text-sm text-muted-foreground truncate">{dept.institutionName} ({dept.institutionAcronym})</div>
                        </div>
                      </div>
                      {getStatusBadge(dept.isActive)}
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{dept.studentCount}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{dept.advisorCount}</div>
                        <div className="text-xs text-muted-foreground">Advisors</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{dept.thesisCount}</div>
                        <div className="text-xs text-muted-foreground">Theses</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium truncate">{dept.headName}</div>
                        <div className="text-xs text-muted-foreground">Head</div>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Policies</span>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {institutions.flatMap(inst => inst.departments)
                  .filter(dept => {
                    const matchesSearch = 
                      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      dept.headName.toLowerCase().includes(searchTerm.toLowerCase());
                    
                    const matchesStatus = statusFilter === "all" || (statusFilter === "active") === dept.isActive;
                    
                    return matchesSearch && matchesStatus;
                  }).length === 0 && (
                  <div className="text-center py-10">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No departments found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No departments match your search." : "No departments have been configured yet."}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setShowAddDepartmentDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Department
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advisors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advisor Management</CardTitle>
              <CardDescription>
                Manage thesis advisors and their assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search advisors..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={() => setShowAddAdvisorDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Advisor
                </Button>
              </div>
              
              <div className="space-y-4">
                {institutions.flatMap(inst => 
                  inst.advisors.map(adv => ({
                    ...adv,
                    institutionName: inst.name,
                    institutionAcronym: inst.acronym
                  }))
                ).filter(adv => {
                  const matchesSearch = 
                    adv.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    adv.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    adv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    adv.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    adv.specialization.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  const matchesStatus = statusFilter === "all" || adv.status === statusFilter;
                  
                  return matchesSearch && matchesStatus;
                }).map((advisor) => (
                  <div key={advisor.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    {/* Top row - Name and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${advisor.firstName}+${advisor.lastName}&backgroundColor=b6e6ff&fontSize=32`} alt={`${advisor.firstName} ${advisor.lastName}`} />
                          <AvatarFallback>{advisor.firstName.charAt(0)}{advisor.lastName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{advisor.firstName} {advisor.lastName}</div>
                          <div className="text-sm text-muted-foreground truncate">{advisor.departmentName} • {advisor.institutionName}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        <Badge variant="outline">{advisor.role.replace('-', ' ')}</Badge>
                        <Badge variant={advisor.status === "active" ? "default" :
                                       advisor.status === "on-leave" ? "secondary" :
                                       "destructive"}>
                          {advisor.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3 text-sm">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium truncate">{advisor.specialization}</div>
                        <div className="text-xs text-muted-foreground">Specialization</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{advisor.currentStudents}/{advisor.studentCapacity}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium truncate">{advisor.email}</div>
                        <div className="text-xs text-muted-foreground">Email</div>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Contact</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <User className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Profile</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Assignments</span>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {institutions.flatMap(inst => inst.advisors)
                  .filter(adv => {
                    const matchesSearch = 
                      adv.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      adv.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      adv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      adv.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      adv.specialization.toLowerCase().includes(searchTerm.toLowerCase());
                    
                    const matchesStatus = statusFilter === "all" || adv.status === statusFilter;
                    
                    return matchesSearch && matchesStatus;
                  }).length === 0 && (
                  <div className="text-center py-10">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No advisors found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No advisors match your search." : "No advisors have been registered yet."}
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setShowAddAdvisorDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Advisor
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>
                Manage enrolled students and their thesis assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export List
                </Button>
              </div>
              
              <div className="space-y-4">
                {institutions.flatMap(inst => 
                  inst.students.map(student => ({
                    ...student,
                    institutionName: inst.name,
                    institutionAcronym: inst.acronym
                  }))
                ).filter(student => {
                  const matchesSearch = 
                    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    student.thesisTitle.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  const matchesStatus = statusFilter === "all" || student.status === statusFilter;
                  
                  return matchesSearch && matchesStatus;
                }).map((student) => (
                  <div key={student.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    {/* Top row - Name and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.firstName}+${student.lastName}&backgroundColor=d1fae5&fontSize=32`} alt={`${student.firstName} ${student.lastName}`} />
                          <AvatarFallback>{student.firstName.charAt(0)}{student.lastName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{student.firstName} {student.lastName}</div>
                          <div className="text-sm text-muted-foreground truncate">{student.departmentName} • {student.institutionName}</div>
                        </div>
                      </div>
                      <Badge className="flex-shrink-0" variant={student.status === "active" ? "default" :
                                     student.status === "on-leave" ? "secondary" :
                                     student.status === "graduated" ? "outline" :
                                     "destructive"}>
                        {student.status.replace('-', ' ')}
                      </Badge>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-sm">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium truncate">{student.studentId}</div>
                        <div className="text-xs text-muted-foreground">Student ID</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium truncate">{student.advisorName}</div>
                        <div className="text-xs text-muted-foreground">Advisor</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded col-span-2">
                        <div className="font-medium truncate">{student.thesisTitle}</div>
                        <div className="text-xs text-muted-foreground">Thesis</div>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Contact</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">View Work</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Message</span>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {institutions.flatMap(inst => inst.students)
                  .filter(student => {
                    const matchesSearch = 
                      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      student.thesisTitle.toLowerCase().includes(searchTerm.toLowerCase());
                    
                    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
                    
                    return matchesSearch && matchesStatus;
                  }).length === 0 && (
                  <div className="text-center py-10">
                    <UserRound className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No students found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No students match your search." : "No students are currently enrolled."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Institutional Policies</CardTitle>
              <CardDescription>
                Manage thesis requirements and institutional guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search policies..."
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="thesis">Thesis</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="ethics">Ethics</SelectItem>
                    <SelectItem value="format">Format</SelectItem>
                    <SelectItem value="submission">Submission</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Policies
                </Button>
              </div>
              
              <div className="space-y-4">
                {institutions.flatMap(inst => 
                  inst.departments.flatMap(dept => 
                    dept.policies.map(policy => ({
                      ...policy,
                      departmentName: dept.name,
                      departmentCode: dept.code,
                      institutionName: inst.name
                    }))
                  )
                ).filter(policy => {
                  const matchesSearch = 
                    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    policy.description.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  const matchesCategory = statusFilter === "all" || policy.category === statusFilter;
                  
                  return matchesSearch && matchesCategory;
                }).map((policy) => (
                  <div key={policy.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    {/* Top row - Title and Category */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg flex-shrink-0">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{policy.title}</div>
                          <div className="text-sm text-muted-foreground truncate">{policy.departmentName} • {policy.institutionName}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0">{policy.category}</Badge>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{policy.description}</p>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">{policy.version}</div>
                        <div className="text-xs text-muted-foreground">Version</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium truncate">{formatDate(policy.effectiveDate)}</div>
                        <div className="text-xs text-muted-foreground">Effective</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium truncate">{formatDate(policy.lastUpdated)}</div>
                        <div className="text-xs text-muted-foreground">Updated</div>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {institutions.flatMap(inst => 
                  inst.departments.flatMap(dept => dept.policies)
                ).filter(policy => {
                  const matchesSearch = 
                    policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    policy.description.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  const matchesCategory = statusFilter === "all" || policy.category === statusFilter;
                  
                  return matchesSearch && matchesCategory;
                }).length === 0 && (
                  <div className="text-center py-10">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No policies found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {searchTerm ? "No policies match your search." : "No institutional policies have been defined yet."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Institution Details Panel */}
      {selectedInstitution && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedInstitution.name} Details</CardTitle>
            <CardDescription>
              Configuration and management for {selectedInstitution.acronym}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{selectedInstitution.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Acronym:</span>
                    <span>{selectedInstitution.acronym}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{selectedInstitution.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Established:</span>
                    <span>{selectedInstitution.established}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Country:</span>
                    <span>{selectedInstitution.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Region:</span>
                    <span>{selectedInstitution.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">City:</span>
                    <span>{selectedInstitution.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Website:</span>
                    <a href={selectedInstitution.website} className="text-blue-600 hover:underline">{selectedInstitution.website}</a>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Departments:</span>
                    <span>{selectedInstitution.departments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Advisors:</span>
                    <span>{selectedInstitution.advisors.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students:</span>
                    <span>{selectedInstitution.students.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Theses:</span>
                    <span>{selectedInstitution.departments.reduce((sum, dept) => sum + dept.thesisCount, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accreditation:</span>
                    <span>{selectedInstitution.accreditation.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span>{selectedInstitution.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(selectedInstitution.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="font-medium mb-2">Departments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedInstitution.departments.map((dept) => (
                  <div key={dept.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{dept.name}</div>
                        <div className="text-sm text-muted-foreground">{dept.code}</div>
                      </div>
                      <Badge variant={dept.isActive ? "default" : "outline"}>
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm">
                      <div>Head: {dept.headName}</div>
                      <div className="flex justify-between mt-1">
                        <span>Students: {dept.studentCount}</span>
                        <span>Advisors: {dept.advisorCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="font-medium mb-2">Advisors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedInstitution.advisors.map((adv) => (
                  <div key={adv.id} className="border rounded-lg p-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${adv.firstName}+${adv.lastName}&backgroundColor=f0f9ff&fontSize=32`} alt={`${adv.firstName} ${adv.lastName}`} />
                      <AvatarFallback>{adv.firstName.charAt(0)}{adv.lastName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{adv.firstName} {adv.lastName}</div>
                      <div className="text-sm text-muted-foreground">{adv.departmentName} • {adv.role}</div>
                      <div className="text-xs text-muted-foreground">{adv.currentStudents}/{adv.studentCapacity} students</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InstitutionalManagement;