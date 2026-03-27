import { useEffect, useMemo } from 'react';
import { useUserStore } from '@stores/userStore';
import { useInsightStore } from '@stores/insightStore';
import { PageHero, PageSection, PageWrap } from '@components/layout/ScreenPrimitives';
import { calculateNumerologyContext } from '@services/numerology';
import { getMonthlyNumerologyArc, getWeeklyNumerologyArc } from '@services/dailyPractice';
import { buildCompassReading, createMetaReadingContext } from '@services/insight/metaReadings';
import {
  buildInsightDisplayModel,
  TensionMapPanel,
  TodayRhythmPanel,
} from '@components/insight';
import messages from '@localization';

export default function Compass() {
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

  if (insightLoading) {
    return <ScreenSkeleton title={messages.compass.title} subtitle={messages.compass.subtitle} />;
  }

  if (!todayInsight) {
    return (
      <ScreenEmptyState
        title={messages.compass.title}
        subtitle={messages.compass.subtitle}
        error={insightError}
        onRetry={profile ? () => regenerateTodayInsight(profile) : undefined}
      />
    );
  }

  const model = buildInsightDisplayModel(todayInsight);
  const numerology = useMemo(() => {
    if (!profile) return null;
    try {
      return calculateNumerologyContext(
        profile.full_name,
        profile.date_of_birth,
        new Date(`${todayInsight.date}T00:00:00`),
        profile.current_name
      );
    } catch {
      return null;
    }
  }, [profile, todayInsight.date]);
  const compassReading = useMemo(() => {
    if (!profile || !numerology) return null;
    try {
      const weeklyArc = getWeeklyNumerologyArc(
        profile.full_name,
        profile.date_of_birth,
        profile.current_name,
        new Date(`${todayInsight.date}T00:00:00`)
      );
      const monthlyArc = getMonthlyNumerologyArc(
        profile.full_name,
        profile.date_of_birth,
        profile.current_name,
        new Date(`${todayInsight.date}T00:00:00`)
      );
      return buildCompassReading(
        numerology,
        createMetaReadingContext(numerology).blueprint,
        weeklyArc,
        monthlyArc
      );
    } catch {
      return null;
    }
  }, [profile, numerology, todayInsight.date]);

  return (
    <PageWrap>
      <PageHero
        eyebrow={messages.compass.title}
        title={todayInsight.headline}
        subtitle={compassReading?.summary ?? messages.compass.subtitle}
        accent="sky"
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <TodayRhythmPanel numbers={model.numerologyNumbers} signals={model.energySignals} />
        {model.decisionCompass && (
          <TensionMapPanel decisionCompass={model.decisionCompass} />
        )}
      </div>

      {compassReading && (
        <PageSection eyebrow="Đọc la bàn của ngày" tone="soft">
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {compassReading.sections.map((section) => (
              <div
                key={section.title}
                className="glass-card elevate-hover rounded-[24px] p-5"
              >
                <div className="type-chip-label">{section.title}</div>
                <p className="type-body-sm mt-3">{section.body}</p>
              </div>
            ))}
          </div>
        </PageSection>
      )}
    </PageWrap>
  );
}

function ScreenSkeleton({
  title: _title,
  subtitle: _subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-8">
      <section className="glass-panel rounded-[38px] px-6 py-8 sm:px-8 sm:py-10">
        <div className="h-4 w-24 rounded bg-white/10" />
        <div className="mt-4 h-14 w-3/4 rounded bg-white/10" />
        <div className="mt-5 h-6 w-1/2 rounded bg-white/6" />
      </section>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="h-[320px] rounded-[36px] bg-white/6" />
        <div className="h-[320px] rounded-[36px] bg-white/6" />
      </div>
    </div>
  );
}

function ScreenEmptyState({
  title,
  subtitle,
  error,
  onRetry,
}: {
  title: string;
  subtitle: string;
  error?: string | null;
  onRetry?: () => void;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="glass-panel rounded-[38px] px-6 py-8 sm:px-8 sm:py-10">
        <span className="type-chip-label">
          {title}
        </span>
        <p className="mt-5 text-lg leading-8 text-slate-200">{subtitle}</p>
      </section>
      <div className="glass-panel rounded-[38px] px-6 py-12 text-center">
        <h3 className="text-lg font-medium text-slate-100">{messages.dashboard.noInsight.title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-300">
          {messages.dashboard.noInsight.description}
        </p>
        {error && <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-amber-700">{error}</p>}
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
    </div>
  );
}
