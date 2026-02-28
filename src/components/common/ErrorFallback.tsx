import React from 'react';

interface FallbackProps {
  error?: Error;
  onRetry: () => void;
  onReload: () => void;
}

const ErrorFallback: React.FC<FallbackProps> = ({ error, onRetry, onReload }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
      <p className="mb-4">We encountered an error. Please try again or reload the page.</p>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={onRetry}>Retry</button>
        <button className="btn btn-secondary" onClick={onReload}>Reload</button>
      </div>
    </div>
  );
};

export default ErrorFallback;
