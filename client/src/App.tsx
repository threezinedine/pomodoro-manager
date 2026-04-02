import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { DashboardPage } from './pages/DashboardPage/DashboardPage';

const AUTH_KEY = 'auth_token';

/** True when the app has checked localStorage and resolved the auth guard. */
function useAuthGuard() {
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(true);
  }, []);

  if (!checked) return null; // still initialising — avoid flash

  const hasToken = !!localStorage.getItem(AUTH_KEY);
  const isLoginPage = location.pathname === '/';

  if (!hasToken && !isLoginPage) {
    return <Navigate to="/" replace />;
  }

  if (hasToken && isLoginPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return undefined; // carry on
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const guard = useAuthGuard();
  if (guard !== undefined) return guard;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
