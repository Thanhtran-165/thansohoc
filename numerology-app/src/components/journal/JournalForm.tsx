/**
 * JournalForm Component
 * Form for creating/editing journal entries with mood, energy, and emotion tracking - Vietnamese UI
 */

import { useState } from 'react';
import { EMOTION_TAGS, EmotionTag } from '@/types';
import { useJournalStore } from '@stores/journalStore';
import { useUserStore } from '@stores/userStore';
import messages from '@localization';

// Vietnamese emotion tag translations
const EMOTION_TAG_LABELS: Record<EmotionTag, string> = {
  happy: messages.journal.tags.happy,
  calm: messages.journal.tags.calm,
  excited: messages.journal.tags.excited,
  grateful: messages.journal.tags.grateful,
  anxious: messages.journal.tags.anxious,
  tired: messages.journal.tags.tired,
  stressed: messages.journal.tags.stressed,
  motivated: messages.journal.tags.motivated,
  reflective: messages.journal.tags.reflective,
  hopeful: messages.journal.tags.hopeful,
  sad: messages.journal.tags.sad,
  angry: messages.journal.tags.angry,
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

  const todayDate = new Date().toISOString().split('T')[0];

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

  // Quick mode
  if (mode === 'quick') {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <label className="text-xs text-gray-600 mb-1">{messages.journal.mood.label}</label>
            <div className="flex gap-1" role="group" aria-label={messages.journal.mood.question}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMoodScore(n)}
                  className={`w-4 h-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    n <= moodScore ? 'bg-primary-500' : 'bg-gray-200'
                  } hover:bg-gray-300`}
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-600 mb-1">{messages.journal.energy.label}</label>
            <div className="flex gap-1" role="group" aria-label={messages.journal.energy.question}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEnergyScore(n)}
                  className={`w-4 h-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    n <= energyScore ? 'bg-amber-500' : 'bg-gray-200'
                  } hover:bg-gray-300`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3" role="group" aria-label={messages.journal.emotions.label}>
          {EMOTION_TAGS.slice(0, 8).map((emotion) => (
            <button
              key={emotion}
              type="button"
              onClick={() => toggleEmotion(emotion)}
              className={`px-2 py-1 text-xs rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                selectedEmotions.includes(emotion)
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {EMOTION_TAG_LABELS[emotion]}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !moodScore || !energyScore}
            className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {isSubmitting ? messages.journal.saving : messages.journal.save}
          </button>
        </div>
      </div>
    );
  }

  // Full mode
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {todayEntry ? messages.journal.edit : messages.journal.fullTitle}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Mood Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {messages.journal.mood.question}
          </label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{messages.journal.mood.low}</span>
            <input
              type="range"
              min={1}
              max={10}
              value={moodScore}
              onChange={(e) => setMoodScore(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-500">{messages.journal.mood.high}</span>
          </div>
          <div className="text-center text-2xl font-bold text-primary-600">
            {moodScore}
          </div>
        </div>

        {/* Energy Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {messages.journal.energy.question}
          </label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{messages.journal.energy.low}</span>
            <input
              type="range"
              min={1}
              max={10}
              value={energyScore}
              onChange={(e) => setEnergyScore(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-500">{messages.journal.energy.high}</span>
          </div>
          <div className="text-center text-2xl font-bold text-amber-600">
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
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-300 rounded"
          >
            {messages.actions.cancel}
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !moodScore || !energyScore}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          {isSubmitting ? messages.journal.saving : (todayEntry ? messages.journal.update : messages.journal.save)}
        </button>
      </div>
    </div>
  );
}

export default JournalForm;
