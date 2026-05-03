import { createClient } from "@supabase/supabase-js";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabase = createClient(
  "https://uysnwupbologmawgwhof.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5c253dXBib2xvZ21hd2d3aG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODM3MjksImV4cCI6MjA4OTY1OTcyOX0.mU7qMkwTllyE8BKgBTuR7BgB9KHQ81HlwxzhMxN4TBs",
  {
    auth: {
      persistSession: true,        // ✅ giữ session khi reload app
      autoRefreshToken: true,      // ✅ tự refresh token
      detectSessionInUrl: false,   // ❌ không cần cho mobile
      storage: AsyncStorage,       // ✅ sử dụng AsyncStorage cho React Native
    },
  }
);