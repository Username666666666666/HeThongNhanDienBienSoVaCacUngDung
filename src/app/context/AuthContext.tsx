import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '../utils/supabase';
import { User } from '../types';
import type { User as SupabaseAuthUser, Session } from '@supabase/supabase-js';

/**
 * Valid user roles in the system
 */
type Role = 'owner' | 'admin' | 'supervisor' | 'support' | 'provider';

/**
 * Authentication Context Interface
 * Provides user authentication state and operations
 */
interface AuthContextType {
  /** Current authenticated user or null */
  user: User | null;
  /** Loading state for auth operations */
  loading: boolean;
  /** Login with email and password */
  login: (email: string, password: string) => Promise<void>;
  /** Login with Google OAuth */
  loginWithGoogle: () => Promise<void>;
  /** Login with Facebook OAuth */
  loginWithFacebook: () => Promise<void>;
  /** Logout current user */
  logout: () => Promise<void>;
  /** Update user profile */
  updateProfile: (updates: Partial<User>) => Promise<void>;
  /** Add virtual coins to user balance */
  addVirtualCoins: (amount: number) => void;
  /** Deduct virtual coins from user balance */
  spendVirtualCoins: (amount: number) => boolean;
}

/**
 * Authentication Context - use with useAuth hook
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access authentication context
 * Must be used within an AuthProvider
 * @returns {AuthContextType} The auth context
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

/**
 * Valid roles in the system
 */
const VALID_ROLES = new Set<Role>([
  'owner',
  'admin',
  'supervisor',
  'support',
  'provider',
]);

/**
 * Normalize and validate user role
 * @private
 * @param {string | null | undefined} value - The role value to normalize
 * @returns {Role} Valid role or 'owner' as default
 */
const normalizeRole = (value?: string | null): Role => {
  if (value && VALID_ROLES.has(value as Role)) return value as Role;
  return 'owner';
};

/**
 * Get display name from Supabase auth user
 * @private
 * @param {SupabaseAuthUser} authUser - Supabase user object
 * @param {string | null | undefined} profileName - User profile name from database
 * @returns {string} Display name for the user
 */
const getDisplayName = (authUser: SupabaseAuthUser, profileName?: string | null) => {
  return (
    profileName?.trim() ||
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    authUser.email ||
    'Người dùng'
  );
};

/**
 * Build application User object from Supabase auth user
 * Creates database record if user profile doesn't exist
 * @private
 * @param {SupabaseAuthUser} authUser - Supabase auth user
 * @returns {Promise<User>} Application user object
 */
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

  // ✅ SYNC: Sync session user without premature logout
  /**
   * Sync application user from Supabase session
   * @private
   */
  const syncSessionUser = async (session: Session | null) => {
    if (!session?.user) return;

    try {
      const appUser = await buildUserFromAuth(session.user);
      setUser(appUser);
    } catch (error) {
      console.error('Failed to sync user:', error);
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
        if (!mounted) return;

        // Only logout when explicitly signed out
        if (event === 'SIGNED_OUT') {
          setUser(null);
          return;
        }

        // Sync user on token refresh or initial session
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

  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @throws {Error} If login fails
   */
  const login = async (email: string, password: string) => {
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
  };

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  /**
   * Login with Facebook OAuth
   * TODO: Verify Facebook OAuth is properly configured in Supabase
   */
  const loginWithFacebook = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: window.location.origin },
    });
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  /**
   * Update user profile
   * @param {Partial<User>} updates - User fields to update
   */
  const updateProfile = async (updates: Partial<User>) => {
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
  };

  /**
   * Add virtual coins to user balance
   * @param {number} amount - Amount to add
   */
  const addVirtualCoins = (amount: number) => {
    if (!user) return;
    setUser({ ...user, virtualCoins: (user.virtualCoins ?? 0) + amount });
  };

  /**
   * Spend virtual coins from user balance
   * @param {number} amount - Amount to spend
   * @returns {boolean} True if enough coins, false otherwise
   */
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
        loginWithGoogle,
        loginWithFacebook,
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