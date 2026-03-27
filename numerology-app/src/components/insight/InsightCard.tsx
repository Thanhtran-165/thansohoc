/**
 * InsightCard Component
 * Editorial-style daily report presentation.
 */

import { useEffect, useState } from 'react';
import { DailyInsight, InsightPresentationBlocks } from '@/types';
import { FeedbackUI } from './FeedbackUI';
import { useUserStore } from '@stores/userStore';
import messages from '@localization';
import { trackEvent } from '@services/analytics';
import { DayOrbitMap, ForceFieldMap } from '@components/observatory/ObservatoryVisuals';

interface InsightCardProps {
  insight: DailyInsight;
  showFeedback?: boolean;
  mode?: 'full' | 'reading';
}

type NarrativeSectionModel = {
  id: string;
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  accent: 'warm' | 'sky' | 'ink' | 'rose';
  summary?: string;
};

type PracticalGuidanceItem = InsightPresentationBlocks['practical_guidance'][number];

export interface InsightDisplayModel {
  openingSummary: string;
  narrativeSections: NarrativeSectionModel[];
  energySignals: Array<{
    label: string;
    intensity: 1 | 2 | 3 | 4 | 5;
    meaning: string;
  }>;
  practicalGuidance: PracticalGuidanceItem[];
  decisionCompass?: InsightPresentationBlocks['decision_compass'];
  numerologyNumbers: Array<{ label: string; value: number }>;
  presentation?: InsightPresentationBlocks;
}

const SECTION_BLUEPRINTS: Array<{
  eyebrow?: string;
  title: string;
  accent: NarrativeSectionModel['accent'];
}> = [
  { eyebrow: 'Điều đang mở ra', title: 'Điều nổi lên trước mắt', accent: 'warm' },
  { eyebrow: 'Điều cần giữ', title: 'Điểm tựa của ngày', accent: 'sky' },
  { eyebrow: 'Cách đi tiếp', title: 'Cách giữ cho mọi thứ vừa nhịp', accent: 'ink' },
  { eyebrow: 'Nhìn rộng hơn', title: 'Lớp nghĩa sâu hơn', accent: 'rose' },
  { eyebrow: 'Điều còn đọng lại', title: 'Điều đáng mang theo', accent: 'warm' },
];

export function InsightCard({
  insight,
  showFeedback = true,
  mode = 'full',
}: InsightCardProps) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { profile } = useUserStore();

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

  const displayModel = buildInsightDisplayModel(insight);
  const {
    openingSummary: modelOpeningSummary,
    narrativeSections: modelNarrativeSections,
    energySignals: modelEnergySignals,
    practicalGuidance: modelPracticalGuidance,
    decisionCompass: modelDecisionCompass,
    numerologyNumbers: modelNumerologyNumbers,
    presentation: modelPresentation,
  } = displayModel;

  if (mode === 'reading') {
    return (
      <article className="glass-panel motion-sheen overflow-hidden rounded-[38px] border-white/10 bg-slate-950/34 shadow-[0_24px_90px_rgba(2,6,23,0.34)]">
        <div className="space-y-8 px-6 py-8 sm:px-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_320px]">
            <div className="space-y-8">
              <GuidedReadingPanel sections={modelNarrativeSections} />
              {modelPresentation?.closing_signal && (
                <ClosingReflection closingSignal={modelPresentation.closing_signal} />
              )}
            </div>

            <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
              {modelDecisionCompass && (
                <TensionMapPanel decisionCompass={modelDecisionCompass} />
              )}
              <TodayRhythmPanel numbers={modelNumerologyNumbers} signals={modelEnergySignals} compact />
            </aside>
          </div>
        </div>

        <footer className="border-t border-white/10 bg-white/[0.04] px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {showFeedback && !feedbackSubmitted && profile?.id && (
                <FeedbackUI
                  insightId={insight.id}
                  userId={profile.id}
                  onSubmitted={() => setFeedbackSubmitted(true)}
                />
              )}

              {feedbackSubmitted && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/12 px-4 py-2 text-sm font-medium text-emerald-200 ring-1 ring-emerald-300/20 backdrop-blur-xl">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {messages.insight.feedbackReceived}
                </span>
              )}
            </div>
          </div>
        </footer>
      </article>
    );
  }

  return (
      <article className="glass-panel motion-sheen overflow-hidden rounded-[38px] border-white/10 bg-slate-950/34 shadow-[0_24px_90px_rgba(2,6,23,0.34)]">
      <header className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_24%),linear-gradient(180deg,_rgba(15,23,42,0.26)_0%,_rgba(15,23,42,0.12)_65%,_rgba(15,23,42,0.06)_100%)] px-6 py-8 sm:px-8 sm:py-10">
        <div className="relative max-w-4xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-300 ring-1 ring-white/10 backdrop-blur-xl">
              {formatLongDate(insight.date)}
            </span>
            {insight.is_fallback && (
              <span className="rounded-full bg-amber-400/12 px-3 py-1 text-xs font-medium text-amber-200 ring-1 ring-amber-300/20 backdrop-blur-xl">
                {messages.insight.cached}
              </span>
            )}
          </div>

          <h2 className="mt-4 max-w-4xl text-4xl font-medium leading-[1.08] text-slate-50 sm:text-5xl">
            {insight.headline}
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-200 sm:text-xl">
            {modelOpeningSummary}
          </p>

          {modelPresentation?.visual_scene && (
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <SceneChip label="Không khí chung" value={modelPresentation.visual_scene.atmosphere} />
              <SceneChip label="Nhịp di chuyển" value={modelPresentation.visual_scene.movement} />
              <SceneChip label="Điều nên giữ" value={modelPresentation.visual_scene.focal_point} />
            </div>
          )}
        </div>
      </header>

      <div className="space-y-8 px-6 py-8 sm:px-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="space-y-8">
            <TodayRhythmPanel numbers={modelNumerologyNumbers} signals={modelEnergySignals} />

            {modelPracticalGuidance.length > 0 && (
              <PracticalFocusPanel
                items={modelPracticalGuidance}
              />
            )}

            {modelNarrativeSections.length > 0 && (
              <GuidedReadingPanel
                sections={modelNarrativeSections}
              />
            )}

            {modelPresentation?.closing_signal && (
              <ClosingReflection closingSignal={modelPresentation.closing_signal} />
            )}
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            {modelDecisionCompass && (
              <TensionMapPanel decisionCompass={modelDecisionCompass} />
            )}
          </aside>
        </div>
      </div>

      <footer className="border-t border-white/10 bg-white/[0.04] px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {showFeedback && !feedbackSubmitted && profile?.id && (
              <FeedbackUI
                insightId={insight.id}
                userId={profile.id}
                onSubmitted={() => setFeedbackSubmitted(true)}
              />
            )}

            {feedbackSubmitted && (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/12 px-4 py-2 text-sm font-medium text-emerald-200 ring-1 ring-emerald-300/20 backdrop-blur-xl">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {messages.insight.feedbackReceived}
              </span>
            )}
          </div>
        </div>
      </footer>
    </article>
  );
}

export function buildInsightDisplayModel(insight: DailyInsight): InsightDisplayModel {
  const currentLayer = insight.layers.deep ?? insight.layers.standard;
  const presentation = insight.presentation;
  const openingSummary = stripClaimMarkers(insight.layers.quick.content);
  const narrativeSections = buildNarrativeSections(
    filterRedundantParagraphs(splitIntoParagraphs(currentLayer.content), openingSummary),
    presentation?.narrative_beats
  );
  const energySignals = buildEnergySignals(presentation);
  const practicalGuidance = presentation?.practical_guidance ?? [];
  const decisionCompass = presentation?.decision_compass;
  const numerologyNumbers = [
    { label: messages.dashboard.numerology.personalDay, value: insight.personal_day },
    { label: messages.dashboard.numerology.personalMonth, value: insight.personal_month },
    { label: messages.dashboard.numerology.personalYear, value: insight.personal_year },
  ];

  return {
    openingSummary,
    narrativeSections,
    energySignals,
    practicalGuidance,
    decisionCompass,
    numerologyNumbers,
    presentation,
  };
}

function buildNarrativeSections(
  paragraphs: string[],
  beats?: InsightPresentationBlocks['narrative_beats']
): NarrativeSectionModel[] {
  const chunks = chunkParagraphs(paragraphs, beats?.length);

  return chunks.map((chunk, index) => {
    const blueprint = SECTION_BLUEPRINTS[index] ?? SECTION_BLUEPRINTS[SECTION_BLUEPRINTS.length - 1];
    const beat = beats?.[index];

    return {
      id: `section-${index + 1}-${slugify(beat?.title ?? blueprint.title)}`,
      eyebrow: blueprint.eyebrow,
      title: beat?.title ?? blueprint.title,
      paragraphs: chunk,
      accent: blueprint.accent,
      summary: beat?.summary,
    };
  });
}

function chunkParagraphs(paragraphs: string[], preferredChunks?: number): string[][] {
  if (paragraphs.length <= 2) {
    return paragraphs.map((paragraph) => [paragraph]);
  }

  if (preferredChunks && preferredChunks > 0) {
    const chunkCount = Math.min(preferredChunks, paragraphs.length);
    const baseSize = Math.floor(paragraphs.length / chunkCount);
    let remainder = paragraphs.length % chunkCount;
    const chunks: string[][] = [];
    let cursor = 0;

    for (let index = 0; index < chunkCount; index += 1) {
      const size = baseSize + (remainder > 0 ? 1 : 0);
      chunks.push(paragraphs.slice(cursor, cursor + size));
      cursor += size;
      remainder -= 1;
    }

    return chunks.filter((chunk) => chunk.length > 0);
  }

  const chunks: string[][] = [];
  let cursor = 0;

  while (cursor < paragraphs.length) {
    const remaining = paragraphs.length - cursor;
    const size = remaining === 3 ? 1 : remaining >= 4 ? 2 : 1;
    chunks.push(paragraphs.slice(cursor, cursor + size));
    cursor += size;
  }

  return chunks;
}

function splitIntoParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => stripClaimMarkers(paragraph).trim())
    .filter(Boolean);
}

function buildEnergySignals(
  presentation: InsightPresentationBlocks | undefined
): Array<{
  label: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  meaning: string;
}> {
  if (presentation?.energy_map?.length) {
    return presentation.energy_map.slice(0, 4);
  }
  return [];
}

function stripClaimMarkers(content: string): string {
  return content.replace(/\[(Calculated|Interpreted|Exploratory)\]\s*/g, '').trim();
}

function formatLongDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function NarrativeSection({
  section,
  isLead,
}: {
  section: NarrativeSectionModel;
  isLead: boolean;
}) {
  const accentClasses: Record<NarrativeSectionModel['accent'], string> = {
    warm: 'border-amber-400/12 bg-[linear-gradient(180deg,_rgba(251,191,36,0.08)_0%,_rgba(15,23,42,0.02)_100%)]',
    sky: 'border-sky-400/12 bg-[linear-gradient(180deg,_rgba(56,189,248,0.08)_0%,_rgba(15,23,42,0.02)_100%)]',
    ink: 'border-white/10 bg-[linear-gradient(180deg,_rgba(148,163,184,0.06)_0%,_rgba(15,23,42,0.02)_100%)]',
    rose: 'border-rose-400/12 bg-[linear-gradient(180deg,_rgba(251,113,133,0.08)_0%,_rgba(15,23,42,0.02)_100%)]',
  };

  return (
    <section id={section.id} className={`glass-panel elevate-hover drift-slow scroll-mt-24 rounded-[30px] border p-6 sm:p-8 ${accentClasses[section.accent]}`}>
      {section.eyebrow && (
        <div className="text-sm font-medium text-slate-400">
          {section.eyebrow}
        </div>
      )}
      <h3 className={`mt-4 font-medium text-slate-50 ${isLead ? 'text-3xl leading-[1.15]' : 'text-2xl leading-[1.2]'}`}>
        {section.title}
      </h3>
      <div className="mt-5 space-y-5">
        {section.paragraphs.map((paragraph, index) => (
          <p
            key={`${section.title}-${index}`}
            className={isLead && index === 0
              ? 'text-xl leading-9 text-slate-200'
              : 'text-[15px] leading-8 text-slate-300'}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

export function TensionMapPanel({
  decisionCompass,
}: {
  decisionCompass: InsightPresentationBlocks['decision_compass'];
}) {
  return (
    <section className="glass-panel motion-panel-float rounded-[28px] p-5">
      <div className="type-chip-label">
        Bản đồ lực của ngày
      </div>
      <div className="mt-4">
        <ForceFieldMap decisionCompass={decisionCompass} />
      </div>
    </section>
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function SceneChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card-strong motion-panel-float-delayed elevate-hover rounded-[20px] p-4">
      <div className="type-chip-label">
        {label}
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-200">
        {value}
      </div>
    </div>
  );
}

export function TodayRhythmPanel({
  numbers,
  signals,
  compact = false,
}: {
  numbers: Array<{ label: string; value: number }>;
  signals: Array<{
    label: string;
    intensity: 1 | 2 | 3 | 4 | 5;
    meaning: string;
  }>;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <section className="glass-panel motion-sheen motion-panel-float rounded-[28px] p-5">
        <div className="type-eyebrow">
          Ba con số hôm nay
        </div>
        <div className="mt-4">
          <DayOrbitMap numbers={numbers} signals={signals} compact />
        </div>
        <div className="mt-4 grid gap-3">
          {numbers.map((item) => (
            <div key={item.label} className="glass-card-strong motion-panel-float-delayed elevate-hover rounded-[20px] p-4">
              <div className="type-chip-label">{item.label}</div>
              <div className="mt-2 text-3xl font-semibold leading-none text-slate-50">
                {item.value > 0 ? item.value : '...'}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel motion-sheen motion-panel-float rounded-[30px] p-6 sm:p-8">
      <div className="max-w-3xl">
        <h3 className="type-block-heading">
          Ba con số đang kéo ngày hôm nay
        </h3>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {numbers.map((item) => (
          <div
            key={item.label}
            className="glass-card-strong motion-panel-float-delayed elevate-hover rounded-[24px] p-5"
          >
            <div className="type-chip-label">{item.label}</div>
            <div className="mt-3 text-5xl font-semibold leading-none text-slate-50">
              {item.value > 0 ? item.value : '...'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <DayOrbitMap numbers={numbers} signals={signals} />
      </div>

    </section>
  );
}

export function PracticalFocusPanel({
  items,
}: {
  items: PracticalGuidanceItem[];
}) {
  const toneMap: Record<PracticalGuidanceItem['area'], { shell: string; badge: string; label: string }> = {
    micro_action: {
      shell: 'border-emerald-300/16 bg-[linear-gradient(180deg,_rgba(16,185,129,0.08)_0%,_rgba(15,23,42,0.02)_100%)]',
      badge: 'bg-emerald-400/12 text-emerald-200 ring-emerald-300/20',
      label: 'Một bước nhỏ',
    },
    work: {
      shell: 'border-sky-300/16 bg-[linear-gradient(180deg,_rgba(56,189,248,0.08)_0%,_rgba(15,23,42,0.02)_100%)]',
      badge: 'bg-sky-400/12 text-sky-200 ring-sky-300/20',
      label: 'Trong công việc',
    },
    relationships: {
      shell: 'border-rose-300/16 bg-[linear-gradient(180deg,_rgba(251,113,133,0.08)_0%,_rgba(15,23,42,0.02)_100%)]',
      badge: 'bg-rose-400/12 text-rose-200 ring-rose-300/20',
      label: 'Trong quan hệ',
    },
    self_regulation: {
      shell: 'border-violet-300/16 bg-[linear-gradient(180deg,_rgba(167,139,250,0.08)_0%,_rgba(15,23,42,0.02)_100%)]',
      badge: 'bg-violet-400/12 text-violet-200 ring-violet-300/20',
      label: 'Giữ nhịp cho mình',
    },
  };

  return (
    <section className="glass-panel motion-sheen overflow-hidden rounded-[30px] p-6 sm:p-8">
      <div className="max-w-3xl">
        <div>
          <h3 className="type-block-heading">
            Nếu muốn áp dụng ngay
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            Chỉ cần chọn một điều thấy đúng với mình lúc này.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {items.map((item, index) => {
          const tone = toneMap[item.area];
          return (
            <div
              key={`${item.area}-${index}`}
              className={`glass-card-strong motion-panel-float-delayed elevate-hover rounded-[26px] p-6 ${tone.shell}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ring-1 ${tone.badge}`}>
                  {tone.label}
                </span>
                <span className="text-xs text-slate-400">
                  {item.timing}
                </span>
              </div>

              <h4 className="mt-4 text-2xl font-semibold leading-8 text-slate-50">
                {item.title}
              </h4>
              <p className="mt-4 text-base leading-8 text-slate-200">
                {item.suggestion}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function GuidedReadingPanel({
  sections,
}: {
  sections: NarrativeSectionModel[];
}) {
  return (
    <section className="glass-panel motion-sheen overflow-hidden rounded-[30px]">
      <div className="border-b border-white/10 px-6 py-6 sm:px-8">
        <div className="max-w-3xl">
          <h3 className="type-block-heading">
            Nhìn kỹ hơn
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Mỗi phần chỉ giữ lại một lớp nghĩa thật sự đáng đọc.
          </p>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6 sm:px-8">
        {sections.map((section, index) => (
          <NarrativeSection
            key={`${section.title}-${index}`}
            section={section}
            isLead={index === 0}
          />
        ))}
      </div>
    </section>
  );
}

export function ClosingReflection({
  closingSignal,
}: {
  closingSignal: InsightPresentationBlocks['closing_signal'];
}) {
  return (
    <section className="glass-dark motion-panel-float rounded-[28px] p-6 text-white sm:p-8">
      <div className="text-sm font-medium text-slate-300">
        {closingSignal.title || 'Điều đáng giữ lại'}
      </div>
      <p className="mt-4 max-w-3xl text-3xl font-semibold leading-[1.25] text-slate-100">
        {closingSignal.phrase}
      </p>
    </section>
  );
}

function filterRedundantParagraphs(paragraphs: string[], openingSummary: string): string[] {
  if (paragraphs.length <= 1) {
    return paragraphs;
  }

  const normalizedSummary = normalizeForComparison(openingSummary);
  const seen = new Set<string>(normalizedSummary ? [normalizedSummary] : []);
  const filtered = paragraphs.filter((paragraph) => {
    const normalizedParagraph = normalizeForComparison(paragraph);
    if (!normalizedParagraph || !normalizedSummary) {
      if (!normalizedParagraph) {
        return false;
      }
    } else if (
      normalizedParagraph.includes(normalizedSummary) ||
      normalizedSummary.includes(normalizedParagraph) ||
      similarityScore(normalizedParagraph, normalizedSummary) >= 0.62
    ) {
      return false;
    }

    for (const prior of seen) {
      if (
        normalizedParagraph === prior ||
        normalizedParagraph.includes(prior) ||
        prior.includes(normalizedParagraph) ||
        similarityScore(normalizedParagraph, prior) >= 0.78
      ) {
        return false;
      }
    }

    seen.add(normalizedParagraph);
    return true;
  });

  return filtered.length > 0 ? filtered : paragraphs;
}

function normalizeForComparison(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function similarityScore(left: string, right: string): number {
  const leftWords = new Set(left.split(' ').filter(Boolean));
  const rightWords = new Set(right.split(' ').filter(Boolean));

  if (leftWords.size === 0 || rightWords.size === 0) {
    return 0;
  }

  let overlap = 0;
  leftWords.forEach((word) => {
    if (rightWords.has(word)) {
      overlap += 1;
    }
  });

  return overlap / Math.min(leftWords.size, rightWords.size);
}

export default InsightCard;
