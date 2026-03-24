/**
 * Dashboard Screen
 * One-way daily numerology report flow.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '@stores/userStore';
import { useInsightStore } from '@stores/insightStore';
import { InsightCard } from '@components/insight';
import { PracticeSummary } from '@/types';
import messages from '@localization';
import { getPracticeSummary } from '@services/dailyPractice';

export default function Dashboard() {
  const { profile } = useUserStore();
  const {
    todayInsight,
    isLoading: insightLoading,
    error: insightError,
    ensureTodayInsight,
    regenerateTodayInsight,
  } = useInsightStore();
  const [practiceSummary, setPracticeSummary] = useState<PracticeSummary | null>(null);

  useEffect(() => {
    if (profile?.id) {
      ensureTodayInsight(profile);
    }
  }, [
    profile?.id,
    profile?.full_name,
    profile?.date_of_birth,
    profile?.style_preference,
    profile?.insight_length,
    ensureTodayInsight,
  ]);

  useEffect(() => {
    if (profile?.id) {
      setPracticeSummary(getPracticeSummary(profile.id));
    }
  }, [profile?.id, todayInsight?.id, todayInsight?.viewed_at]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.24),_transparent_32%),linear-gradient(135deg,_#fffaf2_0%,_#ffffff_45%,_#f5f9ff_100%)] px-6 py-8 shadow-sm">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            <span>{getVietnameseGreeting()}</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>{formatVietnameseLongDate(new Date())}</span>
          </div>

          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {messages.dashboard.dailyReport}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {messages.dashboard.dailyReportDescription}
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-5 backdrop-blur">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {messages.dashboard.generatedForToday}
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {todayInsight?.headline || messages.dashboard.todaysInsight}
                </h2>
                {todayInsight?.theme && (
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700 ring-1 ring-sky-200">
                    {todayInsight.theme}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {todayInsight
                  ? stripClaimMarkers(todayInsight.layers.quick.content)
                  : messages.dashboard.insightSubtitle}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/10">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                {messages.dashboard.reportGuidance}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <OverviewMetric
                  label={messages.dashboard.numerology.personalDay}
                  value={todayInsight?.personal_day ?? '?'}
                />
                <OverviewMetric
                  label={messages.dashboard.numerology.personalMonth}
                  value={todayInsight?.personal_month ?? '?'}
                />
                <OverviewMetric
                  label={messages.dashboard.numerology.personalYear}
                  value={todayInsight?.personal_year ?? '?'}
                />
              </div>
              <div className="mt-4 border-t border-white/10 pt-4 space-y-2">
                <CadenceRow
                  label={messages.dashboard.practice.streak}
                  value={`${practiceSummary?.current_streak ?? 0}`}
                />
                <CadenceRow
                  label={messages.dashboard.practice.weeklyCompletion}
                  value={`${practiceSummary?.report_coverage_last_7 ?? 0}%`}
                />
                <CadenceRow
                  label={messages.history.cards.reportsRead}
                  value={`${practiceSummary?.viewed_days_last_7 ?? 0}/${practiceSummary?.report_days_last_7 ?? 0}`}
                />
                <Link
                  to="/history"
                  className="mt-4 inline-flex text-sm font-medium text-amber-300 transition hover:text-amber-200"
                >
                  {messages.dashboard.archiveLink}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {messages.dashboard.detailedReport}
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            {messages.dashboard.todaysInsight}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            App đọc ngày hiện tại và hồ sơ của bạn để tạo ra bản báo cáo này. Bạn không cần nhập mood, energy hay hoạt động hằng ngày để nhận được nội dung chính.
          </p>
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-6">
          {insightLoading ? (
            <InsightSkeleton />
          ) : todayInsight ? (
            <InsightCard
              insight={todayInsight}
              showFeedback={true}
              showWhyModal={true}
            />
          ) : (
            <EmptyInsightState
              error={insightError}
              onRetry={profile ? () => regenerateTodayInsight(profile) : undefined}
            />
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          {messages.nav.history}
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          Kho lưu trữ các báo cáo đã phát hành
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Mỗi ngày app tạo một báo cáo riêng và lưu lại để bạn có thể đọc lại bất cứ lúc nào, theo dõi chủ đề lặp lại và xem nhịp đọc của mình.
        </p>
        <Link
          to="/history"
          className="mt-5 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          {messages.actions.viewHistory}
        </Link>
      </section>
    </div>
  );
}

function OverviewMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/10">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function CadenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm text-slate-300">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
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

function stripClaimMarkers(content: string): string {
  return content.replace(/\[(Calculated|Interpreted|Exploratory)\]\s*/g, '').trim();
}

function InsightSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-7 w-2/5 rounded bg-slate-200" />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
      </div>
      <div className="space-y-2 rounded-2xl bg-slate-50 p-6">
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-11/12 rounded bg-slate-200" />
        <div className="h-4 w-10/12 rounded bg-slate-200" />
        <div className="h-4 w-8/12 rounded bg-slate-200" />
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
    <div className="py-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-100">
        <svg className="h-7 w-7 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-800">{messages.dashboard.noInsight.title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
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
