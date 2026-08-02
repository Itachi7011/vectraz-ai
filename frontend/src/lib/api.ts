export class ApiRequestError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  isFormData?: boolean;
};

/**
 * All calls go through same-origin `/api/...` — next.config.ts rewrites
 * them server-side to whichever microservice owns that path. Cookies
 * (accessToken/refreshToken) are sent automatically via `credentials:
 * "include"`, matching the httpOnly cookie strategy the backend uses.
 */
export async function apiFetch<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, isFormData = false } = options;

  const res = await fetch(path, {
    method,
    credentials: "include",
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body: body ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await res.json() : undefined;

  if (!res.ok) {
    throw new ApiRequestError(res.status, data?.error ?? `Request failed (${res.status})`, data?.details);
  }

  return data as T;
}
