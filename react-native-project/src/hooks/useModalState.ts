import { useState, useCallback } from 'react';

export const useModalState = (initialData?: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(initialData);

  const open = useCallback((newData?: any) => {
    setData(newData ?? initialData);
    setIsOpen(true);
  }, [initialData]);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(undefined);
  }, []);

  const toggle = useCallback((newData?: any) => {
    if (isOpen) {
      close();
    } else {
      open(newData);
    }
  }, [isOpen, open, close]);

  return { isOpen, data, open, close, toggle };
};
