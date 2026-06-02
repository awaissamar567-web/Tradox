import React from 'react';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import LandingPage from '../pages/LandingPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Simple path-based routing for marketing page
  const isLandingPath = window.location.pathname === '/landing' || window.location.pathname === '/welcome';

  if (isLandingPath) {
    return <LandingPage />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bgBase flex flex-col items-center justify-center gap-4">
        {/* Sleek electric Orange loading bar */}
        <div className="w-12 h-[1px] bg-accent animate-pulse"></div>
        <span className="font-syne text-[10px] uppercase text-textSecondary tracking-[0.2em] animate-pulse">
          Authenticating
        </span>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
