import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const VehiclesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Phương tiện</Text>
      <Text>Chức năng quản lý phương tiện sẽ được phát triển</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default VehiclesScreen;