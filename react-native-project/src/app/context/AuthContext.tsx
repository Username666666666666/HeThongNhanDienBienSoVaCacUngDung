import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session?.user) {
          // Fetch user profile from database
          const { data: profile } = await supabase
            .from('nguoidung')
            .select('*')
            .eq('email', data.session.user.email)
            .single();

          if (profile) {
            setUser(profile as User);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (session?.user) {
          const { data: profile } = await supabase
            .from('nguoidung')
            .select('*')
            .eq('email', session.user.email)
            .single();

          if (profile) {
            setUser(profile as User);
          }
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('nguoidung')
        .select('*')
        .eq('email', email)
        .single();

      if (profile) {
        setUser(profile as User);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create user profile
      const { data: profile } = await supabase
        .from('nguoidung')
        .insert([{ email, name, role: 'owner', virtualCoins: 0 }])
        .select()
        .single();

      if (profile) {
        setUser(profile as User);
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const { data: updated } = await supabase
        .from('nguoidung')
        .update(userData)
        .eq('id', user?.id)
        .select()
        .single();

      if (updated) {
        setUser(updated as User);
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
