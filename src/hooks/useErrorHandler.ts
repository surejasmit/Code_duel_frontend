import { useCallback } from 'react';
import { logFrontendError } from '@/lib/errorUtils';

export function useErrorHandler() {
  return useCallback((error: unknown, context?: string) => {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    logFrontendError({
      message,
      componentStack: context || '',
      timestamp: new Date().toISOString(),
      route: window.location.pathname,
    });
  }, []);
}
