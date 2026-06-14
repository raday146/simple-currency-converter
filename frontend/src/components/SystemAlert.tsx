interface SystemAlertProps {
  message: string;
}

export function SystemAlert({ message }: SystemAlertProps) {
  return (
    <div
      role="alert"
      className="w-full border-b border-red-500/40 bg-red-950/90 px-4 py-3 text-center text-sm font-medium text-red-100"
    >
      {message}
    </div>
  );
}
