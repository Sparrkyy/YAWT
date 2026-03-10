import { useEffect } from 'react';

export default function Toast({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="toast" role="alert">
      {message}
    </div>
  );
}
