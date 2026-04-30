import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import type { User as SupabaseAuthUser, Session } from '@supabase/supabase-js';
import { User } from '../types';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addVirtualCoins: (amount: number) => void;
  spendVirtualCoins: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const VALID_ROLES = new Set<User['role']>(['owner', 'admin', 'supervisor', 'support', 'provider']);

const normalizeRole = (value?: string | null): User['role'] => {
  if (value && VALID_ROLES.has(value as User['role'])) {
    return value as User['role'];
  }
  return 'owner';
};

const getDisplayName = (authUser: SupabaseAuthUser, profileName?: string | null) => {
  return (
    profileName?.trim() ||
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    authUser.email ||
    'Người dùng'
  );
};

const buildUserFromAuth = async (authUser: SupabaseAuthUser): Promise<User> => {
  const fallbackName = getDisplayName(authUser);

  const { data: profile } = await supabase
    .from('nguoidung')
    .select('manguoidung, tennguoidung, chucnang')
    .eq('manguoidung', authUser.id)
    .maybeSingle();

  const role = normalizeRole(profile?.chucnang ?? authUser.user_metadata?.role);

  if (!profile) {
    await supabase.from('nguoidung').insert({
      manguoidung: authUser.id,
      tennguoidung: fallbackName,
      chucnang: 'owner',
    });
  }

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    name: fallbackName,
    role,
    virtualCoins: 0,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncSessionUser = async (session: Session | null) => {
    if (!session?.user) return;

    try {
      const appUser = await buildUserFromAuth(session.user);
      setUser(appUser);
    } catch (error) {
      console.error('SYNC USER ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (data.session?.user) {
        await syncSessionUser(data.session);
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        return;
      }

      if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          await syncSessionUser(session);
        }
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }
    await syncSessionUser(data.session);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const nextUser = { ...user, ...updates };
    setUser(nextUser);

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name) dbUpdates.tennguoidung = updates.name;
    if (updates.role) dbUpdates.chucnang = normalizeRole(updates.role);

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('nguoidung').update(dbUpdates).eq('manguoidung', user.id);
    }
  };

  const addVirtualCoins = (amount: number) => {
    if (!user) return;
    setUser({ ...user, virtualCoins: (user.virtualCoins ?? 0) + amount });
  };

  const spendVirtualCoins = (amount: number): boolean => {
    if (!user) return false;
    if ((user.virtualCoins ?? 0) < amount) return false;
    setUser({ ...user, virtualCoins: (user.virtualCoins ?? 0) - amount });
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateProfile,
        addVirtualCoins,
        spendVirtualCoins,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
