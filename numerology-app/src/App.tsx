import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@stores/userStore';
import ErrorBoundary from '@components/common/ErrorBoundary';
import AppShell from '@components/layout/AppShell';
import Onboarding from '@screens/Onboarding';
import Dashboard from '@screens/Dashboard';
import Profile from '@screens/Profile';
import Settings from '@screens/Settings';

function App() {
  const { isOnboarded } = useUserStore();

  return (
    <ErrorBoundary>
      <AppShell>
        <Routes>
          {/* If not onboarded, redirect to onboarding */}
          {!isOnboarded ? (
            <>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;
