import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@stores/userStore';
import { useSettingsStore } from '@stores/settingsStore';
import { useInsightStore } from '@stores/insightStore';
import ErrorBoundary from '@components/common/ErrorBoundary';
import AppShell from '@components/layout/AppShell';
import Onboarding from '@screens/Onboarding';
import Dashboard from '@screens/Dashboard';
import Guidance from '@screens/Guidance';
import Reading from '@screens/Reading';
import Compass from '@screens/Compass';
import Continuity from '@screens/Continuity';
import DeepCycles from '@screens/DeepCycles';
import BirthChart from '@screens/BirthChart';
import NameLayers from '@screens/NameLayers';
import Profile from '@screens/Profile';
import Settings from '@screens/Settings';
import {
  clearDesktopNotificationRuntime,
  ensureNotificationBridge,
  syncDesktopLaunchOnStartup,
  syncDesktopNotificationRuntime,
} from '@services/desktopNotifications';
import { migrateLegacyDesktopStorage } from '@services/desktopStorageMigration';
import { trackEvent } from '@services/analytics';

function App() {
  const { isOnboarded, profile, loadProfile } = useUserStore();
  const { notifications, loadSettings } = useSettingsStore();
  const { ensureTodayInsight } = useInsightStore();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        await migrateLegacyDesktopStorage();
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
    if (!notifications) {
      return;
    }

    syncDesktopLaunchOnStartup(notifications.launch_on_startup).catch((error) => {
      console.error('Failed to sync launch on startup:', error);
    });
  }, [notifications?.launch_on_startup, notifications]);

  useEffect(() => {
    if (isOnboarded && profile) {
      ensureTodayInsight(profile).catch((error) => {
        console.error('Failed to ensure today insight during app startup:', error);
      });
    }
  }, [isOnboarded, profile, ensureTodayInsight]);

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
        <div className="min-h-screen bg-[linear-gradient(180deg,_#040b15_0%,_#0a1424_100%)] flex items-center justify-center p-6">
          <div className="glass-panel flex items-center gap-3 rounded-[28px] px-5 py-4 text-slate-300">
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
            <Route path="/guidance" element={<AppShell><Guidance /></AppShell>} />
            <Route path="/reading" element={<AppShell><Reading /></AppShell>} />
            <Route path="/compass" element={<AppShell><Compass /></AppShell>} />
            <Route path="/continuity" element={<AppShell><Continuity /></AppShell>} />
            <Route path="/cycles" element={<AppShell><DeepCycles /></AppShell>} />
            <Route path="/birth-chart" element={<AppShell><BirthChart /></AppShell>} />
            <Route path="/name-layers" element={<AppShell><NameLayers /></AppShell>} />
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
