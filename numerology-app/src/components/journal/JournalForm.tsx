/**
 * JournalForm Component
 * Form for creating/editing journal entries with mood, energy, and emotion tracking
 */

import { useState } from 'react';
import { EMOTION_TAGS, EmotionTag } from '@/types';
import { useJournalStore } from '@stores/journalStore';
import { useUserStore } from '@stores/userStore';

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

  // Get today's date in ISO format
  const todayDate = new Date().toISOString().split('T')[0];

  const toggleEmotion = (emotion: EmotionTag) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleMoodChange = (value: number) => {
    setMoodScore(value);
  };

  const handleEnergyChange = (value: number) => {
    setEnergyScore(value);
  };

  const handleSubmit = async () => {
    if (!profile?.id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (todayEntry) {
        // Update existing entry
        await updateEntry(todayEntry.id, {
          mood_score: moodScore,
          energy_score: energyScore,
          emotions: selectedEmotions,
          reflection_text: reflectionText || undefined,
        });
      } else {
        // Create new entry
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
      setError(err instanceof Error ? err.message : 'Failed to save journal entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick mode - simplified version
  if (mode === 'quick') {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <label className="text-xs text-gray-600 mb-1">Mood</label>
            <div className="flex gap-1" role="group" aria-label="Mood level">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleMoodChange(n)}
                  aria-label={`Mood level ${n}`}
                  aria-pressed={moodScore === n}
                  className={`w-4 h-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    n <= moodScore ? 'bg-primary-500' : 'bg-gray-200'
                  } hover:bg-gray-300`}
                />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-600 mb-1">Energy</label>
            <div className="flex gap-1" role="group" aria-label="Energy level">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleEnergyChange(n)}
                  aria-label={`Energy level ${n}`}
                  aria-pressed={energyScore === n}
                  className={`w-4 h-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    n <= energyScore ? 'bg-amber-500' : 'bg-gray-200'
                  } hover:bg-gray-300`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3" role="group" aria-label="Select emotions">
          {EMOTION_TAGS.slice(0, 8).map((emotion) => (
            <button
              key={emotion}
              type="button"
              onClick={() => toggleEmotion(emotion)}
              aria-pressed={selectedEmotions.includes(emotion)}
              className={`px-2 py-1 text-xs rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                selectedEmotions.includes(emotion)
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {emotion}
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
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  // Full mode - detailed version
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {todayEntry ? 'Edit Journal Entry' : 'Quick Journal'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Mood Slider */}
        <div>
          <label htmlFor="mood-slider" className="block text-sm font-medium text-gray-700 mb-2">
            How are you feeling? (1-10)
          </label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Low</span>
            <input
              id="mood-slider"
              type="range"
              min={1}
              max={10}
              value={moodScore}
              onChange={(e) => handleMoodChange(Number(e.target.value))}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={moodScore}
              aria-label={`Mood level: ${moodScore}`}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-500">High</span>
          </div>
          <div className="text-center text-2xl font-bold text-primary-600" aria-live="polite">
            {moodScore}
          </div>
        </div>

        {/* Energy Slider */}
        <div>
          <label htmlFor="energy-slider" className="block text-sm font-medium text-gray-700 mb-2">
            Energy Level (1-10)
          </label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Low</span>
            <input
              id="energy-slider"
              type="range"
              min={1}
              max={10}
              value={energyScore}
              onChange={(e) => handleEnergyChange(Number(e.target.value))}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={energyScore}
              aria-label={`Energy level: ${energyScore}`}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-500">High</span>
          </div>
          <div className="text-center text-2xl font-bold text-amber-600" aria-live="polite">
            {energyScore}
          </div>
        </div>

        {/* Emotion Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emotions (select all that apply)
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Select emotions">
            {EMOTION_TAGS.map((emotion) => (
              <button
                key={emotion}
                type="button"
                onClick={() => toggleEmotion(emotion)}
                aria-pressed={selectedEmotions.includes(emotion)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  selectedEmotions.includes(emotion)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        {/* Reflection Text */}
        <div>
          <label htmlFor="reflection-text" className="block text-sm font-medium text-gray-700 mb-2">
            Reflection (optional)
          </label>
          <textarea
            id="reflection-text"
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="How are you feeling? What's on your mind?"
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
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !moodScore || !energyScore}
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          {isSubmitting ? 'Saving...' : todayEntry ? 'Update Entry' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
}

export default JournalForm;
