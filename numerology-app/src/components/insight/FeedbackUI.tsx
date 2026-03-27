/**
 * FeedbackUI Component
 * Star rating and feedback collection for insights - Vietnamese UI
 */

import { useState } from 'react';
import { ClaimType } from '@/types';
import messages from '@localization';
import { useInsightStore } from '@stores/insightStore';

interface FeedbackUIProps {
  insightId: string;
  userId: string;
  onSubmitted?: () => void;
  compact?: boolean;
}

const getFeedbackTags = () => [
  messages.feedback.tags.helpful,
  messages.feedback.tags.inspiring,
  messages.feedback.tags.accurate,
  messages.feedback.tags.confusing,
  messages.feedback.tags.tooVague,
  messages.feedback.tags.tooDetailed,
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
      await useInsightStore.getState().submitFeedback({
        insight_id: insightId,
        user_id: userId,
        rating: ratingValue,
        most_useful_claim_type: mostUsefulClaim || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        feedback_text: feedbackText || undefined,
      });

      onSubmitted?.();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const claimTypeLabels: Record<ClaimType, string> = {
    calculated: messages.claimTypes.calculated,
    interpreted: messages.claimTypes.interpreted,
    exploratory: messages.claimTypes.exploratory,
  };

  return (
    <div className={`${compact ? 'flex items-center gap-2' : ''}`}>
      {/* Star Rating */}
      <div className="flex items-center gap-1" role="group" aria-label={messages.feedback.rateInsight}>
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
                  : 'text-slate-600'
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
        <div className="mt-4 space-y-4 border-t border-white/8 pt-4">
          {/* Most Useful Claim Type */}
          <div>
            <label className="field-label">
              {messages.feedback.mostUsefulClaim}
            </label>
            <div className="flex gap-2" role="group" aria-label="Select most useful claim type">
              {(['calculated', 'interpreted', 'exploratory'] as ClaimType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setMostUsefulClaim(type)}
                  aria-pressed={mostUsefulClaim === type}
                  aria-label={claimTypeLabels[type]}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    mostUsefulClaim === type
                      ? 'border-sky-300/35 bg-sky-400/12 text-sky-100'
                      : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  {claimTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="field-label">
              {messages.feedback.tagLabels}
            </label>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Feedback tags">
              {getFeedbackTags().map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={selectedTags.includes(tag)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'border-sky-300/35 bg-sky-400/12 text-sky-100'
                      : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="field-label">
              {messages.feedback.additionalFeedback}
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={messages.feedback.placeholder}
              className="field-dark min-h-[80px] resize-none"
              rows={2}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={() => submitFeedback()}
            disabled={isSubmitting}
            className="button-primary-dark"
          >
            {isSubmitting ? messages.feedback.submitting : messages.feedback.submit}
          </button>
        </div>
      )}
    </div>
  );
}

export default FeedbackUI;
