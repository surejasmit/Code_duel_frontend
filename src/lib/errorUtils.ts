type FrontendErrorLog = {
  message: string;
  componentStack?: string;
  timestamp: string;
  route?: string;
};

export function logFrontendError(error: FrontendErrorLog) {
  // Log to console
  console.error('[FrontendError]', error);

  // Store in localStorage (for future backend integration)
  try {
    const logs = JSON.parse(localStorage.getItem('frontendErrorLogs') || '[]');
    logs.push(error);
    localStorage.setItem('frontendErrorLogs', JSON.stringify(logs));
  } catch (e) {
    // fallback: do nothing
  }
}

// Expose globally for ErrorBoundary
if (typeof window !== 'undefined') {
  (window as any).logFrontendError = logFrontendError;
}
