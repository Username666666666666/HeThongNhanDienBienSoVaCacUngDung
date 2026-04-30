
  # Thiết kế giao diện quản lý

  This is a code bundle for Thiết kế giao diện quản lý. The original project is available at https://www.figma.com/design/8iyUkhdtmQTe4Bx50gxsiG/Thi%E1%BA%BFt-k%E1%BA%BF-giao-di%E1%BB%87n-qu%E1%BA%A3n-l%C3%BD.

## 🚀 Performance Optimizations

### React Web App Optimizations
- **Memoized AuthContext**: Added `useMemo` and `useCallback` to prevent unnecessary re-renders
- **Reusable Components**: Created `GuardedScreen`, `Loading`, `DashboardLayout`, and `CardAction` components
- **Custom Hooks**: Added `useRoleGuard` and `useVirtualCoins` for better state management
- **Role-based Access Control**: Enhanced security with proper role guards

### React Native App Optimizations
- **Role-based Tab Navigation**: Separate tab navigators for each user role
- **Memoized Context**: Optimized AuthContext with performance hooks
- **Reusable UI Components**: Created `Button` and `Card` with variants and sizes
- **Mobile-first Design**: Adapted web layouts for mobile UX

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## 📱 React Native Version

A React Native version is available in the `react-native-project/` folder with Expo support.

```bash
cd react-native-project
npm install
expo start
```

## 🔧 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Mobile**: React Native, Expo, React Navigation
- **Backend**: Supabase (unchanged integration)
- **State Management**: React Context with performance optimizations

## 📋 Features by Role

### Owner
- Vehicle management and registration
- Parking lot browsing and booking
- Virtual coin top-up system
- Entry/exit logs

### Supervisor
- Gate management and monitoring
- Suspicious vehicle tracking
- Shift management
- Real-time monitoring

### Admin
- Parking lot configuration
- Staff management
- Statistics and analytics
- Community moderation

### Provider
- Service management
- Virtual coin settings
- Device management
- System administration

### Support
- Community support
- Basic dashboard access

## 🔒 Security & Performance

- **Supabase Integration**: Unchanged for compatibility
- **Role-based Access**: Enhanced guards and permissions
- **Performance**: Memoization and optimized re-renders
- **Type Safety**: Full TypeScript coverage
  