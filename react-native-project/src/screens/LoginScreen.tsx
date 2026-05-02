import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useFormState } from '../hooks/useFormState';
import { useAuth } from '../hooks';
import { Button, Input, Card, ErrorText } from './Common';
import { ERROR_MESSAGES } from '../constants';
import { isValidEmail } from '../utils/formatters';

export const LoginScreen = ({ navigation }: any) => {
  const { login, loading } = useAuth();
  const form = useFormState(
    { email: '', password: '' },
    async (values) => {
      try {
        if (!isValidEmail(values.email)) {
          form.setFieldError('email', ERROR_MESSAGES.INVALID_EMAIL);
          return;
        }
        if (values.password.length < 6) {
          form.setFieldError('password', ERROR_MESSAGES.INVALID_PASSWORD);
          return;
        }

        await login(values.email, values.password);
        navigation.navigate('Home');
      } catch (error: any) {
        form.setFieldError('general', error.message || ERROR_MESSAGES.LOGIN_FAILED);
      }
    }
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card>
          <Input
            label="Email"
            placeholder="user@example.com"
            value={form.values.email}
            onChangeText={(text) => form.setFieldValue('email', text)}
            onBlur={() => form.setFieldTouched('email')}
          />
          {form.touched.email && form.errors.email && (
            <ErrorText message={form.errors.email} />
          )}

          <Input
            label="Mật khẩu"
            placeholder="••••••••"
            value={form.values.password}
            onChangeText={(text) => form.setFieldValue('password', text)}
            secureTextEntry
            onBlur={() => form.setFieldTouched('password')}
          />
          {form.touched.password && form.errors.password && (
            <ErrorText message={form.errors.password} />
          )}

          {form.errors.general && (
            <ErrorText message={form.errors.general} />
          )}

          <Button
            title="Đăng nhập"
            onPress={form.handleSubmit}
            loading={form.isSubmitting || loading}
          />

          <Button
            title="Đăng ký"
            onPress={() => navigation.navigate('Register')}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
});
