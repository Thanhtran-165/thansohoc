/**
 * InsightCard Component
 * Displays a daily insight with Quick, Standard, and optional Deep layers - Vietnamese UI
 */

import { useState, useEffect } from 'react';
import { DailyInsight } from '@/types';
import { InsightLayerContent } from './InsightLayerContent';
import { WhyThisInsightModal } from './WhyThisInsightModal';
import { FeedbackUI } from './FeedbackUI';
import { useUserStore } from '@stores/userStore';
import messages from '@localization';

type LayerType = 'quick' | 'standard' | 'deep';

interface InsightCardProps {
  insight: DailyInsight;
  showFeedback?: boolean;
  showWhyModal?: boolean;
}

export function InsightCard({
  insight,
  showFeedback = true,
  showWhyModal = true,
}: InsightCardProps) {
  const [activeLayer, setActiveLayer] = useState<LayerType>('quick');
  const [showWhyThis, setShowWhyThis] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { profile } = useUserStore();

  // Check if deep layer exists
  const hasDeepLayer = Boolean(insight.layers.deep);

  // Mark insight as viewed when component mounts
  useEffect(() => {
    if (!insight.viewed_at) {
      // Could trigger a viewed_at update here
    }
  }, [insight.id, insight.viewed_at]);

  // Get current layer data (fallback to standard if deep is not available)
  const currentLayer = insight.layers[activeLayer] ?? insight.layers.standard;

  // Layer toggle buttons
  const layerButtons: Array<{ type: LayerType; label: string; available: boolean }> = [
    { type: 'quick', label: messages.insight.layers.quick, available: true },
    { type: 'standard', label: messages.insight.layers.standard, available: true },
    { type: 'deep', label: messages.insight.layers.deep, available: hasDeepLayer },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header with theme badge */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                {insight.theme}
              </span>
              {insight.is_fallback && (
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  {messages.insight.cached}
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {insight.headline}
            </h3>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>{messages.insight.personalDay} {insight.personal_day}</div>
            <div className="text-xs">{insight.date}</div>
          </div>
        </div>
      </div>

      {/* Layer Toggle */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex gap-2">
          {layerButtons.map(({ type, label, available }) => (
            <button
              key={type}
              onClick={() => available && setActiveLayer(type)}
              disabled={!available}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                activeLayer === type
                  ? 'bg-primary-500 text-white'
                  : available
                  ? 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {label}
              {type === 'deep' && !available && ` ${messages.insight.layers.deepOnDemand}`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5">
        <InsightLayerContent
          content={currentLayer.content}
          claims={currentLayer.claims}
          showClaimHighlights={true}
        />

        {/* Exploratory Questions for Deep Layer */}
        {activeLayer === 'deep' && insight.layers.deep?.exploratory_questions && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{messages.insight.questionsToExplore}</h4>
            <ul className="space-y-2">
              {insight.layers.deep.exploratory_questions.map((question, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-amber-500 mt-0.5">?</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confidence Bar */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{messages.insight.overallConfidence}</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${insight.confidence.overall * 100}%` }}
              />
            </div>
            <span className="font-medium text-gray-700">
              {(insight.confidence.overall * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        {showWhyModal && (
          <button
            onClick={() => setShowWhyThis(true)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {messages.insight.whyThis}
          </button>
        )}

        {showFeedback && !feedbackSubmitted && profile?.id && (
          <FeedbackUI
            insightId={insight.id}
            userId={profile.id}
            onSubmitted={() => setFeedbackSubmitted(true)}
          />
        )}

        {feedbackSubmitted && (
          <span className="text-sm text-green-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {messages.insight.feedbackReceived}
          </span>
        )}
      </div>

      {/* Why This Insight Modal */}
      {showWhyThis && (
        <WhyThisInsightModal
          insightId={insight.id}
          onClose={() => setShowWhyThis(false)}
        />
      )}
    </div>
  );
}

export default InsightCard;
