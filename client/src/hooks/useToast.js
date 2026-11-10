import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  const showToast = useCallback((title, message, type = 'success') => {
    setToast({
      isOpen: true,
      title,
      message,
      type,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return { toast, showToast, hideToast };
}
