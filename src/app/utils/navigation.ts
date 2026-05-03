import { UserRole } from '../types';

// Helper function to get the home route based on user role
export const getHomeRoute = (role: UserRole | undefined): string => {
  if (!role) return '/login';
  
  switch (role) {
    case 'admin':
      return '/admin';
    case 'supervisor':
      return '/supervisor';
    case 'support':
      return '/support';
    case 'owner':
      return '/owner';
    case 'provider':
      return '/provider';
    default:
      return '/login';
  }
};

// Helper to check if user should skip community code entry
export const shouldSkipCommunityCodeEntry = (role: UserRole | undefined): boolean => {
  // Supervisor and Support Staff are assigned to communities by admin
  return role === 'supervisor' || role === 'support';
};
