// usePermissions hook for React Native
// Centralized role-based permission checks

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { USER_ROLES, type UserRole } from '../constants';

export const usePermissions = () => {
  const { user } = useContext(AuthContext);

  const hasRole = (role: UserRole) => user?.role === role;

  const isOwner = () => hasRole(USER_ROLES.OWNER as UserRole);
  const isSupervisor = () => hasRole(USER_ROLES.SUPERVISOR as UserRole);
  const isAdmin = () => hasRole(USER_ROLES.ADMIN as UserRole);
  const isProvider = () => hasRole(USER_ROLES.PROVIDER as UserRole);
  const isSupport = () => hasRole(USER_ROLES.SUPPORT as UserRole);

  const canAccessAdmin = () => isAdmin();
  const canAccessSupervisor = () => isSupervisor() || isAdmin();
  const canAccessProvider = () => isProvider() || isAdmin();
  const canAccessSupport = () => isSupport() || isAdmin();
  const canAccessOwner = () => isOwner() || isAdmin();

  return {
    user,
    hasRole,
    isOwner,
    isSupervisor,
    isAdmin,
    isProvider,
    isSupport,
    canAccessAdmin,
    canAccessSupervisor,
    canAccessProvider,
    canAccessSupport,
    canAccessOwner,
  };
};