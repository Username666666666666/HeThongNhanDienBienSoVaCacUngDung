import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { USER_ROLES, UserRole } from '../constants';

export const usePermissions = () => {
  const { user } = useContext(AuthContext);

  const hasRole = (role: UserRole) => user?.role === role;

  const isOwner = () => hasRole(USER_ROLES.OWNER);
  const isSupervisor = () => hasRole(USER_ROLES.SUPERVISOR);
  const isAdmin = () => hasRole(USER_ROLES.ADMIN);
  const isProvider = () => hasRole(USER_ROLES.PROVIDER);
  const isSupport = () => hasRole(USER_ROLES.SUPPORT);

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