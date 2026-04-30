import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { ActionButton } from '../components/ActionButton';

type ScreenProps = NativeStackScreenProps<RootStackParamList, 'CommunityFeed'>;

interface CommunityPost {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
  likes: number;
  comments: number;
  tags: string[];
}

export const CommunityFeedScreen = ({ navigation }: ScreenProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      authorName: 'Nguyễn Văn A',
      content: 'Bãi đỗ xe hôm nay khá đông, mọi người chú ý thời gian!',
      createdAt: new Date(),
      likes: 5,
      comments: 2,
      tags: ['experience'],
    },
    {
      id: '2',
      authorName: 'Trần Thị B',
      content: 'Có ai biết cách nạp xu không? Hướng dẫn giúp mình với.',
      createdAt: new Date(),
      likes: 1,
      comments: 0,
      tags: ['help'],
    },
  ]);

  const [newPostContent, setNewPostContent] = useState('');

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bài viết.');
      return;
    }

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      authorName: user?.name || 'Người dùng',
      content: newPostContent,
      createdAt: new Date(),
      likes: 0,
      comments: 0,
      tags: [],
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    Alert.alert('Thành công', 'Bài viết đã được đăng.');
  };

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.authorName}>{item.authorName}</Text>
        <Text style={styles.postTime}>{item.createdAt.toLocaleDateString()}</Text>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postFooter}>
        <Text style={styles.postStats}>{item.likes} thích • {item.comments} bình luận</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bảng tin cộng đồng</Text>

      <View style={styles.newPostContainer}>
        <TextInput
          value={newPostContent}
          onChangeText={setNewPostContent}
          placeholder="Chia sẻ điều gì đó..."
          multiline
          style={styles.newPostInput}
        />
        <ActionButton label="Đăng" onPress={handleCreatePost} />
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
    color: '#1f2937',
  },
  newPostContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  newPostInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  authorName: {
    fontWeight: '700',
    color: '#1f2937',
  },
  postTime: {
    color: '#6b7280',
    fontSize: 12,
  },
  postContent: {
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  postStats: {
    color: '#6b7280',
    fontSize: 12,
  },
});
