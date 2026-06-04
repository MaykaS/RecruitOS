create table if not exists settings (
  id text primary key,
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
  id text primary key,
  name text not null,
  industry text not null default '',
  target_category text not null default '',
  role_fit text not null default '',
  priority text not null default '',
  visa_friendliness text not null default '',
  recruiting_timeline text not null default '',
  why_this_company text not null default '',
  relevant_experience text not null default '',
  best_angle text not null default '',
  custom_pitch text not null default '',
  company_research_notes text not null default '',
  products text not null default '',
  business_model text not null default '',
  recent_news text not null default '',
  risks_or_questions text not null default '',
  interview_notes text not null default '',
  linked_contact_ids text[] not null default '{}',
  linked_application_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contacts (
  id text primary key,
  company_id text references companies(id) on delete set null,
  name text not null,
  company_name text not null default '',
  role text not null default '',
  source text not null default '',
  relationship_strength integer not null default 3,
  how_i_know_them text not null default '',
  tags text[] not null default '{}',
  email text not null default '',
  linkedin_url text not null default '',
  location text not null default '',
  last_contact_date date,
  next_follow_up_date date,
  conversation_notes text not null default '',
  linked_application_ids text[] not null default '{}',
  can_refer text not null default 'Maybe',
  referral_status text not null default 'Not Asked',
  priority text not null default 'Medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists resumes (
  id text primary key,
  name text not null,
  target_role text not null default '',
  file_link text not null default '',
  last_updated_date date,
  positioning text not null default '',
  notes text not null default '',
  linked_application_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists applications (
  id text primary key,
  company_id text references companies(id) on delete set null,
  resume_version_id text references resumes(id) on delete set null,
  referral_person_contact_id text references contacts(id) on delete set null,
  company_name text not null default '',
  role_title text not null,
  function text not null default '',
  recruiting_track text not null default 'MBA Full-Time',
  location text not null default '',
  posting_link text not null default '',
  status text not null default 'Target',
  priority text not null default 'Medium',
  deadline date,
  date_applied date,
  referral_needed boolean not null default false,
  referral_email text not null default '',
  referral_status text not null default 'Not Asked',
  referral_date date,
  referral_notes text not null default '',
  recruiter_name text not null default '',
  recruiter_email text not null default '',
  hiring_manager_name text not null default '',
  hiring_manager_email text not null default '',
  vp_or_director_name text not null default '',
  vp_or_director_email text not null default '',
  cold_email_sent boolean not null default false,
  follow_up_date date,
  next_step text not null default '',
  notes text not null default '',
  linked_contact_ids text[] not null default '{}',
  linked_action_item_ids text[] not null default '{}',
  timing_fit text not null default 'Unknown',
  start_date_compatibility text not null default 'Unknown',
  mba_mentioned text not null default 'Unknown',
  degree_requirement text not null default 'Unknown',
  application_source text not null default 'Other',
  conversion_opportunity text not null default 'None',
  rejection_reason text not null default '',
  rejection_follow_up_opportunity boolean not null default false,
  rejection_follow_up_sent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists applications add column if not exists recruiter_name text not null default '';
alter table if exists applications add column if not exists hiring_manager_name text not null default '';
alter table if exists applications add column if not exists vp_or_director_name text not null default '';

create table if not exists par_stories (
  id text primary key,
  title text not null,
  category text not null default '',
  target_roles text[] not null default '{}',
  situation text not null default '',
  problem text not null default '',
  action text not null default '',
  result text not null default '',
  polished_answer text not null default '',
  short_version_60_sec text not null default '',
  long_version_2_min text not null default '',
  confidence_score integer not null default 3,
  last_practiced_date date,
  number_of_reps integer not null default 0,
  status text not null default 'Draft',
  weakness_or_focus_area text not null default '',
  notes text not null default '',
  follow_up_questions text not null default '',
  linked_question_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists interview_questions (
  id text primary key,
  question_text text not null,
  category text not null default '',
  notes text not null default '',
  linked_par_story_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists par_question_links (
  par_story_id text not null references par_stories(id) on delete cascade,
  interview_question_id text not null references interview_questions(id) on delete cascade,
  primary key (par_story_id, interview_question_id)
);

create table if not exists par_practice_logs (
  id text primary key,
  par_story_id text not null references par_stories(id) on delete cascade,
  date date not null,
  prompt_used text not null default '',
  version_practiced text not null default 'Full',
  delivery_score integer not null default 3,
  structure_score integer not null default 3,
  confidence_score integer not null default 3,
  notes text not null default '',
  next_fix text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists interview_answers (
  id text primary key,
  question text not null,
  answer_type text not null default 'General',
  target_role text not null default '',
  polished_answer text not null default '',
  short_version text not null default '',
  long_version text not null default '',
  key_points text not null default '',
  confidence_score integer not null default 3,
  last_practiced_date date,
  status text not null default 'Draft',
  notes text not null default '',
  linked_par_story_ids text[] not null default '{}',
  linked_application_ids text[] not null default '{}',
  linked_interview_prep_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cases (
  id text primary key,
  title text not null,
  case_type text not null default '',
  source text not null default '',
  practiced_with text not null default '',
  date date,
  difficulty text not null default 'Medium',
  framework_used text not null default '',
  score integer not null default 3,
  notes text not null default '',
  weakness_area text not null default '',
  redo_needed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists mock_interviews (
  id text primary key,
  date date,
  mocked_with text not null default '',
  interview_type text not null default 'Behavioral',
  target_company_id text references companies(id) on delete set null,
  target_role text not null default '',
  questions_asked text not null default '',
  case_given text not null default '',
  linked_par_story_ids text[] not null default '{}',
  linked_case_ids text[] not null default '{}',
  overall_score integer not null default 3,
  strengths text not null default '',
  weaknesses text not null default '',
  feedback_notes text not null default '',
  linked_action_item_ids text[] not null default '{}',
  follow_up_needed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists interview_prep (
  id text primary key,
  company_id text references companies(id) on delete set null,
  application_id text references applications(id) on delete set null,
  interview_date timestamptz,
  interview_round text not null default '',
  interview_type text not null default '',
  interviewer_name text not null default '',
  interviewer_linkedin text not null default '',
  prep_status text not null default 'Not Started',
  readiness_score integer not null default 0,
  linked_contact_ids text[] not null default '{}',
  linked_par_story_ids text[] not null default '{}',
  linked_interview_answer_ids text[] not null default '{}',
  linked_case_ids text[] not null default '{}',
  company_notes text not null default '',
  likely_questions text not null default '',
  questions_to_ask_interviewer text not null default '',
  thank_you_note_draft text not null default '',
  notes text not null default '',
  linked_action_item_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists outreach_templates (
  id text primary key,
  name text not null,
  use_case text not null default '',
  template_text text not null default '',
  target_audience text not null default '',
  last_used_date date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists brain_dumps (
  id text primary key,
  title text not null,
  note text not null default '',
  category text not null default 'General',
  converted_action_item_id text,
  linked_contact_id text references contacts(id) on delete set null,
  linked_company_id text references companies(id) on delete set null,
  linked_application_id text references applications(id) on delete set null,
  linked_par_id text references par_stories(id) on delete set null,
  linked_case_id text references cases(id) on delete set null,
  linked_mock_interview_id text references mock_interviews(id) on delete set null,
  linked_resume_id text references resumes(id) on delete set null,
  linked_interview_prep_id text references interview_prep(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists action_items (
  id text primary key,
  title text not null,
  description text not null default '',
  status text not null default 'Open',
  priority text not null default 'Medium',
  due_date date,
  completed_at timestamptz,
  source_type text not null default 'General',
  source_id text not null default '',
  linked_contact_id text references contacts(id) on delete set null,
  linked_company_id text references companies(id) on delete set null,
  linked_application_id text references applications(id) on delete set null,
  linked_par_id text references par_stories(id) on delete set null,
  linked_case_id text references cases(id) on delete set null,
  linked_mock_interview_id text references mock_interviews(id) on delete set null,
  linked_resume_id text references resumes(id) on delete set null,
  linked_interview_prep_id text references interview_prep(id) on delete set null,
  linked_interview_answer_id text references interview_answers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contacts_company_id on contacts(company_id);
create index if not exists idx_applications_company_id on applications(company_id);
create index if not exists idx_action_items_due_date on action_items(due_date);
create index if not exists idx_action_items_status on action_items(status);

insert into storage.buckets (id, name, public)
select 'resume-files', 'resume-files', true
where not exists (
  select 1
  from storage.buckets
  where id = 'resume-files'
);

update storage.buckets
set public = true
where id = 'resume-files';

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can view resume files'
  ) then
    create policy "Public can view resume files"
      on storage.objects
      for select
      to public
      using (bucket_id = 'resume-files');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can upload resume files'
  ) then
    create policy "Public can upload resume files"
      on storage.objects
      for insert
      to public
      with check (bucket_id = 'resume-files');
  end if;
end $$;
