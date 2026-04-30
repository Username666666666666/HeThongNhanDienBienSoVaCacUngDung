import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ActionButton } from '../components/ActionButton';

type ScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen = ({ navigation }: ScreenProps) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng điền email và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      await register(email.trim(), password);
      Alert.alert('Thành công', 'Đăng ký thành công. Vui lòng kiểm tra email để xác nhận đăng ký.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Lỗi đăng ký', error.message || 'Không thể tạo tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Mật khẩu"
        secureTextEntry
        style={styles.input}
      />
      <ActionButton label={loading ? 'Đang tạo...' : 'Tạo tài khoản'} onPress={handleRegister} />
      <ActionButton label="Quay lại đăng nhập" onPress={() => navigation.navigate('Login')} variant="secondary" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 24,
    color: '#4338ca',
  },
  input: {
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
});
