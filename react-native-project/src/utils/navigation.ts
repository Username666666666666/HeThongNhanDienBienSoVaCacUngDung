import { UserRole } from '../types';

export const getHomeRoute = (role: UserRole | undefined): string => {
  if (!role) return 'Login';

  switch (role) {
    case 'admin':
      return 'AdminDashboard';
    case 'supervisor':
      return 'SupervisorDashboard';
    case 'support':
      return 'SupportDashboard';
    case 'owner':
      return 'OwnerDashboard';
    case 'provider':
      return 'ProviderDashboard';
    default:
      return 'Login';
  }
};

export const shouldSkipCommunityCodeEntry = (role: UserRole | undefined): boolean => {
  return role === 'supervisor' || role === 'support';
};
