/**
 * JournalForm Component
 * Form for creating/editing journal entries with mood, energy, and emotion tracking - Vietnamese UI
 */

import { useState } from 'react';
import { EMOTION_TAGS, EmotionTag } from '@/types';
import { useJournalStore } from '@stores/journalStore';
import { useUserStore } from '@stores/userStore';
import messages from '@localization';
import { getCurrentDateISO } from '@utils/date';

// Vietnamese emotion tag translations
const EMOTION_TAG_LABELS: Record<EmotionTag, string> = {
  peaceful: messages.journal.tags.peaceful,
  anxious: messages.journal.tags.anxious,
  grateful: messages.journal.tags.grateful,
  frustrated: messages.journal.tags.frustrated,
  hopeful: messages.journal.tags.hopeful,
  overwhelmed: messages.journal.tags.overwhelmed,
  content: messages.journal.tags.content,
  restless: messages.journal.tags.restless,
  inspired: messages.journal.tags.inspired,
  tired: messages.journal.tags.tired,
  joyful: messages.journal.tags.joyful,
  confused: messages.journal.tags.confused,
  confident: messages.journal.tags.confident,
  uncertain: messages.journal.tags.uncertain,
  loved: messages.journal.tags.loved,
  lonely: messages.journal.tags.lonely,
};

interface JournalFormProps {
  mode?: 'quick' | 'full';
  onSuccess?: () => void;
  onCancel?: () => void;
  initialMood?: number;
  initialEnergy?: number;
}

export function JournalForm({
  mode = 'quick',
  onSuccess,
  onCancel,
  initialMood = 5,
  initialEnergy = 5,
}: JournalFormProps) {
  const { profile } = useUserStore();
  const { todayEntry, createEntry, updateEntry } = useJournalStore();

  const [moodScore, setMoodScore] = useState(
    todayEntry?.mood_score ?? initialMood
  );
  const [energyScore, setEnergyScore] = useState(
    todayEntry?.energy_score ?? initialEnergy
  );
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionTag[]>(
    todayEntry?.emotions ?? []
  );
  const [reflectionText, setReflectionText] = useState(
    todayEntry?.reflection_text ?? ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayDate = getCurrentDateISO();

  const toggleEmotion = (emotion: EmotionTag) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleSubmit = async () => {
    if (!profile?.id) return;
    setIsSubmitting(true);
    setError(null);

    try {
      if (todayEntry) {
        await updateEntry(todayEntry.id, {
          mood_score: moodScore,
          energy_score: energyScore,
          emotions: selectedEmotions,
          reflection_text: reflectionText || undefined,
        });
      } else {
        await createEntry({
          user_id: profile.id,
          date: todayDate,
          mood_score: moodScore,
          energy_score: energyScore,
          emotions: selectedEmotions,
          reflection_text: reflectionText || undefined,
        });
      }
      onSuccess?.();
    } catch (err) {
      setError(messages.journal.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick mode - improved layout for right panel
  if (mode === 'quick') {
    return (
      <div className="space-y-5">
        {/* Mood Section */}
        <div>
          <label className="field-label mb-2.5 block text-xs">
            {messages.journal.mood.label}
          </label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-1 justify-between">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMoodScore(n)}
                  className={`w-6 h-6 rounded-md transition-all duration-150 ${
                    n <= moodScore
                      ? 'bg-sky-400 scale-110 shadow-[0_8px_18px_rgba(56,189,248,0.28)]'
                      : 'bg-white/10 hover:bg-white/16 scale-100'
                  }`}
                />
              ))}
            </div>
            <div className="w-8 flex items-center justify-center">
              <span className={`text-base font-bold ${
                moodScore <= 3 ? 'text-sky-300' : 'text-slate-400'
              }`}>
                {moodScore}
              </span>
            </div>
          </div>
        </div>

        {/* Energy Section */}
        <div>
          <label className="field-label mb-2.5 block text-xs">
            {messages.journal.energy.label}
          </label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-1 justify-between">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEnergyScore(n)}
                  className={`w-6 h-6 rounded-md transition-all duration-150 ${
                    n <= energyScore
                      ? 'bg-amber-400 scale-110 shadow-[0_8px_18px_rgba(251,191,36,0.28)]'
                      : 'bg-white/10 hover:bg-white/16 scale-100'
                  }`}
                />
              ))}
            </div>
            <div className="w-8 flex items-center justify-center">
              <span className={`text-base font-bold ${
                energyScore <= 3 ? 'text-amber-300' : 'text-slate-400'
              }`}>
                {energyScore}
              </span>
            </div>
          </div>
        </div>

        {/* Emotions Section */}
        <div>
          <label className="field-label mb-2.5 block text-xs">
            {messages.journal.emotions.label}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EMOTION_TAGS.map((emotion) => (
              <button
                key={emotion}
                type="button"
                onClick={() => toggleEmotion(emotion)}
                className={`px-2.5 py-1 text-xs rounded-full transition-all duration-150 ${
                  selectedEmotions.includes(emotion)
                    ? 'border border-sky-300/35 bg-sky-400/12 text-sky-100 shadow-[0_10px_26px_rgba(56,189,248,0.16)]'
                    : 'border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                }`}
              >
                {EMOTION_TAG_LABELS[emotion]}
              </button>
            ))}
          </div>
        </div>

        {/* Reflection Text */}
        <div>
          <label className="field-label mb-2.5 block text-xs">
            {messages.journal.reflection.label}
          </label>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder={messages.journal.reflection.placeholder}
            rows={3}
            className="field-dark min-h-[96px] resize-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-[18px] border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        )}

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="button-primary-dark flex w-full items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>{messages.journal.saving}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{messages.journal.save}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Full mode - expanded layout with sliders
  return (
    <div className="space-y-5">
      {/* Mood Slider */}
      <div>
        <label className="field-label">
          {messages.journal.mood.question}
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{messages.journal.mood.low}</span>
          <input
            type="range"
            min={1}
            max={10}
            value={moodScore}
            onChange={(e) => setMoodScore(Number(e.target.value))}
            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-white/12 accent-sky-400 focus:outline-none"
          />
          <span className="text-xs text-slate-500">{messages.journal.mood.high}</span>
        </div>
        <div className="text-center text-3xl font-bold text-sky-300">
          {moodScore}
        </div>
      </div>

      {/* Energy Slider */}
      <div>
        <label className="field-label">
          {messages.journal.energy.question}
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{messages.journal.energy.low}</span>
          <input
            type="range"
            min={1}
            max={10}
            value={energyScore}
            onChange={(e) => setEnergyScore(Number(e.target.value))}
            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-white/12 accent-amber-400 focus:outline-none"
          />
          <span className="text-xs text-slate-500">{messages.journal.energy.high}</span>
        </div>
        <div className="text-center text-3xl font-bold text-amber-300">
          {energyScore}
        </div>
      </div>

      {/* Emotion Tags */}
      <div>
        <label className="field-label">
          {messages.journal.emotions.label}
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOTION_TAGS.map((emotion) => (
            <button
              key={emotion}
              type="button"
              onClick={() => toggleEmotion(emotion)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selectedEmotions.includes(emotion)
                  ? 'border-sky-300/35 bg-sky-400/12 text-sky-100'
                  : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
              }`}
            >
              {EMOTION_TAG_LABELS[emotion]}
            </button>
          ))}
        </div>
      </div>

      {/* Reflection Text */}
      <div>
        <label className="field-label">
          {messages.journal.reflection.label}
        </label>
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder={messages.journal.reflection.placeholder}
          rows={3}
          className="field-dark min-h-[96px] resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-white/8 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="button-ghost-dark"
          >
            {messages.actions.cancel}
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !moodScore || !energyScore}
          className="button-primary-dark"
        >
          {isSubmitting ? messages.journal.saving : (todayEntry ? messages.journal.update : messages.journal.save)}
        </button>
      </div>
    </div>
  );
}

export default JournalForm;
