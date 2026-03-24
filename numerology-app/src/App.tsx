import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@stores/userStore';
import { useSettingsStore } from '@stores/settingsStore';
import ErrorBoundary from '@components/common/ErrorBoundary';
import AppShell from '@components/layout/AppShell';
import Onboarding from '@screens/Onboarding';
import Dashboard from '@screens/Dashboard';
import History from '@screens/History';
import Profile from '@screens/Profile';
import Settings from '@screens/Settings';
import { clearDesktopNotificationRuntime, ensureNotificationBridge, syncDesktopNotificationRuntime } from '@services/desktopNotifications';
import { trackEvent } from '@services/analytics';

function App() {
  const { isOnboarded, profile, loadProfile } = useUserStore();
  const { notifications, loadSettings } = useSettingsStore();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await loadProfile();
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [loadProfile]);

  useEffect(() => {
    if (profile?.id) {
      loadSettings(profile.id);
    }
  }, [profile?.id, loadSettings]);

  useEffect(() => {
    ensureNotificationBridge().catch((error) => {
      console.error('Failed to connect notification bridge:', error);
    });
  }, []);

  useEffect(() => {
    if (profile && notifications) {
      syncDesktopNotificationRuntime(profile, notifications).catch((error) => {
        console.error('Failed to sync notification runtime:', error);
      });
      return;
    }

    clearDesktopNotificationRuntime().catch((error) => {
      console.error('Failed to clear notification runtime:', error);
    });
  }, [profile, notifications]);

  useEffect(() => {
    if (!isBootstrapping) {
      trackEvent('app_opened', {
        userId: profile?.id,
        payload: { onboarded: isOnboarded },
      }).catch((error) => {
        console.error('Failed to track app open:', error);
      });
    }
  }, [isBootstrapping, isOnboarded, profile?.id]);

  if (isBootstrapping) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span>Đang tải dữ liệu...</span>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        {!isOnboarded ? (
          <>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<AppShell><Dashboard /></AppShell>} />
            <Route path="/history" element={<AppShell><History /></AppShell>} />
            <Route path="/profile" element={<AppShell><Profile /></AppShell>} />
            <Route path="/settings" element={<AppShell><Settings /></AppShell>} />
            <Route path="/onboarding" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
