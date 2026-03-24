import { useEffect, useState } from 'react';
import { useUserStore } from '@stores/userStore';
import { getEngagementHighlights, getPracticeHistory, getPracticeSummary } from '@services/dailyPractice';
import { PracticeHistoryDay, PracticeSummary } from '@/types';
import messages from '@localization';

export default function History() {
  const { profile } = useUserStore();
  const [summary, setSummary] = useState<PracticeSummary | null>(null);
  const [history, setHistory] = useState<PracticeHistoryDay[]>([]);
  const [engagement, setEngagement] = useState<Array<{ label: string; value: number }>>([]);

  useEffect(() => {
    if (!profile?.id) {
      return;
    }

    setSummary(getPracticeSummary(profile.id));
    setHistory(getPracticeHistory(profile.id, 21));
    setEngagement(
      getEngagementHighlights(profile.id).map((item) => ({
        label: item.label,
        value: item.value,
      }))
    );
  }, [profile?.id]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,_#fffaf2_0%,_#ffffff_50%,_#f5f9ff_100%)] p-6 shadow-sm">
        <div className="max-w-3xl">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            {messages.nav.history}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {messages.history.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {messages.history.subtitle}
          </p>
        </div>
      </section>

      {summary && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              label={messages.history.cards.currentStreak}
              value={`${summary.current_streak}`}
              helper={messages.history.cards.currentStreakHelper}
              accent="primary"
            />
            <MetricCard
              label={messages.history.cards.weeklyCompletion}
              value={`${summary.report_coverage_last_7}%`}
              helper={`${summary.report_days_last_7}/7 ${messages.history.cards.daysActive}`}
              accent="amber"
            />
            <MetricCard
              label={messages.history.cards.reportsRead}
              value={`${summary.viewed_rate_last_7}%`}
              helper={messages.history.cards.reportsReadHelper}
              accent="violet"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">{messages.history.weeklyRecap}</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <StatBlock
                  label={messages.history.recap.reportsPublished}
                  value={`${summary.weekly_recap.report_days}`}
                />
                <StatBlock
                  label={messages.history.recap.reportsRead}
                  value={`${summary.weekly_recap.viewed_days}`}
                />
                <StatBlock
                  label={messages.history.recap.dominantTheme}
                  value={summary.weekly_recap.dominant_theme ?? '--'}
                />
                <StatBlock
                  label={messages.history.recap.latestHeadline}
                  value={summary.weekly_recap.latest_headline ?? '--'}
                />
              </div>
              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <div className="text-sm font-medium text-gray-700">{messages.history.recap.recurringThemes}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {summary.weekly_recap.recurring_themes.length > 0 ? (
                    summary.weekly_recap.recurring_themes.map((theme) => (
                      <span
                        key={theme}
                        className="rounded-full bg-white px-3 py-1 text-sm text-gray-700 shadow-sm ring-1 ring-gray-200"
                      >
                        {theme}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">{messages.history.recap.noThemes}</span>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">{messages.history.engagement.title}</h2>
              <div className="mt-4 space-y-3">
                {engagement.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-base font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{messages.history.timeline}</h2>
          <span className="text-sm text-gray-500">{messages.history.last21Days}</span>
        </div>
        <div className="mt-4 space-y-3">
          {history.length > 0 ? (
            history.map((day) => <HistoryRow key={day.date} day={day} />)
          ) : (
            <div className="rounded-xl bg-gray-50 px-4 py-5 text-sm text-gray-500">
              {messages.history.empty}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  accent: 'primary' | 'amber' | 'violet';
}) {
  const styles = {
    primary: 'from-primary-500 to-primary-600 bg-primary-50',
    amber: 'from-amber-500 to-orange-500 bg-amber-50',
    violet: 'from-violet-500 to-purple-600 bg-violet-50',
  };

  return (
    <div className={`rounded-2xl ${styles[accent].split(' ')[2]} p-5 shadow-sm ring-1 ring-gray-200`}>
      <div className={`inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl bg-gradient-to-br px-3 text-xl font-bold text-white ${styles[accent].split(' ').slice(0, 2).join(' ')}`}>
        {value}
      </div>
      <div className="mt-4 text-sm font-medium text-gray-600">{label}</div>
      <div className="mt-1 text-sm text-gray-500">{helper}</div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2 text-base font-semibold leading-6 text-gray-900">{value}</div>
    </div>
  );
}

function HistoryRow({ day }: { day: PracticeHistoryDay }) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-gray-900">{formatDateLabel(day.date)}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="sky">{messages.history.badges.insight}</Badge>
            <Badge tone={day.is_read ? 'emerald' : 'slate'}>
              {day.is_read ? messages.history.badges.read : messages.history.badges.unread}
            </Badge>
            {day.is_fallback && <Badge tone="amber">{messages.history.badges.fallback}</Badge>}
            {day.has_private_note && <Badge tone="violet">{messages.history.badges.journal}</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-50 p-3 ring-1 ring-gray-200">
          <MiniNumber label={messages.dashboard.numerology.personalDay} value={day.personal_day} />
          <MiniNumber label={messages.dashboard.numerology.personalMonth} value={day.personal_month} />
          <MiniNumber label={messages.dashboard.numerology.personalYear} value={day.personal_year} />
        </div>
      </div>

      {day.insight_headline && (
        <div className="mt-4">
          <div className="text-lg font-semibold text-gray-900">{day.insight_headline}</div>
          {day.insight_theme && <div className="mt-1 text-sm text-gray-500">{day.insight_theme}</div>}
        </div>
      )}

      {day.quick_summary && (
        <p className="mt-3 text-sm leading-7 text-gray-600">
          {day.quick_summary}
        </p>
      )}

      {day.note_excerpt && (
        <div className="mt-4 rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-violet-600">Ghi chú riêng</div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-violet-900/80">{day.note_excerpt}</p>
        </div>
      )}
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: string;
  tone: 'sky' | 'emerald' | 'amber' | 'violet' | 'slate';
}) {
  const styles = {
    sky: 'bg-primary-50 text-primary-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}

function MiniNumber({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-[0.16em] text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-gray-900">{value ?? '--'}</div>
    </div>
  );
}

function formatDateLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });
}
