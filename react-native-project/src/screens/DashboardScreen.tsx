import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useAuth } from '../hooks';
import { usePermissions } from '../hooks/usePermissions';
import { Button, Card, Loading } from '../components/Common';
import { getHomeRoute } from '../utils/navigation';

export const DashboardScreen = ({ navigation }: any) => {
  const { user, logout, loading } = useAuth();
  const { isOwner, isAdmin, isSupervisor } = usePermissions();

  if (loading) return <Loading />;

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card>
          <Text style={styles.title}>Chào, {user.name}!</Text>
          <Text style={styles.subtitle}>Role: {user.role}</Text>
          <Text style={styles.coins}>Xu ảo: {user.virtualCoins}</Text>
        </Card>

        {isOwner() && (
          <>
            <Card>
              <Text style={styles.sectionTitle}>Chủ xe</Text>
              <Button
                title="Xem bãi đỗ"
                onPress={() => navigation.navigate('ParkingLots')}
              />
              <Button
                title="Đăng ký phương tiện"
                onPress={() => navigation.navigate('RegisterVehicle')}
              />
            </Card>
          </>
        )}

        {isAdmin() && (
          <>
            <Card>
              <Text style={styles.sectionTitle}>Quản trị</Text>
              <Button
                title="Quản lý bãi đỗ"
                onPress={() => navigation.navigate('AdminManagement')}
              />
              <Button
                title="Quản lý nhân sự"
                onPress={() => navigation.navigate('StaffManagement')}
              />
            </Card>
          </>
        )}

        {isSupervisor() && (
          <>
            <Card>
              <Text style={styles.sectionTitle}>Giám sát viên</Text>
              <Button
                title="Quản lý cổng"
                onPress={() => navigation.navigate('GateManagement')}
              />
            </Card>
          </>
        )}

        <Card>
          <Button
            title="Profile"
            onPress={() => navigation.navigate('Profile')}
          />
          <Button
            title="Cộng đồng"
            onPress={() => navigation.navigate('Community')}
          />
          <Button
            title="Đăng xuất"
            onPress={handleLogout}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  coins: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
