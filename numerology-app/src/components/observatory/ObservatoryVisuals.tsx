import type { InsightPresentationBlocks } from '@/types';

type NumberPoint = {
  label: string;
  value: number;
};

type SignalPoint = {
  label: string;
  intensity: 1 | 2 | 3 | 4 | 5;
  meaning: string;
};

export function DayOrbitMap({
  numbers,
  signals,
  compact = false,
}: {
  numbers: NumberPoint[];
  signals: SignalPoint[];
  compact?: boolean;
}) {
  const size = compact ? 200 : 360;
  const center = size / 2;
  const rings = compact ? [44, 72, 96] : [72, 118, 162];

  return (
    <div
      className={`glass-panel motion-sheen motion-panel-float relative overflow-hidden rounded-[36px] bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.14),_transparent_48%),linear-gradient(180deg,_rgba(15,23,42,0.16)_0%,_rgba(15,23,42,0.04)_100%)] ${
        compact ? 'p-4' : 'p-5'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(251,191,36,0.12),_transparent_22%),radial-gradient(circle_at_80%_25%,_rgba(56,189,248,0.10),_transparent_24%)]" />
      <div className={`relative ${compact ? 'grid gap-4 md:grid-cols-[200px_minmax(0,1fr)] md:items-center' : 'flex justify-center py-3'}`}>
        <div className="relative mx-auto" style={{ width: size, height: size }}>
          <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full">
            <defs>
              <linearGradient id="orbitStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(56,189,248,0.75)" />
                <stop offset="100%" stopColor="rgba(245,158,11,0.7)" />
              </linearGradient>
            </defs>
            {rings.map((radius, index) => (
              <circle
                key={radius}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={index === rings.length - 1 ? 'url(#orbitStroke)' : 'rgba(148,163,184,0.28)'}
                strokeWidth={index === rings.length - 1 ? 1.8 : 1.2}
                strokeDasharray={index === rings.length - 1 ? '4 8' : '0'}
              />
            ))}
            <circle cx={center} cy={center} r={compact ? 16 : 20} fill="rgba(15,23,42,0.94)" />
          </svg>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white">
            <div className="type-chip-label">Nhịp</div>
            <div className="mt-1 text-2xl font-semibold leading-none">
              {numbers[0]?.value ?? '…'}
            </div>
          </div>

          {numbers.slice(0, 3).map((item, index) => {
            const angle = -90 + index * 120;
            const radius = rings[index] ?? rings[rings.length - 1];
            const x = center + radius * Math.cos((angle * Math.PI) / 180);
            const y = center + radius * Math.sin((angle * Math.PI) / 180);

            return (
              <div
                key={item.label}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: x, top: y }}
              >
                <div className="motion-instrument-breathe rounded-full border border-white/12 bg-white/8 px-3 py-2 text-center shadow-[0_12px_28px_rgba(2,6,23,0.24)] backdrop-blur-2xl">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                    {item.label.replace(' cá nhân', '')}
                  </div>
                  <div className="mt-1 text-2xl font-semibold leading-none text-slate-50">{item.value}</div>
                </div>
              </div>
            );
          })}

          <div className="pointer-events-none motion-orbit-spin absolute inset-0">
            <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-sky-300/80 blur-[1px]" />
            <div className="absolute bottom-10 right-10 h-2 w-2 rounded-full bg-amber-300/80 blur-[1px]" />
          </div>
          <div className="pointer-events-none motion-orbit-spin-reverse absolute inset-[10%]">
            <div className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white/70 blur-[1px]" />
          </div>
        </div>

        {compact && (
          <div className="space-y-3">
            {signals.slice(0, 2).map((signal) => (
              <div
                key={signal.label}
                className="glass-card motion-panel-float-delayed elevate-hover rounded-[20px] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-slate-100">{signal.label}</div>
                  <SignalPips intensity={signal.intensity} />
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{signal.meaning}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ForceFieldMap({
  decisionCompass,
}: {
  decisionCompass: InsightPresentationBlocks['decision_compass'];
}) {
  return (
    <div className="glass-panel motion-sheen motion-panel-float rounded-[32px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_36%),linear-gradient(180deg,_rgba(15,23,42,0.14)_0%,_rgba(15,23,42,0.04)_100%)] p-5">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/82 px-5 py-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="absolute inset-x-0 top-1/2 h-px bg-[linear-gradient(90deg,_transparent_0%,_rgba(255,255,255,0.28)_50%,_transparent_100%)]" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-[linear-gradient(180deg,_transparent_0%,_rgba(255,255,255,0.22)_50%,_transparent_100%)]" />
        <div className="motion-instrument-breathe absolute -left-10 top-8 h-28 w-28 rounded-full border border-sky-300/20" />
        <div className="motion-instrument-breathe absolute -right-8 bottom-6 h-24 w-24 rounded-full border border-amber-300/20 [animation-delay:1.4s]" />

        <div className="relative grid gap-0 md:grid-cols-3">
          <FieldAxis label="Đi theo" value={decisionCompass.lean_in} tone="sky" />
          <FieldAxis label="Giữ vững" value={decisionCompass.hold_steady} tone="ink" />
          <FieldAxis label="Đừng ép" value={decisionCompass.avoid_force} tone="amber" />
        </div>
      </div>
    </div>
  );
}

export function CycleRiver({
  points,
  currentIndex,
  eyebrow,
}: {
  points: Array<{ label: string; value: number; note?: string }>;
  currentIndex?: number;
  eyebrow?: string;
}) {
  return (
    <section className="glass-panel motion-sheen motion-panel-float rounded-[36px] bg-[linear-gradient(180deg,_rgba(15,23,42,0.14)_0%,_rgba(15,23,42,0.04)_100%)] p-5">
      {eyebrow ? (
        <div className="type-chip-label">{eyebrow}</div>
      ) : null}
      <div className="mt-5 overflow-x-auto pb-2">
        <div className="motion-river-shift relative flex min-w-max items-start gap-6">
          <div className="absolute left-0 right-0 top-6 h-px bg-[linear-gradient(90deg,_rgba(56,189,248,0.18)_0%,_rgba(245,158,11,0.2)_100%)]" />
          {points.map((point, index) => {
            const isCurrent = currentIndex === index;
            return (
              <div key={`${point.label}-${index}`} className="relative w-28 shrink-0">
                <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border text-lg font-semibold transition-transform ${
                      isCurrent
                      ? 'motion-instrument-breathe border-white/12 bg-slate-900 text-white shadow-[0_14px_28px_rgba(2,6,23,0.28)]'
                      : 'border-white/10 bg-white/8 text-slate-200'
                  } ${isCurrent ? 'scale-105' : ''}`}
                >
                  {point.value}
                </div>
                <div className="mt-3 text-center">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{point.label}</div>
                  {point.note ? <div className="mt-2 text-sm leading-6 text-slate-300">{point.note}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TransitSkyline({
  current,
  future,
}: {
  current: { year: number; age: number; essence_number: number };
  future: Array<{ year: number; age: number; essence_number: number }>;
}) {
  const items = [current, ...future.slice(0, 4)];
  const maxValue = Math.max(...items.map((item) => item.essence_number), 9);

  return (
    <section className="glass-panel motion-sheen motion-panel-float rounded-[36px] bg-[linear-gradient(180deg,_rgba(15,23,42,0.14)_0%,_rgba(15,23,42,0.04)_100%)] p-5">
      <div className="type-chip-label">Đường chuyển essence</div>
      <div className="mt-5 flex items-end gap-3">
        {items.map((item, index) => {
          const height = Math.max(56, (item.essence_number / maxValue) * 150);
          const isCurrent = index === 0;
          return (
            <div key={`${item.year}-${item.age}`} className="flex-1">
              <div className="flex items-end justify-center">
                <div
                  className={`motion-rise w-full rounded-t-[20px] px-2 pb-3 pt-4 text-center ${
                    isCurrent
                      ? 'bg-[linear-gradient(180deg,_#0f172a_0%,_#334155_100%)] text-white shadow-[0_16px_30px_rgba(2,6,23,0.28)]'
                      : 'bg-[linear-gradient(180deg,_rgba(148,163,184,0.26)_0%,_rgba(30,41,59,0.62)_100%)] text-slate-100'
                  }`}
                  style={{ height, animationDelay: `${index * 80}ms` }}
                >
                  <div className="text-2xl font-semibold leading-none">{item.essence_number}</div>
                </div>
              </div>
              <div className="mt-3 text-center text-xs uppercase tracking-[0.16em] text-slate-400">
                {item.year}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FieldAxis({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'sky' | 'ink' | 'amber';
}) {
  const accent =
    tone === 'sky'
      ? 'text-sky-200'
      : tone === 'amber'
        ? 'text-amber-200'
        : 'text-slate-200';

  return (
    <div className="motion-panel-float-delayed min-h-[220px] px-4 py-4 backdrop-blur-sm md:px-6 md:py-5 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-white/10">
      <div className={`type-chip-label ${accent}`}>{label}</div>
      <p className="mt-4 text-base leading-9 text-white/88">{value}</p>
    </div>
  );
}

function SignalPips({
  intensity,
  compact = false,
}: {
  intensity: 1 | 2 | 3 | 4 | 5;
  compact?: boolean;
}) {
  return (
    <div className={`flex ${compact ? 'gap-1' : 'gap-1.5'}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className={`rounded-full ${
            compact ? 'h-2 w-2' : 'h-2.5 w-2.5'
          } ${
            index < intensity
              ? 'bg-[linear-gradient(180deg,_#38bdf8_0%,_#f59e0b_100%)]'
              : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}
