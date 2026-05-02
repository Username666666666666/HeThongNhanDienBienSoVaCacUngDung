import { useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES, type } from '../constants';
import { UserRole } from '../types';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: UserRole) => user?.role === role;

  const isOwner = () => hasRole(USER_ROLES.OWNER);
  const isSupervisor = () => hasRole(USER_ROLES.SUPERVISOR);
  const isAdmin = () => hasRole(USER_ROLES.ADMIN);
  const isProvider = () => hasRole(USER_ROLES.PROVIDER);
  const isSupport = () => hasRole(USER_ROLES.SUPPORT);

  const hasAnyRole = (roles: UserRole[]) => user?.role && roles.includes(user.role);

  return {
    user,
    hasRole,
    isOwner,
    isSupervisor,
    isAdmin,
    isProvider,
    isSupport,
    hasAnyRole,
  };
};
