import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Define TypeScript interfaces for group collaboration data
interface Group {
  id?: string;
  name: string;
  description: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

interface GroupTask {
  id?: string;
  group_id: string;
  assigned_to: string;
  assigned_by: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

interface GroupDocument {
  id?: string;
  group_id: string;
  uploaded_by: string;
  title: string;
  file_path: string;
  file_type: string;
  size: number;
  description: string;
  created_at?: string;
  updated_at?: string;
}

interface GroupCommunication {
  id?: string;
  group_id: string;
  sender_id: string;
  message: string;
  message_type: 'message' | 'announcement' | 'task_update' | 'document_share';
  created_at?: string;
  updated_at?: string;
}

/**
 * Sample data for Group Collaboration Management
 */
export const generateGroupCollaborationSampleData = async (supabase: SupabaseClient<any, 'public', any>, userId: string) => {
  try {
    // Sample groups
    const sampleGroups: Omit<Group, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        name: 'Literature Review Team',
        description: 'Collaborative group to review and analyze research papers related to machine learning in education',
        created_by: userId,
        status: 'active'
      },
      {
        name: 'Thesis Writing Group',
        description: 'Group to collaborate on writing and reviewing thesis chapters',
        created_by: userId,
        status: 'active'
      },
      {
        name: 'Data Analysis Team',
        description: 'Team focused on statistical analysis and data visualization for research projects',
        created_by: userId,
        status: 'active'
      }
    ];

    // Insert groups and get their IDs
    const insertedGroups = [];
    for (const group of sampleGroups) {
      const { data, error } = await supabase
        .from('research_groups')
        .insert([group])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        insertedGroups.push(data);
        
        // Add the current user as leader
        await supabase
          .from('group_memberships')
          .insert([{
            group_id: data.id,
            user_id: userId,
            role: 'leader',
            accepted_invite: true
          }]);
      }
    }

    // Sample members for the groups (using placeholder user IDs)
    const sampleMembers = [
      { email: 'member1@example.com', role: 'member' },
      { email: 'member2@example.com', role: 'co-leader' },
      { email: 'member3@example.com', role: 'member' },
      { email: 'advisor@example.com', role: 'member' }
    ];

    // Add sample members to the first group
    if (insertedGroups.length > 0) {
      const groupId = insertedGroups[0].id;
      
      for (const member of sampleMembers) {
        // In a real scenario, you would look up actual user IDs
        // For this sample, we'll just create placeholder invitations
        await supabase
          .from('group_invitations')
          .insert([{
            group_id: groupId,
            email: member.email,
            invited_by: userId,
            status: 'pending'
          }]);
      }

      // Sample tasks
      const sampleTasks: Omit<GroupTask, 'id' | 'created_at' | 'updated_at' | 'completed_at'>[] = [
        {
          group_id: groupId,
          assigned_to: userId,
          assigned_by: userId,
          title: 'Review 5 research papers',
          description: 'Analyze and summarize key findings from the provided research papers',
          status: 'in_progress',
          priority: 'high',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          group_id: groupId,
          assigned_to: userId,
          assigned_by: userId,
          title: 'Create literature matrix',
          description: 'Develop a matrix to compare methodologies used in different papers',
          status: 'todo',
          priority: 'medium',
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Insert tasks
      for (const task of sampleTasks) {
        await supabase
          .from('group_tasks')
          .insert([task]);
      }

      // Sample documents
      const sampleDocuments: Omit<GroupDocument, 'id' | 'created_at' | 'updated_at'>[] = [
        {
          group_id: groupId,
          uploaded_by: userId,
          title: 'Research Paper Analysis',
          file_path: '/documents/research-paper-analysis.pdf',
          file_type: 'pdf',
          size: 2048576,
          description: 'Initial analysis of relevant research papers in the field'
        },
        {
          group_id: groupId,
          uploaded_by: userId,
          title: 'Literature Review Outline',
          file_path: '/documents/literature-outline.docx',
          file_type: 'docx',
          size: 1024576,
          description: 'Outline for the literature review section'
        }
      ];

      // Insert documents
      for (const doc of sampleDocuments) {
        await supabase
          .from('group_documents')
          .insert([doc]);
      }

      // Sample communications
      const sampleCommunications: Omit<GroupCommunication, 'id' | 'created_at' | 'updated_at'>[] = [
        {
          group_id: groupId,
          sender_id: userId,
          message: 'Welcome to the Literature Review Team! Let\'s start by assigning initial tasks.',
          message_type: 'announcement'
        },
        {
          group_id: groupId,
          sender_id: userId,
          message: 'I\'ve added the initial research papers to the document section for review.',
          message_type: 'document_share'
        },
        {
          group_id: groupId,
          sender_id: userId,
          message: 'Please confirm your availability for our first meeting next week.',
          message_type: 'message'
        }
      ];

      // Insert communications
      for (const comm of sampleCommunications) {
        await supabase
          .from('group_communications')
          .insert([comm]);
      }
    }

    toast.success('Sample group collaboration data generated successfully!');
    return { groups: insertedGroups };
  } catch (error: any) {
    console.error('Error generating sample group data:', error);
    toast.error('Failed to generate sample group collaboration data: ' + error.message);
    throw error;
  }
};

// Additional utility function to reset sample data (for testing)
export const resetGroupCollaborationSampleData = async (supabase: SupabaseClient<any, 'public', any>, userId: string) => {
  try {
    // Get user's groups
    const { data: userGroups, error: groupsError } = await supabase
      .from('research_groups')
      .select('id')
      .eq('created_by', userId);

    if (groupsError) throw groupsError;

    if (userGroups && userGroups.length > 0) {
      const groupIds = userGroups.map(g => g.id);

      // Delete related data in dependent tables first
      await supabase.from('group_communications').delete().in('group_id', groupIds);
      await supabase.from('group_documents').delete().in('group_id', groupIds);
      await supabase.from('group_tasks').delete().in('group_id', groupIds);
      await supabase.from('group_memberships').delete().in('group_id', groupIds);
      await supabase.from('group_invitations').delete().in('group_id', groupIds);

      // Finally delete the groups
      await supabase.from('research_groups').delete().in('id', groupIds);
    }

    toast.success('Sample group collaboration data reset successfully!');
  } catch (error: any) {
    console.error('Error resetting sample group data:', error);
    toast.error('Failed to reset sample group collaboration data: ' + error.message);
    throw error;
  }
};

// Sample data sets for different purposes
export const sampleGroupDataSets = {
  basic: {
    groups: [
      {
        name: 'Thesis Writing Group',
        description: 'Collaborative group for thesis writing and peer review',
        status: 'active'
      }
    ],
    tasks: [
      {
        title: 'Outline Review',
        description: 'Review and provide feedback on thesis outline',
        status: 'todo',
        priority: 'high'
      },
      {
        title: 'Literature Analysis',
        description: 'Analyze 5 key papers in the field',
        status: 'in_progress',
        priority: 'medium'
      }
    ]
  },
  academic: {
    groups: [
      {
        name: 'Literature Review Team',
        description: 'Collaborative group to review and analyze research papers',
        status: 'active'
      },
      {
        name: 'Data Analysis Group',
        description: 'Team focused on statistical analysis and data visualization',
        status: 'active'
      }
    ],
    tasks: [
      {
        title: 'Methodology Comparison',
        description: 'Compare methodologies used in recent studies',
        status: 'todo',
        priority: 'high'
      },
      {
        title: 'Results Synthesis',
        description: 'Synthesize results from multiple studies',
        status: 'in_progress',
        priority: 'medium'
      },
      {
        title: 'Bibliography Update',
        description: 'Update bibliography with recent publications',
        status: 'completed',
        priority: 'low'
      }
    ]
  }
};