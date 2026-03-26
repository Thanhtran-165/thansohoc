/**
 * Database Service
 * SQLite database connection and query management for local-first storage
 *
 * NOTE: In Tauri, we use localStorage as a fallback since better-sqlite3
 * is a Node.js module and won't work in the webview context.
 * For production, consider using tauri-plugin-sql for proper SQLite support.
 */

import { logger } from '@utils/logger';

// Check if we're in a Node.js environment (can use SQLite)
const canUseSQLite = typeof process !== 'undefined' && process.versions?.node;

// Database instance (singleton)
let db: any = null;

// Database path
const DB_NAME = 'data.db';

// Lazy-loaded modules for Node.js environment
let Database: any = null;
let pathJoin: any = null;
let pathDirname: any = null;
let fsMkdirSync: any = null;
const LOCAL_TABLE_PREFIX = 'db_table_';
const runtimeImport = new Function('specifier', 'return import(specifier)') as (specifier: string) => Promise<any>;

function getLocalTableKey(table: string): string {
  return `${LOCAL_TABLE_PREFIX}${table}`;
}

function readLocalTable<T>(table: string): T[] {
  const raw = localStorage.getItem(getLocalTableKey(table));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalTable<T>(table: string, rows: T[]): void {
  localStorage.setItem(getLocalTableKey(table), JSON.stringify(rows));
}

function cloneRow<T>(row: T): T {
  return JSON.parse(JSON.stringify(row)) as T;
}

function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim();
}

function getTableName(sql: string, keyword: 'FROM' | 'INTO' | 'UPDATE'): string | null {
  const match = normalizeSql(sql).match(new RegExp(`${keyword} ([a-z_]+)`, 'i'));
  return match ? match[1] : null;
}

type LocalCondition = {
  column: string;
  operator: '=' | 'LIKE' | '<';
};

function parseWhereConditions(sql: string): LocalCondition[] {
  const normalized = normalizeSql(sql);
  const whereMatch = normalized.match(/ WHERE (.+?)( ORDER BY | LIMIT |$)/i);
  if (!whereMatch) return [];

  return whereMatch[1]
    .split(/\s+AND\s+/i)
    .map((part) => part.trim())
    .map((part) => {
      const match = part.match(/^([a-z_]+)\s*(=|LIKE|<)\s*\?$/i);
      if (!match) {
        return null;
      }

      return {
        column: match[1],
        operator: match[2].toUpperCase() as LocalCondition['operator'],
      };
    })
    .filter((condition): condition is LocalCondition => condition !== null);
}

function rowMatchesConditions(
  row: Record<string, unknown>,
  conditions: LocalCondition[],
  params: unknown[]
): boolean {
  return conditions.every((condition, index) => {
    const rowValue = row[condition.column];
    const paramValue = params[index];

    if (condition.operator === '=') {
      return rowValue === paramValue;
    }

    if (condition.operator === '<') {
      return String(rowValue) < String(paramValue);
    }

    const pattern = String(paramValue);
    if (pattern.endsWith('%')) {
      return String(rowValue).startsWith(pattern.slice(0, -1));
    }

    return String(rowValue) === pattern;
  });
}

function applyOrderAndLimit<T extends Record<string, unknown>>(sql: string, rows: T[]): T[] {
  const normalized = normalizeSql(sql);
  const orderMatch = normalized.match(/ ORDER BY ([a-z_]+) (ASC|DESC)/i);
  let result = [...rows];

  if (orderMatch) {
    const [, column, direction] = orderMatch;
    result.sort((a, b) => {
      const aValue = String(a[column] ?? '');
      const bValue = String(b[column] ?? '');
      return direction.toUpperCase() === 'DESC'
        ? bValue.localeCompare(aValue)
        : aValue.localeCompare(bValue);
    });
  }

  const limitMatch = normalized.match(/ LIMIT (\d+)/i);
  if (limitMatch) {
    result = result.slice(0, Number(limitMatch[1]));
  }

  return result;
}

function selectLocalRows<T extends Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const table = getTableName(sql, 'FROM');
  if (!table) return [];

  const rows = readLocalTable<T>(table);
  const filtered = rows.filter((row) => rowMatchesConditions(row, parseWhereConditions(sql), params));
  return applyOrderAndLimit(sql, filtered).map((row) => cloneRow(row));
}

function insertLocalRow(sql: string, params: unknown[]): any {
  const table = getTableName(sql, 'INTO');
  if (!table) return { changes: 0 };

  const normalized = normalizeSql(sql);
  const columnsMatch = normalized.match(/^[A-Z\s]*INSERT(?: OR REPLACE)? INTO [a-z_]+ \((.+?)\) VALUES/i);
  if (!columnsMatch) return { changes: 0 };

  const columns = columnsMatch[1].split(',').map((column) => column.trim());
  const row = Object.fromEntries(columns.map((column, index) => [column, params[index]]));

  const rows = readLocalTable<Record<string, unknown>>(table);
  const rowId = row.id;
  const existingIndex = rowId !== undefined
    ? rows.findIndex((existing) => existing.id === rowId)
    : -1;

  if (existingIndex >= 0) {
    rows[existingIndex] = row;
  } else {
    rows.push(row);
  }

  writeLocalTable(table, rows);
  return { changes: 1 };
}

function updateLocalRows(sql: string, params: unknown[]): any {
  const table = getTableName(sql, 'UPDATE');
  if (!table) return { changes: 0 };

  const normalized = normalizeSql(sql);
  const setMatch = normalized.match(/ SET (.+?) WHERE /i);
  if (!setMatch) return { changes: 0 };

  const assignments = setMatch[1]
    .split(',')
    .map((assignment) => assignment.trim())
    .map((assignment) => {
      const match = assignment.match(/^([a-z_]+)\s*=\s*\?$/i);
      return match ? match[1] : null;
    })
    .filter((column): column is string => column !== null);

  const whereConditions = parseWhereConditions(sql);
  const valueParams = params.slice(0, assignments.length);
  const whereParams = params.slice(assignments.length);

  const rows = readLocalTable<Record<string, unknown>>(table);
  let changes = 0;

  const updatedRows = rows.map((row) => {
    if (!rowMatchesConditions(row, whereConditions, whereParams)) {
      return row;
    }

    changes += 1;
    const updatedRow = { ...row };
    assignments.forEach((column, index) => {
      updatedRow[column] = valueParams[index];
    });
    return updatedRow;
  });

  writeLocalTable(table, updatedRows);
  return { changes };
}

function deleteLocalQueryRows(sql: string, params: unknown[]): any {
  const table = getTableName(sql, 'FROM');
  if (!table) return { changes: 0 };

  const rows = readLocalTable<Record<string, unknown>>(table);
  const conditions = parseWhereConditions(sql);
  const remainingRows = rows.filter((row) => !rowMatchesConditions(row, conditions, params));
  const changes = rows.length - remainingRows.length;
  writeLocalTable(table, remainingRows);
  return { changes };
}

export function isLocalStorageDatabase(database: any = db): boolean {
  return database?.type === 'localStorage';
}

export function getLocalTableRows<T>(table: string): T[] {
  return readLocalTable<T>(table).map((row) => cloneRow(row));
}

export function findLocalTableRow<T>(
  table: string,
  predicate: (row: T) => boolean
): T | undefined {
  return getLocalTableRows<T>(table).find(predicate);
}

export function upsertLocalTableRow<T extends { id: string }>(table: string, row: T): void {
  const rows = readLocalTable<T>(table);
  const existingIndex = rows.findIndex((existing) => existing.id === row.id);

  if (existingIndex >= 0) {
    rows[existingIndex] = row;
  } else {
    rows.push(row);
  }

  writeLocalTable(table, rows);
}

export function replaceLocalTableRows<T>(table: string, rows: T[]): void {
  writeLocalTable(table, rows);
}

export function deleteLocalTableRows<T>(
  table: string,
  predicate: (row: T) => boolean
): number {
  const rows = readLocalTable<T>(table);
  const remainingRows = rows.filter((row) => !predicate(row));
  const changes = rows.length - remainingRows.length;
  writeLocalTable(table, remainingRows);
  return changes;
}

export function getLocalAppDataSnapshot(): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};
  const knownKeys = new Set([
    'user_profile',
    'notification_preferences',
    'db_initialized',
    'app-schema-version',
    'app-fallback-mode',
    'app-onboarding-step',
  ]);

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;

    if (knownKeys.has(key) || key.startsWith(LOCAL_TABLE_PREFIX)) {
      const rawValue = localStorage.getItem(key);
      if (!rawValue) continue;

      try {
        snapshot[key] = JSON.parse(rawValue);
      } catch {
        snapshot[key] = rawValue;
      }
    }
  }

  return snapshot;
}

export function clearLocalAppData(): void {
  const keysToRemove: string[] = [];
  const knownKeys = new Set([
    'user_profile',
    'notification_preferences',
    'db_initialized',
    'app-schema-version',
    'app-fallback-mode',
    'app-onboarding-step',
  ]);

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key) continue;

    if (knownKeys.has(key) || key.startsWith(LOCAL_TABLE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

/**
 * Initialize Node.js modules (only in Node.js environment)
 */
async function loadNodeModules(): Promise<boolean> {
  if (!canUseSQLite) return false;

  try {
    const betterSqlite3 = await runtimeImport('better-sqlite3');
    Database = betterSqlite3.default;
    const path = await runtimeImport('path');
    pathJoin = path.join;
    pathDirname = path.dirname;
    const fs = await runtimeImport('fs');
    fsMkdirSync = fs.mkdirSync;
    return true;
  } catch (error) {
    logger.warn('Failed to load Node.js modules, using localStorage fallback');
    return false;
  }
}

/**
 * Get the database file path
 * In Tauri: uses appData directory
 * In browser dev: uses a temp path (for testing only)
 */
async function getDatabasePath(): Promise<string> {
  // Check if running in Tauri environment
  const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

  if (isTauri) {
    try {
      // Dynamic import for Tauri API v2 (only loads when in Tauri environment)
      const { appDataDir } = await import('@tauri-apps/api/path');
      const appDir = await appDataDir();
      return pathJoin(appDir, 'numerology-app', DB_NAME);
    } catch (error) {
      logger.warn('Tauri API not available, using fallback path');
    }
  }

  // Fallback for development without Tauri (web-only mode)
  logger.info('Running in web-only mode, using temp database path');
  return pathJoin(process.cwd(), 'temp-data', DB_NAME);
}

/**
 * Initialize the database connection and run migrations
 */
export async function initDatabase(): Promise<any> {
  if (db) {
    return db;
  }

  // Try to load SQLite in Node.js environment
  const useSQLite = await loadNodeModules();

  if (!useSQLite) {
    // Use localStorage as fallback (browser/Tauri webview)
    logger.info('Using localStorage as database fallback');
    db = { type: 'localStorage' };
    await runMigrationsLocalStorage();
    return db;
  }

  const dbPath = await getDatabasePath();
  logger.info(`Initializing database at: ${dbPath}`);

  try {
    // Ensure parent directory exists
    const dbDir = pathDirname(dbPath);
    fsMkdirSync(dbDir, { recursive: true });

    // Create database connection
    db = new Database(dbPath);

    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Run migrations
    await runMigrations(db);

    logger.info('Database initialized successfully');
    return db;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get the database instance
 * Throws if database is not initialized
 */
export function getDatabase(): any {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db && db.type !== 'localStorage') {
    db.close();
  }
  db = null;
  logger.info('Database connection closed');
}

/**
 * Run migrations for localStorage fallback
 */
async function runMigrationsLocalStorage(): Promise<void> {
  const initialized = localStorage.getItem('db_initialized');
  if (!initialized) {
    // Set default app settings
    const now = new Date().toISOString();
    localStorage.setItem('app-schema-version', JSON.stringify({ value: '1.0.0', updated_at: now }));
    localStorage.setItem('app-fallback-mode', JSON.stringify({ value: 'true', updated_at: now }));
    localStorage.setItem('app-onboarding-step', JSON.stringify({ value: '0', updated_at: now }));
    localStorage.setItem('db_initialized', 'true');
    logger.info('localStorage migrations completed');
  }

  const tables = [
    'analytics_events',
    'app_settings',
    'daily_insights',
    'fallback_cache',
    'insight_feedback',
    'journal_entries',
    'numerology_profiles',
    'why_this_insights',
  ];

  for (const table of tables) {
    const key = getLocalTableKey(table);
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, '[]');
    }
  }
}

/**
 * Run database migrations (SQLite only)
 */
async function runMigrations(database: any): Promise<void> {
  // Get current schema version
  let currentVersion = '0.0.0';
  try {
    const getVersion = database.prepare(`
      SELECT value FROM app_settings WHERE key = 'schema_version'
    `);
    const row = getVersion.get() as { value: string } | undefined;
    if (row) {
      currentVersion = JSON.parse(row.value);
    }
  } catch {
    // Table doesn't exist yet, fresh database
  }

  logger.info(`Current schema version: ${currentVersion}`);

  // Run migrations based on version
  // For MVP, we just run the initial schema
  if (currentVersion === '0.0.0') {
    runMigration001(database);
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      screen TEXT,
      payload TEXT,
      occurred_on TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  ensureColumnExists(database, 'why_this_insights', 'explanation', 'TEXT');
  ensureColumnExists(database, 'insight_feedback', 'tags', 'TEXT');

  // Future migrations would go here:
  // if (compareVersions(currentVersion, '1.0.0') < 0) { ... }
}

function ensureColumnExists(
  database: any,
  table: string,
  column: string,
  definition: string
): void {
  try {
    const columns = database.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    const hasColumn = columns.some((existing) => existing.name === column);

    if (!hasColumn) {
      database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      logger.info(`Added missing column ${column} to ${table}`);
    }
  } catch (error) {
    logger.warn(`Failed to verify column ${column} on ${table}`);
  }
}

/**
 * Migration 001: Initial Schema (SQLite only)
 */
function runMigration001(database: any): void {
  logger.info('Running migration 001: Initial schema');

  const migrations = database.transaction(() => {
    // UserProfile
    database.exec(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        style_preference TEXT NOT NULL CHECK(style_preference IN ('gentle', 'direct', 'practical', 'spiritual')),
        insight_length TEXT NOT NULL CHECK(insight_length IN ('brief', 'detailed')),
        language TEXT NOT NULL CHECK(language IN ('vi', 'en')),
        privacy_mode TEXT NOT NULL DEFAULT 'local_only',
        onboarding_completed INTEGER NOT NULL DEFAULT 0,
        onboarding_completed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // NumerologyProfile
    database.exec(`
      CREATE TABLE IF NOT EXISTS numerology_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        life_path INTEGER NOT NULL,
        destiny_number INTEGER NOT NULL,
        soul_urge INTEGER NOT NULL,
        personality_number INTEGER NOT NULL,
        birthday_number INTEGER NOT NULL,
        maturity_number INTEGER,
        calculated_at TEXT NOT NULL,
        calculation_version TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
      )
    `);

    // DailyInsight
    database.exec(`
      CREATE TABLE IF NOT EXISTS daily_insights (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        request_id TEXT NOT NULL,
        headline TEXT NOT NULL,
        theme TEXT NOT NULL,
        personal_day INTEGER NOT NULL,
        personal_month INTEGER NOT NULL,
        personal_year INTEGER NOT NULL,
        layers TEXT NOT NULL,
        confidence TEXT NOT NULL,
        metadata TEXT NOT NULL,
        is_fallback INTEGER NOT NULL DEFAULT 0,
        fallback_reason TEXT,
        generated_at TEXT NOT NULL,
        viewed_at TEXT,
        UNIQUE(user_id, date),
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
      )
    `);

    // WhyThisInsight
    database.exec(`
      CREATE TABLE IF NOT EXISTS why_this_insights (
        id TEXT PRIMARY KEY,
        insight_id TEXT NOT NULL UNIQUE,
        request_id TEXT NOT NULL,
        data_sources TEXT NOT NULL,
        calculated_claims TEXT NOT NULL,
        interpretation_basis TEXT NOT NULL,
        confidence_breakdown TEXT NOT NULL,
        explanation TEXT,
        generated_at TEXT NOT NULL,
        FOREIGN KEY (insight_id) REFERENCES daily_insights(id) ON DELETE CASCADE
      )
    `);

    // JournalEntry
    database.exec(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        mood_score INTEGER NOT NULL CHECK(mood_score BETWEEN 1 AND 10),
        energy_score INTEGER NOT NULL CHECK(energy_score BETWEEN 1 AND 10),
        emotions TEXT NOT NULL,
        reflection_text TEXT,
        key_events TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(user_id, date),
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
      )
    `);

    // InsightFeedback
    database.exec(`
      CREATE TABLE IF NOT EXISTS insight_feedback (
        id TEXT PRIMARY KEY,
        insight_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
        was_relevant INTEGER,
        was_helpful INTEGER,
        most_useful_claim_type TEXT,
        tags TEXT,
        feedback_text TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (insight_id) REFERENCES daily_insights(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
      )
    `);

    // NotificationPreferences
    database.exec(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        morning_insight_enabled INTEGER NOT NULL DEFAULT 1,
        morning_insight_time TEXT NOT NULL DEFAULT '06:30:00',
        evening_journal_enabled INTEGER NOT NULL DEFAULT 1,
        evening_journal_time TEXT NOT NULL DEFAULT '21:00:00',
        quiet_hours_enabled INTEGER NOT NULL DEFAULT 0,
        quiet_hours_start TEXT,
        quiet_hours_end TEXT,
        launch_on_startup INTEGER NOT NULL DEFAULT 1,
        sound_enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
      )
    `);

    // AnalyticsEvents
    database.exec(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT NOT NULL,
        screen TEXT,
        payload TEXT,
        occurred_on TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    // AppSettings
    database.exec(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id TEXT PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // FallbackCache
    database.exec(`
      CREATE TABLE IF NOT EXISTS fallback_cache (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        insight_id TEXT NOT NULL,
        original_date TEXT NOT NULL,
        insight_json TEXT NOT NULL,
        personal_day INTEGER NOT NULL,
        times_used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        last_used_at TEXT,
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (insight_id) REFERENCES daily_insights(id) ON DELETE CASCADE
      )
    `);

    // Indexes
    database.exec(`
      CREATE INDEX IF NOT EXISTS idx_daily_insights_user_date ON daily_insights(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_fallback_cache_user_date ON fallback_cache(user_id, original_date);
      CREATE INDEX IF NOT EXISTS idx_insight_feedback_insight ON insight_feedback(insight_id)
    `);

    // Default app settings
    const now = new Date().toISOString();
    const insertSetting = database.prepare(`
      INSERT OR IGNORE INTO app_settings (id, key, value, updated_at) VALUES (?, ?, ?, ?)
    `);

    insertSetting.run('app-schema-version', 'schema_version', '"1.0.0"', now);
    insertSetting.run('app-fallback-mode', 'fallback_mode_active', 'false', now);
    insertSetting.run('app-onboarding-step', 'onboarding_step', '0', now);
  });

  migrations();
  logger.info('Migration 001 completed');
}

/**
 * Generic query helpers
 * Works with both SQLite and localStorage modes
 */
export const dbQuery = {
  /**
   * Get a single row
   */
  get<T>(sql: string, params: unknown[] = []): T | undefined {
    const database = getDatabase();
    if (isLocalStorageDatabase(database)) {
      return selectLocalRows<T & Record<string, unknown>>(sql, params)[0];
    }
    const stmt = database.prepare(sql);
    return stmt.get(...params) as T | undefined;
  },

  /**
   * Get multiple rows
   */
  all<T>(_sql: string, _params: unknown[] = []): T[] {
    const database = getDatabase();
    if (isLocalStorageDatabase(database)) {
      return selectLocalRows<T & Record<string, unknown>>(_sql, _params);
    }
    const stmt = database.prepare(_sql);
    return stmt.all(..._params) as T[];
  },

  /**
   * Run a statement (INSERT, UPDATE, DELETE)
   */
  run(_sql: string, params: unknown[] = []): any {
    const database = getDatabase();
    if (isLocalStorageDatabase(database)) {
      const normalized = normalizeSql(_sql).toUpperCase();

      if (normalized.startsWith('INSERT')) {
        return insertLocalRow(_sql, params);
      }

      if (normalized.startsWith('UPDATE')) {
        return updateLocalRows(_sql, params);
      }

      if (normalized.startsWith('DELETE')) {
        return deleteLocalQueryRows(_sql, params);
      }

      return { changes: 0 };
    }
    const stmt = database.prepare(_sql);
    return stmt.run(...params);
  },

  /**
   * Run multiple statements in a transaction
   */
  transaction<T>(fn: () => T): T {
    const database = getDatabase();
    if (database.type === 'localStorage') {
      // localStorage mode - just run the function
      return fn();
    }
    return database.transaction(fn)();
  },

  /**
   * Run a prepared statement multiple times with different params
   */
  batch(_sql: string, paramsArray: unknown[][]): any[] {
    const database = getDatabase();
    if (isLocalStorageDatabase(database)) {
      return paramsArray.map((params) => dbQuery.run(_sql, params));
    }
    const stmt = database.prepare(_sql);
    const results: any[] = [];

    const batchTx = database.transaction(() => {
      for (const params of paramsArray) {
        results.push(stmt.run(...params));
      }
    });

    batchTx();
    return results;
  },
};

// Auto-initialize on import (for convenience)
if (typeof window !== 'undefined') {
  initDatabase().catch((error) => {
    logger.error('Failed to auto-initialize database:', error);
  });
}

export default {
  init: initDatabase,
  get: getDatabase,
  close: closeDatabase,
  query: dbQuery,
};
