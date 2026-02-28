import React from "react";

interface ErrorMessageProps {
  message?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="text-destructive text-xs font-medium mt-1 mb-2" role="alert">
      {message}
    </div>
  );
};
