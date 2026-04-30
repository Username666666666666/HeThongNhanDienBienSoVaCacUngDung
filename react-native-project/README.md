# React Native Parking Management System

## Overview
This is an optimized React Native version of the parking management system, converted from the original web application.

## Key Optimizations

### 1. Navigation Structure
- **Role-based Tab Navigation**: Each user role (owner, supervisor, admin, provider, support) has a dedicated tab navigator with relevant screens.
- **Stack Navigation**: Modal screens and detailed views use stack navigation for better UX.

### 2. Performance Optimizations
- **Memoization**: Used `useMemo`, `useCallback` in AuthContext to prevent unnecessary re-renders.
- **Optimized Components**: Created reusable `Button` and `Card` components with proper styling and accessibility.
- **Efficient Lists**: Used `FlatList` for rendering lists of actions in tab screens.

### 3. UI/UX Improvements
- **Mobile-first Design**: Adapted web layouts to mobile-friendly interfaces.
- **Consistent Styling**: Unified color scheme and typography using StyleSheet.
- **Icons**: Integrated Expo Vector Icons for better visual hierarchy.

### 4. Code Structure
- **Modular Components**: Separated UI components into dedicated files.
- **Type Safety**: Maintained TypeScript throughout for better development experience.
- **Role Guards**: Enhanced role-based access control with proper error handling.

## Project Structure
```
react-native-project/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── GuardedScreen.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── TabNavigators.tsx
│   ├── screens/
│   │   └── index.tsx
│   ├── services/
│   │   └── lprService.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── supabase.ts
├── App.tsx
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

## Supabase Integration
- **Unchanged**: All Supabase-related code remains identical to the web version for compatibility.
- **Auth Flow**: Maintained the same authentication logic with real-time role updates.
- **Database**: Uses the same Supabase schema and queries.

## Installation & Setup
1. Navigate to the `react-native-project` directory
2. Run `npm install` or `yarn install`
3. Configure Supabase environment variables in `src/utils/supabase.ts`
4. Run `expo start` to start the development server

## Features by Role

### Owner
- Vehicle management (register, status, logs)
- Parking (browse lots, register parking, top-up coins)
- Community access
- Profile management

### Supervisor
- Gate management and monitoring
- Suspicious vehicle tracking
- Shift management
- Community access

### Admin
- Parking lot configuration
- Staff management
- Statistics and moderation
- System administration

### Provider
- Service management
- Device and account management
- System settings
- Statistics

### Support
- Community support
- Basic dashboard

## Notes
- All screens are currently placeholder implementations.
- Supabase integration is fully functional.
- Navigation structure is optimized for mobile UX.
- Ready for further screen implementations based on web app logic.
