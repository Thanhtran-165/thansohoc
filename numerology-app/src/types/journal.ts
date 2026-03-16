// Journal types

// Standard emotion tags for MVP
export const EMOTION_TAGS = [
  'peaceful',
  'anxious',
  'grateful',
  'frustrated',
  'hopeful',
  'overwhelmed',
  'content',
  'restless',
  'inspired',
  'tired',
  'joyful',
  'confused',
  'confident',
  'uncertain',
  'loved',
  'lonely',
] as const;

export type EmotionTag = typeof EMOTION_TAGS[number];

export interface KeyEvent {
  time?: string;
  description: string;
  impact?: 'positive' | 'neutral' | 'negative';
}

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string; // ISO 8601 date
  mood_score: number; // 1-10
  energy_score: number; // 1-10
  emotions: EmotionTag[];
  reflection_text: string | null;
  key_events: KeyEvent[] | null;
  created_at: string;
  updated_at: string;
}

export interface CreateJournalEntryInput {
  user_id: string;
  date: string;
  mood_score: number;
  energy_score: number;
  emotions: EmotionTag[];
  reflection_text?: string;
  key_events?: KeyEvent[];
}

export interface UpdateJournalEntryInput {
  mood_score?: number;
  energy_score?: number;
  emotions?: EmotionTag[];
  reflection_text?: string;
  key_events?: KeyEvent[];
}
