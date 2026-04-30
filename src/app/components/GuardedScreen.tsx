import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

type Role = 'owner' | 'admin' | 'supervisor' | 'support' | 'provider';

interface GuardedScreenProps {
  children: ReactNode;
  allowedRoles: Role[];
  fallbackPath?: string;
}

export const GuardedScreen = ({
  children,
  allowedRoles,
  fallbackPath = '/login'
}: GuardedScreenProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};