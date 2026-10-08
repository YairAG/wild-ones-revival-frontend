export function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="rounded bg-red-900/60 px-3 py-2 text-sm text-red-200">{message}</p>;
}
