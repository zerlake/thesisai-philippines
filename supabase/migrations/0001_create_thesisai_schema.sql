-- Phase 4.1: Database Schema Creation, RLS Policies, Performance Indexing

-- 1. Core User Management Tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT,
  full_name TEXT GENERATED ALWAYS AS (COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) STORED,
  phone TEXT,
  role TEXT DEFAULT 'user',
  university_id UUID REFERENCES institutions(id),
  college TEXT,
  department TEXT,
  academic_level TEXT CHECK (academic_level IN ('undergraduate', 'master', 'doctoral', 'faculty')),
  graduation_year INTEGER,
  bio TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Manila',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Institution management
CREATE TABLE IF NOT EXISTS institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('university', 'college', 'institute', 'school')),
  accreditation_status TEXT CHECK (accreditation_status IN ('accredited', 'provisional', 'candidate', 'non-accredited')),
  location TEXT,
  city TEXT,
  region TEXT,
  country TEXT DEFAULT 'Philippines',
  logo_url TEXT,
  website TEXT,
  established_year INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Department management
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institutions(id) NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  college_name TEXT,
  head_instructor TEXT,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advisor management
CREATE TABLE IF NOT EXISTS advisors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  department_id UUID REFERENCES departments(id),
  specialization_area TEXT,
  expertise TEXT[],
  years_experience INTEGER,
  max_students INTEGER DEFAULT 10,
  is_available BOOLEAN DEFAULT TRUE,
  rating NUMERIC(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- Manuscript critic management
CREATE TABLE IF NOT EXISTS critics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  department_id UUID REFERENCES departments(id),
  certification_level TEXT CHECK (certification_level IN ('certified', 'senior', 'expert', 'emeritus')),
  specialization_areas TEXT[],
  years_experience INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  rating NUMERIC(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id)
);

-- 2. Thesis Management Tables
CREATE TABLE IF NOT EXISTS thesis_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  advisor_id UUID REFERENCES advisors(id),
  title TEXT NOT NULL,
  subtitle TEXT,
  abstract TEXT,
  keywords TEXT[],
  language TEXT DEFAULT 'en',
  status TEXT CHECK (status IN ('initiated', 'draft', 'in_review', 'revisions', 'approved', 'submitted', 'published', 'archived')) DEFAULT 'initiated',
  academic_year TEXT,
  semester TEXT CHECK (semester IN ('1st', '2nd', 'summer')),
  defense_date DATE,
  defense_result TEXT CHECK (defense_result IN ('passed', 'passed_with_revisions', 'failed', 'postponed')),
  grade NUMERIC(4,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  defense_scheduled_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS thesis_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES thesis_projects(id) NOT NULL,
  phase_name TEXT NOT NULL,
  phase_order INTEGER NOT NULL,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'review_needed')) DEFAULT 'not_started',
  start_date DATE,
  deadline DATE,
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS thesis_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES thesis_projects(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  type TEXT CHECK (type IN ('proposal', 'chapter', 'full_document', 'appendix', 'presentation', 'review_form', 'approval_form')) NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT,
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  version_number INTEGER DEFAULT 1,
  status TEXT CHECK (status IN ('draft', 'review_requested', 'in_review', 'review_completed', 'approved', 'revisions_needed', 'published')) DEFAULT 'draft',
  review_status TEXT CHECK (review_status IN ('needs_review', 'under_review', 'completed', 'revisions_needed')),
  locked_by UUID REFERENCES profiles(id),
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Collaboration and Feedback Tables
CREATE TABLE IF NOT EXISTS advisor_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES thesis_documents(id) NOT NULL,
  reviewer_id UUID REFERENCES advisors(id) NOT NULL,
  student_id UUID REFERENCES profiles(id) NOT NULL,
  comment TEXT NOT NULL,
  feedback_type TEXT CHECK (feedback_type IN ('structural', 'content', 'style', 'formatting', 'research', 'methodology', 'conclusion', 'other')),
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'major', 'critical')) DEFAULT 'moderate',
  suggested_revisions TEXT[],
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS critic_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES thesis_projects(id) NOT NULL,
  critic_id UUID REFERENCES critics(id) NOT NULL,
  document_id UUID REFERENCES thesis_documents(id),
  review_type TEXT CHECK (review_type IN ('comprehensive', 'formatting', 'content', 'methodology', 'defense_prep')) NOT NULL,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 10),
  detailed_comments TEXT,
  concerns TEXT[],
  recommendations TEXT[],
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected', 'needs_revisions')),
  review_file_path TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collaboration_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES thesis_projects(id) NOT NULL,
  inviter_id UUID REFERENCES profiles(id) NOT NULL,
  invitee_email TEXT NOT NULL,
  role TEXT CHECK (role IN ('advisor', 'co_author', 'reviewer', 'editor')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Academic Content Tables
CREATE TABLE IF NOT EXISTS thesis_chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES thesis_projects(id) NOT NULL,
  document_id UUID REFERENCES thesis_documents(id),
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  chapter_type TEXT CHECK (chapter_type IN ('abstract', 'intro', 'lit_review', 'methodology', 'results', 'discussion', 'conclusion', 'references', 'appendices', 'acknowledgments')),
  content TEXT,
  word_count INTEGER DEFAULT 0,
  character_count INTEGER DEFAULT 0,
  pages_expected INTEGER,
  pages_actual INTEGER,
  status TEXT CHECK (status IN ('draft', 'in_review', 'reviewed', 'completed')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_gaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES thesis_projects(id) NOT NULL,
  identified_by UUID REFERENCES profiles(id) NOT NULL,
  gap_category TEXT CHECK (gap_category IN ('methodology', 'theory', 'empirical', 'application', 'policy', 'other')),
  description TEXT NOT NULL,
  significance TEXT,
  potential_solution TEXT,
  literature_reviewed BOOLEAN DEFAULT FALSE,
  addressed BOOLEAN DEFAULT FALSE,
  addressed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES thesis_projects(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  source_title TEXT NOT NULL,
  authors TEXT[],
  publication_year INTEGER,
  journal TEXT,
  volume TEXT,
  issue TEXT,
  pages TEXT,
  doi TEXT,
  url TEXT,
  citation_type TEXT CHECK (citation_type IN ('journal', 'book', 'conference', 'thesis', 'report', 'website', 'other')),
  citation_style TEXT CHECK (citation_style IN ('apa', 'mla', 'chicago', 'harvard', 'ieee', 'ama', 'other')),
  citation_text TEXT NOT NULL,
  is_original_source BOOLEAN DEFAULT FALSE,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5) DEFAULT 3,
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 5) DEFAULT 3,
  used_in_chapters TEXT[],
  is_validated BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. AI-Enhanced Features Tables
CREATE TABLE IF NOT EXISTS ai_tool_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  tool_name TEXT NOT NULL,
  action_type TEXT CHECK (action_type IN ('create', 'modify', 'analyze', 'suggest', 'generate', 'summarize', 'translate', 'other')),
  input_data JSONB,
  output_data JSONB,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  cost_credits DECIMAL(10,2) DEFAULT 0.00,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_generated_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  project_id UUID REFERENCES thesis_projects(id),
  document_id UUID REFERENCES thesis_documents(id),
  generation_type TEXT CHECK (generation_type IN ('outline', 'draft', 'revision', 'summary', 'analysis', 'synthesis', 'recommendation', 'other')) NOT NULL,
  prompt TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  acceptance_status TEXT CHECK (acceptance_status IN ('pending', 'accepted', 'rejected', 'modified')),
  similarity_score NUMERIC(5,4),
  human_edited BOOLEAN DEFAULT FALSE,
  edit_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topic_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  project_id UUID REFERENCES thesis_projects(id),
  topic TEXT NOT NULL,
  description TEXT,
  field_of_study TEXT,
  research_questions TEXT[],
  potential_approaches TEXT[],
  feasibility_score INTEGER CHECK (feasibility_score >= 1 AND feasibility_score <= 10) DEFAULT 5,
  novelty_score INTEGER CHECK (novelty_score >= 1 AND novelty_score <= 10) DEFAULT 5,
  potential_impact TEXT,
  status TEXT CHECK (status IN ('generated', 'refined', 'saved', 'abandoned')) DEFAULT 'generated',
  saved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Quality Assurance Tables
CREATE TABLE IF NOT EXISTS originality_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES thesis_documents(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT CHECK (status IN ('queued', 'processing', 'completed', 'failed')) DEFAULT 'queued',
  overall_similarity NUMERIC(5,2),
  sources JSONB,
  detailed_report JSONB,
  plagiarism_detected BOOLEAN DEFAULT FALSE,
  flagged_sections JSONB,
  completion_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS formatting_guidelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institutions(id),
  guideline_name TEXT NOT NULL,
  citation_style TEXT CHECK (citation_style IN ('apa', 'mla', 'chicago', 'harvard', 'ieee', 'ama', 'other')),
  version TEXT,
  description TEXT,
  guidelines JSONB,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Notification and Communication Tables
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error', 'urgent')) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  action_required BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  recipient_id UUID REFERENCES profiles(id) NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  thread_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  message_type TEXT CHECK (message_type IN ('direct', 'broadcast', 'reply', 'system')) DEFAULT 'direct',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Performance and Analytics Tables
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  unit TEXT,
  context JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Academic Milestones and Tracking Tables
CREATE TABLE IF NOT EXISTS thesis_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES thesis_projects(id) NOT NULL,
  phase_name TEXT NOT NULL,
  checklist_item TEXT NOT NULL,
  item_order INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES thesis_projects(id) NOT NULL,
  milestone_name TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  actual_completion_date DATE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'overdue', 'cancelled')) DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0,
  dependencies UUID[], -- Array of dependent milestone IDs
  notes TEXT,
  completed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Subscription and Billing Tables
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_per_month DECIMAL(10,2),
  price_per_year DECIMAL(10,2),
  features JSONB,
  max_projects INTEGER,
  max_storage_gb INTEGER,
  max_ai_credits INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  plan_id UUID REFERENCES plans(id) NOT NULL,
  status TEXT CHECK (status IN ('trial', 'active', 'canceled', 'past_due', 'unpaid', 'paused', 'deleted')) DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  ai_credits_used INTEGER DEFAULT 0,
  ai_credits_remaining INTEGER DEFAULT 0,
  documents_created INTEGER DEFAULT 0,
  originality_checks_used INTEGER DEFAULT 0,
  reviews_requested INTEGER DEFAULT 0,
  storage_used_mb INTEGER DEFAULT 0,
  max_storage_mb INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Research Collaboration Tables
CREATE TABLE IF NOT EXISTS research_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES profiles(id) NOT NULL,
  institution_id UUID REFERENCES institutions(id),
  department_id UUID REFERENCES departments(id),
  group_type TEXT CHECK (group_type IN ('thesis', 'research', 'study', 'collaboration', 'other')),
  max_members INTEGER DEFAULT 10,
  is_public BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended', 'archived')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES research_groups(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  role TEXT CHECK (role IN ('leader', 'co_leader', 'member', 'guest')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_by UUID REFERENCES profiles(id),
  status TEXT CHECK (status IN ('active', 'invited', 'removed', 'left')) DEFAULT 'active',
  permissions JSONB, -- Specific permissions for this member
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES research_groups(id) NOT NULL,
  document_id UUID REFERENCES thesis_documents(id) NOT NULL,
  access_level TEXT CHECK (access_level IN ('read', 'write', 'admin', 'owner')),
  shared_by UUID REFERENCES profiles(id) NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Research Tools and Utilities Tables
CREATE TABLE IF NOT EXISTS literature_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  collection_type TEXT CHECK (collection_type IN ('course_reading', 'thesis_sources', 'research_pool', 'favorites', 'other')),
  paper_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS literature_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES literature_collections(id) NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[],
  journal TEXT,
  publication_year INTEGER,
  doi TEXT,
  url TEXT,
  abstract TEXT,
  keywords TEXT[],
  file_path TEXT,
  tags TEXT[],
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  read_status TEXT CHECK (read_status IN ('unread', 'in_progress', 'read', 'important', 'discarded')) DEFAULT 'unread',
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS peer_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  reviewee_id UUID REFERENCES profiles(id) NOT NULL,
  document_id UUID REFERENCES thesis_documents(id) NOT NULL,
  project_id UUID REFERENCES thesis_projects(id) NOT NULL,
  review_type TEXT CHECK (review_type IN ('peer_review', 'study_group', 'collaboration', 'other')),
  content_quality INTEGER CHECK (content_quality >= 1 AND content_quality <= 5),
  writing_quality INTEGER CHECK (writing_quality >= 1 AND writing_quality <= 5),
  methodology INTEGER CHECK (methodology >= 1 AND methodology <= 5),
  relevance INTEGER CHECK (relevance >= 1 AND relevance <= 5),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  comments TEXT,
  suggestions TEXT[],
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Learning and Improvement Tables
CREATE TABLE IF NOT EXISTS learning_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  module_type TEXT CHECK (module_type IN ('writing', 'research', 'formatting', 'defense', 'ethics', 'ai_tools', 'other')),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes INTEGER,
  content JSONB,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  module_id UUID REFERENCES learning_modules(id) NOT NULL,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed', 'passed', 'failed')) DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0,
  score NUMERIC(5,2),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- 14. System Configuration Tables
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  description TEXT,
  rollout_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Audit and Moderation Tables
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES profiles(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moderation_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) NOT NULL,
  reported_entity_type TEXT NOT NULL,
  reported_entity_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
  resolution_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE critics ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE critic_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE originality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE formatting_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE literature_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE literature_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
-- Profiles table indexes
CREATE INDEX CONCURRENTLY profiles_email_idx ON profiles USING btree(email);
CREATE INDEX CONCURRENTLY profiles_university_idx ON profiles USING btree(university_id);
CREATE INDEX CONCURRENTLY profiles_role_idx ON profiles USING btree(role);

-- Institutions table indexes
CREATE INDEX CONCURRENTLY institutions_slug_idx ON institutions USING btree(slug);
CREATE INDEX CONCURRENTLY institutions_type_idx ON institutions USING btree(type);
CREATE INDEX CONCURRENTLY institutions_location_idx ON institutions USING btree(location);

-- Thesis projects table indexes
CREATE INDEX CONCURRENTLY thesis_projects_user_id_idx ON thesis_projects USING btree(user_id);
CREATE INDEX CONCURRENTLY thesis_projects_advisor_id_idx ON thesis_projects USING btree(advisor_id);
CREATE INDEX CONCURRENTLY thesis_projects_status_idx ON thesis_projects USING btree(status);
CREATE INDEX CONCURRENTLY thesis_projects_academic_year_idx ON thesis_projects USING btree(academic_year);

-- Thesis documents table indexes
CREATE INDEX CONCURRENTLY thesis_documents_project_id_idx ON thesis_documents USING btree(project_id);
CREATE INDEX CONCURRENTLY thesis_documents_user_id_idx ON thesis_documents USING btree(user_id);
CREATE INDEX CONCURRENTLY thesis_documents_type_idx ON thesis_documents USING btree(type);
CREATE INDEX CONCURRENTLY thesis_documents_status_idx ON thesis_documents USING btree(status);
CREATE INDEX CONCURRENTLY thesis_documents_locked_by_idx ON thesis_documents USING btree(locked_by);

-- Advisor feedback table indexes
CREATE INDEX CONCURRENTLY advisor_feedback_document_id_idx ON advisor_feedback USING btree(document_id);
CREATE INDEX CONCURRENTLY advisor_feedback_reviewer_id_idx ON advisor_feedback USING btree(reviewer_id);
CREATE INDEX CONCURRENTLY advisor_feedback_student_id_idx ON advisor_feedback USING btree(student_id);
CREATE INDEX CONCURRENTLY advisor_feedback_resolved_idx ON advisor_feedback USING btree(resolved);

-- Activity logs table indexes
CREATE INDEX CONCURRENTLY activity_logs_user_id_idx ON activity_logs USING btree(user_id);
CREATE INDEX CONCURRENTLY activity_logs_entity_type_id_idx ON activity_logs USING btree(entity_type, entity_id);
CREATE INDEX CONCURRENTLY activity_logs_created_at_idx ON activity_logs USING btree(created_at DESC);

-- Notifications table indexes
CREATE INDEX CONCURRENTLY notifications_user_id_idx ON notifications USING btree(user_id);
CREATE INDEX CONCURRENTLY notifications_is_read_idx ON notifications USING btree(is_read);
CREATE INDEX CONCURRENTLY notifications_created_at_idx ON notifications USING btree(created_at DESC);

-- Messages table indexes
CREATE INDEX CONCURRENTLY messages_sender_id_idx ON messages USING btree(sender_id);
CREATE INDEX CONCURRENTLY messages_recipient_id_idx ON messages USING btree(recipient_id);
CREATE INDEX CONCURRENTLY messages_thread_id_idx ON messages USING btree(thread_id);
CREATE INDEX CONCURRENTLY messages_is_read_idx ON messages USING btree(is_read);

-- AI tool usage table indexes
CREATE INDEX CONCURRENTLY ai_tool_usage_user_id_idx ON ai_tool_usage USING btree(user_id);
CREATE INDEX CONCURRENTLY ai_tool_usage_tool_name_idx ON ai_tool_usage USING btree(tool_name);
CREATE INDEX CONCURRENTLY ai_tool_usage_created_at_idx ON ai_tool_usage USING btree(created_at DESC);

-- Originality checks table indexes
CREATE INDEX CONCURRENTLY originality_checks_document_id_idx ON originality_checks USING btree(document_id);
CREATE INDEX CONCURRENTLY originality_checks_user_id_idx ON originality_checks USING btree(user_id);
CREATE INDEX CONCURRENTLY originality_checks_status_idx ON originality_checks USING btree(status);