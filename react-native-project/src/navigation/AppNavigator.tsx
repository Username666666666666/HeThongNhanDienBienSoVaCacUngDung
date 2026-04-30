import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { CommunityFeedScreen } from '../screens/CommunityFeedScreen';
import { CommunityChatScreen } from '../screens/CommunityChatScreen';
import { CoinGamesScreen } from '../screens/CoinGamesScreen';
import { SupportPageScreen } from '../screens/SupportPageScreen';
import { RoleDashboardScreen } from '../screens/RoleDashboardScreen';
import { OwnerDashboardScreen } from '../screens/OwnerDashboardScreen';
import { SupervisorDashboardScreen } from '../screens/SupervisorDashboardScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { ProviderDashboardScreen } from '../screens/ProviderDashboardScreen';
import { SupportDashboardScreen } from '../screens/SupportDashboardScreen';
import { View, ActivityIndicator } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  Profile: undefined;
  Community: undefined;
  CommunityFeed: undefined;
  CommunityChat: undefined;
  CoinGames: undefined;
  SupportPage: undefined;
  RoleDashboard: { role: string };
  OwnerDashboard: undefined;
  SupervisorDashboard: undefined;
  AdminDashboard: undefined;
  ProviderDashboard: undefined;
  SupportDashboard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Community" component={CommunityScreen} />
          <Stack.Screen name="CommunityFeed" component={CommunityFeedScreen} />
          <Stack.Screen name="CommunityChat" component={CommunityChatScreen} />
          <Stack.Screen name="CoinGames" component={CoinGamesScreen} />
          <Stack.Screen name="SupportPage" component={SupportPageScreen} />
          <Stack.Screen name="RoleDashboard" component={RoleDashboardScreen} />
          <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
          <Stack.Screen name="SupervisorDashboard" component={SupervisorDashboardScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="ProviderDashboard" component={ProviderDashboardScreen} />
          <Stack.Screen name="SupportDashboard" component={SupportDashboardScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
