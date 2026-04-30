# React Native Version

This folder contains a React Native adaptation of the current vehicle management application.

## Setup

1. Install dependencies:
   ```bash
   cd react-native-project
   npm install
   ```

2. Configure Supabase:
   - Open `src/config.ts`
   - Set `SUPABASE_URL` and `SUPABASE_ANON_KEY`

3. Run the app:
   ```bash
   npm start
   ```

## Structure

- `App.tsx` - Expo entry point
- `src/context/AuthContext.tsx` - Shared auth state and Supabase session handling
- `src/navigation/AppNavigator.tsx` - Authentication and main navigation
- `src/screens/` - App screens for login, profile, community, support, and role dashboard
- `src/components/DashboardTemplate.tsx` - Reusable dashboard layout for all role dashboards
- `src/utils/supabase.ts` - Supabase client configuration for React Native
- `src/config.ts` - Supabase configuration placeholder

## Notes

- This version is built with Expo and React Navigation.
- It preserves the same authentication flow and core feature map as the web app.
- Replace the placeholder Supabase settings in `src/config.ts` before running.
