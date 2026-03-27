import { useMemo } from 'react';
import { useUserStore } from '@stores/userStore';
import { PageHero, PageSection, PageWrap } from '@components/layout/ScreenPrimitives';
import { calculateNumerologyContext } from '@services/numerology';
import {
  buildBirthChartNarrative,
  buildLoShuDeepReading,
  createMetaReadingContext,
} from '@services/insight/metaReadings';
import { LoShuDigit } from '@/types';
import messages from '@localization';

const GRID_ORDER: LoShuDigit[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

export default function BirthChart() {
  const { profile } = useUserStore();

  const numerology = useMemo(() => {
    if (!profile) return null;
    try {
      return calculateNumerologyContext(
        profile.full_name,
        profile.date_of_birth,
        new Date(),
        profile.current_name
      );
    } catch {
      return null;
    }
  }, [profile]);

  if (!profile || !numerology) {
    return <EmptyState title={messages.birthChart.title} subtitle={messages.birthChart.subtitle} />;
  }

  const chart = numerology.extended.lo_shu;
  const loShuReading = buildLoShuDeepReading(
    numerology,
    createMetaReadingContext(numerology).blueprint
  );
  const birthNarrative = buildBirthChartNarrative(
    numerology,
    createMetaReadingContext(numerology).blueprint
  );

  return (
    <PageWrap>
      <PageHero
        eyebrow={messages.birthChart.title}
        title={messages.birthChart.title}
        subtitle={birthNarrative.summary}
        accent="amber"
        meta={
          <div className="glass-card rounded-[24px] px-4 py-3 text-right">
            <div className="type-chip-label">Trục bẩm sinh</div>
            <div className="mt-3 flex items-end justify-end gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Driver</div>
                <div className="mt-1 text-3xl font-semibold leading-none text-slate-50">{chart.driver_number}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Conductor</div>
                <div className="mt-1 text-3xl font-semibold leading-none text-slate-50">{chart.conductor_number}</div>
              </div>
            </div>
          </div>
        }
      />

      <div className="space-y-8">
          <PageSection eyebrow="Khí chất bẩm sinh">
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {birthNarrative.sections.map((section) => (
                <div
                  key={section.title}
                  className="glass-card elevate-hover rounded-[28px] p-5"
                >
                  <div className="type-card-title">{section.title}</div>
                  <p className="type-body-sm mt-3">{section.body}</p>
                </div>
              ))}
            </div>
          </PageSection>

          <PageSection eyebrow="Bàn số Lo Shu">
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {GRID_ORDER.flat().map((digit) => (
                <div key={digit} className="glass-card elevate-hover rounded-[24px] p-5 text-center">
                  <div className="type-chip-label">Số {digit}</div>
                  <div className="mt-3 text-4xl font-semibold leading-none text-slate-50">
                    {chart.grid[digit] > 0 ? chart.grid[digit] : '—'}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    {chart.grid[digit] > 1 ? `${chart.grid[digit]} lần` : chart.grid[digit] === 1 ? '1 lần' : 'không có'}
                  </div>
                </div>
              ))}
            </div>
          </PageSection>

          <PageSection eyebrow="Đọc lớp bẩm sinh" tone="soft">
            <div className="mt-4 grid gap-4">
              {loShuReading.sections.map((section) => (
                <div
                  key={section.title}
                  className="glass-card elevate-hover rounded-[28px] p-5"
                >
                  <div className="type-chip-label">{section.title}</div>
                  <p className="type-body-sm mt-3">{section.body}</p>
                </div>
              ))}
            </div>
          </PageSection>

          <PageSection eyebrow="Mũi tên đang có">
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {chart.present_arrows.length > 0 ? chart.present_arrows.map((arrow) => (
                <ArrowCard key={arrow.id} label={arrow.label} meaning={arrow.meaning} tone="present" />
              )) : (
                <p className="text-sm leading-7 text-slate-400">Hiện chưa có mũi tên trọn vẹn nào; điều này không xấu, chỉ có nghĩa là lực bẩm sinh phân tán hơn.</p>
              )}
            </div>
          </PageSection>

          <PageSection eyebrow="Khoảng trống đáng để ý">
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {chart.missing_arrows.length > 0 ? chart.missing_arrows.map((arrow) => (
                <ArrowCard key={arrow.id} label={arrow.label} meaning={arrow.meaning} tone="missing" />
              )) : (
                <p className="text-sm leading-7 text-slate-400">Không có khoảng trống lớn ở cấp mũi tên. Điều này cho thấy nền bẩm sinh khá cân.</p>
              )}
            </div>
          </PageSection>

          <section className="glass-panel elevate-hover rounded-[28px] p-5">
            <div className="type-chip-label">
              Số lặp mạnh
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {chart.dominant_digits.length > 0 ? chart.dominant_digits.map((item) => (
                <span key={item.digit} className="rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white">
                  {item.digit} × {item.count}
                </span>
              )) : (
                <span className="text-sm text-slate-400">Không có số nào lặp quá một lần.</span>
              )}
            </div>
          </section>
          <section className="glass-panel elevate-hover rounded-[28px] p-5">
            <div className="type-chip-label">
              Số vắng mặt
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {chart.absent_digits.map((digit) => (
                <span key={digit} className="glass-chip rounded-full px-3 py-1 text-sm text-slate-200">
                  {digit}
                </span>
              ))}
            </div>
          </section>
      </div>
    </PageWrap>
  );
}

function ArrowCard({
  label,
  meaning,
  tone,
}: {
  label: string;
  meaning: string;
  tone: 'present' | 'missing';
}) {
  const shell = tone === 'present'
    ? 'border-emerald-300/16 bg-[linear-gradient(180deg,_rgba(16,185,129,0.08)_0%,_rgba(15,23,42,0.02)_100%)]'
    : 'border-amber-300/16 bg-[linear-gradient(180deg,_rgba(251,191,36,0.08)_0%,_rgba(15,23,42,0.02)_100%)]';

  return (
    <div className={`glass-card elevate-hover rounded-[24px] p-5 ${shell}`}>
      <div className="type-card-title">{label}</div>
      <p className="type-body-sm mt-3">{meaning}</p>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero eyebrow={title} title={title} subtitle={subtitle} accent="amber" />
      <div className="glass-panel rounded-[38px] px-6 py-12 text-center">
        <p className="text-sm leading-7 text-slate-300">Cần hoàn tất hồ sơ trước khi dựng được biểu đồ ngày sinh.</p>
      </div>
    </div>
  );
}
