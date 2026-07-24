export function safeGet<T>(value: unknown): T | null {
  if (value == null || typeof value !== "object") return null;
  return value as T;
}
