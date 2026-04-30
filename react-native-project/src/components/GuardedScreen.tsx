import { ComponentType } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface GuardedProps {
  title: string;
}

export function withRoleGuard<P>(Component: ComponentType<P>, allowedRoles?: string[]) {
  return (props: P) => {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Đang xác thực...</Text>
        </View>
      );
    }

    if (!user) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Bạn cần đăng nhập để truy cập trang này.</Text>
        </View>
      );
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Quyền truy cập bị từ chối.</Text>
          <Text style={styles.subtitle}>Vai trò hiện tại: {user.role}</Text>
        </View>
      );
    }

    return <Component {...props} />;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F7F8FA',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
