// Supabase configuration for React Native
// Handles connection to Supabase backend

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: {
      // Use AsyncStorage for React Native
      getItem: async (key: string) => {
        try {
          const AsyncStorage = await import('@react-native-async-storage/async-storage').then(
            m => m.default
          );
          return await AsyncStorage.getItem(key);
        } catch (e) {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          const AsyncStorage = await import('@react-native-async-storage/async-storage').then(
            m => m.default
          );
          await AsyncStorage.setItem(key, value);
        } catch (e) {
          console.error('Error setting item:', e);
        }
      },
      removeItem: async (key: string) => {
        try {
          const AsyncStorage = await import('@react-native-async-storage/async-storage').then(
            m => m.default
          );
          await AsyncStorage.removeItem(key);
        } catch (e) {
          console.error('Error removing item:', e);
        }
      },
    },
  },
});

export default supabase;