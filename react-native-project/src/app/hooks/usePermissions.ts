import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function usePermissions() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('usePermissions must be used within AuthProvider');
  }

  const { user } = context;

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isSupervisor = (): boolean => hasRole('supervisor');
  const isOwner = (): boolean => hasRole('owner');
  const isProvider = (): boolean => hasRole('provider');
  const isSupport = (): boolean => hasRole('support');

  return { hasRole, isAdmin, isSupervisor, isOwner, isProvider, isSupport };
}
