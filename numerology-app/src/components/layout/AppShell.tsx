/**
 * App Shell
 * Main application wrapper with navigation
 *
 * Accessibility features:
 * - Skip to content link for keyboard users
 * - Main content landmark with id
 */

import { ReactNode } from 'react';
import Header from './Header';
import Navigation from './Navigation';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to content link - visible on focus */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
      >
        Skip to main content
      </a>
      <Header />
      <div className="flex">
        <Navigation />
        <main id="main-content" className="flex-1 p-6 ml-64 mt-16" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}
