import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { supabase } from '../utils/supabase';
import { User } from '../types';
import type { User as SupabaseAuthUser, Session } from '@supabase/supabase-js';

type Role = 'owner' | 'admin' | 'supervisor' | 'support' | 'provider';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addVirtualCoins: (amount: number) => void;
  spendVirtualCoins: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const VALID_ROLES = new Set<Role>([
  'owner',
  'admin',
  'supervisor',
  'support',
  'provider',
]);

const normalizeRole = (value?: string | null): Role => {
  if (value && VALID_ROLES.has(value as Role)) return value as Role;
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
  } as User;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ FIX: KHÔNG logout khi session null tạm thời
const syncSessionUser = async (session: Session | null) => {
  // ❌ KHÔNG logout khi session null tạm thời
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

 const { data: listener } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    console.log("AUTH EVENT:", event);

    if (!mounted) return;

    // ✅ CHỈ logout khi event thật sự
    if (event === 'SIGNED_OUT') {
      setUser(null);
      return;
    }

    // ⚠️ BỎ QUA SIGNED_IN (tránh double call)
    if (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
      if (session?.user) {
        await syncSessionUser(session);
      }
    }
  }
);
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw new Error(error.message);
    }

    await syncSessionUser(data.session);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const loginWithFacebook = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    const nextUser = { ...user, ...updates };
    setUser(nextUser);

    const dbUpdates: Record<string, unknown> = {};

    if (updates.name) dbUpdates.tennguoidung = updates.name;
    if (updates.role) dbUpdates.chucnang = normalizeRole(updates.role);

    if (Object.keys(dbUpdates).length > 0) {
      await supabase
        .from('nguoidung')
        .update(dbUpdates)
        .eq('manguoidung', user.id);
    }
  }, [user]);

  const addVirtualCoins = useCallback((amount: number) => {
    if (!user) return;
    setUser({ ...user, virtualCoins: (user.virtualCoins ?? 0) + amount });
  }, [user]);

  const spendVirtualCoins = useCallback((amount: number): boolean => {
    if (!user) return false;
    if ((user.virtualCoins ?? 0) < amount) return false;

    setUser({ ...user, virtualCoins: (user.virtualCoins ?? 0) - amount });
    return true;
  }, [user]);

  const contextValue = useMemo(() => ({
    user,
    loading,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    updateProfile,
    addVirtualCoins,
    spendVirtualCoins,
  }), [user, loading, login, loginWithGoogle, loginWithFacebook, logout, updateProfile, addVirtualCoins, spendVirtualCoins]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};