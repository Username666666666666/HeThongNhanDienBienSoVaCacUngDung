// AuthContext for React Native
// Manages authentication state and user info globally

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { supabase } from '../utils/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addVirtualCoins: (amount: number) => Promise<void>;
  spendVirtualCoins: (amount: number) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          // Fetch user profile from database
          const { data: profile, error } = await supabase
            .from('nguoidung')
            .select('*')
            .eq('manguoidung', authUser.id)
            .single();

          if (!error && profile) {
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              name: profile.ten || '',
              role: profile.chucnang || 'owner',
              virtualCoins: profile.coin || 0,
              avatar: profile.avatar,
              phone: profile.phone,
              cccd: profile.cccd,
              createdAt: new Date(profile.thoigiantao || Date.now()),
            });
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Fetch profile
      const { data: profile } = await supabase
        .from('nguoidung')
        .select('*')
        .eq('manguoidung', data.user.id)
        .single();

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: profile?.ten || '',
        role: profile?.chucnang || 'owner',
        virtualCoins: profile?.coin || 0,
        avatar: profile?.avatar,
        phone: profile?.phone,
        cccd: profile?.cccd,
        createdAt: new Date(profile?.thoigiantao || Date.now()),
      });
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Create user profile
      await supabase.from('nguoidung').insert({
        manguoidung: data.user.id,
        email: data.user.email,
        ten: name,
        chucnang: 'owner',
        coin: 0,
        thoigiantao: new Date().toISOString(),
      });

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: name,
        role: 'owner',
        virtualCoins: 0,
        createdAt: new Date(),
      });
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    await supabase
      .from('nguoidung')
      .update({
        ten: updates.name,
        phone: updates.phone,
        avatar: updates.avatar,
      })
      .eq('manguoidung', user.id);

    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, [user]);

  const addVirtualCoins = useCallback(async (amount: number) => {
    if (!user) throw new Error('No user logged in');

    const newBalance = user.virtualCoins + amount;
    
    await supabase
      .from('nguoidung')
      .update({ coin: newBalance })
      .eq('manguoidung', user.id);

    setUser(prev => prev ? { ...prev, virtualCoins: newBalance } : null);
  }, [user]);

  const spendVirtualCoins = useCallback(async (amount: number) => {
    if (!user) throw new Error('No user logged in');
    if (user.virtualCoins < amount) throw new Error('Insufficient coins');

    const newBalance = user.virtualCoins - amount;
    
    await supabase
      .from('nguoidung')
      .update({ coin: newBalance })
      .eq('manguoidung', user.id);

    setUser(prev => prev ? { ...prev, virtualCoins: newBalance } : null);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        updateProfile,
        addVirtualCoins,
        spendVirtualCoins,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};