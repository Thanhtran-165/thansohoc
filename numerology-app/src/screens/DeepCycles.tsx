import { useMemo } from 'react';
import { useUserStore } from '@stores/userStore';
import { PageHero, PageSection, PageWrap } from '@components/layout/ScreenPrimitives';
import { TransitSkyline } from '@components/observatory/ObservatoryVisuals';
import { calculateNumerologyContext } from '@services/numerology';
import {
  buildTransitDeepReading,
  buildTransitStageShiftReading,
  createMetaReadingContext,
} from '@services/insight/metaReadings';
import messages from '@localization';

export default function DeepCycles() {
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
    return (
      <EmptyState
        title={messages.cycles.title}
        subtitle={messages.cycles.subtitle}
      />
    );
  }

  const current = numerology.extended.transits.current;
  const transitReading = buildTransitDeepReading(
    numerology,
    createMetaReadingContext(numerology).blueprint
  );
  const stageShift = buildTransitStageShiftReading(numerology);

  return (
    <PageWrap>
      <PageHero
        eyebrow={messages.cycles.title}
        title={messages.cycles.title}
        subtitle={transitReading.summary}
        accent="sky"
        meta={
          <div className="glass-card rounded-[24px] px-4 py-3 text-right">
            <div className="type-chip-label">Essence hiện tại</div>
            <div className="mt-2 text-3xl font-semibold leading-none text-slate-50">
              {current.essence_number}
            </div>
            <div className="mt-2 text-sm text-slate-300">Tuổi {numerology.extended.transits.current_age}</div>
          </div>
        }
      />

      <div className="space-y-8">
          <PageSection eyebrow="Essence hiện tại">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 className="mt-4 text-5xl font-semibold leading-none text-slate-50">
                  {current.essence_number}
                </h2>
              </div>
              <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
                Tuổi {numerology.extended.transits.current_age}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {current.letters.map((letter) => (
                <span
                  key={`${letter.source}-${letter.letter}-${letter.from_age}`}
                  className="glass-chip rounded-full px-3 py-1 text-sm text-slate-200"
                >
                  {letter.label}: {letter.letter} / {letter.value}
                </span>
              ))}
            </div>
          </PageSection>

          <PageSection eyebrow="Câu chuyện của giai đoạn này" tone="soft">
            <div className="mt-6 grid gap-4">
              {transitReading.sections.map((section) => (
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

          <PageSection eyebrow="Đường chuyển essence">
            <div className="mt-6">
              <TransitSkyline
                current={{
                  year: numerology.extended.transits.current_year,
                  age: numerology.extended.transits.current_age,
                  essence_number: current.essence_number,
                }}
                future={numerology.extended.transits.next_years}
              />
            </div>
          </PageSection>

          {stageShift && (
            <PageSection eyebrow="Đoạn chuyển đang tới gần">
              <div className="mt-6 space-y-5">
                {stageShift.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-8 text-slate-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            </PageSection>
          )}

          <PageSection eyebrow="Những năm kế tiếp">
            <div className="mt-6 space-y-4">
              {numerology.extended.transits.next_years.map((yearProfile) => (
                <div key={yearProfile.year} className="glass-card elevate-hover rounded-[24px] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="type-chip-label">Năm {yearProfile.year}</div>
                      <div className="mt-1 text-sm text-slate-400">Tuổi {yearProfile.age}</div>
                    </div>
                    <div className="rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white">
                      Essence {yearProfile.essence_number}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {yearProfile.letters.map((letter) => (
                      <span key={`${yearProfile.year}-${letter.source}`} className="glass-chip rounded-full px-3 py-1 text-sm text-slate-200">
                        {letter.label}: {letter.letter} / {letter.value}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    Essence {yearProfile.essence_number} thường kéo năm này nghiêng về một hướng rõ hơn. Hãy đọc nó như đoạn kế tiếp của giai đoạn hiện tại, chứ không phải một trang hoàn toàn mới tách rời.
                  </p>
                </div>
              ))}
            </div>
          </PageSection>
      </div>
    </PageWrap>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero eyebrow={title} title={title} subtitle={subtitle} accent="sky" />
      <div className="glass-panel rounded-[38px] px-6 py-12 text-center">
        <p className="text-sm leading-7 text-slate-300">Cần hoàn tất hồ sơ trước khi tính được các chu kỳ sâu.</p>
      </div>
    </div>
  );
}
