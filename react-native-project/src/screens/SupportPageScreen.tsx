import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { ActionButton } from '../components/ActionButton';

type ScreenProps = NativeStackScreenProps<RootStackParamList, 'SupportPage'>;

interface SupportTicket {
  id: string;
  authorName: string;
  category: 'coin' | 'account' | 'security' | 'technical' | 'other';
  title: string;
  content: string;
  createdAt: Date;
  replies: number;
  status: 'open' | 'answered' | 'closed';
}

const categories = [
  { value: 'coin' as const, label: 'Xu ảo', color: '#fbbf24' },
  { value: 'account' as const, label: 'Tài khoản', color: '#3b82f6' },
  { value: 'security' as const, label: 'Bảo mật', color: '#dc2626' },
  { value: 'technical' as const, label: 'Kỹ thuật', color: '#8b5cf6' },
  { value: 'other' as const, label: 'Khác', color: '#6b7280' },
];

export const SupportPageScreen = ({ navigation }: ScreenProps) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      authorName: 'Nguyễn Văn A',
      category: 'coin',
      title: 'Không nhận được xu sau khi nạp',
      content: 'Tôi đã nạp 100k nhưng chưa thấy xu vào tài khoản.',
      createdAt: new Date(),
      replies: 3,
      status: 'answered',
    },
    {
      id: '2',
      authorName: 'Trần Thị B',
      category: 'technical',
      title: 'Ứng dụng bị lag khi tải dữ liệu',
      content: 'Ứng dụng chạy chậm khi xem danh sách bãi đỗ xe.',
      createdAt: new Date(),
      replies: 1,
      status: 'open',
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<'all' | SupportTicket['category']>('all');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('other');

  const filteredTickets = selectedCategory === 'all'
    ? tickets
    : tickets.filter(ticket => ticket.category === selectedCategory);

  const handleCreateTicket = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tiêu đề và nội dung.');
      return;
    }

    const newTicket: SupportTicket = {
      id: Date.now().toString(),
      authorName: user?.name || 'Người dùng',
      category: newCategory,
      title: newTitle,
      content: newContent,
      createdAt: new Date(),
      replies: 0,
      status: 'open',
    };

    setTickets([newTicket, ...tickets]);
    setNewTitle('');
    setNewContent('');
    setShowNewTicket(false);
    Alert.alert('Thành công', 'Yêu cầu hỗ trợ đã được gửi.');
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        onPress={() => setSelectedCategory('all')}
        style={[styles.categoryButton, selectedCategory === 'all' && styles.selectedCategory]}
      >
        <Text style={[styles.categoryText, selectedCategory === 'all' && styles.selectedCategoryText]}>Tất cả</Text>
      </TouchableOpacity>
      {categories.map(category => (
        <TouchableOpacity
          key={category.value}
          onPress={() => setSelectedCategory(category.value)}
          style={[styles.categoryButton, selectedCategory === category.value && styles.selectedCategory]}
        >
          <Text style={[styles.categoryText, selectedCategory === category.value && styles.selectedCategoryText]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTicket = ({ item }: { item: SupportTicket }) => {
    const categoryInfo = categories.find(cat => cat.value === item.category);
    return (
      <TouchableOpacity style={styles.ticketCard} onPress={() => Alert.alert('Chi tiết', item.content)}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketTitle}>{item.title}</Text>
          <View style={[styles.categoryBadge, { backgroundColor: categoryInfo?.color }]}>
            <Text style={styles.categoryBadgeText}>{categoryInfo?.label}</Text>
          </View>
        </View>
        <Text style={styles.ticketAuthor}>{item.authorName}</Text>
        <View style={styles.ticketFooter}>
          <Text style={styles.ticketTime}>{item.createdAt.toLocaleDateString()}</Text>
          <Text style={styles.ticketReplies}>{item.replies} trả lời</Text>
          <Text style={[styles.ticketStatus, item.status === 'open' ? styles.openStatus : styles.answeredStatus]}>
            {item.status === 'open' ? 'Mở' : item.status === 'answered' ? 'Đã trả lời' : 'Đóng'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (showNewTicket) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tạo yêu cầu hỗ trợ</Text>

        <TextInput
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="Tiêu đề yêu cầu"
          style={styles.input}
        />

        <TextInput
          value={newContent}
          onChangeText={setNewContent}
          placeholder="Mô tả chi tiết vấn đề"
          multiline
          style={[styles.input, styles.multilineInput]}
        />

        <View style={styles.categorySelect}>
          {categories.map(category => (
            <TouchableOpacity
              key={category.value}
              onPress={() => setNewCategory(category.value)}
              style={[styles.categoryOption, newCategory === category.value && styles.selectedCategoryOption]}
            >
              <Text style={styles.categoryOptionText}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ActionButton label="Gửi yêu cầu" onPress={handleCreateTicket} />
        <ActionButton label="Hủy" onPress={() => setShowNewTicket(false)} variant="secondary" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hỗ trợ</Text>

      {renderCategoryFilter()}

      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item.id}
        renderItem={renderTicket}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có yêu cầu hỗ trợ nào trong danh mục này.</Text>
        }
      />

      <ActionButton label="Tạo yêu cầu mới" onPress={() => setShowNewTicket(true)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ecfdf5',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    color: '#065f46',
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
  },
  selectedCategory: {
    backgroundColor: '#10b981',
  },
  categoryText: {
    color: '#374151',
  },
  selectedCategoryText: {
    color: '#ffffff',
  },
  ticketCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065f46',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  ticketAuthor: {
    color: '#374151',
    marginBottom: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketTime: {
    color: '#6b7280',
    fontSize: 12,
  },
  ticketReplies: {
    color: '#6b7280',
    fontSize: 12,
  },
  ticketStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openStatus: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  answeredStatus: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categorySelect: {
    marginBottom: 16,
  },
  categoryOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  selectedCategoryOption: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  categoryOptionText: {
    color: '#374151',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 40,
  },
});
