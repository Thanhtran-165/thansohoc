/**
 * InsightCard Component
 * Daily report presentation for insight layers.
 */

import { useEffect, useMemo, useState } from 'react';
import { DailyInsight, Claim, ClaimType } from '@/types';
import { InsightLayerContent } from './InsightLayerContent';
import { WhyThisInsightModal } from './WhyThisInsightModal';
import { FeedbackUI } from './FeedbackUI';
import { useUserStore } from '@stores/userStore';
import messages from '@localization';
import { trackEvent } from '@services/analytics';

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
  const [activeLayer, setActiveLayer] = useState<LayerType>('standard');
  const [showWhyThis, setShowWhyThis] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { profile } = useUserStore();

  const hasDeepLayer = Boolean(insight.layers.deep);

  useEffect(() => {
    trackEvent('insight_viewed', {
      userId: profile?.id,
      payload: {
        insight_id: insight.id,
        date: insight.date,
        theme: insight.theme,
      },
    }).catch((error) => {
      console.error('Failed to track insight view:', error);
    });
  }, [insight.id, insight.date, insight.theme, profile?.id]);

  const currentLayer = insight.layers[activeLayer] ?? insight.layers.standard;

  const layerButtons: Array<{ type: LayerType; label: string; available: boolean }> = [
    { type: 'quick', label: messages.insight.layers.quick, available: true },
    { type: 'standard', label: messages.insight.layers.standard, available: true },
    { type: 'deep', label: messages.insight.layers.deep, available: hasDeepLayer },
  ];

  const highlightedClaims = useMemo(() => {
    const claims = activeLayer === 'quick'
      ? insight.layers.quick.claims
      : currentLayer.claims;

    return claims.slice(0, 4);
  }, [activeLayer, currentLayer.claims, insight.layers.quick.claims]);

  return (
    <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <header className="border-b border-slate-100 bg-[linear-gradient(135deg,_#fffdf8_0%,_#ffffff_45%,_#f5f9ff_100%)] px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700 ring-1 ring-sky-200">
                {insight.theme}
              </span>
              {insight.is_fallback && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                  {messages.insight.cached}
                </span>
              )}
            </div>

            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
              {insight.headline}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {messages.dashboard.executiveSummary}
            </p>
          </div>

          <div className="min-w-44 rounded-2xl bg-slate-950 px-4 py-4 text-right text-white">
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              {messages.insight.personalDay}
            </div>
            <div className="mt-2 text-3xl font-semibold">{insight.personal_day}</div>
            <div className="mt-3 text-xs text-slate-400">{formatShortDate(insight.date)}</div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-5">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {messages.dashboard.executiveSummary}
          </div>
          <div className="mt-3 text-sm leading-7 text-slate-700">
            <InsightLayerContent
              content={insight.layers.quick.content}
              claims={insight.layers.quick.claims}
              showClaimHighlights={false}
            />
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {messages.dashboard.readingModes}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {layerButtons.map(({ type, label, available }) => (
                <button
                  key={type}
                  onClick={() => available && setActiveLayer(type)}
                  disabled={!available}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeLayer === type
                      ? 'bg-slate-950 text-white'
                      : available
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'cursor-not-allowed bg-slate-100 text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
            {messages.insight.overallConfidence}:{' '}
            <span className="font-semibold text-slate-900">
              {(insight.confidence.overall * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.8fr)]">
          <section className="rounded-[24px] bg-slate-50 p-6 ring-1 ring-slate-200">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {activeLayer === 'standard'
                ? messages.dashboard.detailedReport
                : `${messages.dashboard.detailedReport} · ${layerLabel(activeLayer)}`}
            </div>
            <div className="mt-4 text-[15px] leading-8 text-slate-700">
              <InsightLayerContent
                content={currentLayer.content}
                claims={currentLayer.claims}
                showClaimHighlights={true}
              />
            </div>

            {activeLayer === 'deep' && insight.layers.deep?.exploratory_questions && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
                  {messages.insight.questionsToExplore}
                </h4>
                <ul className="mt-4 space-y-3">
                  {insight.layers.deep.exploratory_questions.map((question, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm leading-7 text-slate-600">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {messages.dashboard.reportGuidance}
              </div>
              <div className="mt-4 space-y-3">
                {highlightedClaims.map((claim, index) => (
                  <ClaimSnapshot key={`${claim.type}-${index}`} claim={claim} />
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {messages.dashboard.yourNumbers}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <NumberTile label={messages.dashboard.numerology.personalDay} value={insight.personal_day} />
                <NumberTile label={messages.dashboard.numerology.personalMonth} value={insight.personal_month} />
                <NumberTile label={messages.dashboard.numerology.personalYear} value={insight.personal_year} />
              </div>
            </section>
          </aside>
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-5">
        <div className="flex flex-wrap items-center gap-3">
          {showWhyModal && (
            <button
              onClick={() => setShowWhyThis(true)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {messages.insight.whyThis}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {showFeedback && !feedbackSubmitted && profile?.id && (
            <FeedbackUI
              insightId={insight.id}
              userId={profile.id}
              onSubmitted={() => setFeedbackSubmitted(true)}
            />
          )}

          {feedbackSubmitted && (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {messages.insight.feedbackReceived}
            </span>
          )}
        </div>
      </footer>

      {showWhyThis && (
        <WhyThisInsightModal
          insightId={insight.id}
          onClose={() => setShowWhyThis(false)}
        />
      )}
    </article>
  );
}

function ClaimSnapshot({ claim }: { claim: Claim }) {
  const typeLabel: Record<ClaimType, string> = {
    calculated: messages.claimTypes.calculated,
    interpreted: messages.claimTypes.interpreted,
    exploratory: messages.claimTypes.exploratory,
  };

  const colorMap: Record<ClaimType, string> = {
    calculated: 'bg-sky-50 text-sky-700 ring-sky-200',
    interpreted: 'bg-violet-50 text-violet-700 ring-violet-200',
    exploratory: 'bg-amber-50 text-amber-700 ring-amber-200',
  };

  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ring-1 ${colorMap[claim.type]}`}>
          {typeLabel[claim.type]}
        </span>
        {claim.confidence !== null && (
          <span className="text-xs text-slate-500">
            {(claim.confidence * 100).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {claim.text.replace(/\[(Calculated|Interpreted|Exploratory)\]\s*/, '')}
      </p>
    </div>
  );
}

function NumberTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-4 text-center ring-1 ring-slate-200">
      <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function layerLabel(layer: LayerType): string {
  if (layer === 'quick') return messages.insight.layers.quick;
  if (layer === 'deep') return messages.insight.layers.deep;
  return messages.insight.layers.standard;
}

function formatShortDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default InsightCard;
