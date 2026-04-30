import { View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { ActionButton } from '../components/ActionButton';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đăng xuất.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hồ sơ</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Tên</Text>
        <Text style={styles.value}>{user?.name}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Vai trò</Text>
        <Text style={styles.value}>{user?.role}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Tiền ảo</Text>
        <Text style={styles.value}>{user?.virtualCoins}</Text>
      </View>
      <ActionButton label="Đăng xuất" onPress={handleLogout} variant="secondary" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
    color: '#1f2937',
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    color: '#6b7280',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});
