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
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500" />
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={true} onClose={onClose} title={messages.insight.whyThisTitle}>
        <div className="text-center py-8 text-red-500">
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
          <p className="text-gray-500">
            {messages.insight.explanationNotAvailable}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {messages.insight.explanationNotAvailableDetail}
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={messages.insight.whyThisTitle}>
      <div className="max-h-[70vh] overflow-y-auto">
        {/* Data Sources */}
        <section className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">{messages.insight.dataSources}</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{messages.insight.profileCompleteness}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${data.data_sources.profile_completeness * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {(data.data_sources.profile_completeness * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {messages.insight.available}: {data.data_sources.data_available.join(', ')}
            </div>
          </div>
        </section>

        {/* Calculated Claims */}
        <section className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">{messages.insight.calculatedClaims}</h4>
          <div className="space-y-3">
            {data.calculated_claims.map((claim, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  {claim.claim}
                </p>
                <div className="text-xs text-blue-600 bg-blue-100 rounded px-2 py-1 font-mono">
                  {claim.formula}
                </div>
                {claim.inputs && Object.keys(claim.inputs).length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
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
          <h4 className="text-sm font-medium text-gray-700 mb-3">{messages.insight.interpretationBasis}</h4>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">{messages.insight.style}:</span>
                <span className="ml-2 font-medium text-purple-700 capitalize">
                  {data.interpretation_basis.style_preference}
                </span>
              </div>
              <div>
                <span className="text-gray-500">{messages.insight.context}:</span>
                <span className="ml-2 text-purple-700 text-xs">
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
                  <div className="rounded-lg bg-white/70 p-3">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                      {messages.insight.dominantAxis}
                    </div>
                    <div className="mt-2 text-sm font-medium text-purple-800">
                      {data.interpretation_basis.dominant_axis}
                    </div>
                  </div>
                )}
                {data.interpretation_basis.pattern && (
                  <div className="rounded-lg bg-white/70 p-3">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                      {messages.insight.pattern}
                    </div>
                    <div className="mt-2 text-sm font-medium text-purple-800">
                      {data.interpretation_basis.pattern}
                    </div>
                  </div>
                )}
                {data.interpretation_basis.report_archetype && (
                  <div className="rounded-lg bg-white/70 p-3">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                      {messages.insight.reportArchetype}
                    </div>
                    <div className="mt-2 text-sm font-medium text-purple-800">
                      {data.interpretation_basis.report_archetype}
                    </div>
                  </div>
                )}
                {data.interpretation_basis.conflict_grammar && (
                  <div className="rounded-lg bg-white/70 p-3">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                      {messages.insight.conflictGrammar}
                    </div>
                    <div className="mt-2 text-sm font-medium text-purple-800">
                      {data.interpretation_basis.conflict_grammar}
                    </div>
                  </div>
                )}
              </div>
            )}
            {data.interpretation_basis.ruling_stack && data.interpretation_basis.ruling_stack.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500 mb-2">
                  {messages.insight.hierarchy}
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.interpretation_basis.ruling_stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-100"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.interpretation_basis.section_plan && data.interpretation_basis.section_plan.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500 mb-2">
                  {messages.insight.reportStructure}
                </div>
                <div className="space-y-2">
                  {data.interpretation_basis.section_plan.map((item, index) => (
                    <div key={`${index}-${item}`} className="rounded-lg bg-white/70 px-3 py-2 text-sm text-purple-800">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.interpretation_basis.assembly_plan && data.interpretation_basis.assembly_plan.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500 mb-2">
                  {messages.insight.auditTrail}
                </div>
                <div className="space-y-2">
                  {data.interpretation_basis.assembly_plan.map((item, index) => (
                    <div key={`${index}-${item}`} className="rounded-lg bg-white/70 px-3 py-2 text-sm text-purple-800">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500">
              {messages.insight.modelVersion}{data.interpretation_basis.model_version} •
              {messages.insight.promptVersion}{data.interpretation_basis.prompt_version}
            </div>
          </div>
        </section>

        {/* Confidence Breakdown */}
        <section className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">{messages.insight.confidenceBreakdown}</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{messages.insight.dataQuality}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${data.confidence_breakdown.data * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {(data.confidence_breakdown.data * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{messages.insight.interpretationConfidence}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${data.confidence_breakdown.interpretation * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {(data.confidence_breakdown.interpretation * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">{messages.insight.overall}</span>
              <span className="text-lg font-bold text-primary-600">
                {(data.confidence_breakdown.overall * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </section>

        {/* Explanation */}
        {data.explanation && (
          <section>
            <h4 className="text-sm font-medium text-gray-700 mb-3">{messages.insight.summary}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {data.explanation}
            </p>
          </section>
        )}
      </div>
    </Modal>
  );
}

export default WhyThisInsightModal;
