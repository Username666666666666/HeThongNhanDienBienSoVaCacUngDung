import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { ActionButton } from '../components/ActionButton';

type ScreenProps = NativeStackScreenProps<RootStackParamList, 'CoinGames'>;

interface CoinGame {
  id: string;
  gameType: 'coin_flip' | 'dice_roll';
  hostName: string;
  betAmount: number;
  participants: number;
  maxParticipants: number;
  status: 'waiting' | 'in_progress' | 'completed';
}

export const CoinGamesScreen = ({ navigation }: ScreenProps) => {
  const { user } = useAuth();
  const [games, setGames] = useState<CoinGame[]>([
    {
      id: '1',
      gameType: 'coin_flip',
      hostName: 'Trần Thị B',
      betAmount: 10000,
      participants: 1,
      maxParticipants: 2,
      status: 'waiting',
    },
    {
      id: '2',
      gameType: 'dice_roll',
      hostName: 'Lê Văn C',
      betAmount: 20000,
      participants: 1,
      maxParticipants: 4,
      status: 'waiting',
    },
  ]);

  const [userCoins] = useState(150000);

  const handleJoinGame = (game: CoinGame) => {
    if (userCoins < game.betAmount) {
      Alert.alert('Không đủ xu', 'Bạn không có đủ xu để tham gia trò chơi này.');
      return;
    }

    Alert.alert(
      'Tham gia trò chơi',
      `Bạn muốn tham gia trò chơi với cược ${game.betAmount.toLocaleString()} xu?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Tham gia',
          onPress: () => {
            // Update game participants
            setGames(prevGames =>
              prevGames.map(g =>
                g.id === game.id
                  ? { ...g, participants: g.participants + 1, status: g.participants + 1 >= g.maxParticipants ? 'in_progress' : 'waiting' }
                  : g
              )
            );
            Alert.alert('Thành công', 'Bạn đã tham gia trò chơi!');
          },
        },
      ]
    );
  };

  const renderGame = ({ item }: { item: CoinGame }) => (
    <View style={styles.gameCard}>
      <View style={styles.gameHeader}>
        <Text style={styles.gameType}>
          {item.gameType === 'coin_flip' ? 'Tung đồng xu' : 'Lắc xúc xắc'}
        </Text>
        <Text style={styles.betAmount}>{item.betAmount.toLocaleString()} xu</Text>
      </View>
      <Text style={styles.hostName}>Host: {item.hostName}</Text>
      <Text style={styles.participants}>
        {item.participants}/{item.maxParticipants} người tham gia
      </Text>
      <View style={styles.gameFooter}>
        <Text style={[styles.status, item.status === 'waiting' ? styles.waitingStatus : styles.inProgressStatus]}>
          {item.status === 'waiting' ? 'Đang chờ' : item.status === 'in_progress' ? 'Đang chơi' : 'Hoàn thành'}
        </Text>
        {item.status === 'waiting' && item.participants < item.maxParticipants && (
          <TouchableOpacity onPress={() => handleJoinGame(item)} style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Tham gia</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trò chơi xu</Text>
      <Text style={styles.subtitle}>Số xu hiện tại: {userCoins.toLocaleString()}</Text>

      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={renderGame}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có trò chơi nào. Tạo trò chơi mới để bắt đầu!</Text>
        }
      />

      <ActionButton label="Tạo trò chơi mới" onPress={() => Alert.alert('Tính năng sắp có', 'Tạo trò chơi mới sẽ được thêm trong phiên bản tiếp theo.')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fef3c7',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    color: '#92400e',
  },
  subtitle: {
    fontSize: 16,
    color: '#a16207',
    marginBottom: 16,
  },
  gameCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  gameType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  betAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
  hostName: {
    color: '#4b5563',
    marginBottom: 4,
  },
  participants: {
    color: '#6b7280',
    marginBottom: 12,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  waitingStatus: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  inProgressStatus: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  joinButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 40,
  },
});
