import { useState } from 'react';
import { z } from 'zod';

const emailSchema = z.string().email('Email không hợp lệ');
const passwordSchema = z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự');

export const useAuthForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    try {
      emailSchema.parse(email);
      setErrors(prev => ({ ...prev, email: '' }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, email: error.errors[0].message }));
      }
      return false;
    }
  };

  const validatePassword = (password: string) => {
    try {
      passwordSchema.parse(password);
      setErrors(prev => ({ ...prev, password: '' }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, password: error.errors[0].message }));
      }
      return false;
    }
  };

  const clearErrors = () => setErrors({});

  return {
    errors,
    validateEmail,
    validatePassword,
    clearErrors,
  };
};