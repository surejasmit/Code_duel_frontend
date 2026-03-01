import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error if needed
    const win = window as typeof window & { logFrontendError?: Function };
    if (typeof win.logFrontendError === 'function') {
      win.logFrontendError({
        message: error.message,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        route: window.location.pathname,
      });
    } else {
      console.error('ErrorBoundary:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-4">An unexpected error occurred. Please try again or reload the page.</p>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={this.handleRetry}>Retry</button>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
