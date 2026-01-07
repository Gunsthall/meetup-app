interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800 font-medium mb-2">Error</p>
      <p className="text-red-600 text-sm mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-red-700 underline hover:text-red-900"
        >
          Try again
        </button>
      )}
    </div>
  );
}
