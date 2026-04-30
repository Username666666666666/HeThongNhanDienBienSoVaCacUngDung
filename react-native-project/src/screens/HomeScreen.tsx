import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ActionButton } from '../components/ActionButton';

type ScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: ScreenProps) => {
  const { user } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.welcome}>Xin chào, {user?.name || 'Người dùng'}</Text>
      <Text style={styles.role}>Vai trò: {user?.role}</Text>
      <ActionButton label="Trang cá nhân" onPress={() => navigation.navigate('Profile')} />
      <ActionButton label="Cộng đồng" onPress={() => navigation.navigate('Community')} />
      <ActionButton label="Bảng điều khiển vai trò" onPress={() => {
        const role = user?.role;
        if (role === 'owner') {
          navigation.navigate('OwnerDashboard');
        } else if (role === 'supervisor') {
          navigation.navigate('SupervisorDashboard');
        } else if (role === 'admin') {
          navigation.navigate('AdminDashboard');
        } else if (role === 'provider') {
          navigation.navigate('ProviderDashboard');
        } else if (role === 'support') {
          navigation.navigate('SupportDashboard');
        } else {
          navigation.navigate('RoleDashboard', { role: role ?? 'owner' });
        }
      }} />
      <Text style={styles.sectionTitle}>Chức năng khác</Text>
      <ActionButton label="Báo cáo hỗ trợ" onPress={() => navigation.navigate('SupportPage')} variant="secondary" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
  },
  welcome: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    color: '#312e81',
  },
  role: {
    marginBottom: 24,
    color: '#4b5563',
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontWeight: '700',
    color: '#4338ca',
  },
});
