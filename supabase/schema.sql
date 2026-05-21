create extension if not exists "pgcrypto";

create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  daily_application_target integer not null default 10,
  weekly_application_target integer not null default 50,
  weekly_par_target integer not null default 7,
  weekly_case_target integer not null default 7,
  weekly_mock_target integer not null default 1,
  weekly_networking_target integer not null default 15,
  preferred_target_roles text[] not null default '{}',
  case_types text[] not null default '{}',
  application_statuses text[] not null default '{}',
  action_item_statuses text[] not null default '{}',
  action_item_priorities text[] not null default '{}',
  recruiting_tracks text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text default '',
  target_category text default '',
  role_fit text default '',
  priority text default '',
  visa_friendliness text default '',
  recruiting_timeline text default '',
  why_this_company text default '',
  relevant_experience text default '',
  best_angle text default '',
  custom_pitch text default '',
  company_research_notes text default '',
  products text default '',
  business_model text default '',
  recent_news text default '',
  risks_or_questions text default '',
  interview_notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  name text not null,
  company_name text default '',
  role text default '',
  source text default '',
  relationship_strength integer default 3,
  how_i_know_them text default '',
  tags text[] not null default '{}',
  email text default '',
  linkedin_url text default '',
  location text default '',
  last_contact_date date,
  next_follow_up_date date,
  conversation_notes text default '',
  can_refer text default 'Maybe',
  referral_status text default 'Not Asked',
  priority text default 'Medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target_role text default '',
  file_link text default '',
  last_updated_date date,
  positioning text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  resume_version_id uuid references resumes(id) on delete set null,
  referral_person_contact_id uuid references contacts(id) on delete set null,
  company_name text default '',
  role_title text not null,
  function text default '',
  recruiting_track text default 'MBA Full-Time',
  location text default '',
  posting_link text default '',
  status text default 'Target',
  priority text default 'Medium',
  deadline date,
  date_applied date,
  referral_needed boolean not null default false,
  referral_email text default '',
  referral_status text default 'Not Asked',
  referral_date date,
  referral_notes text default '',
  recruiter_email text default '',
  hiring_manager_email text default '',
  vp_or_director_email text default '',
  cold_email_sent boolean not null default false,
  follow_up_date date,
  next_step text default '',
  notes text default '',
  timing_fit text default 'Unknown',
  start_date_compatibility text default 'Unknown',
  mba_mentioned text default 'Unknown',
  degree_requirement text default 'Unknown',
  application_source text default 'Other',
  conversion_opportunity text default 'None',
  rejection_reason text default '',
  rejection_follow_up_opportunity boolean not null default false,
  rejection_follow_up_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists par_stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text default '',
  target_roles text[] not null default '{}',
  situation text default '',
  problem text default '',
  action text default '',
  result text default '',
  polished_answer text default '',
  short_version_60_sec text default '',
  long_version_2_min text default '',
  confidence_score integer not null default 3,
  last_practiced_date date,
  number_of_reps integer not null default 0,
  status text default 'Draft',
  weakness_or_focus_area text default '',
  notes text default '',
  follow_up_questions text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists interview_questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  category text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists par_question_links (
  par_story_id uuid not null references par_stories(id) on delete cascade,
  interview_question_id uuid not null references interview_questions(id) on delete cascade,
  primary key (par_story_id, interview_question_id)
);

create table if not exists par_practice_logs (
  id uuid primary key default gen_random_uuid(),
  par_story_id uuid not null references par_stories(id) on delete cascade,
  date date not null,
  prompt_used text default '',
  version_practiced text default 'Full',
  delivery_score integer not null default 3,
  structure_score integer not null default 3,
  confidence_score integer not null default 3,
  notes text default '',
  next_fix text default '',
  created_at timestamptz not null default now()
);

create table if not exists interview_answers (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer_type text default 'General',
  target_role text default '',
  polished_answer text default '',
  short_version text default '',
  long_version text default '',
  key_points text default '',
  confidence_score integer not null default 3,
  last_practiced_date date,
  status text default 'Draft',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  case_type text default '',
  source text default '',
  practiced_with text default '',
  date date,
  difficulty text default 'Medium',
  framework_used text default '',
  score integer not null default 3,
  notes text default '',
  weakness_area text default '',
  redo_needed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mock_interviews (
  id uuid primary key default gen_random_uuid(),
  date date,
  mocked_with text default '',
  interview_type text default 'Behavioral',
  target_company_id uuid references companies(id) on delete set null,
  target_role text default '',
  questions_asked text default '',
  case_given text default '',
  overall_score integer not null default 3,
  strengths text default '',
  weaknesses text default '',
  feedback_notes text default '',
  follow_up_needed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists interview_prep (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  application_id uuid references applications(id) on delete set null,
  interview_date timestamptz,
  interview_round text default '',
  interview_type text default '',
  interviewer_name text default '',
  interviewer_linkedin text default '',
  prep_status text default 'Not Started',
  readiness_score integer not null default 0,
  company_notes text default '',
  likely_questions text default '',
  questions_to_ask_interviewer text default '',
  thank_you_note_draft text default '',
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists outreach_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  use_case text default '',
  template_text text default '',
  target_audience text default '',
  last_used_date date,
  notes text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists brain_dumps (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  note text default '',
  category text default 'General',
  converted_action_item_id uuid,
  linked_contact_id uuid references contacts(id) on delete set null,
  linked_company_id uuid references companies(id) on delete set null,
  linked_application_id uuid references applications(id) on delete set null,
  linked_par_id uuid references par_stories(id) on delete set null,
  linked_case_id uuid references cases(id) on delete set null,
  linked_mock_interview_id uuid references mock_interviews(id) on delete set null,
  linked_resume_id uuid references resumes(id) on delete set null,
  linked_interview_prep_id uuid references interview_prep(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists action_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  status text not null default 'Open',
  priority text not null default 'Medium',
  due_date date,
  completed_at timestamptz,
  source_type text default 'General',
  source_id text default '',
  linked_contact_id uuid references contacts(id) on delete set null,
  linked_company_id uuid references companies(id) on delete set null,
  linked_application_id uuid references applications(id) on delete set null,
  linked_par_id uuid references par_stories(id) on delete set null,
  linked_case_id uuid references cases(id) on delete set null,
  linked_mock_interview_id uuid references mock_interviews(id) on delete set null,
  linked_resume_id uuid references resumes(id) on delete set null,
  linked_interview_prep_id uuid references interview_prep(id) on delete set null,
  linked_interview_answer_id uuid references interview_answers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
