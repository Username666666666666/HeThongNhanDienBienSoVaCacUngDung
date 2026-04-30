import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Screens from '../screens';
import { withRoleGuard } from '../components/GuardedScreen';

const Tab = createBottomTabNavigator();

const ROLE = {
  ALL: ['owner', 'supervisor', 'admin', 'provider', 'support'],
  OWNER: ['owner', 'supervisor', 'support'],
  SUPERVISOR: ['supervisor'],
  SUPPORT: ['support'],
  ADMIN: ['admin'],
  PROVIDER: ['provider'],
};

export const OwnerTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
        if (route.name === 'OwnerDashboard') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Vehicles') iconName = focused ? 'car' : 'car-outline';
        else if (route.name === 'Parking') iconName = focused ? 'location' : 'location-outline';
        else if (route.name === 'Community') iconName = focused ? 'people' : 'people-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="OwnerDashboard" component={withRoleGuard(Screens.OwnerDashboard, ROLE.OWNER)} options={{ title: 'Trang chủ' }} />
    <Tab.Screen name="Vehicles" component={withRoleGuard(Screens.VehiclesTab, ROLE.OWNER)} options={{ title: 'Xe của tôi' }} />
    <Tab.Screen name="Parking" component={withRoleGuard(Screens.ParkingTab, ROLE.OWNER)} options={{ title: 'Đỗ xe' }} />
    <Tab.Screen name="Community" component={withRoleGuard(Screens.CommunityTab, ROLE.ALL)} options={{ title: 'Cộng đồng' }} />
    <Tab.Screen name="Profile" component={withRoleGuard(Screens.Profile, ROLE.ALL)} options={{ title: 'Hồ sơ' }} />
  </Tab.Navigator>
);

export const SupervisorTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
        if (route.name === 'SupervisorDashboard') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Monitoring') iconName = focused ? 'eye' : 'eye-outline';
        else if (route.name === 'Management') iconName = focused ? 'settings' : 'settings-outline';
        else if (route.name === 'Community') iconName = focused ? 'people' : 'people-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="SupervisorDashboard" component={withRoleGuard(Screens.SupervisorDashboard, ROLE.SUPERVISOR)} options={{ title: 'Trang chủ' }} />
    <Tab.Screen name="Monitoring" component={withRoleGuard(Screens.MonitoringTab, ROLE.SUPERVISOR)} options={{ title: 'Giám sát' }} />
    <Tab.Screen name="Management" component={withRoleGuard(Screens.ManagementTab, ROLE.SUPERVISOR)} options={{ title: 'Quản lý' }} />
    <Tab.Screen name="Community" component={withRoleGuard(Screens.CommunityTab, ROLE.ALL)} options={{ title: 'Cộng đồng' }} />
    <Tab.Screen name="Profile" component={withRoleGuard(Screens.SupervisorProfile, ROLE.SUPERVISOR)} options={{ title: 'Hồ sơ' }} />
  </Tab.Navigator>
);

export const AdminTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
        if (route.name === 'AdminDashboard') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Management') iconName = focused ? 'settings' : 'settings-outline';
        else if (route.name === 'Statistics') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
        else if (route.name === 'Community') iconName = focused ? 'people' : 'people-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="AdminDashboard" component={withRoleGuard(Screens.AdminDashboard, ROLE.ADMIN)} options={{ title: 'Trang chủ' }} />
    <Tab.Screen name="Management" component={withRoleGuard(Screens.AdminManagementTab, ROLE.ADMIN)} options={{ title: 'Quản lý' }} />
    <Tab.Screen name="Statistics" component={withRoleGuard(Screens.Statistics, ROLE.ADMIN)} options={{ title: 'Thống kê' }} />
    <Tab.Screen name="Community" component={withRoleGuard(Screens.CommunityTab, ROLE.ALL)} options={{ title: 'Cộng đồng' }} />
    <Tab.Screen name="Profile" component={withRoleGuard(Screens.Profile, ROLE.ALL)} options={{ title: 'Hồ sơ' }} />
  </Tab.Navigator>
);

export const ProviderTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
        if (route.name === 'ProviderDashboard') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Services') iconName = focused ? 'construct' : 'construct-outline';
        else if (route.name === 'Management') iconName = focused ? 'settings' : 'settings-outline';
        else if (route.name === 'Statistics') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="ProviderDashboard" component={withRoleGuard(Screens.ProviderDashboard, ROLE.PROVIDER)} options={{ title: 'Trang chủ' }} />
    <Tab.Screen name="Services" component={withRoleGuard(Screens.ProviderServicesTab, ROLE.PROVIDER)} options={{ title: 'Dịch vụ' }} />
    <Tab.Screen name="Management" component={withRoleGuard(Screens.ProviderManagementTab, ROLE.PROVIDER)} options={{ title: 'Quản lý' }} />
    <Tab.Screen name="Statistics" component={withRoleGuard(Screens.ProviderStatistics, ROLE.PROVIDER)} options={{ title: 'Thống kê' }} />
    <Tab.Screen name="Profile" component={withRoleGuard(Screens.Profile, ROLE.ALL)} options={{ title: 'Hồ sơ' }} />
  </Tab.Navigator>
);

export const SupportTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
        if (route.name === 'SupportStaffDashboard') iconName = focused ? 'home' : 'home-outline';
        else if (route.name === 'Community') iconName = focused ? 'people' : 'people-outline';
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="SupportStaffDashboard" component={withRoleGuard(Screens.SupportStaffDashboard, ROLE.SUPPORT)} options={{ title: 'Trang chủ' }} />
    <Tab.Screen name="Community" component={withRoleGuard(Screens.CommunityTab, ROLE.ALL)} options={{ title: 'Cộng đồng' }} />
    <Tab.Screen name="Profile" component={withRoleGuard(Screens.SupportProfile, ROLE.SUPPORT)} options={{ title: 'Hồ sơ' }} />
  </Tab.Navigator>
);
