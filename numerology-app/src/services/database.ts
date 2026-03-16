/**
 * Database Service
 * SQLite database connection and query management for local-first storage
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs';
import { logger } from '@utils/logger';

// Database instance (singleton)
let db: Database.Database | null = null;

// Database path
const DB_NAME = 'data.db';

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
      return join(appDir, 'numerology-app', DB_NAME);
    } catch (error) {
      logger.warn('Tauri API not available, using fallback path');
    }
  }

  // Fallback for development without Tauri (web-only mode)
  logger.info('Running in web-only mode, using temp database path');
  return join(process.cwd(), 'temp-data', DB_NAME);
}

/**
 * Initialize the database connection and run migrations
 */
export async function initDatabase(): Promise<Database.Database> {
  if (db) {
    return db;
  }

  const dbPath = await getDatabasePath();
  logger.info(`Initializing database at: ${dbPath}`);

  try {
    // Ensure parent directory exists
    const dbDir = dirname(dbPath);
    mkdirSync(dbDir, { recursive: true });

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
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    logger.info('Database connection closed');
  }
}

/**
 * Run database migrations
 */
async function runMigrations(database: Database.Database): Promise<void> {
  // Get current schema version
  const getVersion = database.prepare(`
    SELECT value FROM app_settings WHERE key = 'schema_version'
  `);

  let currentVersion = '0.0.0';
  try {
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

  // Future migrations would go here:
  // if (compareVersions(currentVersion, '1.0.0') < 0) { ... }
}

/**
 * Migration 001: Initial Schema
 */
function runMigration001(database: Database.Database): void {
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
        launch_on_startup INTEGER NOT NULL DEFAULT 0,
        sound_enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
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
 */
export const dbQuery = {
  /**
   * Get a single row
   */
  get<T>(sql: string, params: unknown[] = []): T | undefined {
    const stmt = getDatabase().prepare(sql);
    return stmt.get(...params) as T | undefined;
  },

  /**
   * Get multiple rows
   */
  all<T>(sql: string, params: unknown[] = []): T[] {
    const stmt = getDatabase().prepare(sql);
    return stmt.all(...params) as T[];
  },

  /**
   * Run a statement (INSERT, UPDATE, DELETE)
   */
  run(sql: string, params: unknown[] = []): Database.RunResult {
    const stmt = getDatabase().prepare(sql);
    return stmt.run(...params);
  },

  /**
   * Run multiple statements in a transaction
   */
  transaction<T>(fn: () => T): T {
    return getDatabase().transaction(fn)();
  },

  /**
   * Run a prepared statement multiple times with different params
   */
  batch(sql: string, paramsArray: unknown[][]): Database.RunResult[] {
    const stmt = getDatabase().prepare(sql);
    const results: Database.RunResult[] = [];

    const batchTx = getDatabase().transaction(() => {
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
