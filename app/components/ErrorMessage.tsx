export function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded border-2 border-error bg-error-bg px-3 py-2 text-sm font-bold text-error"
    >
      {message}
    </p>
  );
}
