import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import { ActionButton } from '../components/ActionButton';

type ScreenProps = NativeStackScreenProps<RootStackParamList, 'CommunityChat'>;

interface ChatMessage {
  id: string;
  userName: string;
  content: string;
  createdAt: Date;
  isCurrentUser: boolean;
}

export const CommunityChatScreen = ({ navigation }: ScreenProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userName: 'Hệ thống',
      content: 'Chào mừng đến với phòng chat cộng đồng!',
      createdAt: new Date(),
      isCurrentUser: false,
    },
    {
      id: '2',
      userName: 'Nguyễn Văn A',
      content: 'Bãi đỗ xe hôm nay khá đông nhé mọi người.',
      createdAt: new Date(),
      isCurrentUser: false,
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    flatListRef.current?.scrollToEnd();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userName: user?.name || 'Người dùng',
      content: newMessage,
      createdAt: new Date(),
      isCurrentUser: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageContainer, item.isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
      {!item.isCurrentUser && <Text style={styles.messageAuthor}>{item.userName}</Text>}
      <View style={[styles.messageBubble, item.isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
        <Text style={[styles.messageText, item.isCurrentUser ? styles.currentUserText : styles.otherUserText]}>
          {item.content}
        </Text>
      </View>
      <Text style={styles.messageTime}>{item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.title}>Trò chuyện cộng đồng</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Nhập tin nhắn..."
          style={styles.messageInput}
          multiline
        />
        <TouchableOpacity onPress={handleSendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageAuthor: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 4,
  },
  currentUserBubble: {
    backgroundColor: '#3b82f6',
  },
  otherUserBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: '#ffffff',
  },
  otherUserText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 10,
    color: '#9ca3af',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
