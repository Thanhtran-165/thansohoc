/**
 * Navigation Component
 * Side navigation with main app sections - Vietnamese UI
 */

import { NavLink } from 'react-router-dom';
import messages from '@localization';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  group: 'today' | 'extended' | 'personal';
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: messages.nav.dashboard, icon: 'home', group: 'today' },
  { path: '/guidance', label: messages.nav.guidance, icon: 'spark', group: 'today' },
  { path: '/reading', label: messages.nav.reading, icon: 'book', group: 'today' },
  { path: '/compass', label: messages.nav.compass, icon: 'compass', group: 'today' },
  { path: '/continuity', label: messages.nav.continuity, icon: 'pulse', group: 'extended' },
  { path: '/cycles', label: messages.nav.cycles, icon: 'orbit', group: 'extended' },
  { path: '/birth-chart', label: messages.nav.birthChart, icon: 'grid', group: 'extended' },
  { path: '/name-layers', label: messages.nav.nameLayers, icon: 'signature', group: 'extended' },
  { path: '/profile', label: messages.nav.profile, icon: 'user', group: 'personal' },
  { path: '/settings', label: messages.nav.settings, icon: 'settings', group: 'personal' },
];

interface NavigationProps {
  isMobileOpen?: boolean;
  onNavigate?: () => void;
}

export default function Navigation({
  isMobileOpen = false,
  onNavigate,
}: NavigationProps) {
  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          aria-label={messages.nav.closeMenu}
          className="fixed inset-0 top-16 z-30 bg-black/58 lg:hidden"
          onClick={onNavigate}
        />
      )}

      <nav
        className={`motion-sheen fixed bottom-0 left-0 top-16 z-40 w-72 overflow-y-auto border-r border-white/10 bg-[linear-gradient(180deg,_rgba(7,17,31,0.72)_0%,_rgba(9,20,36,0.64)_100%)] backdrop-blur-3xl transform transition-transform duration-500 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        aria-label={messages.app.name}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.14),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.04)_0%,_transparent_22%)]" />
        <div className="flex min-h-full flex-col">
          <div className="relative flex-1 p-4">
            {(['today', 'extended', 'personal'] as const).map((group) => (
              <div key={group} className="mb-6 last:mb-0">
                <div className="px-4 pb-2 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">
                  {group === 'today' ? 'Hôm nay' : group === 'extended' ? 'Mở rộng' : 'Cá nhân'}
                </div>
                <ul className="space-y-1">
                  {NAV_ITEMS.filter((item) => item.group === group).map((item, itemIndex) => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={onNavigate}
                        style={{ animationDelay: `${itemIndex * 36}ms` }}
                        className={({ isActive }) =>
                          `motion-nav-link motion-rise group flex items-center gap-3 rounded-[24px] border px-4 py-3.5 text-sm font-medium transition-all backdrop-blur-2xl ${
                            isActive
                              ? 'motion-nav-link-active border-white/12 bg-[linear-gradient(135deg,_rgba(148,163,184,0.28)_0%,_rgba(30,41,59,0.72)_100%)] text-white shadow-[0_18px_34px_rgba(2,6,23,0.28)]'
                              : 'border-white/8 bg-white/6 text-slate-300 hover:bg-white/10 hover:text-white'
                          }`
                        }
                      >
                        <NavIcon name={item.icon} />
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Version Info */}
          <div className="relative border-t border-white/8 p-4">
            <p className="text-xs text-slate-500">
              {messages.app.version}
            </p>
          </div>
        </div>
      </nav>
    </>
  );
}

/**
 * Simple icon component using SVG paths
 */
function NavIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    home: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    user: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    settings: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    pulse: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h4l2-5 4 10 2-5h4" />
      </svg>
    ),
    spark: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      </svg>
    ),
    book: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5 5.172 5 3.11 5.86 2 7.25v11C3.11 16.86 5.172 16 7.5 16c1.746 0 3.332.477 4.5 1.253m0-11C13.168 5.477 14.754 5 16.5 5c2.328 0 4.39.86 5.5 2.25v11C20.89 16.86 18.828 16 16.5 16c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    compass: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3a9 9 0 100 18 9 9 0 000-18zm2.5 6.5l-2 5-5 2 2-5 5-2z" />
      </svg>
    ),
    orbit: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0M4 12c0-4.418 3.582-8 8-8m0 16c4.418 0 8-3.582 8-8m-8 8c-2.5 0-5-3.582-5-8s2.5-8 5-8 5 3.582 5 8-2.5 8-5 8z" />
      </svg>
    ),
    grid: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h5v5H4V4zm0 11h5v5H4v-5zm11-11h5v5h-5V4zm0 11h5v5h-5v-5z" />
      </svg>
    ),
    signature: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16c2.5 0 3-6 5.5-6 2 0 1 6 3.5 6 2 0 1.5-9 5.5-9 1.2 0 1.8.6 2 1.5M4 20h16" />
      </svg>
    ),
  };

  return icons[name] || null;
}
