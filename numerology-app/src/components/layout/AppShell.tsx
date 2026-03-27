/**
 * App Shell
 * Main application wrapper with navigation
 *
 * Accessibility features:
 * - Skip to content link for keyboard users
 * - Main content landmark with id
 */

import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';
import messages from '@localization';
import { trackEvent } from '@services/analytics';
import { useUserStore } from '@stores/userStore';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();
  const { profile } = useUserStore();

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    trackEvent('screen_view', {
      userId: profile?.id,
      screen: location.pathname,
    }).catch((error) => {
      console.error('Failed to track screen view:', error);
    });
  }, [location.pathname, profile?.id]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.2),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(251,191,36,0.18),_transparent_24%),radial-gradient(circle_at_50%_120%,_rgba(167,139,250,0.18),_transparent_32%),linear-gradient(180deg,_#040b15_0%,_#08111d_45%,_#0a1424_100%)] text-slate-100">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="motion-shell-orb absolute left-[8%] top-24 h-72 w-72 rounded-full bg-amber-400/14 blur-3xl" />
        <div className="motion-shell-orb-delayed absolute right-[10%] top-20 h-80 w-80 rounded-full bg-sky-400/14 blur-3xl" />
        <div className="motion-shell-orb absolute bottom-8 left-1/3 h-72 w-72 rounded-full bg-violet-400/12 blur-3xl" />
      </div>
      {/* Skip to content link - visible on focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:border focus:border-sky-300/30 focus:bg-sky-400/12 focus:px-4 focus:py-2 focus:text-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-300/30"
      >
        {messages.nav.skipToContent}
      </a>
      <Header
        showMenuButton={true}
        isMobileNavOpen={isMobileNavOpen}
        onMenuToggle={() => setIsMobileNavOpen((prev) => !prev)}
      />
      <div className="relative z-10 flex">
        <Navigation
          isMobileOpen={isMobileNavOpen}
          onNavigate={() => setIsMobileNavOpen(false)}
        />
        <main
          id="main-content"
          className="mt-16 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:ml-64 lg:px-8 lg:py-8"
          role="main"
        >
          <div key={location.pathname} className="screen-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
