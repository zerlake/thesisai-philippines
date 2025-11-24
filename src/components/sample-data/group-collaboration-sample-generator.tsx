'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FileText,
  MessageSquare,
  CheckSquare,
  RotateCcw,
  GitBranch,
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { generateGroupCollaborationSampleData, resetGroupCollaborationSampleData } from '@/lib/sample-data/group-collaboration-sample';
import { toast } from 'sonner';

interface SampleDataGeneratorProps {
  onSampleDataGenerated?: () => void; // Callback function to refresh the UI after generating data
}

export default function GroupCollaborationSampleDataGenerator({ onSampleDataGenerated }: SampleDataGeneratorProps) {
  const { session, supabase } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleGenerateSampleData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id) {
      toast.error('You must be logged in to generate sample data');
      return;
    }

    setIsGenerating(true);
    try {
      await generateGroupCollaborationSampleData(supabase, session.user.id);
      if (onSampleDataGenerated) {
        onSampleDataGenerated();
      }
    } catch (error) {
      console.error('Error generating sample data:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetSampleData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id) {
      toast.error('You must be logged in to reset sample data');
      return;
    }

    if (confirm('Are you sure you want to reset all sample group collaboration data? This will delete all groups you created and their associated data.')) {
      setIsResetting(true);
      try {
        await resetGroupCollaborationSampleData(supabase, session.user.id);
        if (onSampleDataGenerated) {
          onSampleDataGenerated();
        }
      } catch (error) {
        console.error('Error resetting sample data:', error);
      } finally {
        setIsResetting(false);
      }
    }
  };

  // Feature list for the sample data generator
  const features = [
    { icon: Users, text: 'Sample research groups' },
    { icon: UserPlus, text: 'Group members & invitations' },
    { icon: CheckSquare, text: 'Group tasks & assignments' },
    { icon: FileText, text: 'Shared documents' },
    { icon: MessageSquare, text: 'Group communications' },
    { icon: GitBranch, text: 'Collaboration workflows' },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Group Collaboration Sample Data</CardTitle>
            <CardDescription className="mt-1">
              Generate sample data to explore group collaboration features
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Ready
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                <feature.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleGenerateSampleData}
              disabled={isGenerating}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <GitBranch className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Sample Data'}
            </Button>

            <Button
              onClick={handleResetSampleData}
              disabled={isResetting}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isResetting ? 'Resetting...' : 'Reset Data'}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md mt-3">
            <p className="font-medium mb-1">What this includes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>3 sample research groups with descriptions</li>
              <li>Sample group tasks with different statuses</li>
              <li>Shared documents for group collaboration</li>
              <li>Sample communications between group members</li>
              <li>Group member invitations and roles</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}