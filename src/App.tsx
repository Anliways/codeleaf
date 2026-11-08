import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import MobileGate from '@/components/common/MobileGate';
import { Toaster } from '@/components/ui/sonner';

import { routes } from './routes';

// import { AuthProvider } from '@/contexts/AuthContext';
// import { RouteGuard } from '@/components/common/RouteGuard';

const App: React.FC = () => {
  return (
    <Router>
      {/*<AuthProvider>*/}
      {/*<RouteGuard>*/}
      <IntersectObserver />
      <MobileGate>
        <div className="flex flex-col min-h-screen">
          {/*<Header />*/}
          <main className="flex-grow min-h-0">
            <Routes>
            {routes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                element={route.element}
              />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </MobileGate>
      <Toaster />
      {/*</RouteGuard>*/}
      {/*</AuthProvider>*/}
    </Router>
  );
};

export default App;
