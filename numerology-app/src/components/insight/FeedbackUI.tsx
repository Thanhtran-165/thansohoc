/**
 * FeedbackUI Component
 * Star rating and feedback collection for insights
 */

import { useState } from 'react';
import { ClaimType } from '@/types';

interface FeedbackUIProps {
  insightId: string;
  userId: string;
  onSubmitted?: () => void;
  compact?: boolean;
}

const EMOTION_TAGS = [
  'helpful',
  'inspiring',
  'accurate',
  'confusing',
  'too vague',
  'too detailed',
];

export function FeedbackUI({
  insightId,
  userId,
  onSubmitted,
  compact = false,
}: FeedbackUIProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [mostUsefulClaim, setMostUsefulClaim] = useState<ClaimType | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showExpanded, setShowExpanded] = useState(false);

  const handleRatingClick = async (value: number) => {
    setRating(value);

    // Auto-submit for compact mode with just rating
    if (compact) {
      await submitFeedback(value);
    } else {
      setShowExpanded(true);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const submitFeedback = async (ratingValue: number = rating) => {
    if (ratingValue === 0) return;

    setIsSubmitting(true);

    try {
      // Submit feedback via store
      const { useInsightStore } = await import('@stores/insightStore');
      await useInsightStore.getState().submitFeedback({
        insight_id: insightId,
        user_id: userId,
        rating: ratingValue,
        most_useful_claim_type: mostUsefulClaim || undefined,
        feedback_text: feedbackText || undefined,
      });

      onSubmitted?.();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${compact ? 'flex items-center gap-2' : ''}`}>
      {/* Star Rating */}
      <div className="flex items-center gap-1" role="group" aria-label="Rate this insight">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleRatingClick(value)}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
            aria-pressed={rating === value}
            className="p-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded transition-transform hover:scale-110"
          >
            <svg
              className={`w-5 h-5 ${
                value <= (hoverRating || rating)
                  ? 'text-amber-400 fill-current'
                  : 'text-gray-300'
              }`}
              viewBox="0 0 24 24"
              fill={value <= (hoverRating || rating) ? 'currentColor' : 'none'}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>

      {/* Expanded Feedback Form */}
      {showExpanded && !compact && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
          {/* Most Useful Claim Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Most useful claim type?
            </label>
            <div className="flex gap-2" role="group" aria-label="Select most useful claim type">
              {(['calculated', 'interpreted', 'exploratory'] as ClaimType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setMostUsefulClaim(type)}
                  aria-pressed={mostUsefulClaim === type}
                  aria-label={`${type.charAt(0).toUpperCase() + type.slice(1)} claim type`}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    mostUsefulClaim === type
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Feedback tags">
              {EMOTION_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={selectedTags.includes(tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional feedback (optional)
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What could make this insight more helpful?"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={() => submitFeedback()}
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      )}
    </div>
  );
}

export default FeedbackUI;
