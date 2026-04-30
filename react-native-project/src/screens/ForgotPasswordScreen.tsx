import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import { ActionButton } from '../components/ActionButton';

export const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'myapp://reset-password',
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (error: any) {
      Alert.alert('Không thể gửi yêu cầu', error.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.description}>
        Nhập email để nhận liên kết đặt lại mật khẩu. Bạn sẽ nhận được hướng dẫn qua email.
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <ActionButton label={loading ? 'Đang gửi...' : 'Gửi yêu cầu'} onPress={handleSubmit} />
      {submitted && (
        <Text style={styles.success}>
          Yêu cầu đã gửi. Kiểm tra email của bạn để tiếp tục.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff7ed',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 16,
    color: '#c2410c',
  },
  description: {
    color: '#7c2d12',
    marginBottom: 16,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  success: {
    marginTop: 16,
    color: '#166534',
    fontWeight: '700',
  },
});
