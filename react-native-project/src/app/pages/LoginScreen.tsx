import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Button, Input, Card } from '../components';
import { useFormState } from '../hooks/useFormState';

interface LoginScreenProps {
  navigation: any;
}

export function LoginScreen({ navigation }: LoginScreenProps) {
  const form = useFormState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    try {
      form.setIsSubmitting(true);
      // TODO: Implement login logic
      console.log('Login:', form.values);
      form.setIsSubmitting(false);
    } catch (error) {
      console.error('Login error:', error);
      form.setFieldError('email', 'Đăng nhập thất bại');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Đăng Nhập</Text>

        <Card>
          <Input
            label="Email"
            placeholder="Nhập email"
            value={form.values.email}
            onChangeText={(text) => form.handleChange('email', text)}
            onBlur={() => form.handleBlur('email')}
            error={form.touched.email ? form.errors.email : undefined}
            keyboardType="email-address"
          />

          <Input
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={form.values.password}
            onChangeText={(text) => form.handleChange('password', text)}
            onBlur={() => form.handleBlur('password')}
            error={form.touched.password ? form.errors.password : undefined}
            secureTextEntry
          />

          <Button
            title="Đăng Nhập"
            onPress={handleLogin}
            loading={form.isSubmitting}
            style={styles.button}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkContainer}
          >
            <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
  linkContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  link: {
    color: '#007AFF',
    fontSize: 14,
  },
});
