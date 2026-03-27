import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '@stores/userStore';
import { PageHero, PageSection, PageWrap } from '@components/layout/ScreenPrimitives';
import { calculateNumerologyContext } from '@services/numerology';
import {
  buildNameExpressionReading,
  buildNameLayerReading,
  createMetaReadingContext,
} from '@services/insight/metaReadings';
import messages from '@localization';

export default function NameLayers() {
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
    return <EmptyState title={messages.nameLayers.title} subtitle={messages.nameLayers.subtitle} />;
  }

  const names = numerology.extended.name_variants;
  const nameReading = buildNameLayerReading(
    numerology,
    createMetaReadingContext(numerology).blueprint
  );
  const expressionReading = buildNameExpressionReading(numerology);

  return (
    <PageWrap>
      <PageHero
        eyebrow={messages.nameLayers.title}
        title={messages.nameLayers.title}
        subtitle={nameReading.summary}
        accent="violet"
        meta={
          <Link to="/profile" className="button-secondary-dark">
            Cập nhật tên trong hồ sơ
          </Link>
        }
      />

      <div className="space-y-8">
          <PageSection eyebrow="Tên đang được so sánh">
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <NameBlock label="Tên khai sinh" value={names.birth_name} />
              <NameBlock label="Tên đang dùng" value={names.current_name} />
            </div>
          </PageSection>

          <PageSection eyebrow="Tên đang đi ra ngoài như thế nào" tone="soft">
            <div className="mt-6 space-y-5">
              {expressionReading.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-base leading-8 text-slate-300">
                  {paragraph}
                </p>
              ))}
            </div>
          </PageSection>

          <PageSection eyebrow="Đọc lớp tên" tone="soft">
            <div className="mt-4 grid gap-4">
              {nameReading.sections.map((section) => (
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

          <PageSection eyebrow="Pythagorean và Chaldean">
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              Hai hệ này không nhằm tranh nhau đúng sai. Chúng cho bạn hai góc nhìn về cùng một lớp tên: một bên gần với mạch Pythagorean chung của app, một bên cho thấy sắc thái âm rung của cách gọi đang dùng.
            </p>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <NumberCompareCard
                title="Pythagorean"
                birth={names.pythagorean_birth}
                current={names.pythagorean_current}
              />
              <NumberCompareCard
                title="Chaldean"
                birth={names.chaldean_birth}
                current={names.chaldean_current}
              />
            </div>
          </PageSection>
      </div>
    </PageWrap>
  );
}

function NameBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card elevate-hover rounded-[24px] p-5">
      <div className="type-chip-label">{label}</div>
      <div className="mt-3 text-lg font-medium text-slate-50">{value}</div>
    </div>
  );
}

function NumberCompareCard({
  title,
  birth,
  current,
}: {
  title: string;
  birth: { raw_total: number; reduced: number };
  current: { raw_total: number; reduced: number };
}) {
  return (
    <div className="glass-card elevate-hover rounded-[26px] p-6">
      <div className="type-chip-label">{title}</div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <NumberCell label="Tên khai sinh" raw={birth.raw_total} reduced={birth.reduced} />
        <NumberCell label="Tên đang dùng" raw={current.raw_total} reduced={current.reduced} />
      </div>
    </div>
  );
}

function NumberCell({
  label,
  raw,
  reduced,
}: {
  label: string;
  raw: number;
  reduced: number;
}) {
  return (
    <div className="glass-chip rounded-[22px] p-4">
      <div className="type-chip-label">{label}</div>
      <div className="mt-3 flex items-end gap-3">
        <span className="text-4xl font-semibold leading-none text-slate-50">{reduced}</span>
        <span className="text-sm text-slate-400">({raw})</span>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero eyebrow={title} title={title} subtitle={subtitle} accent="violet" />
      <div className="glass-panel rounded-[38px] px-6 py-12 text-center">
        <p className="text-sm leading-7 text-slate-300">Cần hoàn tất hồ sơ trước khi nhìn được lớp tên.</p>
      </div>
    </div>
  );
}
