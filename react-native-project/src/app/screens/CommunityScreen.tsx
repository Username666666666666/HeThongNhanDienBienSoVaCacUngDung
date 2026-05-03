import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CommunityScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cộng đồng</Text>
      <Text>Chức năng cộng đồng sẽ được phát triển</Text>
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

export default CommunityScreen;