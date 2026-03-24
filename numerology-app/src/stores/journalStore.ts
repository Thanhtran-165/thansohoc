/**
 * Journal Store
 * Manages journal entry state
 */

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { JournalEntry, CreateJournalEntryInput, UpdateJournalEntryInput } from '@/types';
import { dbQuery } from '@services/database';
import { getCurrentTimestamp, getCurrentDateISO } from '@utils/date';
import { trackEvent } from '@services/analytics';

interface JournalState {
  // State
  todayEntry: JournalEntry | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadTodayEntry: (userId: string) => Promise<void>;
  createEntry: (input: CreateJournalEntryInput) => Promise<JournalEntry>;
  updateEntry: (id: string, input: UpdateJournalEntryInput) => Promise<void>;
  clearError: () => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  // Initial state
  todayEntry: null,
  isLoading: false,
  error: null,

  // Load today's journal entry
  loadTodayEntry: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const today = getCurrentDateISO();

      const entry = dbQuery.get<JournalEntry>(
        `SELECT * FROM journal_entries WHERE user_id = ? AND date = ?`,
        [userId, today]
      );

      if (entry) {
        entry.emotions = typeof entry.emotions === 'string'
          ? JSON.parse(entry.emotions)
          : entry.emotions;
        entry.key_events = typeof entry.key_events === 'string'
          ? JSON.parse(entry.key_events)
          : entry.key_events;
      }

      set({ todayEntry: entry || null, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load journal entry', isLoading: false });
      console.error('Failed to load journal entry:', error);
    }
  },

  // Create a new journal entry
  createEntry: async (input: CreateJournalEntryInput) => {
    const now = getCurrentTimestamp();
    const id = uuidv4();

    const entry: JournalEntry = {
      id,
      user_id: input.user_id,
      date: input.date,
      mood_score: input.mood_score,
      energy_score: input.energy_score,
      emotions: input.emotions,
      reflection_text: input.reflection_text || null,
      key_events: input.key_events || null,
      created_at: now,
      updated_at: now,
    };

    dbQuery.run(
      `INSERT INTO journal_entries (
        id, user_id, date, mood_score, energy_score, emotions,
        reflection_text, key_events, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.user_id,
        entry.date,
        entry.mood_score,
        entry.energy_score,
        JSON.stringify(entry.emotions),
        entry.reflection_text,
        JSON.stringify(entry.key_events),
        entry.created_at,
        entry.updated_at,
      ]
    );

    set({ todayEntry: entry });
    await trackEvent('journal_saved', {
      userId: entry.user_id,
      payload: {
        date: entry.date,
        mood_score: entry.mood_score,
        energy_score: entry.energy_score,
        is_edit: false,
      },
    });
    return entry;
  },

  // Update an existing journal entry
  updateEntry: async (id: string, input: UpdateJournalEntryInput) => {
    const { todayEntry } = get();
    if (!todayEntry) {
      throw new Error('No entry to update');
    }

    const now = getCurrentTimestamp();
    const updateFields: string[] = [];
    const values: (string | number | null)[] = [];

    // Build dynamic update query
    if (input.mood_score !== undefined) {
      updateFields.push('mood_score = ?');
      values.push(input.mood_score);
    }
    if (input.energy_score !== undefined) {
      updateFields.push('energy_score = ?');
      values.push(input.energy_score);
    }
    if (input.emotions !== undefined) {
      updateFields.push('emotions = ?');
      values.push(JSON.stringify(input.emotions));
    }
    if (input.reflection_text !== undefined) {
      updateFields.push('reflection_text = ?');
      values.push(input.reflection_text);
    }
    if (input.key_events !== undefined) {
      updateFields.push('key_events = ?');
      values.push(JSON.stringify(input.key_events));
    }

    updateFields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    dbQuery.run(
      `UPDATE journal_entries SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    set({
      todayEntry: {
        ...todayEntry,
        ...input,
        updated_at: now,
      },
    });
    await trackEvent('journal_saved', {
      userId: todayEntry.user_id,
      payload: {
        date: todayEntry.date,
        mood_score: input.mood_score ?? todayEntry.mood_score,
        energy_score: input.energy_score ?? todayEntry.energy_score,
        is_edit: true,
      },
    });
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
