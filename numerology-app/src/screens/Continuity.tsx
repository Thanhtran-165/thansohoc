import type { ReactNode } from 'react';
import messages from '@localization';
import { useUserStore } from '@stores/userStore';
import { PageHero, PageSection, PageWrap } from '@components/layout/ScreenPrimitives';
import { CycleRiver } from '@components/observatory/ObservatoryVisuals';
import {
  getPracticeSummary,
  getRecentPracticeContext,
  getWeeklyNumerologyArc,
  getMonthlyNumerologyArc,
} from '@services/dailyPractice';
import {
  buildContinuityReadingBlock,
  buildMonthlyCycleReading,
  buildWeeklyCycleReading,
} from '@services/insight/metaReadings';

export default function Continuity() {
  const { profile } = useUserStore();
  const context = profile?.id ? getRecentPracticeContext(profile.id) : null;
  const summary = profile?.id ? getPracticeSummary(profile.id) : null;
  let weeklyArc = null;
  let monthlyArc = null;

  if (profile) {
    try {
      weeklyArc = getWeeklyNumerologyArc(profile.full_name, profile.date_of_birth, profile.current_name);
      monthlyArc = getMonthlyNumerologyArc(profile.full_name, profile.date_of_birth, profile.current_name);
    } catch {
      weeklyArc = null;
      monthlyArc = null;
    }
  }

  if (!profile?.id || !context || !summary || !weeklyArc || !monthlyArc) {
    return (
      <PageWrap>
        <PageHero
          eyebrow={messages.continuity.title}
          title={messages.continuity.title}
          subtitle={messages.continuity.empty}
          accent="sky"
        />
      </PageWrap>
    );
  }

  const continuityReading = buildContinuityReadingBlock(
    context.continuity_note,
    context.theme_shift,
    summary.dominant_theme_last_30
  );
  const weeklyReading = buildWeeklyCycleReading(weeklyArc);
  const monthlyReading = buildMonthlyCycleReading(monthlyArc);

  return (
    <PageWrap>
      <PageHero
        eyebrow={messages.continuity.title}
        title={messages.continuity.title}
        subtitle={continuityReading.paragraphs[0] ?? messages.continuity.subtitle}
        accent="sky"
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]">
        <div className="space-y-6">
          <InfoCard title={messages.continuity.cards.weekly}>
            <div className="space-y-4">
              <div>
                <div className="type-card-title">{weeklyArc.title}</div>
                <div className="mt-1 text-sm text-slate-400">{weeklyArc.range_label}</div>
              </div>
              <div className="grid gap-4">
                {weeklyReading.sections.map((section) => (
                  <div
                    key={section.title}
                    className="glass-card elevate-hover rounded-[28px] p-5"
                  >
                    <div className="type-chip-label">{section.title}</div>
                    <p className="type-body-sm mt-2">{section.body}</p>
                  </div>
                ))}
              </div>
              <CycleRiver
                eyebrow="Dòng tuần"
                points={weeklyArc.daily_numbers.map((item) => ({
                  label: item.label,
                  value: item.personal_day,
                  note: `Ngày ${item.personal_day}`,
                }))}
                currentIndex={weeklyArc.daily_numbers.findIndex((item) => item.date === new Date().toISOString().slice(0, 10))}
              />
            </div>
          </InfoCard>

          <InfoCard title={messages.continuity.cards.monthly}>
            <div className="space-y-4">
              <div>
                <div className="type-card-title">{monthlyArc.title}</div>
                <div className="mt-1 text-sm text-slate-400">{monthlyArc.range_label}</div>
              </div>
              <div className="grid gap-4">
                {monthlyReading.sections.map((section) => (
                  <div
                    key={section.title}
                    className="glass-card elevate-hover rounded-[28px] p-5"
                  >
                    <div className="type-chip-label">{section.title}</div>
                    <p className="type-body-sm mt-2">{section.body}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4">
                {monthlyArc.weekly_highlights.map((item) => (
                  <div
                    key={item.label}
                    className="glass-card elevate-hover rounded-[28px] p-5"
                  >
                    <div className="type-chip-label">{item.label}</div>
                    <p className="type-body-sm mt-2">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </InfoCard>

          <InfoCard title={messages.continuity.cards.recurring}>
            {context.recurring_themes.length > 0 ? (
              <div className="space-y-4">
                {context.recurring_themes.map((item) => (
                  <div key={item.theme}>
                  <div className="flex items-center justify-between gap-3 text-base text-slate-200">
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
            ) : (
              <p className="text-base leading-8 text-slate-300">
                Chưa có chủ đề nào lặp lại đủ rõ để gọi tên.
              </p>
            )}
          </InfoCard>

          <InfoCard title={messages.continuity.cards.recentNumbers}>
            {context.recent_numbers.length > 0 ? (
              <CycleRiver
                eyebrow="Vệt 30 ngày"
                points={context.recent_numbers.map((item) => ({
                  label: formatShortDate(item.date),
                  value: item.personal_day,
                  note: `${item.personal_day}/${item.personal_month}/${item.personal_year}`,
                }))}
                currentIndex={context.recent_numbers.length - 1}
              />
            ) : (
              <p className="text-base leading-8 text-slate-300">
                Chưa có đủ dữ liệu nhịp gần đây.
              </p>
            )}
          </InfoCard>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <MetricStack
            streak={context.current_streak}
            viewed={`${context.viewed_days_last_30}/${Math.max(context.report_days_last_30, 1)}`}
            dominantTheme={summary.dominant_theme_last_30}
          />
        </aside>
      </section>
    </PageWrap>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <PageSection eyebrow={title}>{children}</PageSection>
  );
}

function MetricStack({
  streak,
  viewed,
  dominantTheme,
}: {
  streak: number;
  viewed: string;
  dominantTheme: string | null;
}) {
  return (
    <section className="glass-panel rounded-[34px] p-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <MetricChip label={messages.continuity.cards.streak} value={`${streak}`} />
        <MetricChip label={messages.continuity.cards.opened7} value={viewed} />
      </div>

      {dominantTheme && (
        <div className="glass-card mt-5 rounded-[28px] p-5">
          <div className="type-chip-label">
            {messages.continuity.cards.strongest}
          </div>
          <p className="mt-3 text-base leading-8 text-slate-200">{dominantTheme}</p>
        </div>
      )}
    </section>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-[28px] p-5">
      <div className="type-chip-label">{label}</div>
      <div className="mt-3 text-3xl font-semibold text-slate-50">{value}</div>
    </div>
  );
}

function formatShortDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  });
}
