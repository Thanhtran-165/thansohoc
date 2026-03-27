import { invoke, isTauri } from '@tauri-apps/api/core';

interface LegacyStorageMigrationResult {
  foundLegacy: boolean;
  foundCurrent: boolean;
  migratedKeys: number;
  mergedRecords: number;
}

let migrationAttempted = false;

export async function migrateLegacyDesktopStorage(): Promise<LegacyStorageMigrationResult | null> {
  if (!isTauri() || migrationAttempted) {
    return null;
  }

  migrationAttempted = true;
  return invoke<LegacyStorageMigrationResult>('migrate_legacy_webkit_storage');
}
