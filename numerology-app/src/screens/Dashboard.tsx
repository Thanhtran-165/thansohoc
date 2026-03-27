/**
 * Dashboard Screen
 * Lightweight overview for today's report.
 */

import { useEffect, useMemo } from 'react';
import { useUserStore } from '@stores/userStore';
import { useInsightStore } from '@stores/insightStore';
import { buildInsightDisplayModel, SceneChip } from '@components/insight';
import { PageHero, PageSection, PageWrap } from '@components/layout/ScreenPrimitives';
import { DailyInsight } from '@/types';
import { getMonthlyNumerologyArc, getWeeklyNumerologyArc } from '@services/dailyPractice';
import { buildEmbeddedCycleContext } from '@services/insight/metaReadings';
import messages from '@localization';

export default function Dashboard() {
  const { profile } = useUserStore();
  const {
    todayInsight,
    isLoading: insightLoading,
    error: insightError,
    ensureTodayInsight,
    regenerateTodayInsight,
  } = useInsightStore();

  useEffect(() => {
    if (profile?.id) {
      ensureTodayInsight(profile);
    }
  }, [
    profile?.id,
    profile?.full_name,
    profile?.date_of_birth,
    profile?.style_preference,
    ensureTodayInsight,
  ]);

  return (
    <PageWrap>
      <PageHero
        eyebrow={`${getVietnameseGreeting()} · ${formatVietnameseLongDate(new Date())}`}
        title={messages.dashboard.dailyReport}
        subtitle="Hôm nay có điều gì đang nổi lên rõ nhất với bạn?"
        accent="amber"
        meta={
          profile ? (
            <button
              type="button"
              onClick={() => regenerateTodayInsight(profile)}
              className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Làm mới báo cáo hôm nay
            </button>
          ) : undefined
        }
      >
        <p className="max-w-2xl text-sm leading-7 text-slate-300">
          Nếu đang vội, chỉ cần nắm phần mở đầu rồi chuyển sang phần bạn cần ngay lúc này.
        </p>
      </PageHero>

      {insightLoading ? (
        <OverviewSkeleton />
      ) : todayInsight ? (
        <OverviewLayout insight={todayInsight} />
      ) : (
        <EmptyInsightState
          error={insightError}
          onRetry={profile ? () => regenerateTodayInsight(profile) : undefined}
        />
      )}
    </PageWrap>
  );
}

function OverviewLayout({ insight }: { insight: DailyInsight }) {
  const model = buildInsightDisplayModel(insight);
  const { profile } = useUserStore();
  const cycleContext = useMemo(() => {
    if (!profile) return null;
    try {
      const weekly = getWeeklyNumerologyArc(
        profile.full_name,
        profile.date_of_birth,
        profile.current_name,
        new Date(`${insight.date}T00:00:00`)
      );
      const monthly = getMonthlyNumerologyArc(
        profile.full_name,
        profile.date_of_birth,
        profile.current_name,
        new Date(`${insight.date}T00:00:00`)
      );
      return buildEmbeddedCycleContext(weekly, monthly);
    } catch {
      return null;
    }
  }, [profile, insight.date]);

  return (
    <>
      <PageSection tone="soft">
        <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_22%),linear-gradient(180deg,_rgba(255,255,255,0.03)_0%,_rgba(15,23,42,0.02)_68%,_rgba(56,189,248,0.02)_100%)] px-6 py-8 sm:px-8 sm:py-10">
          <div className="max-w-4xl">
            <span className="rounded-full border border-white/12 bg-white/8 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-slate-400 backdrop-blur-xl">
              {formatVietnameseLongDate(new Date(`${insight.date}T00:00:00`))}
            </span>
            <h2 className="mt-5 max-w-5xl text-5xl font-medium leading-[0.98] text-slate-50 sm:text-6xl">
              {insight.headline}
            </h2>
            <p className="mt-6 max-w-4xl text-lg leading-9 text-slate-200 sm:text-xl">
              {model.openingSummary}
            </p>
          </div>
        </div>

        {model.presentation?.visual_scene && (
          <div className="grid gap-4 px-6 py-6 md:grid-cols-3 sm:px-8">
            <SceneChip label="Không khí chung" value={model.presentation.visual_scene.atmosphere} />
            <SceneChip label="Nhịp di chuyển" value={model.presentation.visual_scene.movement} />
            <SceneChip label="Điều nên giữ" value={model.presentation.visual_scene.focal_point} />
          </div>
        )}
      </PageSection>

      {cycleContext && (
        <section className="grid gap-5 lg:grid-cols-2">
          <CycleContextCard title="Tuần này" body={cycleContext.weekly} />
          <CycleContextCard title="Tháng này" body={cycleContext.monthly} />
        </section>
      )}
    </>
  );
}

function CycleContextCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <section className="glass-panel elevate-hover drift-slow rounded-[28px] px-6 py-5">
      <div className="type-chip-label">{title}</div>
      <p className="type-body mt-3">{body}</p>
    </section>
  );
}

function getVietnameseGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return messages.greeting.morning;
  if (hour < 17) return messages.greeting.afternoon;
  return messages.greeting.evening;
}

function formatVietnameseLongDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function OverviewSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="glass-panel rounded-[38px] px-8 py-10">
        <div className="h-4 w-32 rounded bg-white/10" />
        <div className="mt-4 h-24 w-5/6 rounded bg-white/10" />
        <div className="mt-6 h-24 rounded-[28px] bg-white/6" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="h-28 rounded-[28px] bg-white/6" />
          <div className="h-28 rounded-[28px] bg-white/6" />
          <div className="h-28 rounded-[28px] bg-white/6" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-32 rounded-[34px] bg-white/6" />
        <div className="h-32 rounded-[34px] bg-white/6" />
      </div>
    </div>
  );
}

function EmptyInsightState({
  error,
  onRetry,
}: {
  error?: string | null;
  onRetry?: () => void;
}) {
  return (
    <div className="glass-panel rounded-[38px] px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[24px] bg-sky-400/12 ring-1 ring-sky-300/18 backdrop-blur-xl">
        <svg className="h-7 w-7 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-100">{messages.dashboard.noInsight.title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">
        {messages.dashboard.noInsight.description}
      </p>
      {error && (
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-amber-700">
          {error}
        </p>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Tạo báo cáo hôm nay
        </button>
      )}
    </div>
  );
}
