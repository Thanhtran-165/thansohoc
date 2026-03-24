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
    <div className="min-h-screen bg-gray-50">
      {/* Skip to content link - visible on focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
      >
        {messages.nav.skipToContent}
      </a>
      <Header
        showMenuButton={true}
        isMobileNavOpen={isMobileNavOpen}
        onMenuToggle={() => setIsMobileNavOpen((prev) => !prev)}
      />
      <div className="flex">
        <Navigation
          isMobileOpen={isMobileNavOpen}
          onNavigate={() => setIsMobileNavOpen(false)}
        />
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:ml-64 mt-16" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
