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

interface RegisterScreenProps {
  navigation: any;
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const form = useFormState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = async () => {
    try {
      form.setIsSubmitting(true);
      // TODO: Implement register logic
      console.log('Register:', form.values);
      form.setIsSubmitting(false);
    } catch (error) {
      console.error('Register error:', error);
      form.setFieldError('email', 'Đăng ký thất bại');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Đăng Ký</Text>

        <Card>
          <Input
            label="Tên"
            placeholder="Nhập tên"
            value={form.values.name}
            onChangeText={(text) => form.handleChange('name', text)}
            onBlur={() => form.handleBlur('name')}
            error={form.touched.name ? form.errors.name : undefined}
          />

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

          <Input
            label="Xác nhận mật khẩu"
            placeholder="Xác nhận mật khẩu"
            value={form.values.confirmPassword}
            onChangeText={(text) => form.handleChange('confirmPassword', text)}
            onBlur={() => form.handleBlur('confirmPassword')}
            error={form.touched.confirmPassword ? form.errors.confirmPassword : undefined}
            secureTextEntry
          />

          <Button
            title="Đăng Ký"
            onPress={handleRegister}
            loading={form.isSubmitting}
            style={styles.button}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkContainer}
          >
            <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
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
