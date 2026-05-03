import { useState, useCallback, useRef } from 'react';

interface FormState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export const useFormState = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit?: (values: T) => Promise<void> | void
) => {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitPromiseRef = useRef<Promise<void> | null>(null);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
    }));
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, []);

  const setFieldTouched = useCallback((field: string, isTouched = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: isTouched },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setIsSubmitting(true);

      try {
        submitPromiseRef.current = onSubmit?.(state.values) ?? Promise.resolve();
        await submitPromiseRef.current;
      } catch (err) {
        console.error('Form submit error:', err);
      } finally {
        setIsSubmitting(false);
        submitPromiseRef.current = null;
      }
    },
    [state.values, onSubmit]
  );

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
    });
  }, [initialValues]);

  return {
    ...state,
    isSubmitting,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleSubmit,
    reset,
  };
};
