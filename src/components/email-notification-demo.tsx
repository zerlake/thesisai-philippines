'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotificationEmail } from '@/hooks/useNotificationEmail';
import { Mail, Send } from 'lucide-react';

export function EmailNotificationDemo() {
  const { sendEmail, isLoading } = useNotificationEmail();
  const [formData, setFormData] = useState({
    to: '',
    advisorName: 'Dr. Garcia',
    studentName: 'Maria Santos',
    actionType: 'submission' as const,
    documentTitle: 'Chapter 1 - Introduction',
    message: 'Maria Santos has submitted Chapter 1 for your review.',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.to) {
      alert('Please enter an advisor email address');
      return;
    }

    await sendEmail({
      to: formData.to,
      advisorName: formData.advisorName,
      studentName: formData.studentName,
      actionType: formData.actionType,
      documentTitle: formData.documentTitle,
      message: formData.message,
      actionUrl: 'https://thesisai-philippines.vercel.app/advisor',
      actionButtonText: 'Review Dashboard',
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          <div>
            <CardTitle>Email Notification Demo</CardTitle>
            <CardDescription>
              Send a test email notification to an advisor
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Advisor Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Advisor Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="advisor@example.com"
              value={formData.to}
              onChange={(e) => handleChange('to', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use 'delivered@resend.dev' to test with Resend
            </p>
          </div>

          {/* Advisor Name */}
          <div className="space-y-2">
            <Label htmlFor="advisorName">Advisor Name</Label>
            <Input
              id="advisorName"
              placeholder="Dr. Garcia"
              value={formData.advisorName}
              onChange={(e) => handleChange('advisorName', e.target.value)}
            />
          </div>

          {/* Student Name */}
          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name</Label>
            <Input
              id="studentName"
              placeholder="Maria Santos"
              value={formData.studentName}
              onChange={(e) => handleChange('studentName', e.target.value)}
            />
          </div>

          {/* Action Type */}
          <div className="space-y-2">
            <Label htmlFor="actionType">Notification Type</Label>
            <Select value={formData.actionType} onValueChange={(value) => handleChange('actionType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submission">📄 Document Submission</SelectItem>
                <SelectItem value="revision">✏️ Revision Ready</SelectItem>
                <SelectItem value="request">❓ Student Request</SelectItem>
                <SelectItem value="milestone">🎉 Milestone Achievement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document Title */}
          <div className="space-y-2">
            <Label htmlFor="documentTitle">Document/Topic Title</Label>
            <Input
              id="documentTitle"
              placeholder="Chapter 1 - Introduction"
              value={formData.documentTitle}
              onChange={(e) => handleChange('documentTitle', e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              placeholder="Message to be displayed in the email..."
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md text-sm"
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Sending...' : 'Send Test Email'}
          </Button>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-semibold text-blue-900 mb-2">📧 Testing Tips:</p>
            <ul className="text-blue-800 space-y-1 text-xs">
              <li>• Use <code className="bg-white px-1 rounded">delivered@resend.dev</code> for Resend test emails</li>
              <li>• Check your inbox (or spam folder) for the test email</li>
              <li>• Use your actual email to receive notifications in development</li>
              <li>• Make sure <code className="bg-white px-1 rounded">RESEND_API_KEY</code> is set in <code className="bg-white px-1 rounded">.env.local</code></li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
