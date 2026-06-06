export type ModuleSlug =
  | "dashboard"
  | "pars"
  | "interview-answers"
  | "cases"
  | "networking"
  | "applications"
  | "companies"
  | "interview-prep"
  | "mock-interviews"
  | "action-items"
  | "resumes"
  | "outreach-templates"
  | "settings"
  | "brain-dump";

export type CrudModuleSlug = Exclude<ModuleSlug, "dashboard" | "settings">;

export type Primitive = string | number | boolean | null | undefined;

export interface Option {
  label: string;
  value: string;
}

export interface FieldConfig {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "date"
    | "datetime-local"
    | "number"
    | "select"
    | "multiselect"
    | "checkbox";
  placeholder?: string;
  options?: string[] | ((data: RecruitOSData) => Option[]);
  min?: number;
  max?: number;
}

export interface ColumnConfig {
  key: string;
  label: string;
}

export type SortDirection = "asc" | "desc";

export interface SortOption {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "boolean" | "array";
  order?: string[];
}

export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ActionItem extends BaseRecord {
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  completed_at: string;
  source_type: string;
  source_id: string;
  linked_contact_id: string;
  linked_company_id: string;
  linked_application_id: string;
  linked_par_id: string;
  linked_case_id: string;
  linked_mock_interview_id: string;
  linked_resume_id: string;
  linked_interview_prep_id: string;
  linked_interview_answer_id: string;
}

export interface PARStory extends BaseRecord {
  title: string;
  category: string;
  situation: string;
  problem: string;
  action: string;
  result: string;
  polished_answer: string;
  short_version_60_sec: string;
  long_version_2_min: string;
  confidence_score: number;
  last_practiced_date: string;
  number_of_reps: number;
  status: string;
  weakness_or_focus_area: string;
  notes: string;
  follow_up_questions: string;
  linked_question_ids: string[];
}

export interface InterviewQuestion extends BaseRecord {
  question_text: string;
  linked_par_story_ids: string[];
}

export interface PARPracticeLog extends BaseRecord {
  par_story_id: string;
  date: string;
  prompt_used: string;
  version_practiced: string;
  delivery_score: number;
  structure_score: number;
  confidence_score: number;
  notes: string;
  next_fix: string;
}

export interface InterviewAnswer extends BaseRecord {
  question: string;
  answer_type: string;
  target_role: string;
  polished_answer: string;
  short_version: string;
  long_version: string;
  key_points: string;
  confidence_score: number;
  last_practiced_date: string;
  status: string;
  notes: string;
  linked_par_story_ids: string[];
  linked_application_ids: string[];
  linked_interview_prep_ids: string[];
}

export interface CasePractice extends BaseRecord {
  title: string;
  case_type: string;
  source: string;
  practiced_with: string;
  date: string;
  difficulty: string;
  framework_used: string;
  score: number;
  notes: string;
  weakness_area: string;
  redo_needed: boolean;
}

export interface Contact extends BaseRecord {
  name: string;
  company_id: string;
  company_name: string;
  role: string;
  source: string;
  relationship_strength: number;
  how_i_know_them: string;
  tags: string[];
  email: string;
  linkedin_url: string;
  location: string;
  last_contact_date: string;
  next_follow_up_date: string;
  conversation_notes: string;
  linked_application_ids: string[];
  can_refer: string;
  referral_status: string;
  priority: string;
}

export interface Company extends BaseRecord {
  name: string;
  industry: string;
  target_category: string;
  role_fit: string;
  priority: string;
  visa_friendliness: string;
  recruiting_timeline: string;
  why_this_company: string;
  relevant_experience: string;
  best_angle: string;
  custom_pitch: string;
  company_research_notes: string;
  products: string;
  business_model: string;
  recent_news: string;
  risks_or_questions: string;
  interview_notes: string;
  linked_contact_ids: string[];
  linked_application_ids: string[];
}

export interface Application extends BaseRecord {
  company_id: string;
  company_name: string;
  role_title: string;
  function: string;
  recruiting_track: string;
  location: string;
  posting_link: string;
  status: string;
  priority: string;
  deadline: string;
  date_applied: string;
  resume_version_id: string;
  referral_needed: boolean;
  referral_person_contact_id: string;
  referral_email: string;
  referral_status: string;
  referral_date: string;
  referral_notes: string;
  recruiter_name: string;
  recruiter_email: string;
  hiring_manager_name: string;
  hiring_manager_email: string;
  vp_or_director_name: string;
  vp_or_director_email: string;
  cold_email_sent: boolean;
  follow_up_date: string;
  next_step: string;
  notes: string;
  linked_contact_ids: string[];
  linked_action_item_ids: string[];
  timing_fit: string;
  start_date_compatibility: string;
  mba_mentioned: string;
  degree_requirement: string;
  application_source: string;
  conversion_opportunity: string;
  rejection_reason: string;
  rejection_follow_up_opportunity: boolean;
  rejection_follow_up_sent: boolean;
}

export interface InterviewPrep extends BaseRecord {
  company_id: string;
  application_id: string;
  interview_date: string;
  interview_round: string;
  interview_type: string;
  interviewer_name: string;
  interviewer_linkedin: string;
  prep_status: string;
  readiness_score: number;
  linked_contact_ids: string[];
  linked_par_story_ids: string[];
  linked_interview_answer_ids: string[];
  linked_case_ids: string[];
  company_notes: string;
  likely_questions: string;
  questions_to_ask_interviewer: string;
  thank_you_note_draft: string;
  notes: string;
  linked_action_item_ids: string[];
}

export interface MockInterview extends BaseRecord {
  date: string;
  mocked_with: string;
  interview_type: string;
  target_company_id: string;
  target_role: string;
  questions_asked: string;
  case_given: string;
  linked_par_story_ids: string[];
  linked_case_ids: string[];
  overall_score: number;
  strengths: string;
  weaknesses: string;
  feedback_notes: string;
  linked_action_item_ids: string[];
  follow_up_needed: boolean;
}

export interface ResumeVersion extends BaseRecord {
  name: string;
  target_role: string;
  file_link: string;
  last_updated_date: string;
  positioning: string;
  notes: string;
  linked_application_ids: string[];
}

export interface OutreachTemplate extends BaseRecord {
  name: string;
  use_case: string;
  template_text: string;
  target_audience: string;
  last_used_date: string;
  notes: string;
}

export interface BrainDump extends BaseRecord {
  title: string;
  note: string;
  category: string;
  converted_action_item_id: string;
  linked_contact_id: string;
  linked_company_id: string;
  linked_application_id: string;
  linked_par_id: string;
  linked_case_id: string;
  linked_mock_interview_id: string;
  linked_resume_id: string;
  linked_interview_prep_id: string;
}

export interface AppSettings extends BaseRecord {
  daily_application_target: number;
  weekly_application_target: number;
  weekly_par_target: number;
  weekly_case_target: number;
  weekly_mock_target: number;
  weekly_networking_target: number;
  preferred_target_roles: string[];
  case_types: string[];
  application_statuses: string[];
  action_item_statuses: string[];
  action_item_priorities: string[];
  recruiting_tracks: string[];
}

export interface RecruitOSData {
  actionItems: ActionItem[];
  parStories: PARStory[];
  interviewQuestions: InterviewQuestion[];
  parPracticeLogs: PARPracticeLog[];
  interviewAnswers: InterviewAnswer[];
  cases: CasePractice[];
  contacts: Contact[];
  companies: Company[];
  applications: Application[];
  interviewPrep: InterviewPrep[];
  mockInterviews: MockInterview[];
  resumes: ResumeVersion[];
  outreachTemplates: OutreachTemplate[];
  brainDumps: BrainDump[];
  settings: AppSettings;
}

export type ApplicationStrategyLabel =
  | "Double Down"
  | "Apply This Week"
  | "Network First"
  | "At Risk"
  | "Waiting Too Long"
  | "Drop";

export interface ApplicationInsight {
  application: Application;
  company: Company | null;
  linkedContacts: Contact[];
  openActionItems: ActionItem[];
  applicationPriorityScore: number;
  applicationStrategyLabel: ApplicationStrategyLabel;
  applicationRiskFlags: string[];
  primaryReason: string;
  dueLabel: string;
  hasWarmContact: boolean;
  hasInterviewSignal: boolean;
}

export type ContactNextActionLabel =
  | "Send Outreach"
  | "Follow Up Now"
  | "Prep For Conversation"
  | "Ask For Referral"
  | "Convert To Application"
  | "Log Takeaways";

export interface ContactWorkflowInsight {
  contact: Contact;
  company: Company | null;
  linkedApplications: Application[];
  contactFollowUpUrgency: number;
  contactNextBestAction: ContactNextActionLabel;
  primaryReason: string;
  whyThisPersonMatters: string;
  askPrompt: string;
  sendPrompt: string;
}

export type InterviewPrepGap =
  | "No linked STARs"
  | "No linked answers"
  | "No company notes"
  | "No interviewer questions"
  | "Readiness below threshold";

export interface InterviewPrepPacket {
  prep: InterviewPrep;
  company: Company | null;
  application: Application | null;
  recommendedPars: PARStory[];
  recommendedAnswers: InterviewAnswer[];
  linkedCases: CasePractice[];
  openPrepActionItems: ActionItem[];
  likelyQuestions: string[];
  questionsToAsk: string[];
  gaps: InterviewPrepGap[];
  completenessScore: number;
}

export interface PriorityQueueItem {
  id: string;
  kind: "application" | "contact" | "interview-prep";
  title: string;
  subtitle: string;
  recommendation: string;
  reason: string;
  urgencyScore: number;
  badge: string;
  linkedId: string;
}

export interface ModuleConfig {
  slug: CrudModuleSlug;
  title: string;
  collection: keyof RecruitOSData;
  singular: string;
  description: string;
  titleKey: string;
  searchKeys: string[];
  columns: ColumnConfig[];
  sortOptions: SortOption[];
  defaultSort: {
    key: string;
    direction: SortDirection;
  };
  fields: FieldConfig[];
  defaultValues: Record<string, Primitive | string[]>;
}

export const STORAGE_KEY = "recruit-os-state-v1";

export const ACTION_ITEM_STATUSES = [
  "Open",
  "In Progress",
  "Waiting",
  "Done",
  "Archived",
];
export const ACTION_ITEM_PRIORITIES = ["Low", "Medium", "High", "Critical"];
export const TARGET_ROLES = [
  "PM",
  "TPM",
  "Product Strategy",
  "BizOps",
  "AI Product",
  "Consulting",
  "General",
];
export const RECRUITING_TRACKS = [
  "MBA Full-Time",
  "General Full-Time",
  "Internship Alternative",
  "Networking Lead",
];
export const APPLICATION_STATUSES = [
  "Target",
  "Researching",
  "Networking Before Applying",
  "Ready to Apply",
  "Applied",
  "Referral Requested",
  "Interviewing",
  "Assessment",
  "Final Round",
  "Rejected",
  "Offer",
  "Closed",
];
export const CASE_TYPES = [
  "PM Product Design",
  "PM Metrics",
  "PM Strategy",
  "TPM Execution",
  "TPM Technical Tradeoff",
  "Business Case",
  "Market Sizing",
  "GTM Strategy",
  "AI Product Case",
  "Operations Case",
];
export const BRAIN_DUMP_CATEGORIES = [
  "PAR",
  "Case",
  "Networking",
  "Application",
  "Mock Interview",
  "Resume",
  "Interview Prep",
  "Interview Answer",
  "Company",
  "General",
];
export const SOURCE_TYPES = [
  "Brain Dump",
  "Networking",
  "Application",
  "PAR",
  "Case",
  "Mock Interview",
  "Resume",
  "Company",
  "Interview Prep",
  "Interview Answer",
  "Outreach Template",
  "General",
];
export const INTERVIEW_PREP_CHECKLIST = [
  "Review job description",
  "Identify top 5 role requirements",
  "Review resume version used",
  "Prepare resume walkthrough",
  "Customize Tell Me About Yourself",
  "Prepare Why this company",
  "Prepare Why this role",
  "Prepare Why me",
  "Select 5-7 STAR stories",
  "Practice likely behavioral questions",
  "Practice role-specific case",
  "Research company products",
  "Research business model",
  "Research recent company news",
  "Review interviewer background if known",
  "Talk to at least one person at the company",
  "Prepare thoughtful questions for interviewer",
  "Complete one mock interview",
  "Prepare post-interview thank-you note",
];

export const NAV_ITEMS: { slug: ModuleSlug; label: string }[] = [
  { slug: "dashboard", label: "Dashboard" },
  { slug: "pars", label: "STARs" },
  { slug: "interview-answers", label: "Interview Answers" },
  { slug: "cases", label: "Cases" },
  { slug: "networking", label: "Networking" },
  { slug: "applications", label: "Applications" },
  { slug: "companies", label: "Companies" },
  { slug: "interview-prep", label: "Interview Prep" },
  { slug: "mock-interviews", label: "Mock Interviews" },
  { slug: "action-items", label: "Action Items" },
  { slug: "resumes", label: "Resumes" },
  { slug: "outreach-templates", label: "Outreach Templates" },
  { slug: "settings", label: "Settings" },
];

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function toDateInput(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function dateOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInput(date.toISOString());
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isDueTodayOrOverdue(value: string) {
  return Boolean(value) && value <= toDateInput(nowIso());
}

export function isWithinNextDays(value: string, days: number) {
  if (!value) return false;
  const end = dateOffset(days);
  return value >= toDateInput(nowIso()) && value <= end;
}

export function startOfWeek(date = new Date()) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function endOfWeek(date = new Date()) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function isInCurrentWeek(value: string) {
  if (!value) return false;
  const date = new Date(value);
  return date >= startOfWeek() && date <= endOfWeek();
}

export function isActionDone(action: ActionItem) {
  return action.status === "Done";
}

export function progressPercentage(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

export function joinList(items: string[]) {
  return items.length ? items.join(", ") : "—";
}

export function toOptions(values: string[]): Option[] {
  return values.map((value) => ({ label: value, value }));
}

export function emptySettings(): AppSettings {
  const timestamp = nowIso();
  return {
    id: "settings-default",
    created_at: timestamp,
    updated_at: timestamp,
    daily_application_target: 10,
    weekly_application_target: 50,
    weekly_par_target: 7,
    weekly_case_target: 7,
    weekly_mock_target: 1,
    weekly_networking_target: 15,
    preferred_target_roles: ["PM", "TPM", "Product Strategy"],
    case_types: CASE_TYPES,
    application_statuses: APPLICATION_STATUSES,
    action_item_statuses: ACTION_ITEM_STATUSES,
    action_item_priorities: ACTION_ITEM_PRIORITIES,
    recruiting_tracks: RECRUITING_TRACKS,
  };
}

export const seedData = (): RecruitOSData => {
  const timestamp = nowIso();
  const companyOracle = "company-oracle";
  const companyAdobe = "company-adobe";
  const companyAmazon = "company-amazon";
  const contactMaya = "contact-maya";
  const contactLina = "contact-lina";
  const contactEthan = "contact-ethan";
  const resumePm = "resume-pm";
  const applicationOracle = "application-oracle";
  const applicationAdobe = "application-adobe";
  const parOracle = "par-oracle";
  const parMixer = "par-mixer";
  const questionInfluence = "question-influence";
  const questionFailure = "question-failure";
  const answerTmay = "answer-tmay";
  const caseMetrics = "case-metrics";
  const caseGtm = "case-gtm";
  const mockBehavioral = "mock-behavioral";
  const prepOracle = "prep-oracle";
  const brainDump = "brain-1";
  const actionResume = "action-resume";
  const actionFollowUp = "action-follow-up";
  const actionCase = "action-case";
  const actionPrep = "action-prep";

  return {
    settings: emptySettings(),
    companies: [
      {
        id: companyOracle,
        created_at: timestamp,
        updated_at: timestamp,
        name: "Oracle",
        industry: "Enterprise Software",
        target_category: "Dream",
        role_fit: "AI Product",
        priority: "High",
        visa_friendliness: "Medium",
        recruiting_timeline: "Regular",
        why_this_company:
          "Strong match for AI product strategy and enterprise storytelling.",
        relevant_experience: "Agentic AI strategy and B2B product positioning.",
        best_angle: "Bridge MBA strategy with enterprise AI execution.",
        custom_pitch: "I can turn customer pain into clear AI product strategy.",
        company_research_notes:
          "Focus on Fusion apps, vertical AI, and enterprise adoption motion.",
        products: "OCI, Fusion, NetSuite, AI Agents",
        business_model: "Enterprise subscriptions and cloud services",
        recent_news: "Ongoing AI agent platform expansion",
        risks_or_questions: "How much PM vs strategy ownership is in role?",
        interview_notes: "",
        linked_contact_ids: [contactMaya],
        linked_application_ids: [applicationOracle],
      },
      {
        id: companyAdobe,
        created_at: timestamp,
        updated_at: timestamp,
        name: "Adobe",
        industry: "Software",
        target_category: "Strong",
        role_fit: "PM",
        priority: "High",
        visa_friendliness: "Unknown",
        recruiting_timeline: "Early",
        why_this_company: "Great product craft and platform scale.",
        relevant_experience: "Customer storytelling plus product sense.",
        best_angle: "Blend product thinking with business case rigor.",
        custom_pitch: "",
        company_research_notes: "Explore Firefly, Express, and SMB creator flows.",
        products: "Creative Cloud, Acrobat, Firefly",
        business_model: "Subscription software",
        recent_news: "Generative AI assistant rollouts",
        risks_or_questions: "",
        interview_notes: "",
        linked_contact_ids: [contactLina],
        linked_application_ids: [applicationAdobe],
      },
      {
        id: companyAmazon,
        created_at: timestamp,
        updated_at: timestamp,
        name: "Amazon",
        industry: "Technology",
        target_category: "Exploratory",
        role_fit: "TPM",
        priority: "Medium",
        visa_friendliness: "Strong",
        recruiting_timeline: "Just-in-Time",
        why_this_company: "",
        relevant_experience: "",
        best_angle: "",
        custom_pitch: "",
        company_research_notes: "",
        products: "",
        business_model: "",
        recent_news: "",
        risks_or_questions: "",
        interview_notes: "",
        linked_contact_ids: [contactEthan],
        linked_application_ids: [],
      },
    ],
    contacts: [
      {
        id: contactMaya,
        created_at: timestamp,
        updated_at: timestamp,
        name: "Maya Cohen",
        company_id: companyOracle,
        company_name: "Oracle",
        role: "Senior Product Manager",
        source: "Cornell Johnson",
        relationship_strength: 4,
        how_i_know_them: "Johnson alum intro",
        tags: ["Cornell", "Alum", "PM"],
        email: "maya@example.com",
        linkedin_url: "https://linkedin.com/in/maya",
        location: "New York",
        last_contact_date: dateOffset(-8),
        next_follow_up_date: dateOffset(-1),
        conversation_notes: "Suggested tailoring resume toward AI platform work.",
        linked_application_ids: [applicationOracle],
        can_refer: "Yes",
        referral_status: "Agreed",
        priority: "High",
      },
      {
        id: contactLina,
        created_at: timestamp,
        updated_at: timestamp,
        name: "Lina Park",
        company_id: companyAdobe,
        company_name: "Adobe",
        role: "Product Marketing Manager",
        source: "High Tech Club",
        relationship_strength: 3,
        how_i_know_them: "Trek follow-up",
        tags: ["High Tech Club", "PMM"],
        email: "lina@example.com",
        linkedin_url: "",
        location: "San Jose",
        last_contact_date: dateOffset(-12),
        next_follow_up_date: dateOffset(0),
        conversation_notes: "Open to a 15 minute chat after portfolio review.",
        linked_application_ids: [applicationAdobe],
        can_refer: "Maybe",
        referral_status: "Not Asked",
        priority: "Medium",
      },
      {
        id: contactEthan,
        created_at: timestamp,
        updated_at: timestamp,
        name: "Ethan Levy",
        company_id: companyAmazon,
        company_name: "Amazon",
        role: "TPM",
        source: "Israeli",
        relationship_strength: 2,
        how_i_know_them: "Friend of a classmate",
        tags: ["Israeli", "TPM"],
        email: "",
        linkedin_url: "",
        location: "Seattle",
        last_contact_date: dateOffset(-30),
        next_follow_up_date: dateOffset(5),
        conversation_notes: "",
        linked_application_ids: [],
        can_refer: "Maybe",
        referral_status: "Not Asked",
        priority: "Low",
      },
    ],
    resumes: [
      {
        id: resumePm,
        created_at: timestamp,
        updated_at: timestamp,
        name: "PM Storytelling Resume",
        target_role: "General Q",
        file_link: "",
        last_updated_date: dateOffset(-2),
        positioning: "Customer insight + strategy + AI product work",
        notes: "Tuned for PM and strategy-heavy roles.",
        linked_application_ids: [applicationAdobe, applicationOracle],
      },
    ],
    applications: [
      {
        id: applicationOracle,
        created_at: timestamp,
        updated_at: timestamp,
        company_id: companyOracle,
        company_name: "Oracle",
        role_title: "AI Product Strategy MBA",
        function: "AI Product",
        recruiting_track: "MBA Full-Time",
        location: "Remote",
        posting_link: "",
        status: "Interviewing",
        priority: "High",
        deadline: dateOffset(4),
        date_applied: dateOffset(-1),
        resume_version_id: resumePm,
        referral_needed: true,
        referral_person_contact_id: contactMaya,
        referral_email: "",
        referral_status: "Agreed",
        referral_date: dateOffset(-3),
        referral_notes: "Maya will submit after latest resume version.",
        recruiter_name: "",
        recruiter_email: "",
        hiring_manager_name: "",
        hiring_manager_email: "",
        vp_or_director_name: "",
        vp_or_director_email: "",
        cold_email_sent: false,
        follow_up_date: dateOffset(0),
        next_step: "Send updated resume and schedule prep chat.",
        notes: "Need sharp Why Oracle + AI narrative.",
        linked_contact_ids: [contactMaya],
        linked_action_item_ids: [actionResume, actionPrep],
        timing_fit: "Good",
        start_date_compatibility: "Yes",
        mba_mentioned: "Yes",
        degree_requirement: "MBA",
        application_source: "Referral",
        conversion_opportunity: "None",
        rejection_reason: "",
        rejection_follow_up_opportunity: false,
        rejection_follow_up_sent: false,
      },
      {
        id: applicationAdobe,
        created_at: timestamp,
        updated_at: timestamp,
        company_id: companyAdobe,
        company_name: "Adobe",
        role_title: "Product Manager, Growth",
        function: "PM",
        recruiting_track: "General Full-Time",
        location: "San Jose",
        posting_link: "",
        status: "Ready to Apply",
        priority: "High",
        deadline: dateOffset(2),
        date_applied: "",
        resume_version_id: resumePm,
        referral_needed: false,
        referral_person_contact_id: "",
        referral_email: "",
        referral_status: "Not Asked",
        referral_date: "",
        referral_notes: "",
        recruiter_name: "",
        recruiter_email: "",
        hiring_manager_name: "",
        hiring_manager_email: "",
        vp_or_director_name: "",
        vp_or_director_email: "",
        cold_email_sent: true,
        follow_up_date: dateOffset(1),
        next_step: "Finish growth metrics examples and submit.",
        notes: "",
        linked_contact_ids: [contactLina],
        linked_action_item_ids: [],
        timing_fit: "Good",
        start_date_compatibility: "Yes",
        mba_mentioned: "No",
        degree_requirement: "Bachelor’s",
        application_source: "Company Site",
        conversion_opportunity: "Could Become Networking",
        rejection_reason: "",
        rejection_follow_up_opportunity: false,
        rejection_follow_up_sent: false,
      },
    ],
    parStories: [
      {
        id: parOracle,
        created_at: timestamp,
        updated_at: timestamp,
        title: "Oracle Agentic AI Strategy",
        category: "Leadership",
        situation: "Needed to shape internal AI agent strategy with limited alignment.",
        problem: "Teams had different assumptions about value and user pain.",
        action: "Built a decision memo, aligned stakeholders, and prioritized use cases.",
        result: "Created shared direction and accelerated pilot planning.",
        polished_answer: "Structured story about alignment and clarity.",
        short_version_60_sec: "I aligned teams around AI agent priorities.",
        long_version_2_min: "Full two minute version with context and outcome.",
        confidence_score: 3,
        last_practiced_date: dateOffset(-10),
        number_of_reps: 2,
        status: "Good",
        weakness_or_focus_area: "Need tighter result metrics.",
        notes: "",
        follow_up_questions: "",
        linked_question_ids: [questionInfluence],
      },
      {
        id: parMixer,
        created_at: timestamp,
        updated_at: timestamp,
        title: "High Tech Club NYC Mixer",
        category: "Influence",
        situation: "Needed to quickly build sponsor momentum for event turnout.",
        problem: "Low initial response and unclear partner value.",
        action: "Reframed pitch around sponsor reach and student quality.",
        result: "Increased sponsor interest and event attendance.",
        polished_answer: "Strong influence without authority story.",
        short_version_60_sec: "",
        long_version_2_min: "",
        confidence_score: 2,
        last_practiced_date: dateOffset(-18),
        number_of_reps: 1,
        status: "Draft",
        weakness_or_focus_area: "Need clearer personal leadership point.",
        notes: "",
        follow_up_questions: "",
        linked_question_ids: [questionInfluence, questionFailure],
      },
    ],
    interviewQuestions: [
      {
        id: questionInfluence,
        created_at: timestamp,
        updated_at: timestamp,
        question_text: "Tell me about a time you influenced without authority.",
        linked_par_story_ids: [parOracle, parMixer],
      },
      {
        id: questionFailure,
        created_at: timestamp,
        updated_at: timestamp,
        question_text: "Tell me about a failure and what you learned.",
        linked_par_story_ids: [parMixer],
      },
    ],
    parPracticeLogs: [],
    interviewAnswers: [
      {
        id: answerTmay,
        created_at: timestamp,
        updated_at: timestamp,
        question: "Tell me about yourself",
        answer_type: "General Q",
        target_role: "PM",
        polished_answer: "MBA candidate bridging strategy, product, and enterprise AI.",
        short_version: "MBA + AI product strategy operator.",
        long_version: "Longer answer connecting past experience to PM goals.",
        key_points: "MBA, enterprise AI, product thinking, cross-functional influence",
        confidence_score: 4,
        last_practiced_date: dateOffset(-5),
        status: "Good",
        notes: "",
        linked_par_story_ids: [parOracle],
        linked_application_ids: [applicationOracle],
        linked_interview_prep_ids: [prepOracle],
      },
    ],
    cases: [
      {
        id: caseMetrics,
        created_at: timestamp,
        updated_at: timestamp,
        title: "Retention Metrics Deep Dive",
        case_type: "PM Metrics",
        source: "RocketBlocks",
        practiced_with: "Self",
        date: dateOffset(-11),
        difficulty: "Medium",
        framework_used: "North Star, input metrics, diagnosis tree",
        score: 3,
        notes: "",
        weakness_area: "Need sharper tradeoff framing.",
        redo_needed: true,
      },
      {
        id: caseGtm,
        created_at: timestamp,
        updated_at: timestamp,
        title: "AI Workflow Tool GTM",
        case_type: "GTM Strategy",
        source: "Peer prep",
        practiced_with: "Classmate",
        date: dateOffset(-4),
        difficulty: "Hard",
        framework_used: "Segmentation, wedge, pricing, channels",
        score: 2,
        notes: "Need faster prioritization.",
        weakness_area: "Synthesis",
        redo_needed: true,
      },
    ],
    interviewPrep: [
      {
        id: prepOracle,
        created_at: timestamp,
        updated_at: timestamp,
        company_id: companyOracle,
        application_id: applicationOracle,
        interview_date: `${dateOffset(3)}T14:00`,
        interview_round: "First Round",
        interview_type: "Behavioral",
        interviewer_name: "Maya Cohen",
        interviewer_linkedin: "",
        prep_status: "In Progress",
        readiness_score: 33,
        linked_contact_ids: [contactMaya],
        linked_par_story_ids: [parOracle, parMixer],
        linked_interview_answer_ids: [answerTmay],
        linked_case_ids: [],
        company_notes: "Review OCI and enterprise AI narrative.",
        likely_questions: "Why Oracle, stakeholder influence, product strategy",
        questions_to_ask_interviewer: "How does AI strategy turn into roadmap bets?",
        thank_you_note_draft: "",
        notes: "",
        linked_action_item_ids: [actionPrep],
      },
    ],
    mockInterviews: [
      {
        id: mockBehavioral,
        created_at: timestamp,
        updated_at: timestamp,
        date: dateOffset(-9),
        mocked_with: "Career coach",
        interview_type: "Behavioral",
        target_company_id: companyOracle,
        target_role: "AI Product",
        questions_asked: "Tell me about yourself, failure, influence",
        case_given: "",
        linked_par_story_ids: [parOracle, parMixer],
        linked_case_ids: [],
        overall_score: 3,
        strengths: "Clear structure",
        weaknesses: "Needs stronger results section",
        feedback_notes: "Tighten answer endings and company fit.",
        linked_action_item_ids: [],
        follow_up_needed: true,
      },
    ],
    outreachTemplates: [
      {
        id: "template-cornell",
        created_at: timestamp,
        updated_at: timestamp,
        name: "Cornell alum message",
        use_case: "Cornell alum message",
        template_text:
          "Hi {{name}}, I’m a Johnson MBA exploring {{company}} and would value 15 minutes to learn from your path.",
        target_audience: "Alumni",
        last_used_date: dateOffset(-7),
        notes: "",
      },
    ],
    brainDumps: [
      {
        id: brainDump,
        created_at: timestamp,
        updated_at: timestamp,
        title: "Practice failure STAR",
        note: "Need a cleaner failure story for PM interviews.",
        category: "PAR",
        converted_action_item_id: "",
        linked_contact_id: "",
        linked_company_id: "",
        linked_application_id: applicationAdobe,
        linked_par_id: parMixer,
        linked_case_id: "",
        linked_mock_interview_id: "",
        linked_resume_id: "",
        linked_interview_prep_id: "",
      },
    ],
    actionItems: [
      {
        id: actionResume,
        created_at: timestamp,
        updated_at: timestamp,
        title: "Send Oracle-updated resume to Maya",
        description: "Incorporate AI platform language and send the latest draft.",
        status: "Open",
        priority: "High",
        due_date: dateOffset(0),
        completed_at: "",
        source_type: "Application",
        source_id: applicationOracle,
        linked_contact_id: contactMaya,
        linked_company_id: companyOracle,
        linked_application_id: applicationOracle,
        linked_par_id: "",
        linked_case_id: "",
        linked_mock_interview_id: "",
        linked_resume_id: resumePm,
        linked_interview_prep_id: "",
        linked_interview_answer_id: "",
      },
      {
        id: actionFollowUp,
        created_at: timestamp,
        updated_at: timestamp,
        title: "Follow up with Lina about Adobe growth role",
        description: "Ask for product growth context before applying.",
        status: "Waiting",
        priority: "Medium",
        due_date: dateOffset(0),
        completed_at: "",
        source_type: "Networking",
        source_id: contactLina,
        linked_contact_id: contactLina,
        linked_company_id: companyAdobe,
        linked_application_id: applicationAdobe,
        linked_par_id: "",
        linked_case_id: "",
        linked_mock_interview_id: "",
        linked_resume_id: "",
        linked_interview_prep_id: "",
        linked_interview_answer_id: "",
      },
      {
        id: actionCase,
        created_at: timestamp,
        updated_at: timestamp,
        title: "Redo GTM strategy case",
        description: "Practice sharper prioritization and synthesis.",
        status: "Open",
        priority: "High",
        due_date: dateOffset(1),
        completed_at: "",
        source_type: "Case",
        source_id: caseGtm,
        linked_contact_id: "",
        linked_company_id: "",
        linked_application_id: "",
        linked_par_id: "",
        linked_case_id: caseGtm,
        linked_mock_interview_id: "",
        linked_resume_id: "",
        linked_interview_prep_id: "",
        linked_interview_answer_id: "",
      },
      {
        id: actionPrep,
        created_at: timestamp,
        updated_at: timestamp,
        title: "Prepare Why Oracle answer",
        description: "Tie AI product motivation to Oracle's enterprise footprint.",
        status: "In Progress",
        priority: "High",
        due_date: dateOffset(1),
        completed_at: "",
        source_type: "Interview Prep",
        source_id: prepOracle,
        linked_contact_id: "",
        linked_company_id: companyOracle,
        linked_application_id: applicationOracle,
        linked_par_id: "",
        linked_case_id: "",
        linked_mock_interview_id: "",
        linked_resume_id: "",
        linked_interview_prep_id: prepOracle,
        linked_interview_answer_id: answerTmay,
      },
    ],
  };
};

export function getCollectionKey(slug: CrudModuleSlug): keyof RecruitOSData {
  const mapping: Record<CrudModuleSlug, keyof RecruitOSData> = {
    "action-items": "actionItems",
    applications: "applications",
    cases: "cases",
    companies: "companies",
    "interview-answers": "interviewAnswers",
    "interview-prep": "interviewPrep",
    "mock-interviews": "mockInterviews",
    networking: "contacts",
    pars: "parStories",
    resumes: "resumes",
    "outreach-templates": "outreachTemplates",
    "brain-dump": "brainDumps",
  };
  return mapping[slug];
}

export function getCompanyOptions(data: RecruitOSData) {
  return data.companies.map((company) => ({
    label: company.name,
    value: company.id,
  }));
}

export function getContactOptions(data: RecruitOSData) {
  return data.contacts.map((contact) => ({
    label: `${contact.name}${contact.company_name ? ` · ${contact.company_name}` : ""}`,
    value: contact.id,
  }));
}

export function getApplicationOptions(data: RecruitOSData) {
  return data.applications.map((application) => ({
    label: `${application.company_name || "Unknown"} · ${application.role_title}`,
    value: application.id,
  }));
}

export function getPAROptions(data: RecruitOSData) {
  return data.parStories.map((par) => ({ label: par.title, value: par.id }));
}

export function getCaseOptions(data: RecruitOSData) {
  return data.cases.map((item) => ({ label: item.title, value: item.id }));
}

export function getInterviewPrepOptions(data: RecruitOSData) {
  return data.interviewPrep.map((prep) => ({
    label: `${lookupCompanyName(data, prep.company_id) || "Interview"} · ${formatDateTime(prep.interview_date)}`,
    value: prep.id,
  }));
}

export function getInterviewAnswerOptions(data: RecruitOSData) {
  return data.interviewAnswers.map((answer) => ({
    label: answer.question,
    value: answer.id,
  }));
}

export function getResumeOptions(data: RecruitOSData) {
  return data.resumes.map((resume) => ({ label: resume.name, value: resume.id }));
}

export function lookupCompanyName(data: RecruitOSData, companyId: string) {
  return data.companies.find((company) => company.id === companyId)?.name ?? "";
}

export const MODULE_CONFIGS: Record<CrudModuleSlug, ModuleConfig> = {
  "action-items": {
    slug: "action-items",
    title: "Action Items",
    singular: "Action Item",
    collection: "actionItems",
    description: "One master task list that stays linked back to its source.",
    titleKey: "title",
    searchKeys: ["title", "description", "status", "priority", "source_type"],
    columns: [
      { key: "title", label: "Title" },
      { key: "status", label: "Status" },
      { key: "priority", label: "Priority" },
      { key: "due_date", label: "Due" },
      { key: "source_type", label: "Source" },
    ],
    sortOptions: [
      { key: "title", label: "Title", type: "text" },
      { key: "status", label: "Status", type: "text", order: ACTION_ITEM_STATUSES },
      { key: "priority", label: "Priority", type: "text", order: ACTION_ITEM_PRIORITIES },
      { key: "due_date", label: "Due date", type: "date" },
      { key: "source_type", label: "Source type", type: "text" },
      { key: "created_at", label: "Created", type: "date" },
    ],
    defaultSort: { key: "due_date", direction: "asc" },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ACTION_ITEM_STATUSES },
      { key: "priority", label: "Priority", type: "select", options: ACTION_ITEM_PRIORITIES },
      { key: "due_date", label: "Due date", type: "date" },
      { key: "source_type", label: "Source type", type: "select", options: SOURCE_TYPES },
      { key: "source_id", label: "Source id", type: "text" },
      { key: "linked_contact_id", label: "Linked contact", type: "select", options: getContactOptions },
      { key: "linked_company_id", label: "Linked company", type: "select", options: getCompanyOptions },
      { key: "linked_application_id", label: "Linked application", type: "select", options: getApplicationOptions },
      { key: "linked_par_id", label: "Linked STAR", type: "select", options: getPAROptions },
      { key: "linked_case_id", label: "Linked case", type: "select", options: getCaseOptions },
      { key: "linked_mock_interview_id", label: "Linked mock interview", type: "select", options: (data) => data.mockInterviews.map((item) => ({ label: `${formatDate(item.date)} · ${item.interview_type}`, value: item.id })) },
      { key: "linked_resume_id", label: "Linked resume", type: "select", options: getResumeOptions },
      { key: "linked_interview_prep_id", label: "Linked interview prep", type: "select", options: getInterviewPrepOptions },
      { key: "linked_interview_answer_id", label: "Linked interview answer", type: "select", options: getInterviewAnswerOptions },
    ],
    defaultValues: {
      title: "",
      description: "",
      status: "Open",
      priority: "Medium",
      due_date: toDateInput(nowIso()),
      completed_at: "",
      source_type: "General",
      source_id: "",
      linked_contact_id: "",
      linked_company_id: "",
      linked_application_id: "",
      linked_par_id: "",
      linked_case_id: "",
      linked_mock_interview_id: "",
      linked_resume_id: "",
      linked_interview_prep_id: "",
      linked_interview_answer_id: "",
    },
  },
  applications: {
    slug: "applications",
    title: "Applications",
    singular: "Application",
    collection: "applications",
    description: "Track roles, deadlines, referrals, and next steps by recruiting track.",
    titleKey: "role_title",
    searchKeys: ["company_name", "role_title", "status", "recruiting_track", "next_step"],
    columns: [
      { key: "company_name", label: "Company" },
      { key: "role_title", label: "Role" },
      { key: "status", label: "Status" },
      { key: "recruiting_track", label: "Track" },
      { key: "follow_up_date", label: "Follow up" },
    ],
    sortOptions: [
      { key: "company_name", label: "Company", type: "text" },
      { key: "role_title", label: "Role title", type: "text" },
      { key: "status", label: "Status", type: "text", order: APPLICATION_STATUSES },
      { key: "priority", label: "Priority", type: "text", order: ACTION_ITEM_PRIORITIES },
      { key: "recruiting_track", label: "Recruiting track", type: "text", order: RECRUITING_TRACKS },
      { key: "deadline", label: "Deadline", type: "date" },
      { key: "date_applied", label: "Date applied", type: "date" },
      { key: "follow_up_date", label: "Follow up date", type: "date" },
      { key: "created_at", label: "Created", type: "date" },
    ],
    defaultSort: { key: "follow_up_date", direction: "asc" },
    fields: [
      { key: "company_id", label: "Company", type: "select", options: getCompanyOptions },
      { key: "role_title", label: "Role title", type: "text" },
      { key: "function", label: "Function", type: "select", options: ["PM", "TPM", "Product Strategy", "BizOps", "AI Product", "Solutions", "Consulting", "Program Management", "Other"] },
      { key: "recruiting_track", label: "Recruiting track", type: "select", options: (data) => toOptions(data.settings.recruiting_tracks) },
      { key: "location", label: "Location", type: "text" },
      { key: "posting_link", label: "Posting link", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: (data) =>
          toOptions(
            Array.from(
              new Set([...APPLICATION_STATUSES, ...data.settings.application_statuses]),
            ),
          ),
      },
      { key: "priority", label: "Priority", type: "select", options: ACTION_ITEM_PRIORITIES },
      { key: "deadline", label: "Deadline", type: "date" },
      { key: "date_applied", label: "Date applied", type: "date" },
      { key: "resume_version_id", label: "Resume version", type: "select", options: getResumeOptions },
      { key: "linked_contact_ids", label: "Linked contacts", type: "multiselect", options: getContactOptions },
      { key: "recruiter_name", label: "Recruiter name", type: "text" },
      { key: "recruiter_email", label: "Recruiter email", type: "text" },
      { key: "hiring_manager_name", label: "Hiring manager name", type: "text" },
      { key: "hiring_manager_email", label: "Hiring manager email", type: "text" },
      { key: "vp_or_director_name", label: "VP / director name", type: "text" },
      { key: "vp_or_director_email", label: "VP / director email", type: "text" },
      { key: "referral_needed", label: "Referral needed", type: "checkbox" },
      { key: "referral_person_contact_id", label: "Referral contact", type: "select", options: getContactOptions },
      { key: "referral_email", label: "Referral email", type: "text" },
      { key: "referral_status", label: "Referral status", type: "select", options: ["Not Asked", "Asked", "Agreed", "Submitted", "Declined"] },
      { key: "referral_date", label: "Referral date", type: "date" },
      { key: "referral_notes", label: "Referral notes", type: "textarea" },
      { key: "follow_up_date", label: "Follow up date", type: "date" },
      { key: "next_step", label: "Next step", type: "text" },
      { key: "cold_email_sent", label: "Cold email sent", type: "checkbox" },
      { key: "notes", label: "Notes", type: "textarea" },
      { key: "timing_fit", label: "Timing fit", type: "select", options: ["Good", "Maybe", "Risky", "Unknown"] },
      { key: "start_date_compatibility", label: "Start date compatibility", type: "select", options: ["Yes", "No", "Unknown"] },
      { key: "mba_mentioned", label: "MBA mentioned", type: "select", options: ["Yes", "No", "Unknown"] },
      { key: "degree_requirement", label: "Degree requirement", type: "select", options: ["MBA", "Bachelor’s", "Master’s", "None", "Unknown"] },
      { key: "application_source", label: "Source", type: "select", options: ["LinkedIn", "MBA Portal", "Company Site", "Referral", "Alum", "Recruiter", "Other"] },
      { key: "conversion_opportunity", label: "Conversion opportunity", type: "select", options: ["None", "Could Become Internship", "Could Become Project", "Could Become Networking"] },
      { key: "rejection_reason", label: "Rejection reason", type: "select", options: ["", "Timing", "Experience", "Visa", "Role Filled", "Unknown", "Other"] },
      { key: "rejection_follow_up_opportunity", label: "Rejection follow-up opportunity", type: "checkbox" },
      { key: "rejection_follow_up_sent", label: "Rejection follow-up sent", type: "checkbox" },
    ],
    defaultValues: {
      company_id: "",
      company_name: "",
      role_title: "",
      function: "PM",
      recruiting_track: "MBA Full-Time",
      location: "",
      posting_link: "",
      status: "Target",
      priority: "Medium",
      deadline: "",
      date_applied: "",
      resume_version_id: "",
      linked_contact_ids: [],
      recruiter_name: "",
      recruiter_email: "",
      hiring_manager_name: "",
      hiring_manager_email: "",
      vp_or_director_name: "",
      vp_or_director_email: "",
      referral_needed: false,
      referral_person_contact_id: "",
      referral_email: "",
      referral_status: "Not Asked",
      referral_date: "",
      referral_notes: "",
      cold_email_sent: false,
      follow_up_date: "",
      next_step: "",
      notes: "",
      linked_action_item_ids: [],
      timing_fit: "Unknown",
      start_date_compatibility: "Unknown",
      mba_mentioned: "Unknown",
      degree_requirement: "Unknown",
      application_source: "Other",
      conversion_opportunity: "None",
      rejection_reason: "",
      rejection_follow_up_opportunity: false,
      rejection_follow_up_sent: false,
    },
  },
  cases: {
    slug: "cases",
    title: "Cases",
    singular: "Case",
    collection: "cases",
    description: "Manage case practice, weak spots, and redo-needed sessions.",
    titleKey: "title",
    searchKeys: ["title", "case_type", "weakness_area", "source"],
    columns: [
      { key: "title", label: "Title" },
      { key: "case_type", label: "Type" },
      { key: "score", label: "Score" },
      { key: "date", label: "Last practice" },
      { key: "redo_needed", label: "Redo" },
    ],
    sortOptions: [
      { key: "title", label: "Title", type: "text" },
      { key: "case_type", label: "Case type", type: "text" },
      { key: "score", label: "Score", type: "number" },
      { key: "date", label: "Last practice", type: "date" },
      { key: "redo_needed", label: "Redo needed", type: "boolean" },
      { key: "difficulty", label: "Difficulty", type: "text", order: ["Easy", "Medium", "Hard"] },
      { key: "created_at", label: "Created", type: "date" },
    ],
    defaultSort: { key: "date", direction: "desc" },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "case_type", label: "Case type", type: "select", options: (data) => toOptions(data.settings.case_types) },
      { key: "source", label: "Source", type: "text" },
      { key: "practiced_with", label: "Practiced with", type: "text" },
      { key: "date", label: "Date", type: "date" },
      { key: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard"] },
      { key: "framework_used", label: "Framework used", type: "text" },
      { key: "score", label: "Score", type: "number", min: 1, max: 5 },
      { key: "weakness_area", label: "Weakness area", type: "text" },
      { key: "redo_needed", label: "Redo needed", type: "checkbox" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    defaultValues: {
      title: "",
      case_type: CASE_TYPES[0],
      source: "",
      practiced_with: "",
      date: "",
      difficulty: "Medium",
      framework_used: "",
      score: 3,
      notes: "",
      weakness_area: "",
      redo_needed: false,
    },
  },
  companies: {
    slug: "companies",
    title: "Companies",
    singular: "Company",
    collection: "companies",
    description: "Keep target company research, fit, and linked recruiting context together.",
    titleKey: "name",
    searchKeys: ["name", "industry", "role_fit", "target_category", "best_angle"],
    columns: [
      { key: "name", label: "Company" },
      { key: "target_category", label: "Category" },
      { key: "role_fit", label: "Role fit" },
      { key: "priority", label: "Priority" },
      { key: "visa_friendliness", label: "Visa" },
    ],
    sortOptions: [
      { key: "name", label: "Company", type: "text" },
      { key: "target_category", label: "Category", type: "text", order: ["Dream", "Strong", "Backup", "Exploratory"] },
      { key: "role_fit", label: "Role fit", type: "text" },
      { key: "priority", label: "Priority", type: "text", order: ACTION_ITEM_PRIORITIES },
      { key: "visa_friendliness", label: "Visa friendliness", type: "text", order: ["Strong", "Medium", "Weak", "Unknown"] },
      { key: "recruiting_timeline", label: "Recruiting timeline", type: "text", order: ["Early", "Regular", "Just-in-Time", "Unknown"] },
      { key: "created_at", label: "Created", type: "date" },
    ],
    defaultSort: { key: "priority", direction: "desc" },
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "industry", label: "Industry", type: "text" },
      { key: "target_category", label: "Target category", type: "select", options: ["Dream", "Strong", "Backup", "Exploratory"] },
      { key: "role_fit", label: "Role fit", type: "select", options: ["PM", "TPM", "Product Strategy", "BizOps", "AI Product", "Consulting", "Other"] },
      { key: "priority", label: "Priority", type: "select", options: ACTION_ITEM_PRIORITIES },
      { key: "visa_friendliness", label: "Visa friendliness", type: "select", options: ["Strong", "Medium", "Weak", "Unknown"] },
      { key: "recruiting_timeline", label: "Recruiting timeline", type: "select", options: ["Early", "Regular", "Just-in-Time", "Unknown"] },
      { key: "why_this_company", label: "Why this company", type: "textarea" },
      { key: "relevant_experience", label: "Relevant experience", type: "textarea" },
      { key: "best_angle", label: "Best angle", type: "text" },
      { key: "custom_pitch", label: "Custom pitch", type: "textarea" },
      { key: "company_research_notes", label: "Research notes", type: "textarea" },
      { key: "products", label: "Products", type: "text" },
      { key: "business_model", label: "Business model", type: "text" },
      { key: "recent_news", label: "Recent news", type: "textarea" },
      { key: "risks_or_questions", label: "Risks or questions", type: "textarea" },
      { key: "interview_notes", label: "Interview notes", type: "textarea" },
    ],
    defaultValues: {
      name: "",
      industry: "",
      target_category: "Strong",
      role_fit: "PM",
      priority: "Medium",
      visa_friendliness: "Unknown",
      recruiting_timeline: "Unknown",
      why_this_company: "",
      relevant_experience: "",
      best_angle: "",
      custom_pitch: "",
      company_research_notes: "",
      products: "",
      business_model: "",
      recent_news: "",
      risks_or_questions: "",
      interview_notes: "",
      linked_contact_ids: [],
      linked_application_ids: [],
    },
  },
  "interview-answers": {
    slug: "interview-answers",
    title: "Interview Answers",
    singular: "Interview Answer",
    collection: "interviewAnswers",
    description: "Reusable polished answers for non-STAR interview questions.",
    titleKey: "question",
    searchKeys: ["question", "target_role", "status"],
    columns: [
      { key: "question", label: "Question" },
      { key: "target_role", label: "Group" },
      { key: "confidence_score", label: "Confidence" },
      { key: "last_practiced_date", label: "Last practiced" },
    ],
    sortOptions: [
      { key: "question", label: "Question", type: "text" },
      { key: "target_role", label: "Question group", type: "text" },
      { key: "confidence_score", label: "Confidence score", type: "number" },
      { key: "last_practiced_date", label: "Last practiced", type: "date" },
      { key: "status", label: "Status", type: "text", order: ["Draft", "Good", "Interview-Ready"] },
      { key: "created_at", label: "Created", type: "date" },
    ],
    defaultSort: { key: "last_practiced_date", direction: "asc" },
    fields: [
      { key: "question", label: "Question", type: "text" },
      { key: "target_role", label: "Question group", type: "select", options: ["General Q", "PM", "TPM", "Product Strategy", "Company-Specific", "Role-Specific"] },
      { key: "polished_answer", label: "Polished answer", type: "textarea" },
      { key: "short_version", label: "Short version", type: "textarea" },
      { key: "long_version", label: "Long version", type: "textarea" },
      { key: "key_points", label: "Key points", type: "textarea" },
      { key: "confidence_score", label: "Confidence score", type: "number", min: 1, max: 5 },
      { key: "last_practiced_date", label: "Last practiced", type: "date" },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Good", "Interview-Ready"] },
      { key: "notes", label: "Notes", type: "textarea" },
      { key: "linked_par_story_ids", label: "Linked STARs", type: "multiselect", options: getPAROptions },
      { key: "linked_application_ids", label: "Linked applications", type: "multiselect", options: getApplicationOptions },
      { key: "linked_interview_prep_ids", label: "Linked interview prep", type: "multiselect", options: getInterviewPrepOptions },
    ],
    defaultValues: {
      question: "",
      answer_type: "General Q",
      target_role: "General Q",
      polished_answer: "",
      short_version: "",
      long_version: "",
      key_points: "",
      confidence_score: 3,
      last_practiced_date: "",
      status: "Draft",
      notes: "",
      linked_par_story_ids: [],
      linked_application_ids: [],
      linked_interview_prep_ids: [],
    },
  },
  "interview-prep": {
    slug: "interview-prep",
    title: "Interview Prep",
    singular: "Interview Prep Record",
    collection: "interviewPrep",
    description: "Turn interviews into structured prep plans with linked checklist action items.",
    titleKey: "interviewer_name",
    searchKeys: ["interviewer_name", "interview_round", "interview_type", "prep_status"],
    columns: [
      { key: "interview_date", label: "Interview" },
      { key: "interview_round", label: "Round" },
      { key: "interview_type", label: "Type" },
      { key: "prep_status", label: "Prep status" },
      { key: "readiness_score", label: "Readiness" },
    ],
    sortOptions: [
      { key: "interview_date", label: "Interview date", type: "date" },
      { key: "interview_round", label: "Interview round", type: "text" },
      { key: "interview_type", label: "Interview type", type: "text" },
      { key: "prep_status", label: "Prep status", type: "text", order: ["Not Started", "In Progress", "Ready", "Completed"] },
      { key: "readiness_score", label: "Readiness score", type: "number" },
      { key: "interviewer_name", label: "Interviewer name", type: "text" },
      { key: "created_at", label: "Created", type: "date" },
    ],
    defaultSort: { key: "interview_date", direction: "asc" },
    fields: [
      { key: "company_id", label: "Company", type: "select", options: getCompanyOptions },
      { key: "application_id", label: "Application", type: "select", options: getApplicationOptions },
      { key: "interview_date", label: "Interview date", type: "datetime-local" },
      { key: "interview_round", label: "Interview round", type: "select", options: ["Recruiter Screen", "First Round", "Case", "Technical", "Final Round", "Other"] },
      { key: "interview_type", label: "Interview type", type: "select", options: ["Behavioral", "PM Case", "TPM", "Technical", "Mixed", "Recruiter Screen", "Final Round"] },
      { key: "interviewer_name", label: "Interviewer name", type: "text" },
      { key: "interviewer_linkedin", label: "Interviewer LinkedIn", type: "text" },
      { key: "prep_status", label: "Prep status", type: "select", options: ["Not Started", "In Progress", "Ready", "Completed"] },
      { key: "linked_contact_ids", label: "Linked contacts", type: "multiselect", options: getContactOptions },
      { key: "linked_par_story_ids", label: "Linked STARs", type: "multiselect", options: getPAROptions },
      { key: "linked_interview_answer_ids", label: "Linked answers", type: "multiselect", options: getInterviewAnswerOptions },
      { key: "linked_case_ids", label: "Linked cases", type: "multiselect", options: getCaseOptions },
      { key: "company_notes", label: "Company notes", type: "textarea" },
      { key: "likely_questions", label: "Likely questions", type: "textarea" },
      { key: "questions_to_ask_interviewer", label: "Questions to ask", type: "textarea" },
      { key: "thank_you_note_draft", label: "Thank-you draft", type: "textarea" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    defaultValues: {
      company_id: "",
      application_id: "",
      interview_date: "",
      interview_round: "First Round",
      interview_type: "Behavioral",
      interviewer_name: "",
      interviewer_linkedin: "",
      prep_status: "Not Started",
      readiness_score: 0,
      linked_contact_ids: [],
      linked_par_story_ids: [],
      linked_interview_answer_ids: [],
      linked_case_ids: [],
      company_notes: "",
      likely_questions: "",
      questions_to_ask_interviewer: "",
      thank_you_note_draft: "",
      notes: "",
      linked_action_item_ids: [],
    },
  },
  "mock-interviews": {
    slug: "mock-interviews",
    title: "Mock Interviews",
    singular: "Mock Interview",
    collection: "mockInterviews",
    description: "Track mock sessions, feedback, and next-fix action items.",
    titleKey: "mocked_with",
    searchKeys: ["mocked_with", "interview_type", "target_role", "weaknesses"],
    columns: [
      { key: "date", label: "Date" },
      { key: "interview_type", label: "Type" },
      { key: "mocked_with", label: "With" },
      { key: "overall_score", label: "Score" },
      { key: "follow_up_needed", label: "Follow up" },
    ],
    sortOptions: [
      { key: "date", label: "Date", type: "date" },
      { key: "interview_type", label: "Interview type", type: "text" },
      { key: "mocked_with", label: "Mocked with", type: "text" },
      { key: "overall_score", label: "Overall score", type: "number" },
      { key: "target_role", label: "Target role", type: "text" },
      { key: "follow_up_needed", label: "Follow up needed", type: "boolean" },
      { key: "created_at", label: "Created", type: "date" },
    ],
    defaultSort: { key: "date", direction: "desc" },
    fields: [
      { key: "date", label: "Date", type: "date" },
      { key: "mocked_with", label: "Mocked with", type: "text" },
      { key: "interview_type", label: "Interview type", type: "select", options: ["PM", "TPM", "Behavioral", "Case", "Full Mock", "Recruiter", "Other"] },
      { key: "target_company_id", label: "Target company", type: "select", options: getCompanyOptions },
      { key: "target_role", label: "Target role", type: "select", options: TARGET_ROLES },
      { key: "questions_asked", label: "Questions asked", type: "textarea" },
      { key: "case_given", label: "Case given", type: "textarea" },
      { key: "linked_par_story_ids", label: "Linked STARs", type: "multiselect", options: getPAROptions },
      { key: "linked_case_ids", label: "Linked cases", type: "multiselect", options: getCaseOptions },
      { key: "overall_score", label: "Overall score", type: "number", min: 1, max: 5 },
      { key: "strengths", label: "Strengths", type: "textarea" },
      { key: "weaknesses", label: "Weaknesses", type: "textarea" },
      { key: "feedback_notes", label: "Feedback notes", type: "textarea" },
      { key: "follow_up_needed", label: "Follow up needed", type: "checkbox" },
    ],
    defaultValues: {
      date: "",
      mocked_with: "",
      interview_type: "Behavioral",
      target_company_id: "",
      target_role: "General",
      questions_asked: "",
      case_given: "",
      linked_par_story_ids: [],
      linked_case_ids: [],
      overall_score: 3,
      strengths: "",
      weaknesses: "",
      feedback_notes: "",
      linked_action_item_ids: [],
      follow_up_needed: false,
    },
  },
  networking: {
    slug: "networking",
    title: "Networking",
    singular: "Contact",
    collection: "contacts",
    description: "A lightweight CRM for conversations, referrals, and follow-ups.",
    titleKey: "name",
    searchKeys: ["name", "company_name", "role", "source", "tags", "conversation_notes"],
    columns: [
      { key: "name", label: "Name" },
      { key: "company_name", label: "Company" },
      { key: "role", label: "Role" },
      { key: "next_follow_up_date", label: "Next follow-up" },
      { key: "referral_status", label: "Referral" },
    ],
    sortOptions: [
      { key: "name", label: "Name", type: "text" },
      { key: "company_name", label: "Company", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "relationship_strength", label: "Relationship strength", type: "number" },
      { key: "last_contact_date", label: "Last contact", type: "date" },
      { key: "next_follow_up_date", label: "Next follow-up", type: "date" },
      { key: "referral_status", label: "Referral status", type: "text", order: ["Not Asked", "Asked", "Agreed", "Submitted", "Declined"] },
      { key: "priority", label: "Priority", type: "text", order: ["Low", "Medium", "High"] },
      { key: "created_at", label: "Created", type: "date" },
    ],
    defaultSort: { key: "next_follow_up_date", direction: "asc" },
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "company_id", label: "Company", type: "select", options: getCompanyOptions },
      { key: "role", label: "Role", type: "text" },
      { key: "source", label: "Source", type: "text" },
      { key: "relationship_strength", label: "Relationship strength", type: "number", min: 1, max: 5 },
      { key: "how_i_know_them", label: "How I know them", type: "textarea" },
      { key: "tags", label: "Tags", type: "multiselect", options: ["Cornell", "Cornell Johnson", "Alum", "Israeli", "High Tech Club", "HPC Trek", "LinkedIn", "Friend", "Recruiter", "Hiring Manager", "Professor", "Company Event", "Other"] },
      { key: "email", label: "Email", type: "text" },
      { key: "linkedin_url", label: "LinkedIn URL", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "last_contact_date", label: "Last contact date", type: "date" },
      { key: "next_follow_up_date", label: "Next follow-up date", type: "date" },
      { key: "conversation_notes", label: "Conversation notes", type: "textarea" },
      { key: "linked_application_ids", label: "Linked applications", type: "multiselect", options: getApplicationOptions },
      { key: "can_refer", label: "Can refer", type: "select", options: ["Yes", "No", "Maybe"] },
      { key: "referral_status", label: "Referral status", type: "select", options: ["Not Asked", "Asked", "Agreed", "Submitted", "Declined"] },
      { key: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High"] },
    ],
    defaultValues: {
      name: "",
      company_id: "",
      company_name: "",
      role: "",
      source: "",
      relationship_strength: 3,
      how_i_know_them: "",
      tags: [],
      email: "",
      linkedin_url: "",
      location: "",
      last_contact_date: "",
      next_follow_up_date: "",
      conversation_notes: "",
      linked_application_ids: [],
      can_refer: "Maybe",
      referral_status: "Not Asked",
      priority: "Medium",
    },
  },
  pars: {
    slug: "pars",
    title: "STAR Stories",
    singular: "STAR Story",
    collection: "parStories",
    description: "Build, practice, and map STAR stories across multiple behavioral questions.",
    titleKey: "title",
    searchKeys: ["title", "status", "weakness_or_focus_area", "notes", "follow_up_questions"],
    columns: [
      { key: "title", label: "Title" },
      { key: "linked_question_ids", label: "Questions" },
      { key: "status", label: "Status" },
      { key: "confidence_score", label: "Confidence" },
      { key: "last_practiced_date", label: "Last practiced" },
    ],
    sortOptions: [
      { key: "title", label: "Title", type: "text" },
      { key: "linked_question_ids", label: "Questions covered", type: "array" },
      { key: "status", label: "Status", type: "text", order: ["Draft", "Good", "Strong", "Interview-Ready"] },
      { key: "confidence_score", label: "Confidence score", type: "number" },
      { key: "number_of_reps", label: "Number of reps", type: "number" },
      { key: "last_practiced_date", label: "Last practiced", type: "date" },
      { key: "created_at", label: "Created", type: "date" },
    ],
    defaultSort: { key: "last_practiced_date", direction: "asc" },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "linked_question_ids", label: "Questions this story can answer", type: "multiselect", options: (data) => data.interviewQuestions.map((question) => ({ label: question.question_text, value: question.id })) },
      { key: "situation", label: "Situation", type: "textarea" },
      { key: "problem", label: "Task", type: "textarea" },
      { key: "action", label: "Action", type: "textarea" },
      { key: "result", label: "Result", type: "textarea" },
      { key: "polished_answer", label: "Polished answer", type: "textarea" },
      { key: "confidence_score", label: "Confidence score", type: "number", min: 1, max: 5 },
      { key: "last_practiced_date", label: "Last practiced", type: "date" },
      { key: "number_of_reps", label: "Number of reps", type: "number", min: 0, max: 999 },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Good", "Strong", "Interview-Ready"] },
      { key: "weakness_or_focus_area", label: "Weakness or focus", type: "textarea" },
      { key: "notes", label: "Notes", type: "textarea" },
      { key: "follow_up_questions", label: "Follow-up questions", type: "textarea" },
    ],
    defaultValues: {
      title: "",
      situation: "",
      problem: "",
      action: "",
      result: "",
      polished_answer: "",
      confidence_score: 3,
      last_practiced_date: "",
      number_of_reps: 0,
      status: "Draft",
      weakness_or_focus_area: "",
      notes: "",
      follow_up_questions: "",
      linked_question_ids: [],
    },
  },
  resumes: {
    slug: "resumes",
    title: "Resumes",
    singular: "Resume Version",
    collection: "resumes",
    description: "Track resume versions and where they are used.",
    titleKey: "name",
    searchKeys: ["name", "target_role", "positioning", "notes"],
    columns: [
      { key: "name", label: "Name" },
      { key: "target_role", label: "Target role" },
      { key: "last_updated_date", label: "Updated" },
      { key: "linked_application_ids", label: "Used in" },
    ],
    sortOptions: [
      { key: "name", label: "Name", type: "text" },
      { key: "target_role", label: "Target role", type: "text" },
      { key: "last_updated_date", label: "Last updated", type: "date" },
      { key: "linked_application_ids", label: "Used in applications", type: "array" },
      { key: "created_at", label: "Created", type: "date" },
    ],
    defaultSort: { key: "last_updated_date", direction: "desc" },
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "target_role", label: "Target role", type: "select", options: ["PM", "TPM", "Product Strategy", "AI/Enterprise Software", "Consulting/Strategy", "General"] },
      { key: "file_link", label: "Resume PDF link", type: "text" },
      { key: "last_updated_date", label: "Last updated", type: "date" },
      { key: "positioning", label: "Positioning", type: "textarea" },
      { key: "notes", label: "Notes", type: "textarea" },
      { key: "linked_application_ids", label: "Linked applications", type: "multiselect", options: getApplicationOptions },
    ],
    defaultValues: {
      name: "",
      target_role: "General",
      file_link: "",
      last_updated_date: "",
      positioning: "",
      notes: "",
      linked_application_ids: [],
    },
  },
  "outreach-templates": {
    slug: "outreach-templates",
    title: "Outreach Templates",
    singular: "Outreach Template",
    collection: "outreachTemplates",
    description: "Reusable recruiting messages and follow-up templates.",
    titleKey: "name",
    searchKeys: ["name", "use_case", "target_audience", "template_text"],
    columns: [
      { key: "name", label: "Name" },
      { key: "use_case", label: "Use case" },
      { key: "target_audience", label: "Audience" },
      { key: "last_used_date", label: "Last used" },
    ],
    sortOptions: [
      { key: "name", label: "Name", type: "text" },
      { key: "use_case", label: "Use case", type: "text" },
      { key: "target_audience", label: "Target audience", type: "text" },
      { key: "last_used_date", label: "Last used", type: "date" },
      { key: "created_at", label: "Created", type: "date" },
    ],
    defaultSort: { key: "last_used_date", direction: "desc" },
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "use_case", label: "Use case", type: "select", options: ["Cold LinkedIn message", "Cornell alum message", "Israeli connection message", "Referral ask", "Follow-up after call", "Rejection-to-networking message", "Recruiter email", "Hiring manager email", "Thank-you note", "Interview thank-you note"] },
      { key: "target_audience", label: "Target audience", type: "text" },
      { key: "template_text", label: "Template text", type: "textarea" },
      { key: "last_used_date", label: "Last used date", type: "date" },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
    defaultValues: {
      name: "",
      use_case: "Cold LinkedIn message",
      template_text: "",
      target_audience: "",
      last_used_date: "",
      notes: "",
    },
  },
  "brain-dump": {
    slug: "brain-dump",
    title: "Brain Dump",
    singular: "Brain Dump",
    collection: "brainDumps",
    description: "Quick capture for tasks and ideas that can convert into action items.",
    titleKey: "title",
    searchKeys: ["title", "note", "category"],
    columns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "converted_action_item_id", label: "Converted" },
    ],
    sortOptions: [
      { key: "title", label: "Title", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "converted_action_item_id", label: "Converted", type: "boolean" },
      { key: "created_at", label: "Created", type: "date" },
      { key: "updated_at", label: "Updated", type: "date" },
    ],
    defaultSort: { key: "created_at", direction: "desc" },
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "note", label: "Note", type: "textarea" },
      { key: "category", label: "Category", type: "select", options: BRAIN_DUMP_CATEGORIES },
      { key: "linked_contact_id", label: "Linked contact", type: "select", options: getContactOptions },
      { key: "linked_company_id", label: "Linked company", type: "select", options: getCompanyOptions },
      { key: "linked_application_id", label: "Linked application", type: "select", options: getApplicationOptions },
      { key: "linked_par_id", label: "Linked STAR", type: "select", options: getPAROptions },
      { key: "linked_case_id", label: "Linked case", type: "select", options: getCaseOptions },
      { key: "linked_mock_interview_id", label: "Linked mock interview", type: "select", options: (data) => data.mockInterviews.map((item) => ({ label: `${formatDate(item.date)} · ${item.interview_type}`, value: item.id })) },
      { key: "linked_resume_id", label: "Linked resume", type: "select", options: getResumeOptions },
      { key: "linked_interview_prep_id", label: "Linked interview prep", type: "select", options: getInterviewPrepOptions },
    ],
    defaultValues: {
      title: "",
      note: "",
      category: "General",
      converted_action_item_id: "",
      linked_contact_id: "",
      linked_company_id: "",
      linked_application_id: "",
      linked_par_id: "",
      linked_case_id: "",
      linked_mock_interview_id: "",
      linked_resume_id: "",
      linked_interview_prep_id: "",
    },
  },
};

export function resolveOptions(
  options: FieldConfig["options"],
  data: RecruitOSData,
): Option[] {
  if (!options) return [];
  if (typeof options === "function") return options(data);
  return options.map((value) => ({ label: value, value }));
}

export function normalizeText(text: string) {
  return text.toLowerCase().trim();
}

export function matchesSearch(value: unknown, query: string) {
  if (!query) return true;
  if (value == null) return false;
  const haystack = Array.isArray(value) ? value.join(" ") : String(value);
  return normalizeText(haystack).includes(normalizeText(query));
}

export function searchModuleRecords(
  data: RecruitOSData,
  module: CrudModuleSlug,
  query: string,
) {
  const config = MODULE_CONFIGS[module];
  const collection = data[config.collection] as unknown as Array<Record<string, unknown>>;
  return collection.filter((record) =>
    config.searchKeys.some((key) => matchesSearch(record[key], query)),
  );
}

export function sortParSuggestions(items: PARStory[]) {
  return [...items].sort((left, right) => {
    const leftScore =
      left.confidence_score * 10 +
      left.number_of_reps * 5 +
      (left.status === "Interview-Ready" ? 25 : 0) +
      (left.last_practiced_date ? new Date(left.last_practiced_date).getTime() / 1_000_000_000_000 : 0);
    const rightScore =
      right.confidence_score * 10 +
      right.number_of_reps * 5 +
      (right.status === "Interview-Ready" ? 25 : 0) +
      (right.last_practiced_date ? new Date(right.last_practiced_date).getTime() / 1_000_000_000_000 : 0);
    return leftScore - rightScore;
  });
}

export function sortCaseSuggestions(items: CasePractice[]) {
  return [...items].sort((left, right) => {
    const leftScore =
      left.score * 8 +
      (left.redo_needed ? -10 : 0) +
      (left.date ? new Date(left.date).getTime() / 1_000_000_000_000 : 0);
    const rightScore =
      right.score * 8 +
      (right.redo_needed ? -10 : 0) +
      (right.date ? new Date(right.date).getTime() / 1_000_000_000_000 : 0);
    return leftScore - rightScore;
  });
}

export function calculateReadinessScore(actionItems: ActionItem[], prepId: string) {
  const linked = actionItems.filter(
    (item) => item.linked_interview_prep_id === prepId,
  );
  if (!linked.length) return 0;
  const completed = linked.filter(isActionDone).length;
  return progressPercentage(completed, linked.length);
}

export function getLinkedActionItems(
  data: RecruitOSData,
  module: CrudModuleSlug,
  recordId: string,
) {
  return data.actionItems.filter((item) => {
    if (item.source_id === recordId) return true;
    switch (module) {
      case "applications":
        return item.linked_application_id === recordId;
      case "companies":
        return item.linked_company_id === recordId;
      case "networking":
        return item.linked_contact_id === recordId;
      case "pars":
        return item.linked_par_id === recordId;
      case "cases":
        return item.linked_case_id === recordId;
      case "mock-interviews":
        return item.linked_mock_interview_id === recordId;
      case "resumes":
        return item.linked_resume_id === recordId;
      case "interview-prep":
        return item.linked_interview_prep_id === recordId;
      case "interview-answers":
        return item.linked_interview_answer_id === recordId;
      case "outreach-templates":
        return item.source_type === "Outreach Template" && item.source_id === recordId;
      case "action-items":
      case "brain-dump":
        return false;
      default:
        return false;
    }
  });
}

export function getSourceSummary(data: RecruitOSData, actionItem: ActionItem) {
  if (actionItem.linked_application_id) {
    const application = data.applications.find(
      (item) => item.id === actionItem.linked_application_id,
    );
    if (application) {
      return `${application.company_name} · ${application.role_title}`;
    }
  }
  if (actionItem.linked_contact_id) {
    const contact = data.contacts.find((item) => item.id === actionItem.linked_contact_id);
    if (contact) {
      return `${contact.name}${contact.company_name ? ` · ${contact.company_name}` : ""}`;
    }
  }
  if (actionItem.linked_company_id) {
    return lookupCompanyName(data, actionItem.linked_company_id);
  }
  if (actionItem.linked_par_id) {
    return data.parStories.find((item) => item.id === actionItem.linked_par_id)?.title ?? "";
  }
  if (actionItem.linked_case_id) {
    return data.cases.find((item) => item.id === actionItem.linked_case_id)?.title ?? "";
  }
  if (actionItem.linked_interview_prep_id) {
    const prep = data.interviewPrep.find((item) => item.id === actionItem.linked_interview_prep_id);
    if (prep) {
      return `${lookupCompanyName(data, prep.company_id)} · ${formatDateTime(prep.interview_date)}`;
    }
  }
  return actionItem.source_type;
}

function clampScore(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function uniqueInsightStrings(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function dateDiffFromToday(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
}

function formatRelativeDateLabel(value?: string | null) {
  const diff = dateDiffFromToday(value);
  if (diff == null) return "No due date";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  if (diff <= 7) return `Due in ${diff}d`;
  return formatDate(value);
}

function applicationHasInterviewSignal(data: RecruitOSData, applicationId: string) {
  return data.interviewPrep.some((prep) => prep.application_id === applicationId);
}

function getApplicationCompany(data: RecruitOSData, application: Application) {
  return data.companies.find((company) => company.id === application.company_id) ?? null;
}

function getApplicationContacts(data: RecruitOSData, application: Application) {
  return data.contacts.filter(
    (contact) =>
      contact.id === application.referral_person_contact_id ||
      application.linked_contact_ids.includes(contact.id) ||
      contact.linked_application_ids.includes(application.id),
  );
}

function splitMultilineText(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getApplicationInsights(data: RecruitOSData): ApplicationInsight[] {
  return [...data.applications]
    .map((application) => {
      const company = getApplicationCompany(data, application);
      const linkedContacts = getApplicationContacts(data, application);
      const openActionItems = getLinkedActionItems(data, "applications", application.id).filter(
        (item) => !isActionDone(item),
      );
      const hasWarmContact = linkedContacts.some(
        (contact) =>
          contact.relationship_strength >= 4 ||
          ["Asked", "Agreed", "Submitted"].includes(contact.referral_status),
      );
      const hasInterviewSignal = applicationHasInterviewSignal(data, application.id);
      const deadlineDiff = dateDiffFromToday(application.deadline);
      const followUpDiff = dateDiffFromToday(application.follow_up_date);
      const appliedAge = dateDiffFromToday(application.date_applied);
      const referralAge = dateDiffFromToday(application.referral_date);
      const riskFlags: string[] = [];
      let score = 0;

      if (company?.priority === "High" || application.priority === "High") score += 18;
      if (company?.role_fit && TARGET_ROLES.includes(company.role_fit)) score += 8;
      if (hasWarmContact) score += 14;
      if (hasInterviewSignal) score += 16;
      if (application.status === "Ready to Apply") score += 18;
      if (application.status === "Interviewing") score += 20;
      if (application.status === "Assessment") score += 15;
      if (application.status === "Final Round") score += 24;
      if (deadlineDiff != null && deadlineDiff <= 7) {
        score += 20;
        riskFlags.push("deadline soon");
      }
      if (deadlineDiff != null && deadlineDiff < 0) riskFlags.push("deadline passed");
      if (application.referral_needed && application.referral_status !== "Submitted") {
        score += 10;
        riskFlags.push("no referral despite referral needed");
      }
      if (company?.visa_friendliness === "Unknown") score -= 2;
      if (company?.visa_friendliness === "Medium") score -= 5;
      if (company?.visa_friendliness === "Low" || company?.visa_friendliness === "Weak") {
        score -= 10;
        riskFlags.push("visa fit weak");
      }
      if (company?.recruiting_timeline === "Just-in-Time") {
        score += 6;
        riskFlags.push("just-in-time timeline");
      }
      if (followUpDiff != null && followUpDiff < 0) {
        score += 16;
        riskFlags.push("stale follow-up");
      }
      if (openActionItems.some((item) => isDueTodayOrOverdue(item.due_date))) {
        score += 12;
        riskFlags.push("urgent linked action");
      }
      if (hasWarmContact) riskFlags.push("strong contact exists");
      if (company?.priority === "High" || application.priority === "High") {
        riskFlags.push("company marked high priority");
      }
      if (hasInterviewSignal) riskFlags.push("interview activity already exists");

      let label: ApplicationStrategyLabel = "Apply This Week";
      if (
        (company?.priority === "Low" || application.priority === "Low") &&
        !hasWarmContact &&
        !hasInterviewSignal &&
        (company?.visa_friendliness === "Low" || company?.visa_friendliness === "Weak" || application.start_date_compatibility === "Weak")
      ) {
        label = "Drop";
      } else if (
        application.status === "Applied" &&
        ((appliedAge != null && appliedAge <= -10) ||
          (referralAge != null && referralAge <= -10 && application.referral_status !== "Submitted"))
      ) {
        label = "Waiting Too Long";
      } else if (
        ["Applied", "Interviewing", "Assessment", "Final Round"].includes(application.status) &&
        ((!application.next_step && !application.follow_up_date) ||
          (followUpDiff != null && followUpDiff < 0))
      ) {
        label = "At Risk";
      } else if (
        (application.status === "Target" && hasWarmContact && !application.date_applied) ||
        (application.referral_needed && application.referral_status !== "Submitted")
      ) {
        label = "Network First";
      } else if (
        (company?.priority === "High" || application.priority === "High") &&
        (hasWarmContact || hasInterviewSignal)
      ) {
        label = "Double Down";
      } else if (
        application.status === "Ready to Apply" ||
        (deadlineDiff != null && deadlineDiff >= 0 && deadlineDiff <= 7)
      ) {
        label = "Apply This Week";
      }

      const primaryReasonByLabel: Record<ApplicationStrategyLabel, string> = {
        "Double Down": hasInterviewSignal
          ? "You already have momentum here. Push the highest-leverage next step."
          : "This is a high-priority target with warm access. Invest more energy here now.",
        "Apply This Week":
          deadlineDiff != null && deadlineDiff >= 0 && deadlineDiff <= 7
            ? "The deadline is close enough that this should move now."
            : "This role is close to ready and should leave the dashboard soon.",
        "Network First":
          "A warm path or unresolved referral can improve the odds before applying.",
        "At Risk":
          "This process has momentum, but it can stall without a concrete next step.",
        "Waiting Too Long":
          "Too much time has passed since the last meaningful recruiting touchpoint.",
        Drop: "The fit and traction look weak relative to other places you could spend effort.",
      };

      return {
        application,
        company,
        linkedContacts,
        openActionItems,
        applicationPriorityScore: clampScore(score),
        applicationStrategyLabel: label,
        applicationRiskFlags: uniqueInsightStrings(riskFlags),
        primaryReason: primaryReasonByLabel[label],
        dueLabel: formatRelativeDateLabel(application.follow_up_date || application.deadline),
        hasWarmContact,
        hasInterviewSignal,
      };
    })
    .sort((left, right) => right.applicationPriorityScore - left.applicationPriorityScore);
}

export function getNetworkingWorkflowInsights(data: RecruitOSData): ContactWorkflowInsight[] {
  return [...data.contacts]
    .map((contact) => {
      const company = data.companies.find((item) => item.id === contact.company_id) ?? null;
      const linkedApplications = data.applications.filter(
        (application) =>
          application.referral_person_contact_id === contact.id ||
          application.linked_contact_ids.includes(contact.id) ||
          contact.linked_application_ids.includes(application.id),
      );
      const nextFollowUpDiff = dateDiffFromToday(contact.next_follow_up_date);
      const lastTouchDiff = dateDiffFromToday(contact.last_contact_date);
      let urgency = contact.relationship_strength * 8;
      let nextAction: ContactNextActionLabel = "Send Outreach";
      let primaryReason = "Open a relationship with a targeted outreach note.";

      if (nextFollowUpDiff != null && nextFollowUpDiff < 0) {
        urgency += 35;
        nextAction = "Follow Up Now";
        primaryReason = "This relationship is due for a follow-up now.";
      } else if (
        linkedApplications.some((application) => application.referral_needed) &&
        contact.can_refer === "Yes" &&
        !["Agreed", "Submitted"].includes(contact.referral_status)
      ) {
        urgency += 32;
        nextAction = "Ask For Referral";
        primaryReason = "This person can help unlock a live application.";
      } else if (
        nextFollowUpDiff != null &&
        nextFollowUpDiff >= 0 &&
        nextFollowUpDiff <= 2
      ) {
        urgency += 24;
        nextAction = "Prep For Conversation";
        primaryReason = "There is an upcoming touchpoint worth preparing for.";
      } else if (
        linkedApplications.length === 0 &&
        (company?.priority === "High" || contact.priority === "High")
      ) {
        urgency += 20;
        nextAction = "Convert To Application";
        primaryReason = "This relationship is warm enough to turn into an application path.";
      } else if (lastTouchDiff != null && lastTouchDiff <= -1 && !contact.conversation_notes) {
        urgency += 14;
        nextAction = "Log Takeaways";
        primaryReason = "Capture the last conversation before the details fade.";
      }

      const companyLabel = company?.name || contact.company_name || "this company";
      return {
        contact,
        company,
        linkedApplications,
        contactFollowUpUrgency: clampScore(urgency),
        contactNextBestAction: nextAction,
        primaryReason,
        whyThisPersonMatters:
          contact.how_i_know_them || `${contact.name} can help you navigate ${companyLabel}.`,
        askPrompt:
          nextAction === "Ask For Referral"
            ? `Ask ${contact.name} what would make a referral easy for them to support.`
            : `Ask ${contact.name} about the role, team, and how candidates stand out at ${companyLabel}.`,
        sendPrompt:
          nextAction === "Follow Up Now"
            ? `Send a short update, gratitude, and one clear next ask to ${contact.name}.`
            : `Send a light, specific message that gives ${contact.name} an easy reply path.`,
      };
    })
    .sort((left, right) => right.contactFollowUpUrgency - left.contactFollowUpUrgency);
}

function getSuggestedParsForPrep(
  data: RecruitOSData,
  prep: InterviewPrep,
  _application: Application | null,
) {
  void _application;
  const explicit = prep.linked_par_story_ids
    .map((id) => data.parStories.find((par) => par.id === id))
    .filter((item): item is PARStory => Boolean(item));
  if (explicit.length) return explicit;

  return [...data.parStories]
    .sort((left, right) => {
      const leftScore =
        (left.status === "Interview-Ready" ? 30 : 0) +
        left.confidence_score * 12 +
        left.number_of_reps * 8 +
        left.linked_question_ids.length * 5 +
        (left.last_practiced_date ? 18 : 0);
      const rightScore =
        (right.status === "Interview-Ready" ? 30 : 0) +
        right.confidence_score * 12 +
        right.number_of_reps * 8 +
        right.linked_question_ids.length * 5 +
        (right.last_practiced_date ? 18 : 0);
      return leftScore - rightScore;
    })
    .slice(0, 4);
}

function getSuggestedAnswersForPrep(
  data: RecruitOSData,
  prep: InterviewPrep,
  application: Application | null,
) {
  const explicit = prep.linked_interview_answer_ids
    .map((id) => data.interviewAnswers.find((answer) => answer.id === id))
    .filter((item): item is InterviewAnswer => Boolean(item));
  if (explicit.length) return explicit;

  return [...data.interviewAnswers]
    .filter((answer) => {
      if (answer.linked_interview_prep_ids.includes(prep.id)) return true;
      if (application && answer.linked_application_ids.includes(application.id)) return true;
      if (!application?.function) return true;
      return normalizeText(answer.target_role).includes(normalizeText(application.function));
    })
    .sort((left, right) => right.confidence_score - left.confidence_score)
    .slice(0, 4);
}

export function buildInterviewPrepPacket(
  data: RecruitOSData,
  prepId: string,
): InterviewPrepPacket | null {
  const prep = data.interviewPrep.find((item) => item.id === prepId);
  if (!prep) return null;
  const company = data.companies.find((item) => item.id === prep.company_id) ?? null;
  const application = data.applications.find((item) => item.id === prep.application_id) ?? null;
  const recommendedPars = getSuggestedParsForPrep(data, prep, application);
  const recommendedAnswers = getSuggestedAnswersForPrep(data, prep, application);
  const linkedCases = prep.linked_case_ids
    .map((id) => data.cases.find((item) => item.id === id))
    .filter((item): item is CasePractice => Boolean(item));
  const openPrepActionItems = getLinkedActionItems(data, "interview-prep", prep.id).filter(
    (item) => !isActionDone(item),
  );
  const likelyQuestions = splitMultilineText(prep.likely_questions);
  const questionsToAsk = splitMultilineText(prep.questions_to_ask_interviewer);
  const gaps: InterviewPrepGap[] = [];

  if (!recommendedPars.length) gaps.push("No linked STARs");
  if (!recommendedAnswers.length) gaps.push("No linked answers");
  if (!(prep.company_notes || company?.company_research_notes || company?.why_this_company)) {
    gaps.push("No company notes");
  }
  if (!questionsToAsk.length) gaps.push("No interviewer questions");
  if (prep.readiness_score < 70) gaps.push("Readiness below threshold");

  let completenessScore = 100;
  completenessScore -= gaps.length * 12;
  if (!linkedCases.length && prep.interview_type.toLowerCase().includes("case")) {
    completenessScore -= 10;
  }

  return {
    prep,
    company,
    application,
    recommendedPars,
    recommendedAnswers,
    linkedCases,
    openPrepActionItems,
    likelyQuestions,
    questionsToAsk,
    gaps,
    completenessScore: clampScore(completenessScore),
  };
}

export function getTopPriorityQueue(data: RecruitOSData): PriorityQueueItem[] {
  const applicationItems: PriorityQueueItem[] = getApplicationInsights(data).slice(0, 6).map(
    (insight) => ({
      id: `application-${insight.application.id}`,
      kind: "application",
      title: `${insight.application.company_name} - ${insight.application.role_title}`,
      subtitle: insight.application.status,
      recommendation: insight.applicationStrategyLabel,
      reason: insight.primaryReason,
      urgencyScore: insight.applicationPriorityScore,
      badge: insight.dueLabel,
      linkedId: insight.application.id,
    }),
  );
  const contactItems: PriorityQueueItem[] = getNetworkingWorkflowInsights(data).slice(0, 4).map(
    (insight) => ({
      id: `contact-${insight.contact.id}`,
      kind: "contact",
      title: `${insight.contact.name} - ${insight.company?.name || insight.contact.company_name || "Networking"}`,
      subtitle: insight.contact.role || "Contact",
      recommendation: insight.contactNextBestAction,
      reason: insight.primaryReason,
      urgencyScore: insight.contactFollowUpUrgency,
      badge: formatRelativeDateLabel(insight.contact.next_follow_up_date),
      linkedId: insight.contact.id,
    }),
  );
  const prepItems: PriorityQueueItem[] = data.interviewPrep
    .map((prep) => buildInterviewPrepPacket(data, prep.id))
    .filter((packet): packet is InterviewPrepPacket => Boolean(packet))
    .filter((packet) => {
      const diff = dateDiffFromToday(packet.prep.interview_date);
      return diff != null && diff >= 0 && diff <= 7;
    })
    .map((packet) => ({
      id: `prep-${packet.prep.id}`,
      kind: "interview-prep" as const,
      title: `${packet.company?.name || "Interview"} - ${packet.prep.interview_round || packet.prep.interview_type}`,
      subtitle: packet.prep.interview_type || "Interview Prep",
      recommendation: packet.gaps.length ? "Close Prep Gaps" : "Interview Ready",
      reason: packet.gaps.length
        ? `Focus on ${packet.gaps[0].toLowerCase()} before the interview.`
        : "Your prep packet is in good shape. Use today to rehearse.",
      urgencyScore: clampScore(90 - (dateDiffFromToday(packet.prep.interview_date) ?? 0) * 8),
      badge: formatRelativeDateLabel(packet.prep.interview_date),
      linkedId: packet.prep.id,
    }));

  return [...applicationItems, ...contactItems, ...prepItems]
    .sort((left, right) => right.urgencyScore - left.urgencyScore)
    .slice(0, 8);
}
