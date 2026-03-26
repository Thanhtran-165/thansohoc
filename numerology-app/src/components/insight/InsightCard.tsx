/**
 * InsightCard Component
 * Editorial-style daily report presentation.
 */

import { useEffect, useMemo, useState } from 'react';
import { DailyInsight, InsightPresentationBlocks } from '@/types';
import { FeedbackUI } from './FeedbackUI';
import { useUserStore } from '@stores/userStore';
import messages from '@localization';
import { trackEvent } from '@services/analytics';
import { getPracticeSummary, getRecentPracticeContext } from '@services/dailyPractice';

interface InsightCardProps {
  insight: DailyInsight;
  showFeedback?: boolean;
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

  const currentLayer = insight.layers.deep ?? insight.layers.standard;
  const presentation = insight.presentation;

  const openingSummary = useMemo(
    () => stripClaimMarkers(insight.layers.quick.content),
    [insight.layers.quick.content]
  );

  const narrativeSections = useMemo(() => {
    const paragraphs = filterRedundantParagraphs(
      splitIntoParagraphs(currentLayer.content),
      openingSummary
    );
    return buildNarrativeSections(paragraphs, presentation?.narrative_beats);
  }, [currentLayer.content, openingSummary, presentation?.narrative_beats]);

  const energySignals = useMemo(
    () => buildEnergySignals(presentation),
    [presentation]
  );
  const practicalGuidance = presentation?.practical_guidance ?? [];
  const decisionCompass = presentation?.decision_compass;
  const practiceContext = useMemo(
    () => (profile?.id ? getRecentPracticeContext(profile.id) : null),
    [profile?.id, insight.id]
  );
  const practiceSummary = useMemo(
    () => (profile?.id ? getPracticeSummary(profile.id) : null),
    [profile?.id, insight.id]
  );

  const numerologyNumbers = [
    { label: messages.dashboard.numerology.personalDay, value: insight.personal_day },
    { label: messages.dashboard.numerology.personalMonth, value: insight.personal_month },
    { label: messages.dashboard.numerology.personalYear, value: insight.personal_year },
  ];

  return (
    <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.08)]">
      <header className="relative overflow-hidden border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_24%),linear-gradient(180deg,_#fffdf8_0%,_#ffffff_65%,_#f8fbff_100%)] px-6 py-8 sm:px-8 sm:py-10">
        <div className="relative max-w-4xl">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/85 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 ring-1 ring-slate-200">
              {formatLongDate(insight.date)}
            </span>
            {insight.is_fallback && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                {messages.insight.cached}
              </span>
            )}
          </div>

          <h2 className="mt-4 max-w-4xl font-serif text-4xl leading-[1.08] text-slate-950 sm:text-5xl">
            {insight.headline}
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-700 sm:text-xl">
            {openingSummary}
          </p>

          {presentation?.visual_scene && (
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              <SceneChip label="Không khí chung" value={presentation.visual_scene.atmosphere} />
              <SceneChip label="Nhịp di chuyển" value={presentation.visual_scene.movement} />
              <SceneChip label="Điều nên giữ" value={presentation.visual_scene.focal_point} />
            </div>
          )}
        </div>
      </header>

      <div className="space-y-8 px-6 py-8 sm:px-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="space-y-8">
            <TodayRhythmPanel numbers={numerologyNumbers} signals={energySignals} />

            {practicalGuidance.length > 0 && (
              <PracticalFocusPanel
                items={practicalGuidance}
              />
            )}

            {narrativeSections.length > 0 && (
              <GuidedReadingPanel
                sections={narrativeSections}
              />
            )}

            {presentation?.closing_signal && (
              <ClosingReflection closingSignal={presentation.closing_signal} />
            )}
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            {decisionCompass && (
              <TensionMapPanel decisionCompass={decisionCompass} signals={energySignals} />
            )}
            {practiceContext && (
              <ContinuityThreadPanel
                context={practiceContext}
                summary={practiceSummary}
              />
            )}
            {narrativeSections.length > 0 && (
              <ReadingPathPanel sections={narrativeSections} />
            )}
          </aside>
        </div>
      </div>

      <footer className="border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-8">
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
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
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
    warm: 'bg-[linear-gradient(180deg,_#fffaf3_0%,_#ffffff_100%)] border-amber-100',
    sky: 'bg-[linear-gradient(180deg,_#f8fcff_0%,_#ffffff_100%)] border-sky-100',
    ink: 'bg-[linear-gradient(180deg,_#f7f8fb_0%,_#ffffff_100%)] border-slate-200',
    rose: 'bg-[linear-gradient(180deg,_#fff8fb_0%,_#ffffff_100%)] border-rose-100',
  };

  return (
    <section id={section.id} className={`scroll-mt-24 rounded-[30px] border p-6 shadow-[0_16px_45px_rgba(15,23,42,0.05)] sm:p-8 ${accentClasses[section.accent]}`}>
      {section.eyebrow && (
        <div className="text-sm font-medium text-slate-500">
          {section.eyebrow}
        </div>
      )}
      <h3 className={`mt-4 font-serif text-slate-950 ${isLead ? 'text-3xl leading-[1.15]' : 'text-2xl leading-[1.2]'}`}>
        {section.title}
      </h3>
      <div className="mt-5 space-y-5">
        {section.paragraphs.map((paragraph, index) => (
          <p
            key={`${section.title}-${index}`}
            className={isLead && index === 0
              ? 'text-xl leading-9 text-slate-700'
              : 'text-[15px] leading-8 text-slate-700'}
          >
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}

function TensionMapPanel({
  decisionCompass,
  signals,
}: {
  decisionCompass: InsightPresentationBlocks['decision_compass'];
  signals: Array<{
    label: string;
    intensity: 1 | 2 | 3 | 4 | 5;
    meaning: string;
  }>;
}) {
  const strongestSignal = signals[0];

  return (
    <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#fffdf8_0%,_#ffffff_100%)] p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
        Bản đồ lực của ngày
      </div>
      <div className="mt-4 space-y-3">
        <CompassRow label="Đi theo" value={decisionCompass.lean_in} tone="sky" />
        <CompassRow label="Giữ vững" value={decisionCompass.hold_steady} tone="warm" />
        <CompassRow label="Đừng ép" value={decisionCompass.avoid_force} tone="ink" />
      </div>

      {strongestSignal && (
        <div className="mt-5 rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-slate-900">Lực nổi rõ nhất</div>
            <SignalDots intensity={strongestSignal.intensity} />
          </div>
          <div className="mt-3 text-base font-medium text-slate-900">{strongestSignal.label}</div>
          <p className="mt-2 text-sm leading-7 text-slate-600">{strongestSignal.meaning}</p>
        </div>
      )}
    </section>
  );
}

function CompassRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'warm' | 'sky' | 'ink';
}) {
  const toneClass = {
    warm: 'bg-amber-50 border-amber-100',
    sky: 'bg-sky-50 border-sky-100',
    ink: 'bg-slate-50 border-slate-200',
  }[tone];

  return (
    <div className={`rounded-[20px] border p-4 ${toneClass}`}>
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-sm leading-7 text-slate-700">{value}</div>
    </div>
  );
}

function ContinuityThreadPanel({
  context,
  summary,
}: {
  context: ReturnType<typeof getRecentPracticeContext>;
  summary: ReturnType<typeof getPracticeSummary> | null;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#f8fbff_0%,_#ffffff_100%)] p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
        Mạch riêng của bạn
      </div>

      {context.continuity_note && (
        <p className="mt-4 text-sm leading-7 text-slate-700">{context.continuity_note}</p>
      )}

      <div className="mt-4 grid gap-3 grid-cols-2">
        <MetricChip label="Chuỗi hiện tại" value={`${context.current_streak}`} />
        <MetricChip label="Đã mở 7 ngày" value={`${context.viewed_days_last_7}/${Math.max(context.report_days_last_7, 1)}`} />
      </div>

      {context.theme_shift && (
        <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Nhịp đang đổi</div>
          <p className="mt-2 text-sm leading-7 text-slate-700">{context.theme_shift}</p>
        </div>
      )}

      {context.recurring_themes.length > 0 && (
        <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Chủ đề trở lại</div>
          <div className="mt-3 space-y-3">
            {context.recurring_themes.map((item) => (
              <div key={item.theme}>
                <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                  <span>{item.theme}</span>
                  <span>{item.count} lần</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,_#38bdf8_0%,_#f59e0b_100%)]"
                    style={{ width: `${Math.min(100, item.count * 33)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {context.recent_numbers.length > 0 && (
        <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">Dòng nhịp gần đây</div>
          <div className="mt-3 space-y-3">
            {context.recent_numbers.map((item) => (
              <div key={item.date} className="flex items-center justify-between gap-4 text-sm text-slate-700">
                <span>{formatShortDate(item.date)}</span>
                <span className="rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-600">
                  {item.personal_day}/{item.personal_month}/{item.personal_year}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary?.dominant_theme_last_7 && (
        <p className="mt-4 text-xs leading-6 text-slate-500">
          Mạch rõ nhất 7 ngày gần đây: {summary.dominant_theme_last_7}
        </p>
      )}
    </section>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-white p-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function ReadingPathPanel({
  sections,
}: {
  sections: NarrativeSectionModel[];
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#fff8fb_0%,_#ffffff_100%)] p-5 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
        Đường đọc hôm nay
      </div>
      <div className="mt-4 space-y-3">
        {sections.map((section, index) => (
          <button
            key={section.id}
            type="button"
            onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="w-full rounded-[18px] border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-medium text-white">
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900">{section.title}</div>
                {section.summary && (
                  <div className="mt-1 text-xs leading-5 text-slate-500">{section.summary}</div>
                )}
              </div>
            </div>
          </button>
        ))}
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

function formatShortDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
}

function SceneChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white/80 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="text-sm font-medium text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-sm leading-6 text-slate-700">
        {value}
      </div>
    </div>
  );
}

function TodayRhythmPanel({
  numbers,
  signals,
}: {
  numbers: Array<{ label: string; value: number }>;
  signals: Array<{
    label: string;
    intensity: 1 | 2 | 3 | 4 | 5;
    meaning: string;
  }>;
}) {
  return (
    <section className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,_#fcfcfd_0%,_#ffffff_100%)] p-6 shadow-[0_16px_45px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="max-w-3xl">
        <h3 className="font-serif text-3xl leading-[1.15] text-slate-950">
          Ba con số đang kéo ngày hôm nay
        </h3>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {numbers.map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
          >
            <div className="text-sm font-medium text-slate-500">{item.label}</div>
            <div className="mt-3 font-serif text-5xl leading-none text-slate-950">
              {item.value > 0 ? item.value : '...'}
            </div>
          </div>
        ))}
      </div>

      {signals.length > 0 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {signals.slice(0, 3).map((signal) => (
            <div key={signal.label} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-medium text-slate-900">{signal.label}</div>
                <SignalDots intensity={signal.intensity} />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{signal.meaning}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PracticalFocusPanel({
  items,
}: {
  items: PracticalGuidanceItem[];
}) {
  const toneMap: Record<PracticalGuidanceItem['area'], { shell: string; badge: string; label: string }> = {
    micro_action: {
      shell: 'border-emerald-100 bg-emerald-50/70',
      badge: 'bg-white text-emerald-700 ring-emerald-100',
      label: 'Một bước nhỏ',
    },
    work: {
      shell: 'border-sky-100 bg-sky-50/70',
      badge: 'bg-white text-sky-700 ring-sky-100',
      label: 'Trong công việc',
    },
    relationships: {
      shell: 'border-rose-100 bg-rose-50/70',
      badge: 'bg-white text-rose-700 ring-rose-100',
      label: 'Trong quan hệ',
    },
    self_regulation: {
      shell: 'border-violet-100 bg-violet-50/70',
      badge: 'bg-white text-violet-700 ring-violet-100',
      label: 'Giữ nhịp cho mình',
    },
  };

  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,_#f8fffb_0%,_#ffffff_100%)] p-6 shadow-[0_16px_45px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="max-w-3xl">
        <div>
          <h3 className="font-serif text-3xl leading-[1.15] text-slate-950">
            Nếu muốn áp dụng ngay
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
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
              className={`rounded-[26px] border p-6 shadow-[0_14px_35px_rgba(15,23,42,0.04)] ${tone.shell}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ring-1 ${tone.badge}`}>
                  {tone.label}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {item.timing}
                </span>
              </div>

              <h4 className="mt-4 text-2xl font-semibold leading-8 text-slate-900">
                {item.title}
              </h4>
              <p className="mt-4 text-base leading-8 text-slate-700">
                {item.suggestion}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SignalDots({ intensity }: { intensity: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`h-2.5 w-5 rounded-full ${index < intensity ? 'bg-[linear-gradient(90deg,_#38bdf8_0%,_#f59e0b_100%)]' : 'bg-white/15'}`}
        />
      ))}
    </div>
  );
}

function GuidedReadingPanel({
  sections,
}: {
  sections: NarrativeSectionModel[];
}) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
        <div className="max-w-3xl">
          <h3 className="font-serif text-3xl leading-[1.15] text-slate-950">
            Nhìn kỹ hơn
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
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

function ClosingReflection({
  closingSignal,
}: {
  closingSignal: InsightPresentationBlocks['closing_signal'];
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_100%)] p-6 text-white shadow-[0_20px_55px_rgba(15,23,42,0.24)] sm:p-8">
      <div className="text-sm font-medium text-slate-300">
        {closingSignal.title || 'Điều đáng giữ lại'}
      </div>
      <p className="mt-4 max-w-3xl font-serif text-3xl leading-[1.25] text-slate-100">
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
