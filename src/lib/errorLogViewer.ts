// Utility to view error logs from localStorage (for debugging)
export function getFrontendErrorLogs() {
  try {
    return JSON.parse(localStorage.getItem('frontendErrorLogs') || '[]');
  } catch {
    return [];
  }
}

// Utility to clear error logs (for debugging)
export function clearFrontendErrorLogs() {
  localStorage.removeItem('frontendErrorLogs');
}
