import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ActionButton } from '../components/ActionButton';

type ScreenProps = NativeStackScreenProps<RootStackParamList, 'Community'>;

export const CommunityScreen = ({ navigation }: ScreenProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cộng đồng</Text>
      <Text style={styles.subtitle}>Khám phá tin tức, trò chuyện và tham gia trò chơi xu.</Text>
      <ActionButton label="Bảng tin cộng đồng" onPress={() => navigation.navigate('CommunityFeed')} />
      <ActionButton label="Trò chuyện" onPress={() => navigation.navigate('CommunityChat')} />
      <ActionButton label="Trò chơi xu" onPress={() => navigation.navigate('CoinGames')} />
      <ActionButton label="Hỗ trợ" onPress={() => navigation.navigate('SupportPage')} variant="secondary" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#eef2ff',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    color: '#312e81',
  },
  subtitle: {
    color: '#4b5563',
    marginBottom: 24,
    lineHeight: 22,
  },
});
