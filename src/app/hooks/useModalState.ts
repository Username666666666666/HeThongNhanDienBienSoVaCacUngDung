import { useState, useCallback } from 'react';

interface ModalState {
  isOpen: boolean;
  data?: any;
}

export const useModalState = (initialData?: any) => {
  const [state, setState] = useState<ModalState>({
    isOpen: false,
    data: initialData,
  });

  const open = useCallback((data?: any) => {
    setState({ isOpen: true, data: data ?? initialData });
  }, [initialData]);

  const close = useCallback(() => {
    setState({ isOpen: false, data: undefined });
  }, []);

  const toggle = useCallback((data?: any) => {
    setState(prev => 
      prev.isOpen 
        ? { isOpen: false, data: undefined }
        : { isOpen: true, data: data ?? initialData }
    );
  }, [initialData]);

  return { ...state, open, close, toggle };
};
