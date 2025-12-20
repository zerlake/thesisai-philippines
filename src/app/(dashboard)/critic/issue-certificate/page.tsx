'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function IssueCertificatePage() {
  const { session, profile, isLoading } = useAuth();
  const [certificateData, setCertificateData] = useState({
    studentName: "",
    thesisTitle: "",
    reviewDate: "",
    certificateType: ""
  });
  const [certificates, setCertificates] = useState<any[]>([]);
  const [recentCertificates, setRecentCertificates] = useState<any[]>([]);

  // Sample certificate data
  const sampleCertificates = [
    { id: 1, studentName: "John Smith", thesisTitle: "The Impact of Climate Change on Biodiversity", type: "approval", date: "2023-11-15", score: 85, status: "Issued" },
    { id: 2, studentName: "Sarah Johnson", thesisTitle: "Machine Learning in Healthcare Diagnostics", type: "approval", date: "2023-11-18", score: 92, status: "Issued" },
    { id: 3, studentName: "Michael Chen", thesisTitle: "Sustainable Architecture in Urban Planning", type: "conditional", date: "2023-11-20", score: 78, status: "Pending" },
    { id: 4, studentName: "Emma Rodriguez", thesisTitle: "Neuroplasticity and Cognitive Rehabilitation", type: "approval", date: "2023-11-22", score: 88, status: "Issued" },
  ];

  useEffect(() => {
    // Load sample data on component mount
    setCertificates(sampleCertificates);
    setRecentCertificates(sampleCertificates.slice(0, 3));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle certificate issuance logic
    alert(`Certificate issued for ${certificateData.studentName}`);

    // Add to certificates list
    const newCertificate = {
      id: certificates.length + 1,
      studentName: certificateData.studentName,
      thesisTitle: certificateData.thesisTitle,
      type: certificateData.certificateType,
      date: certificateData.reviewDate || new Date().toISOString().split('T')[0],
      score: Math.floor(Math.random() * 20) + 80, // Random score between 80-100
      status: "Issued"
    };

    setCertificates([newCertificate, ...certificates]);
    setRecentCertificates([newCertificate, ...recentCertificates.slice(0, 2)]);

    // Reset form
    setCertificateData({
      studentName: "",
      thesisTitle: "",
      reviewDate: "",
      certificateType: ""
    });
  };

  // Check if user is authenticated and has critic role
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session || !profile || profile.role !== 'critic') {
    return <div>Please log in as a critic to access this page</div>;
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Issue Certificate</h1>
        <p className="text-muted-foreground">Generate and issue certificates for reviewed manuscripts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{certificates.length}</div>
            <p className="text-sm text-muted-foreground">Issued this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {certificates.length > 0
                ? Math.round((certificates.filter(c => c.type === "approval").length / certificates.length) * 100)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Approved certificates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Avg. Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {certificates.length > 0
                ? Math.round(certificates.reduce((sum, c) => sum + c.score, 0) / certificates.length)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Across all certificates</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Certificate Issuance</CardTitle>
            <CardDescription>Complete the form below to issue a review certificate</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="studentName" className="block text-sm font-medium mb-1">Student Name</label>
                  <Input
                    id="studentName"
                    value={certificateData.studentName}
                    onChange={(e) => setCertificateData({...certificateData, studentName: e.target.value})}
                    placeholder="Enter student name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="thesisTitle" className="block text-sm font-medium mb-1">Thesis Title</label>
                  <Input
                    id="thesisTitle"
                    value={certificateData.thesisTitle}
                    onChange={(e) => setCertificateData({...certificateData, thesisTitle: e.target.value})}
                    placeholder="Enter thesis title"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reviewDate" className="block text-sm font-medium mb-1">Review Date</label>
                  <Input
                    id="reviewDate"
                    type="date"
                    value={certificateData.reviewDate}
                    onChange={(e) => setCertificateData({...certificateData, reviewDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="certificateType" className="block text-sm font-medium mb-1">Certificate Type</label>
                  <Select
                    value={certificateData.certificateType}
                    onValueChange={(value) => setCertificateData({...certificateData, certificateType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select certificate type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approval">Approval Certificate</SelectItem>
                      <SelectItem value="conditional">Conditional Approval</SelectItem>
                      <SelectItem value="rejection">Rejection Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="comments" className="block text-sm font-medium mb-1">Comments</label>
                <Textarea
                  id="comments"
                  placeholder="Add any additional comments for the certificate"
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full md:w-auto">Issue Certificate</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Certificates</CardTitle>
            <CardDescription>Recently issued certificates</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.studentName}</TableCell>
                      <TableCell>
                        <Badge variant={cert.type === "approval" ? "default" : cert.type === "conditional" ? "secondary" : "destructive"}>
                          {cert.type.charAt(0).toUpperCase() + cert.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{cert.score}%</TableCell>
                      <TableCell>{cert.date}</TableCell>
                      <TableCell>
                        <Badge variant={cert.status === "Issued" ? "default" : "secondary"}>
                          {cert.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All Certificates</CardTitle>
          <CardDescription>Complete history of issued certificates</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Thesis Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">#{cert.id}</TableCell>
                    <TableCell>{cert.studentName}</TableCell>
                    <TableCell className="max-w-xs truncate">{cert.thesisTitle}</TableCell>
                    <TableCell>
                      <Badge variant={cert.type === "approval" ? "default" : cert.type === "conditional" ? "secondary" : "destructive"}>
                        {cert.type.charAt(0).toUpperCase() + cert.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{cert.score}%</TableCell>
                    <TableCell>{cert.date}</TableCell>
                    <TableCell>
                      <Badge variant={cert.status === "Issued" ? "default" : "secondary"}>
                        {cert.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}