const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const MIGRATIONS_DIR = path.join(__dirname, "migrations");
const DB_PATH = path.join(DATA_DIR, "recruitos.sqlite");

const DEFAULT_CADENCES = [
  { id: "cadence-case", title: "Log a case session", cadenceType: "Case practice", intervalUnit: "days", intervalValue: 2, active: 1 },
  { id: "cadence-followup", title: "Review networking follow-ups", cadenceType: "Networking", intervalUnit: "days", intervalValue: 3, active: 1 }
];

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");

function initializeDatabase() {
  ensureSchemaMigrationsTable();
  baselineLegacySchema();
  runPendingMigrations();
  seedDefaults();
}

function ensureSchemaMigrationsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
}

function baselineLegacySchema() {
  const appliedIds = new Set(getAppliedMigrationIds());
  if (appliedIds.size > 0) return;
  if (!hasAnyLegacyAppTables()) return;

  const baselines = [];
  if (hasCoreSchema()) {
    baselines.push(["001", "001_initial_schema.sql"]);
  }
  if (hasTable("contact_interactions")) {
    baselines.push(["002", "002_add_contact_interactions.sql"]);
  }

  if (!baselines.length) return;

  const insert = db.prepare("INSERT OR IGNORE INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)");
  const now = new Date().toISOString();
  const transaction = db.transaction(() => {
    for (const [id, name] of baselines) {
      insert.run(id, name, now);
    }
  });
  transaction();
  console.log(`RecruitOS baselined legacy schema with migrations: ${baselines.map((entry) => entry[1]).join(", ")}`);
}

function runPendingMigrations() {
  const migrations = getMigrationFiles();
  const appliedIds = new Set(getAppliedMigrationIds());
  const pending = migrations.filter((migration) => !appliedIds.has(migration.id));
  if (!pending.length) return;

  createBackup();

  for (const migration of pending) {
    const sql = fs.readFileSync(migration.fullPath, "utf8");
    const applyMigration = db.transaction(() => {
      db.exec(sql);
      db.prepare("INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)")
        .run(migration.id, migration.name, new Date().toISOString());
    });

    try {
      applyMigration();
      console.log(`RecruitOS applied migration ${migration.name}`);
    } catch (error) {
      console.error(`RecruitOS failed to apply migration ${migration.name}`, error);
      throw error;
    }
  }
}

function getMigrationFiles() {
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort()
    .map((fileName) => ({
      id: fileName.split("_")[0],
      name: fileName,
      fullPath: path.join(MIGRATIONS_DIR, fileName)
    }));
}

function getAppliedMigrationIds() {
  return db.prepare("SELECT id FROM schema_migrations ORDER BY id ASC").all().map((row) => row.id);
}

function createBackup() {
  if (!fs.existsSync(DB_PATH)) return "";
  const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const backupPath = path.join(BACKUP_DIR, `recruitos-${timestamp}.sqlite`);
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`RecruitOS created database backup at ${backupPath}`);
  return backupPath;
}

function hasAnyLegacyAppTables() {
  return ["applications", "contacts", "case_sessions", "tips", "cadence_rules", "activity_events", "settings"]
    .some((tableName) => hasTable(tableName));
}

function hasCoreSchema() {
  return ["applications", "contacts", "case_sessions", "tips", "cadence_rules", "activity_events", "settings", "application_contacts", "tip_applications", "tip_contacts", "tip_case_sessions"]
    .every((tableName) => hasTable(tableName));
}

function hasTable(tableName) {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?").get(tableName);
  return Boolean(row);
}

function seedDefaults() {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  if (!db.prepare("SELECT COUNT(*) AS count FROM settings").get().count) {
    db.prepare("INSERT INTO settings (id, recent_activity_limit) VALUES (?, ?)").run("default", 6);
  }
  if (!db.prepare("SELECT COUNT(*) AS count FROM cadence_rules").get().count) {
    const insert = db.prepare(`
      INSERT INTO cadence_rules (
        id, title, cadence_type, interval_unit, interval_value, active,
        last_completed_date, next_due_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const rule of DEFAULT_CADENCES) {
      insert.run(rule.id, rule.title, rule.cadenceType, rule.intervalUnit, rule.intervalValue, rule.active, "", today, now, now);
    }
  }
}

module.exports = { db, DB_PATH, BACKUP_DIR, initializeDatabase };
