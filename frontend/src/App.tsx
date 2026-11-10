import React, { useState, useEffect } from 'react';
import { DemoProvider } from './context/DemoContext';
import { EEGProvider } from './context/EEGContext';
import { AppLayout } from './layouts/AppLayout';
import type { NavRoute } from './layouts/Sidebar';

// Pages
import { Dashboard } from './pages/Dashboard';
import { LiveEEG } from './pages/LiveEEG';
import { BrainSignals } from './pages/BrainSignals';
import { IntentDetection } from './pages/IntentDetection';
import { RoboticArm3D } from './pages/RoboticArm3D';
import { HardwareManager } from './pages/HardwareManager';
import { Sessions } from './pages/Sessions';
import { MLLab } from './pages/MLLab';
import { Calibration } from './pages/Calibration';
import { Analytics } from './pages/Analytics';
import { CommandMapping } from './pages/CommandMapping';
import { SafetyCenter } from './pages/SafetyCenter';
import { Settings } from './pages/Settings';

const ROUTE_TITLES: Record<NavRoute, string> = {
  '/dashboard': 'Dashboard',
  '/eeg': 'Live EEG Monitor',
  '/signals': 'Brain Signals Analysis',
  '/intent': 'AI Intent Detection',
  '/robot': '3D Arm Simulator',
  '/hardware': 'Hardware Interface',
  '/sessions': 'Recorded Sessions',
  '/ml': 'Machine Learning Lab',
  '/calibration': 'Subject Calibration Protocol',
  '/analytics': 'Platform Analytics',
  '/commands': 'Command Mapping',
  '/safety': 'Safety Center',
  '/settings': 'Platform Settings',
};

export const App: React.FC = () => {
  // Sync route with window.location.pathname or hash
  const [currentRoute, setCurrentRoute] = useState<NavRoute>(() => {
    const path = window.location.pathname as NavRoute;
    if (path in ROUTE_TITLES) return path;
    const hash = window.location.hash.replace('#', '') as NavRoute;
    if (hash in ROUTE_TITLES) return hash;
    return '/dashboard';
  });

  const handleRouteChange = (route: NavRoute) => {
    setCurrentRoute(route);
    window.history.pushState(null, '', route);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname as NavRoute;
      if (path in ROUTE_TITLES) {
        setCurrentRoute(path);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case '/dashboard':
        return <Dashboard />;
      case '/eeg':
        return <LiveEEG />;
      case '/signals':
        return <BrainSignals />;
      case '/intent':
        return <IntentDetection />;
      case '/robot':
        return <RoboticArm3D />;
      case '/hardware':
        return <HardwareManager />;
      case '/sessions':
        return <Sessions />;
      case '/ml':
        return <MLLab />;
      case '/calibration':
        return <Calibration />;
      case '/analytics':
        return <Analytics />;
      case '/commands':
        return <CommandMapping />;
      case '/safety':
        return <SafetyCenter />;
      case '/settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DemoProvider>
      <EEGProvider>
        <AppLayout
          currentRoute={currentRoute}
          onRouteChange={handleRouteChange}
          pageTitle={ROUTE_TITLES[currentRoute] || 'Dashboard'}
        >
          {renderCurrentPage()}
        </AppLayout>
      </EEGProvider>
    </DemoProvider>
  );
};

export default App;
