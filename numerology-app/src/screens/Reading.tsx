import { useEffect } from 'react';
import { useUserStore } from '@stores/userStore';
import { useInsightStore } from '@stores/insightStore';
import {
  buildInsightDisplayModel,
  ClosingReflection,
  GuidedReadingPanel,
} from '@components/insight';
import { PageHero, PageWrap } from '@components/layout/ScreenPrimitives';
import messages from '@localization';

export default function Reading() {
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
    return <ScreenSkeleton title={messages.reading.title} subtitle={messages.reading.subtitle} />;
  }

  if (!todayInsight) {
    return (
      <ScreenEmptyState
        title={messages.reading.title}
        subtitle={messages.reading.subtitle}
        error={insightError}
        onRetry={profile ? () => regenerateTodayInsight(profile) : undefined}
      />
    );
  }

  const model = buildInsightDisplayModel(todayInsight);

  return (
    <PageWrap>
      <PageHero
        eyebrow={messages.reading.title}
        title={todayInsight.headline}
        subtitle={model.openingSummary}
        accent="amber"
      />

      <div className="space-y-8">
        <GuidedReadingPanel sections={model.narrativeSections} />
        {model.presentation?.closing_signal && (
          <ClosingReflection closingSignal={model.presentation.closing_signal} />
        )}
      </div>
    </PageWrap>
  );
}

function ScreenSkeleton({
  title,
  subtitle,
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
      <div className="space-y-6">
        <div className="h-[320px] rounded-[36px] bg-white/6" />
        <div className="h-[240px] rounded-[36px] bg-white/6" />
      </div>
      <span className="sr-only">{`${title} ${subtitle}`}</span>
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
        <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-300 ring-1 ring-white/10 backdrop-blur-xl">
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
