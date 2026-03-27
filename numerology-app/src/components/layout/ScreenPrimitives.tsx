import type { ReactNode } from 'react';

type Accent = 'amber' | 'sky' | 'mint' | 'violet' | 'rose';

const ACCENT_STYLES: Record<Accent, { glow: string; badge: string; orb: string }> = {
  amber: {
    glow: 'bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.06),_transparent_42%),linear-gradient(180deg,_rgba(17,24,39,0.18)_0%,_rgba(2,6,23,0.12)_100%)]',
    badge: 'bg-white/8 text-amber-200 ring-white/10 backdrop-blur-xl',
    orb: 'from-amber-300/24 via-white/10 to-sky-300/14',
  },
  sky: {
    glow: 'bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.06),_transparent_42%),linear-gradient(180deg,_rgba(17,24,39,0.18)_0%,_rgba(2,6,23,0.12)_100%)]',
    badge: 'bg-white/8 text-sky-200 ring-white/10 backdrop-blur-xl',
    orb: 'from-sky-300/24 via-white/10 to-cyan-300/14',
  },
  mint: {
    glow: 'bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.06),_transparent_42%),linear-gradient(180deg,_rgba(17,24,39,0.18)_0%,_rgba(2,6,23,0.12)_100%)]',
    badge: 'bg-white/8 text-emerald-200 ring-white/10 backdrop-blur-xl',
    orb: 'from-emerald-300/24 via-white/10 to-sky-300/14',
  },
  violet: {
    glow: 'bg-[radial-gradient(circle_at_top_left,_rgba(196,181,253,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.06),_transparent_42%),linear-gradient(180deg,_rgba(17,24,39,0.18)_0%,_rgba(2,6,23,0.12)_100%)]',
    badge: 'bg-white/8 text-violet-200 ring-white/10 backdrop-blur-xl',
    orb: 'from-violet-300/24 via-white/10 to-fuchsia-300/14',
  },
  rose: {
    glow: 'bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.18),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.06),_transparent_42%),linear-gradient(180deg,_rgba(17,24,39,0.18)_0%,_rgba(2,6,23,0.12)_100%)]',
    badge: 'bg-white/8 text-rose-200 ring-white/10 backdrop-blur-xl',
    orb: 'from-rose-300/24 via-white/10 to-amber-300/14',
  },
};

export function PageWrap({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-6xl space-y-8">{children}</div>;
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  accent = 'sky',
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent?: Accent;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  const style = ACCENT_STYLES[accent];

  return (
    <section
      className={`motion-sheen motion-panel-float relative overflow-hidden rounded-[42px] border border-white/10 bg-slate-950/28 px-6 py-8 shadow-[0_22px_60px_rgba(2,6,23,0.28)] ring-1 ring-white/8 backdrop-blur-3xl sm:px-8 sm:py-10`}
    >
      <div className={`pointer-events-none absolute inset-0 ${style.glow}`} />
      <div className={`pointer-events-none absolute -right-16 top-8 h-44 w-44 rounded-full bg-gradient-to-br ${style.orb} blur-3xl`} />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-sky-300/16 blur-3xl" />
      <div className="section-reveal flex flex-wrap items-start justify-between gap-4">
        <div className="relative max-w-4xl">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] ring-1 ${style.badge}`}
          >
            {eyebrow}
          </span>
          <h1 className="mt-5 text-4xl font-medium leading-[1.02] text-slate-50 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{subtitle}</p>
        </div>
        {meta ? <div className="relative shrink-0">{meta}</div> : null}
      </div>
      {children ? <div className="section-reveal section-delay-1 relative mt-7">{children}</div> : null}
    </section>
  );
}

export function PageSection({
  eyebrow,
  title,
  children,
  tone = 'plain',
}: {
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  tone?: 'plain' | 'soft';
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-[36px] border border-white/10 bg-slate-950/30 p-6 shadow-[0_18px_48px_rgba(2,6,23,0.24)] ring-1 ring-white/8 backdrop-blur-2xl sm:p-7 ${
        tone === 'soft'
          ? 'before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_38%),linear-gradient(180deg,_rgba(148,163,184,0.05)_0%,_rgba(255,255,255,0.02)_100%)] before:content-[\'\']'
          : 'before:absolute before:inset-0 before:bg-[linear-gradient(180deg,_rgba(255,255,255,0.04)_0%,_rgba(255,255,255,0.01)_100%)] before:content-[\'\']'
      } motion-sheen motion-panel-float-delayed`}
    >
      <div className="section-reveal relative">
      {eyebrow ? (
        <div className="type-chip-label">
          {eyebrow}
        </div>
      ) : null}
      {title ? <h2 className="mt-3 text-xl font-medium text-slate-50">{title}</h2> : null}
      <div className={eyebrow || title ? 'mt-5' : ''}>{children}</div>
      </div>
    </section>
  );
}

export function SurfaceNote({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="motion-sheen motion-panel-float rounded-[26px] border border-white/10 bg-white/8 px-4 py-4 shadow-[0_12px_28px_rgba(2,6,23,0.2)] ring-1 ring-white/8 backdrop-blur-2xl">
      <div className="type-chip-label">{label}</div>
      <p className="mt-2 text-sm leading-7 text-slate-300">{value}</p>
    </div>
  );
}
