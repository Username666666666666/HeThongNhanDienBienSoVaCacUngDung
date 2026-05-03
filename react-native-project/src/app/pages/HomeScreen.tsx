import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Card, Button } from '../components';

interface HomeScreenProps {
  navigation: any;
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Hệ Thống Quản Lý Bãi Xe</Text>

        <Card title="Tính năng chính">
          <Text style={styles.description}>
            Ứng dụng quản lý bãi xe toàn diện với hỗ trợ:
          </Text>
          <Text style={styles.feature}>• Quản lý lỗi xe</Text>
          <Text style={styles.feature}>• Theo dõi camera</Text>
          <Text style={styles.feature}>• Quản lý nhân viên</Text>
          <Text style={styles.feature}>• Báo cáo vi phạm</Text>
          <Text style={styles.feature}>• Thanh toán tiền xu</Text>
        </Card>

        <Card title="Menu">
          <Button
            title="Bảng điều khiển"
            onPress={() => navigation.navigate('Dashboard')}
            variant="primary"
            style={styles.menuButton}
          />
          <Button
            title="Lịch sử đỗ xe"
            onPress={() => navigation.navigate('History')}
            variant="primary"
            style={styles.menuButton}
          />
          <Button
            title="Cộng đồng"
            onPress={() => navigation.navigate('Community')}
            variant="primary"
            style={styles.menuButton}
          />
        </Card>
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
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  feature: {
    fontSize: 14,
    color: '#333',
    marginVertical: 4,
  },
  menuButton: {
    marginVertical: 8,
  },
});
