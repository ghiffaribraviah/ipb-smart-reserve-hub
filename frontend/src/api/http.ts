const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type RequestBody = BodyInit | JsonValue;

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: RequestBody;
};

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

let authTokenProvider: (() => string | null) | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAuthTokenProvider(provider: (() => string | null) | null) {
  authTokenProvider = provider;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function buildUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function isBodyInit(body: RequestBody): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof URLSearchParams ||
    ArrayBuffer.isView(body)
  );
}

function buildHeaders(body: RequestBody | undefined, headers: HeadersInit | undefined) {
  const nextHeaders = Object.fromEntries(new Headers(headers).entries());
  const token = authTokenProvider?.();

  if (token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined && !isBodyInit(body) && !("Content-Type" in nextHeaders) && !("content-type" in nextHeaders)) {
    nextHeaders["Content-Type"] = "application/json";
  }

  return nextHeaders;
}

async function readError(response: Response) {
  const contentType = response.headers.get("Content-Type") ?? "";

  if (!contentType.includes("application/json")) {
    return { detail: await response.text() };
  }

  return response.json().catch(() => ({ detail: response.statusText }));
}

function errorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail: unknown }).detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (item && typeof item === "object" && "msg" in item) {
            return String((item as { msg: unknown }).msg);
          }
          return String(item);
        })
        .join(", ");
    }
  }

  return fallback;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, headers, ...init } = options;
  const requestBody = body === undefined || isBodyInit(body) ? body : JSON.stringify(body);
  const response = await fetch(buildUrl(path), {
    ...init,
    body: requestBody,
    headers: buildHeaders(body, headers),
  });

  if (!response.ok) {
    const payload = await readError(response);

    if (response.status === 401) {
      unauthorizedHandler?.();
    }

    throw new ApiError(errorMessage(payload, response.statusText), response.status, payload);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }

  return response.json() as Promise<T>;
}

function getAttachmentFilename(disposition: string | null) {
  if (!disposition) {
    return null;
  }

  const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function apiDownload(path: string, options: RequestInit = {}) {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: buildHeaders(undefined, options.headers),
  });

  if (!response.ok) {
    const payload = await readError(response);
    throw new ApiError(errorMessage(payload, response.statusText), response.status, payload);
  }

  return {
    blob: await response.blob(),
    filename: getAttachmentFilename(response.headers.get("Content-Disposition")),
  };
}
