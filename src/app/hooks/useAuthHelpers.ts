import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';

export const useRoleGuard = (allowedRoles: string[]) => {
  const { user, loading } = useAuth();

  const hasAccess = useMemo(() => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }, [user, allowedRoles]);

  const isLoading = loading;
  const isAuthenticated = !!user;

  return {
    hasAccess,
    isLoading,
    isAuthenticated,
    user,
    userRole: user?.role,
  };
};

export const useVirtualCoins = () => {
  const { user, addVirtualCoins, spendVirtualCoins } = useAuth();

  const balance = user?.virtualCoins ?? 0;

  const canAfford = (amount: number) => balance >= amount;

  return {
    balance,
    addVirtualCoins,
    spendVirtualCoins,
    canAfford,
  };
};