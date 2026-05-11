export type ApiFieldErrors = Record<string, string>;

export type ApiErrorKind = "http" | "network";

export class ApiError extends Error {
  fieldErrors: ApiFieldErrors;
  kind: ApiErrorKind;
  status?: number;

  constructor({
    fieldErrors = {},
    kind,
    message,
    status,
  }: {
    fieldErrors?: ApiFieldErrors;
    kind: ApiErrorKind;
    message: string;
    status?: number;
  }) {
    super(message);
    this.name = "ApiError";
    this.fieldErrors = fieldErrors;
    this.kind = kind;
    this.status = status;
  }
}

type ApiClientOptions = {
  baseUrl?: string;
  fetch?: typeof window.fetch;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
};

type ApiRequestOptions = {
  auth?: boolean;
  body?: unknown;
  headers?: HeadersInit;
  method?: string;
};

type BackendValidationError = {
  loc?: unknown[];
  msg?: string;
};

type BackendErrorBody = {
  detail?: string | BackendValidationError[];
  message?: string;
};

export type ApiClient = ReturnType<typeof createApiClient>;

export function getDefaultApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
}

export function createApiClient({
  baseUrl = getDefaultApiBaseUrl(),
  fetch = window.fetch.bind(window),
  getToken = () => null,
  onUnauthorized,
}: ApiClientOptions = {}) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");

  async function run(path: string, options: ApiRequestOptions & { responseType?: "json" | "blob" } = {}) {
    const headers = new Headers(options.headers);
    const token = getToken();
    const shouldAttachAuth = options.auth !== false && token;
    let body = options.body as BodyInit | null | undefined;

    if (shouldAttachAuth) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (options.body !== undefined && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }

    let response: Response;
    try {
      response = await fetch(`${normalizedBaseUrl}${path}`, {
        body,
        headers,
        method: options.method ?? "GET",
      });
    } catch {
      throw new ApiError({
        kind: "network",
        message: "Tidak dapat terhubung ke server. Silakan coba lagi.",
      });
    }

    if (!response.ok) {
      if (response.status === 401) {
        onUnauthorized?.();
      }
      throw await createHttpError(response);
    }

    if (options.responseType === "blob") {
      return response.blob();
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  return {
    download(path: string, options: Omit<ApiRequestOptions, "body" | "method"> = {}) {
      return run(path, { ...options, responseType: "blob" }) as Promise<Blob>;
    },
    request<TResponse>(path: string, options: ApiRequestOptions = {}) {
      return run(path, options) as Promise<TResponse>;
    },
    upload<TResponse>(path: string, body: FormData, options: Omit<ApiRequestOptions, "body" | "method"> = {}) {
      return run(path, { ...options, body, method: "POST" }) as Promise<TResponse>;
    },
  };
}

async function createHttpError(response: Response) {
  const body = await readErrorBody(response);
  const fieldErrors = extractFieldErrors(body);
  const message = extractErrorMessage(body) ?? "Permintaan tidak dapat diproses.";

  return new ApiError({
    fieldErrors,
    kind: "http",
    message,
    status: response.status,
  });
}

async function readErrorBody(response: Response): Promise<BackendErrorBody | null> {
  try {
    return (await response.json()) as BackendErrorBody;
  } catch {
    return null;
  }
}

function extractErrorMessage(body: BackendErrorBody | null) {
  if (!body) {
    return null;
  }
  if (typeof body.detail === "string") {
    return body.detail;
  }
  if (Array.isArray(body.detail) && body.detail[0]?.msg) {
    return body.detail[0].msg;
  }
  return body.message ?? null;
}

function extractFieldErrors(body: BackendErrorBody | null): ApiFieldErrors {
  if (!Array.isArray(body?.detail)) {
    return {};
  }

  return body.detail.reduce<ApiFieldErrors>((errors, item) => {
    const field = item.loc?.at(-1);
    if (typeof field === "string" && item.msg) {
      errors[field] = item.msg;
    }
    return errors;
  }, {});
}
