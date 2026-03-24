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
          <label className="block text-xs font-medium text-gray-700 mb-2.5">
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
                      ? 'bg-primary-500 scale-110 shadow-sm'
                      : 'bg-gray-200 hover:bg-gray-300 scale-100'
                  }`}
                />
              ))}
            </div>
            <div className="w-8 flex items-center justify-center">
              <span className={`text-base font-bold ${
                moodScore <= 3 ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {moodScore}
              </span>
            </div>
          </div>
        </div>

        {/* Energy Section */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2.5">
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
                      ? 'bg-amber-500 scale-110 shadow-sm'
                      : 'bg-gray-200 hover:bg-gray-300 scale-100'
                  }`}
                />
              ))}
            </div>
            <div className="w-8 flex items-center justify-center">
              <span className={`text-base font-bold ${
                energyScore <= 3 ? 'text-amber-600' : 'text-gray-500'
              }`}>
                {energyScore}
              </span>
            </div>
          </div>
        </div>

        {/* Emotions Section */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2.5">
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
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {EMOTION_TAG_LABELS[emotion]}
              </button>
            ))}
          </div>
        </div>

        {/* Reflection Text */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2.5">
            {messages.journal.reflection.label}
          </label>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder={messages.journal.reflection.placeholder}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none focus:outline-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {messages.journal.mood.question}
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{messages.journal.mood.low}</span>
          <input
            type="range"
            min={1}
            max={10}
            value={moodScore}
            onChange={(e) => setMoodScore(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-xs text-gray-500">{messages.journal.mood.high}</span>
        </div>
        <div className="text-center text-3xl font-bold text-primary-600">
          {moodScore}
        </div>
      </div>

      {/* Energy Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {messages.journal.energy.question}
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{messages.journal.energy.low}</span>
          <input
            type="range"
            min={1}
            max={10}
            value={energyScore}
            onChange={(e) => setEnergyScore(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-xs text-gray-500">{messages.journal.energy.high}</span>
        </div>
        <div className="text-center text-3xl font-bold text-amber-600">
          {energyScore}
        </div>
      </div>

      {/* Emotion Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {messages.journal.emotions.label}
        </label>
        <div className="flex flex-wrap gap-2">
          {EMOTION_TAGS.map((emotion) => (
            <button
              key={emotion}
              type="button"
              onClick={() => toggleEmotion(emotion)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                selectedEmotions.includes(emotion)
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {EMOTION_TAG_LABELS[emotion]}
            </button>
          ))}
        </div>
      </div>

      {/* Reflection Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {messages.journal.reflection.label}
        </label>
        <textarea
          value={reflectionText}
          onChange={(e) => setReflectionText(e.target.value)}
          placeholder={messages.journal.reflection.placeholder}
          rows={3}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none focus:outline-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-gray-600 hover:text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 rounded"
          >
            {messages.actions.cancel}
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !moodScore || !energyScore}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? messages.journal.saving : (todayEntry ? messages.journal.update : messages.journal.save)}
        </button>
      </div>
    </div>
  );
}

export default JournalForm;
