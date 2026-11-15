/** Accept only same-origin relative paths as post-login destinations. */
export function safeRedirectPath(value: unknown, fallback = "/app/dashboard"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
