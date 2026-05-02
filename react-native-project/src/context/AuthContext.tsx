import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { User, UserRole } from '../types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addVirtualCoins: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const normalizeRole = (value?: string | null): UserRole => {
  const validRoles: UserRole[] = ['owner', 'admin', 'supervisor', 'support', 'provider'];
  if (value && validRoles.includes(value as UserRole)) return value as UserRole;
  return 'owner';
};

const buildUserFromAuth = async (authUser: any): Promise<User> => {
  const displayName = authUser.user_metadata?.full_name || authUser.email || 'Người dùng';

  const { data: profile } = await supabase
    .from('nguoidung')
    .select('manguoidung, tennguoidung, chucnang')
    .eq('manguoidung', authUser.id)
    .maybeSingle();

  const role = normalizeRole(profile?.chucnang ?? authUser.user_metadata?.role);

  if (!profile) {
    await supabase.from('nguoidung').insert({
      manguoidung: authUser.id,
      tennguoidung: displayName,
      chucnang: 'owner',
    });
  }

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    name: displayName,
    role,
    virtualCoins: 0,
  } as User;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (!mounted) return;

        if (data.session?.user) {
          const appUser = await buildUserFromAuth(data.session.user);
          setUser(appUser);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (session?.user) {
          const appUser = await buildUserFromAuth(session.user);
          setUser(appUser);
        }
      }
    );

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      if (data.session?.user) {
        const appUser = await buildUserFromAuth(data.session.user);
        setUser(appUser);
      }
    } finally {
      setLoading(false);
    }
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
    if (updates.role) dbUpdates.chucnang = updates.role;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase
        .from('nguoidung')
        .update(dbUpdates)
        .eq('manguoidung', user.id);
    }
  };

  const addVirtualCoins = (amount: number) => {
    if (!user) return;
    setUser({ ...user, virtualCoins: (user.virtualCoins ?? 0) + amount });
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
