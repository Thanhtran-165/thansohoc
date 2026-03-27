/**
 * WhyThisInsightModal Component
 * Explains how a specific insight was generated - Vietnamese UI
 *
 * Phase 5: Real data from database via persistence layer
 */

import { useState, useEffect } from 'react';
import Modal from '@components/common/Modal';
import { getWhyThisInsight } from '@services/insight/persistence';
import { WhyThisInsight as ServiceWhyThisInsight } from '@services/insight/types';
import messages from '@localization';

interface WhyThisInsightModalProps {
  insightId: string;
  onClose: () => void;
}

export function WhyThisInsightModal({
  insightId,
  onClose,
}: WhyThisInsightModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ServiceWhyThisInsight | null>(null);

  useEffect(() => {
    const fetchWhyThis = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch real WhyThisInsight data from database
        const whyThisData = await getWhyThisInsight(insightId);

        if (!whyThisData) {
          setError(null);
          setData(null);
        } else {
          setData(whyThisData);
        }
      } catch (err) {
        setError(messages.insight.failedToLoad);
        console.error('Failed to load WhyThisInsight:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWhyThis();
  }, [insightId]);

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onClose} title={messages.insight.whyThisTitle}>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-300/30 border-t-sky-300" />
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={true} onClose={onClose} title={messages.insight.whyThisTitle}>
        <div className="py-8 text-center text-rose-300">
          {error}
        </div>
      </Modal>
    );
  }

  // Handle no data state (when insight exists but why_this doesn't)
  if (!data) {
    return (
      <Modal isOpen={true} onClose={onClose} title={messages.insight.whyThisTitle}>
        <div className="text-center py-8">
          <p className="text-slate-300">
            {messages.insight.explanationNotAvailable}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {messages.insight.explanationNotAvailableDetail}
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={messages.insight.whyThisTitle}>
      <div className="max-h-[70vh] overflow-y-auto pr-1">
        {/* Data Sources */}
        <section className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-slate-200">{messages.insight.dataSources}</h4>
          <div className="glass-card rounded-[22px] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">{messages.insight.profileCompleteness}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-emerald-300 transition-all"
                    style={{ width: `${data.data_sources.profile_completeness * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-100">
                  {(data.data_sources.profile_completeness * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {messages.insight.available}: {data.data_sources.data_available.join(', ')}
            </div>
          </div>
        </section>

        {/* Calculated Claims */}
        <section className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-slate-200">{messages.insight.calculatedClaims}</h4>
          <div className="space-y-3">
            {data.calculated_claims.map((claim, index) => (
              <div key={index} className="glass-card rounded-[22px] p-4">
                <p className="mb-2 text-sm font-medium text-slate-100">
                  {claim.claim}
                </p>
                <div className="inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 font-mono text-xs text-sky-200">
                  {claim.formula}
                </div>
                {claim.inputs && Object.keys(claim.inputs).length > 0 && (
                  <div className="mt-2 text-xs text-slate-500">
                    <span className="font-medium">{messages.insight.inputs}:</span>{' '}
                    {Object.entries(claim.inputs).map(([k, v]) => `${k}=${v}`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Interpretation Basis */}
        <section className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-slate-200">{messages.insight.interpretationBasis}</h4>
          <div className="glass-card rounded-[22px] p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">{messages.insight.style}:</span>
                <span className="ml-2 font-medium capitalize text-violet-200">
                  {data.interpretation_basis.style_preference}
                </span>
              </div>
              <div>
                <span className="text-slate-500">{messages.insight.context}:</span>
                <span className="ml-2 text-xs text-violet-200">
                  {data.interpretation_basis.numerology_context.join(', ')}
                </span>
              </div>
            </div>
            {(data.interpretation_basis.dominant_axis ||
              data.interpretation_basis.pattern ||
              data.interpretation_basis.report_archetype ||
              data.interpretation_basis.conflict_grammar) && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {data.interpretation_basis.dominant_axis && (
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.04] p-3">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      {messages.insight.dominantAxis}
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-100">
                      {data.interpretation_basis.dominant_axis}
                    </div>
                  </div>
                )}
                {data.interpretation_basis.pattern && (
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.04] p-3">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      {messages.insight.pattern}
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-100">
                      {data.interpretation_basis.pattern}
                    </div>
                  </div>
                )}
                {data.interpretation_basis.report_archetype && (
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.04] p-3">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      {messages.insight.reportArchetype}
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-100">
                      {data.interpretation_basis.report_archetype}
                    </div>
                  </div>
                )}
                {data.interpretation_basis.conflict_grammar && (
                  <div className="rounded-[18px] border border-white/8 bg-white/[0.04] p-3">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      {messages.insight.conflictGrammar}
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-100">
                      {data.interpretation_basis.conflict_grammar}
                    </div>
                  </div>
                )}
              </div>
            )}
            {data.interpretation_basis.ruling_stack && data.interpretation_basis.ruling_stack.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  {messages.insight.hierarchy}
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.interpretation_basis.ruling_stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-xs font-medium text-violet-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.interpretation_basis.section_plan && data.interpretation_basis.section_plan.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  {messages.insight.reportStructure}
                </div>
                <div className="space-y-2">
                  {data.interpretation_basis.section_plan.map((item, index) => (
                    <div key={`${index}-${item}`} className="rounded-[18px] border border-white/8 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.interpretation_basis.assembly_plan && data.interpretation_basis.assembly_plan.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  {messages.insight.auditTrail}
                </div>
                <div className="space-y-2">
                  {data.interpretation_basis.assembly_plan.map((item, index) => (
                    <div key={`${index}-${item}`} className="rounded-[18px] border border-white/8 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-2 text-xs text-slate-500">
              {messages.insight.modelVersion}{data.interpretation_basis.model_version} •
              {messages.insight.promptVersion}{data.interpretation_basis.prompt_version}
            </div>
          </div>
        </section>

        {/* Confidence Breakdown */}
        <section className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-slate-200">{messages.insight.confidenceBreakdown}</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{messages.insight.dataQuality}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-300"
                    style={{ width: `${data.confidence_breakdown.data * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-100">
                  {(data.confidence_breakdown.data * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{messages.insight.interpretationConfidence}</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-violet-300"
                    style={{ width: `${data.confidence_breakdown.interpretation * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-100">
                  {(data.confidence_breakdown.interpretation * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/8 pt-2">
              <span className="text-sm font-medium text-slate-100">{messages.insight.overall}</span>
              <span className="text-lg font-bold text-sky-200">
                {(data.confidence_breakdown.overall * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </section>

        {/* Explanation */}
        {data.explanation && (
          <section>
            <h4 className="mb-3 text-sm font-medium text-slate-200">{messages.insight.summary}</h4>
            <p className="text-sm leading-relaxed text-slate-300">
              {data.explanation}
            </p>
          </section>
        )}
      </div>
    </Modal>
  );
}

export default WhyThisInsightModal;
