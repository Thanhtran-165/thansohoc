/**
 * Header Component
 * Top navigation bar with app title and user info - Vietnamese UI
 */

import { useUserStore } from '@stores/userStore';
import messages from '@localization';

// Vietnamese day names
const DAY_NAMES = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const MONTH_NAMES = [
  'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
  'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'
];

function formatVietnameseDate(date: Date): string {
  const dayName = DAY_NAMES[date.getDay()];
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  return `${dayName}, ngày ${day} ${month}`;
}

interface HeaderProps {
  showMenuButton?: boolean;
  isMobileNavOpen?: boolean;
  onMenuToggle?: () => void;
}

export default function Header({
  showMenuButton = false,
  isMobileNavOpen = false,
  onMenuToggle,
}: HeaderProps) {
  const { profile } = useUserStore();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/34 backdrop-blur-3xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* App Title */}
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <button
              type="button"
              onClick={onMenuToggle}
              aria-label={isMobileNavOpen ? messages.nav.closeMenu : messages.nav.openMenu}
              className="motion-sheen elevate-hover h-10 w-10 rounded-[20px] border border-white/12 bg-white/8 text-slate-200 shadow-[0_10px_24px_rgba(2,6,23,0.22)] backdrop-blur-2xl hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-sky-300/30 lg:hidden"
            >
              <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          )}
          <div className="motion-sheen motion-panel-float relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[22px] border border-white/14 bg-[linear-gradient(135deg,_rgba(15,23,42,0.96)_0%,_rgba(51,65,85,0.9)_100%)] shadow-[0_14px_30px_rgba(2,6,23,0.3)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_45%)]" />
            <span className="text-sm font-semibold text-white">N</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
              {messages.app.name}
            </h1>
            <p className="hidden text-xs text-slate-400 sm:block">{messages.app.tagline}</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Date */}
          <span className="motion-sheen motion-panel-float-delayed hidden rounded-full border border-white/12 bg-white/8 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-2xl md:block">
            {formatVietnameseDate(new Date())}
          </span>

          {/* User */}
          {profile && (
            <div className="motion-sheen motion-panel-float-delayed flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-2 py-1.5 shadow-[0_10px_24px_rgba(2,6,23,0.22)] backdrop-blur-2xl">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/12">
                <span className="text-sm font-medium text-slate-100">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden pr-2 text-sm font-medium text-slate-100 sm:block">
                {profile.full_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
