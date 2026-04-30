import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '../utils/supabase';
import type { User, UserRole } from '../types';
import type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

interface NguoiDungRow {
  manguoidung: string;
  tennguoidung: string | null;
  chucnang: string | null;
  virtual_coins: number | null;
}

const normalizeRole = (value?: string | null): UserRole => {
  const validRoles: UserRole[] = [
    'owner',
    'admin',
    'supervisor',
    'support',
    'provider',
  ];

  return validRoles.includes(value as UserRole) ? (value as UserRole) : 'owner';
};

const buildUserFromAuth = async (authUser: SupabaseAuthUser): Promise<User> => {
  const { data: profile } = await supabase
    .from('nguoidung')
    .select('manguoidung, tennguoidung, chucnang, virtual_coins')
    .eq('manguoidung', authUser.id)
    .maybeSingle();

  const name =
    profile?.tennguoidung || authUser.user_metadata?.full_name || authUser.email || 'Người dùng';

  const role = normalizeRole(profile?.chucnang || authUser.user_metadata?.role);
  const virtualCoins = profile?.virtual_coins ?? 0;

  if (!profile) {
    await supabase.from('nguoidung').insert({
      manguoidung: authUser.id,
      tennguoidung: name,
      chucnang: 'owner',
      virtual_coins: 0,
    });
  }

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    name,
    role,
    virtualCoins,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = async (session: Session | null) => {
    if (!session?.user) return;
    const appUser = await buildUserFromAuth(session.user);
    setUser(appUser);
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session?.user) {
        await syncUser(data.session);
      }
      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_OUT') {
          setUser(null);
          return;
        }
        if (session?.user) {
          await syncUser(session);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      throw error;
    }

    await syncUser(data.session);
    setLoading(false);
  };

  const register = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
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
    if (updates.virtualCoins !== undefined) dbUpdates.virtual_coins = updates.virtualCoins;

    await supabase
      .from('nguoidung')
      .update(dbUpdates)
      .eq('manguoidung', user.id);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
