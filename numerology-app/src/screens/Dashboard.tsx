/**
 * Dashboard Screen
 * One-way daily numerology report flow.
 */

import { useEffect } from 'react';
import { useUserStore } from '@stores/userStore';
import { useInsightStore } from '@stores/insightStore';
import { InsightCard } from '@components/insight';
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
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),_transparent_24%),linear-gradient(180deg,_#fff9f1_0%,_#ffffff_60%,_#f7fbff_100%)] px-6 py-8 shadow-[0_24px_90px_rgba(15,23,42,0.08)] sm:px-8 sm:py-10">
        <div className="absolute -left-10 bottom-0 h-44 w-44 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -right-8 top-0 h-52 w-52 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative">
          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              <span>{getVietnameseGreeting()}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{formatVietnameseLongDate(new Date())}</span>
            </div>

            <h1 className="max-w-4xl font-serif text-4xl leading-[1.05] text-slate-950 sm:text-5xl xl:text-6xl">
              {messages.dashboard.dailyReport}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Hôm nay có điều gì đang nổi lên rõ nhất với bạn?
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {profile && (
                <button
                  type="button"
                  onClick={() => regenerateTodayInsight(profile)}
                  className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Làm mới báo cáo hôm nay
                </button>
              )}
              <span className="text-sm leading-7 text-slate-500">
                Nếu đang vội, chỉ cần đọc phần mở đầu và chọn một gợi ý thấy hợp với mình lúc này.
              </span>
            </div>
          </div>
        </div>
      </section>

      {insightLoading ? (
        <InsightSkeleton />
      ) : todayInsight ? (
        <InsightCard
          insight={todayInsight}
          showFeedback={true}
        />
      ) : (
        <EmptyInsightState
          error={insightError}
          onRetry={profile ? () => regenerateTodayInsight(profile) : undefined}
        />
      )}
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

function InsightSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 px-8 py-10">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-4 h-14 w-4/5 rounded bg-slate-200" />
        <div className="mt-6 h-32 rounded-[28px] bg-slate-100" />
      </div>
      <div className="grid gap-6 px-8 py-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.8fr)]">
        <div className="space-y-5">
          <div className="h-56 rounded-[28px] bg-slate-100" />
          <div className="h-56 rounded-[28px] bg-slate-100" />
          <div className="h-56 rounded-[28px] bg-slate-100" />
        </div>
        <div className="space-y-5">
          <div className="h-52 rounded-[28px] bg-slate-100" />
          <div className="h-44 rounded-[28px] bg-slate-100" />
          <div className="h-44 rounded-[28px] bg-slate-100" />
        </div>
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
    <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_24px_90px_rgba(15,23,42,0.08)]">
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
