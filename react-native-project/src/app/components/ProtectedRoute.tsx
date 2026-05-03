import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { LoadingFallback } from './LoadingFallback';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const context = useContext(AuthContext);

  if (!context) {
    return (
      <View style={styles.container}>
        <Text>Auth context not available</Text>
      </View>
    );
  }

  const { isLoading, isAuthenticated, user } = context;

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Vui lòng đăng nhập</Text>
      </View>
    );
  }

  if (requiredRole && user) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Bạn không có quyền truy cập</Text>
        </View>
      );
    }
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
