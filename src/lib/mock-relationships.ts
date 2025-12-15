/**
 * Mock relationship data for student-advisor-critic connections
 * This creates sample data that connects students with their advisors and critics
 * to demonstrate real-time data synchronization between dashboards
 */

import { createClient } from '@supabase/supabase-js';

// Mock data for interconnected users
const mockUsers = {
  students: [
    {
      id: 'student-1-mock',
      email: 'maria.santos@example.com',
      first_name: 'Maria',
      last_name: 'Santos',
      role: 'user',
      thesis_title: 'Impact of AI on Academic Writing',
      progress: 65,
      advisor_assigned: 'advisor-1-mock',
      critic_assigned: 'critic-1-mock',
      documents_count: 12,
      last_active: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: 'student-2-mock',
      email: 'john.dela.cruz@example.com',
      first_name: 'John',
      last_name: 'Dela Cruz',
      role: 'user', 
      thesis_title: 'Sustainable Energy Solutions in Urban Planning',
      progress: 42,
      advisor_assigned: 'advisor-1-mock',
      critic_assigned: 'critic-2-mock',
      documents_count: 8,
      last_active: new Date(Date.now() - 172800000), // 2 days ago
    },
    {
      id: 'student-3-mock',
      email: 'ana.reyes@example.com',
      first_name: 'Ana',
      last_name: 'Reyes',
      role: 'user',
      thesis_title: 'Mental Health Impacts of Social Media Usage',
      progress: 87,
      advisor_assigned: 'advisor-2-mock',
      critic_assigned: 'critic-1-mock',
      documents_count: 15,
      last_active: new Date(),
    }
  ],
  advisors: [
    {
      id: 'advisor-1-mock',
      email: 'dr.fernando.garcia@example.com',
      first_name: 'Fernando',
      last_name: 'Garcia',
      role: 'advisor',
      department: 'Computer Science',
      students_assigned: ['student-1-mock', 'student-2-mock'],
      total_students: 2,
      pending_reviews: 3,
      availability: 'high',
    },
    {
      id: 'advisor-2-mock',
      email: 'dr.elena.mendoza@example.com',
      first_name: 'Elena',
      last_name: 'Mendoza',
      role: 'advisor',
      department: 'Psychology',
      students_assigned: ['student-3-mock'],
      total_students: 1,
      pending_reviews: 1,
      availability: 'medium',
    }
  ],
  critics: [
    {
      id: 'critic-1-mock',
      email: 'dr.roberto.lim@university.edu',
      first_name: 'Roberto',
      last_name: 'Lim',
      role: 'critic',
      institution: 'University of the Philippines',
      students_assigned: ['student-1-mock', 'student-3-mock'],
      total_students: 2,
      pending_certifications: 2,
      status: 'active',
    },
    {
      id: 'critic-2-mock',
      email: 'dr.carlos.tan@research.edu',
      first_name: 'Carlos',
      last_name: 'Tan',
      role: 'critic',
      institution: 'Ateneo de Manila University',
      students_assigned: ['student-2-mock'],
      total_students: 1,
      pending_certifications: 1,
      status: 'active',
    }
  ]
};

// Mock documents data WITH CONTENT for editor integration
const mockDocuments = [
  {
    id: 'doc-1-mock',
    user_id: 'student-1-mock',
    title: 'Chapter 1 - Introduction',
    status: 'submitted',
    advisor_review_status: 'reviewed',
    critic_review_status: 'pending',
    created_at: new Date(Date.now() - 259200000), // 3 days ago
    updated_at: new Date(Date.now() - 86400000),  // 1 day ago
    content: `<h1 id="introduction">Chapter I: Introduction</h1>
<h2>Background</h2>
<p>The rapid advancement of artificial intelligence in recent years has transformed multiple sectors of society, including education. As academic writing becomes increasingly complex, students require sophisticated tools to enhance their writing quality, structure, and coherence.</p>
<h2>Problem Statement</h2>
<p>Despite the availability of writing assistance tools, many graduate students struggle with organizing complex arguments, maintaining academic tone, and ensuring proper citations. This thesis addresses the gap between current AI capabilities and the specific needs of academic writers.</p>
<h2>Research Objectives</h2>
<ul>
<li>To evaluate the impact of AI-assisted writing tools on academic paper quality</li>
<li>To identify key features that improve student thesis writing outcomes</li>
<li>To propose an integrated system for academic writing support</li>
</ul>`
  },
  {
    id: 'doc-2-mock',
    user_id: 'student-1-mock',
    title: 'Chapter 2 - Literature Review',
    status: 'draft',
    advisor_review_status: 'pending',
    critic_review_status: 'pending',
    created_at: new Date(Date.now() - 172800000), // 2 days ago
    updated_at: new Date(Date.now() - 172800000),
    content: `<h1 id="literature-review">Chapter II: Literature Review</h1>
<h2>Historical Context of Academic Writing Support</h2>
<p>Academic writing has been a cornerstone of higher education for centuries. Traditional approaches relied heavily on manual review and peer feedback. With the emergence of computational linguistics in the 1980s, automated writing assessment tools began to develop.</p>
<h2>Evolution of AI in Education</h2>
<p>The integration of artificial intelligence in educational settings has grown exponentially since the introduction of large language models. Early implementations focused on grammar and syntax checking. Current systems provide deeper semantic analysis and contextual suggestions.</p>
<h2>Key Findings</h2>
<p>Recent meta-analyses have shown that students using AI-assisted writing tools show a 23-35% improvement in paper organization and clarity. However, concerns about academic integrity and over-reliance on automation persist in the literature.</p>
<h3>Student Performance Metrics</h3>
<ul>
<li>Organization and structure: 28% improvement</li>
<li>Clarity and readability: 31% improvement</li>
<li>Citation accuracy: 18% improvement</li>
<li>Time spent on writing: 35% reduction</li>
</ul>
<h2>Critical Analysis</h2>
<p>While AI shows promise in academic writing support, several limitations exist. These tools often lack domain-specific knowledge and may provide generic suggestions that don't address discipline-specific conventions.</p>`
  },
  {
    id: 'doc-3-mock',
    user_id: 'student-3-mock',
    title: 'Methodology Framework',
    status: 'submitted',
    advisor_review_status: 'reviewed',
    critic_review_status: 'reviewed',
    created_at: new Date(Date.now() - 432000000), // 5 days ago
    updated_at: new Date(Date.now() - 259200000), // 3 days ago
    content: `<h1>Methodology</h1>
<h2>Research Design</h2>
<p>This study employs a mixed-methods approach combining quantitative analysis of user metrics with qualitative feedback from student and advisor participants.</p>
<h2>Data Collection</h2>
<p>Data was collected over a 12-week period with 50 graduate students using the proposed thesis AI platform compared to a control group using traditional writing tools.</p>`
  }
];

// Mock advisor-student relationships
const mockAdvisorStudentRelationships = [
  {
    id: 'rel-1-mock',
    advisor_id: 'advisor-1-mock',
    student_id: 'student-1-mock',
    status: 'active',
    assigned_date: new Date(Date.now() - 2592000000), // 30 days ago
  },
  {
    id: 'rel-2-mock',
    advisor_id: 'advisor-1-mock',
    student_id: 'student-2-mock',
    status: 'active',
    assigned_date: new Date(Date.now() - 2073600000), // 24 days ago
  },
  {
    id: 'rel-3-mock',
    advisor_id: 'advisor-2-mock',
    student_id: 'student-3-mock',
    status: 'active',
    assigned_date: new Date(Date.now() - 1814400000), // 21 days ago
  }
];

// Mock critic-student relationships
const mockCriticStudentRelationships = [
  {
    id: 'crel-1-mock',
    critic_id: 'critic-1-mock',
    student_id: 'student-1-mock',
    status: 'active',
    assigned_date: new Date(Date.now() - 2592000000), // 30 days ago
  },
  {
    id: 'crel-2-mock',
    critic_id: 'critic-1-mock',
    student_id: 'student-3-mock',
    status: 'active',
    assigned_date: new Date(Date.now() - 1814400000), // 21 days ago
  },
  {
    id: 'crel-3-mock',
    critic_id: 'critic-2-mock',
    student_id: 'student-2-mock',
    status: 'active',
    assigned_date: new Date(Date.now() - 2073600000), // 24 days ago
  }
];

// Mock feedback data
const mockFeedback = [
  {
    id: 'feedback-1-mock',
    document_id: 'doc-1-mock',
    reviewer_type: 'advisor', // 'advisor' or 'critic'
    reviewer_id: 'advisor-1-mock',
    student_id: 'student-1-mock',
    feedback_text: 'Good introduction but needs more recent references. Consider adding studies from 2023-2024.',
    status: 'submitted',
    created_at: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: 'feedback-2-mock',
    document_id: 'doc-1-mock',
    reviewer_type: 'critic',
    reviewer_id: 'critic-1-mock',
    student_id: 'student-1-mock',
    feedback_text: 'Well-structured introduction. The problem statement is clear and research objectives are well-defined.',
    status: 'pending',
    created_at: new Date(Date.now() - 43200000), // 12 hours ago
  }
];

// Function to create interconnected mock data
export function getMockRelationshipData() {
  return {
    users: mockUsers,
    documents: mockDocuments,
    advisorStudentRelationships: mockAdvisorStudentRelationships,
    criticStudentRelationships: mockCriticStudentRelationships,
    feedback: mockFeedback,
  };
}

// Function to get student data by advisor ID
export function getStudentsForAdvisor(advisorId: string) {
  const relationship = mockAdvisorStudentRelationships.filter(rel => rel.advisor_id === advisorId);
  const studentIds = relationship.map(rel => rel.student_id);
  return mockUsers.students.filter(student => studentIds.includes(student.id));
}

// Function to get student data by critic ID
export function getStudentsForCritic(criticId: string) {
  const relationship = mockCriticStudentRelationships.filter(rel => rel.critic_id === criticId);
  const studentIds = relationship.map(rel => rel.student_id);
  return mockUsers.students.filter(student => studentIds.includes(student.id));
}

// Function to get advisor data for a specific student
export function getAdvisorForStudent(studentId: string) {
  const student = mockUsers.students.find(s => s.id === studentId);
  if (!student || !student.advisor_assigned) return null;
  return mockUsers.advisors.find(a => a.id === student.advisor_assigned);
}

// Function to get critic data for a specific student
export function getCriticForStudent(studentId: string) {
  const student = mockUsers.students.find(s => s.id === studentId);
  if (!student || !student.critic_assigned) return null;
  return mockUsers.critics.find(c => c.id === student.critic_assigned);
}

// Function to get documents for a student
export function getDocumentsForStudent(studentId: string) {
  return mockDocuments.filter(doc => doc.user_id === studentId);
}

// Function to get feedback for a student's document
export function getFeedbackForDocument(documentId: string) {
  return mockFeedback.filter(feedback => feedback.document_id === documentId);
}

// Function to update student progress (simulating real-time updates)
export function updateStudentProgress(studentId: string, newProgress: number) {
  const student = mockUsers.students.find(s => s.id === studentId);
  if (student) {
    student.progress = newProgress;
    // This change would be reflected across all dashboards that fetch student data
    return student;
  }
  return null;
}

// Function to update document status (simulating real-time updates)
export function updateDocumentStatus(documentId: string, newStatus: string) {
  const document = mockDocuments.find(d => d.id === documentId);
  if (document) {
    document.status = newStatus;
    // This change would be reflected in both student and advisor dashboards
    return document;
  }
  return null;
}

// Function to add new feedback
export function addFeedback(feedbackData: any) {
  const newFeedback = {
    id: `feedback-${Date.now()}-mock`,
    ...feedbackData,
    created_at: new Date(),
  };
  mockFeedback.push(newFeedback);
  return newFeedback;
}

// Function to update review status
export function updateReviewStatus(documentId: string, reviewerType: 'advisor' | 'critic', status: string) {
  const document = mockDocuments.find(d => d.id === documentId);
  if (document) {
    if (reviewerType === 'advisor') {
      document.advisor_review_status = status;
    } else if (reviewerType === 'critic') {
      document.critic_review_status = status;
    }
    return document;
  }
  return null;
}

// Function to establish relationships between demo accounts
// This simulates what happens when demo accounts are created
export function setupDemoAccountRelationships() {
  // The demo accounts from the application are:
  // student@demo.thesisai.local
  // advisor@demo.thesisai.local
  // critic@demo.thesisai.local
  // admin@demo.thesisai.local

  // We'll map these to our mock users by assigning IDs that match the demo login pattern
  const demoStudentId = 'demo-student-1'; // Matches student@demo.thesisai.local
  const demoAdvisorId = 'demo-advisor-1'; // Matches advisor@demo.thesisai.local
  const demoCriticId = 'demo-critic-1'; // Matches critic@demo.thesisai.local

  // Update the mock data to include demo users
  mockUsers.students.push({
    id: demoStudentId,
    email: 'student@demo.thesisai.local',
    first_name: 'Demo',
    last_name: 'Student',
    role: 'user',
    thesis_title: 'The Impact of Technology on Modern Education',
    progress: 45,
    advisor_assigned: demoAdvisorId,
    critic_assigned: demoCriticId,
    documents_count: 7,
    last_active: new Date(),
  });

  mockUsers.advisors.push({
    id: demoAdvisorId,
    email: 'advisor@demo.thesisai.local',
    first_name: 'Demo',
    last_name: 'Advisor',
    role: 'advisor',
    department: 'Computer Science',
    students_assigned: [demoStudentId],
    total_students: 1,
    pending_reviews: 2,
    availability: 'high',
  });

  mockUsers.critics.push({
    id: demoCriticId,
    email: 'critic@demo.thesisai.local',
    first_name: 'Demo',
    last_name: 'Critic',
    role: 'critic',
    institution: 'University of the Philippines',
    students_assigned: [demoStudentId],
    total_students: 1,
    pending_certifications: 1,
    status: 'active',
  });

  // Add a relationship between demo users
  mockAdvisorStudentRelationships.push({
    id: 'demo-rel-1',
    advisor_id: demoAdvisorId,
    student_id: demoStudentId,
    status: 'active',
    assigned_date: new Date(Date.now() - 86400000), // 1 day ago
  });

  mockCriticStudentRelationships.push({
    id: 'demo-crel-1',
    critic_id: demoCriticId,
    student_id: demoStudentId,
    status: 'active',
    assigned_date: new Date(Date.now() - 86400000), // 1 day ago
  });

  // Add some documents for the demo student WITH CONTENT for editor integration
  mockDocuments.push({
    id: 'demo-doc-1',
    user_id: demoStudentId,
    title: 'Chapter 1 - Introduction',
    status: 'submitted',
    advisor_review_status: 'reviewed',
    critic_review_status: 'pending',
    created_at: new Date(Date.now() - 172800000), // 2 days ago
    updated_at: new Date(Date.now() - 86400000),  // 1 day ago
    content: `<h1 id="introduction">Chapter I: Introduction</h1>
<h2>Background</h2>
<p>The rapid advancement of artificial intelligence in recent years has transformed multiple sectors of society, including education. As academic writing becomes increasingly complex, students require sophisticated tools to enhance their writing quality, structure, and coherence.</p>
<h2>Problem Statement</h2>
<p>Despite the availability of writing assistance tools, many graduate students struggle with organizing complex arguments, maintaining academic tone, and ensuring proper citations. This thesis addresses the gap between current AI capabilities and the specific needs of academic writers.</p>
<h2>Research Objectives</h2>
<ul>
<li>To evaluate the impact of AI-assisted writing tools on academic paper quality</li>
<li>To identify key features that improve student thesis writing outcomes</li>
<li>To propose an integrated system for academic writing support</li>
</ul>`
  },
  {
    id: 'demo-doc-2',
    user_id: demoStudentId,
    title: 'Chapter 2 - Literature Review',
    status: 'draft',
    advisor_review_status: 'pending',
    critic_review_status: 'pending',
    created_at: new Date(Date.now() - 86400000),  // 1 day ago
    updated_at: new Date(Date.now() - 43200000),  // 12 hours ago
    content: `<h1 id="literature-review">Chapter II: Literature Review</h1>
<h2>Historical Context of Academic Writing Support</h2>
<p>Academic writing has been a cornerstone of higher education for centuries. Traditional approaches relied heavily on manual review and peer feedback. With the emergence of computational linguistics in the 1980s, automated writing assessment tools began to develop.</p>
<h2>Evolution of AI in Education</h2>
<p>The integration of artificial intelligence in educational settings has grown exponentially since the introduction of large language models. Early implementations focused on grammar and syntax checking. Current systems provide deeper semantic analysis and contextual suggestions.</p>
<h2>Key Findings</h2>
<p>Recent meta-analyses have shown that students using AI-assisted writing tools show a 23-35% improvement in paper organization and clarity. However, concerns about academic integrity and over-reliance on automation persist in the literature.</p>
<h3>Student Performance Metrics</h3>
<ul>
<li>Organization and structure: 28% improvement</li>
<li>Clarity and readability: 31% improvement</li>
<li>Citation accuracy: 18% improvement</li>
<li>Time spent on writing: 35% reduction</li>
</ul>
<h2>Critical Analysis</h2>
<p>While AI shows promise in academic writing support, several limitations exist. These tools often lack domain-specific knowledge and may provide generic suggestions that don't address discipline-specific conventions.</p>`
  });

  // Add some feedback for the demo student
  mockFeedback.push({
    id: 'demo-feedback-1',
    document_id: 'demo-doc-1',
    reviewer_type: 'advisor',
    reviewer_id: demoAdvisorId,
    student_id: demoStudentId,
    feedback_text: 'Good introduction, but needs more recent references. Consider citing sources from 2023-2024.',
    status: 'submitted',
    created_at: new Date(Date.now() - 43200000), // 12 hours ago
  });
}


// Initialize demo relationships if needed
setupDemoAccountRelationships();