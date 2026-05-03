import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button, Card, LoadingFallback } from '../components';
import { AuthContext } from '../context/AuthContext';

interface ProfileScreenProps {
  navigation: any;
}

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <LoadingFallback />;
  }

  const { user, logout, isLoading } = authContext;

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Chưa đăng nhập</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Hồ sơ cá nhân</Text>

        <Card title="Thông tin">
          <View style={styles.infoRow}>
            <Text style={styles.label}>Tên:</Text>
            <Text style={styles.value}>{user.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Vai trò:</Text>
            <Text style={styles.value}>{user.role}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Xu:</Text>
            <Text style={styles.value}>{user.virtualCoins}</Text>
          </View>
        </Card>

        <Button
          title="Đăng Xuất"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 20,
  },
});
