import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ParkingLotsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bãi xe</Text>
      <Text>Chức năng bãi xe sẽ được phát triển</Text>
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

export default ParkingLotsScreen;