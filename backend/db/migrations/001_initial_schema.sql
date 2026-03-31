CREATE TABLE applications (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  salary TEXT NOT NULL DEFAULT '',
  application_date TEXT NOT NULL DEFAULT '',
  deadline TEXT NOT NULL DEFAULT '',
  job_url TEXT NOT NULL DEFAULT '',
  next_step TEXT NOT NULL DEFAULT '',
  next_step_date TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  how_we_met TEXT NOT NULL DEFAULT '',
  last_contact_date TEXT NOT NULL DEFAULT '',
  next_follow_up_date TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE case_sessions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  case_type TEXT NOT NULL,
  firm_style TEXT NOT NULL,
  method TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT '',
  duration_minutes TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  rating TEXT NOT NULL DEFAULT '0',
  what_went_well TEXT NOT NULL DEFAULT '',
  what_to_improve TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  linked_contact_id TEXT NOT NULL DEFAULT '',
  partner_label TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE tips (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE cadence_rules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  cadence_type TEXT NOT NULL,
  interval_unit TEXT NOT NULL,
  interval_value INTEGER NOT NULL,
  active INTEGER NOT NULL,
  last_completed_date TEXT NOT NULL DEFAULT '',
  next_due_date TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE activity_events (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  action_type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  timestamp TEXT NOT NULL
);

CREATE TABLE settings (
  id TEXT PRIMARY KEY,
  recent_activity_limit INTEGER NOT NULL
);

CREATE TABLE application_contacts (
  application_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  PRIMARY KEY (application_id, contact_id),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE TABLE tip_applications (
  tip_id TEXT NOT NULL,
  application_id TEXT NOT NULL,
  PRIMARY KEY (tip_id, application_id),
  FOREIGN KEY (tip_id) REFERENCES tips(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE TABLE tip_contacts (
  tip_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  PRIMARY KEY (tip_id, contact_id),
  FOREIGN KEY (tip_id) REFERENCES tips(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);

CREATE TABLE tip_case_sessions (
  tip_id TEXT NOT NULL,
  case_session_id TEXT NOT NULL,
  PRIMARY KEY (tip_id, case_session_id),
  FOREIGN KEY (tip_id) REFERENCES tips(id) ON DELETE CASCADE,
  FOREIGN KEY (case_session_id) REFERENCES case_sessions(id) ON DELETE CASCADE
);
