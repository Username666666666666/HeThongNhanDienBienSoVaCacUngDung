// useAuthForm hook for React Native
// Centralized authentication form validation

import { useState, useCallback } from 'react';
import { z } from 'zod';

const emailSchema = z.string().email('Email không hợp lệ');
const passwordSchema = z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự');
const nameSchema = z.string().min(2, 'Tên phải có ít nhất 2 ký tự');

interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  [key: string]: string | undefined;
}

export const useAuthForm = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = useCallback((email: string) => {
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
  }, []);

  const validatePassword = useCallback((password: string) => {
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
  }, []);

  const validateName = useCallback((name: string) => {
    try {
      nameSchema.parse(name);
      setErrors(prev => ({ ...prev, name: '' }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, name: error.errors[0].message }));
      }
      return false;
    }
  }, []);

  const validateAll = useCallback((credentials: {
    email?: string;
    password?: string;
    name?: string;
  }) => {
    let isValid = true;
    
    if (credentials.email && !validateEmail(credentials.email)) {
      isValid = false;
    }
    if (credentials.password && !validatePassword(credentials.password)) {
      isValid = false;
    }
    if (credentials.name && !validateName(credentials.name)) {
      isValid = false;
    }
    
    return isValid;
  }, [validateEmail, validatePassword, validateName]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  return {
    errors,
    validateEmail,
    validatePassword,
    validateName,
    validateAll,
    clearErrors,
    setFieldError,
  };
};