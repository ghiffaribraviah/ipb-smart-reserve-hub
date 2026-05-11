import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient, getDefaultApiBaseUrl } from "./apiClient";

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("apiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uses the configured API base URL and bearer token for JSON requests", async () => {
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    const client = createApiClient({
      baseUrl: "https://api.example.test",
      fetch,
      getToken: () => "session-token",
    });

    await client.request("/student/profile");

    const [, requestInit] = fetch.mock.calls[0]!;
    expect(fetch).toHaveBeenCalledWith("https://api.example.test/student/profile", expect.objectContaining({ method: "GET" }));
    expect((requestInit.headers as Headers).get("Authorization")).toBe("Bearer session-token");
  });

  it("defaults the API base URL to the local backend when no env override exists", () => {
    vi.stubEnv("VITE_API_BASE_URL", "");

    expect(getDefaultApiBaseUrl()).toBe("http://localhost:8000");
  });

  it("normalizes backend validation errors into field errors", async () => {
    const fetch = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          detail: [
            {
              loc: ["body", "email"],
              msg: "Email sudah terdaftar.",
            },
          ],
        },
        { status: 422 },
      ),
    );
    const client = createApiClient({ baseUrl: "http://localhost:8000", fetch });

    await expect(client.request("/auth/register", { method: "POST", body: { email: "taken@apps.ipb.ac.id" } })).rejects.toMatchObject({
      fieldErrors: { email: "Email sudah terdaftar." },
      status: 422,
    });
  });

  it("clears the session callback on unauthorized responses", async () => {
    const onUnauthorized = vi.fn();
    const fetch = vi.fn().mockResolvedValue(jsonResponse({ detail: "Not authenticated" }, { status: 401 }));
    const client = createApiClient({ baseUrl: "http://localhost:8000", fetch, onUnauthorized });

    await expect(client.request("/auth/me")).rejects.toBeInstanceOf(ApiError);

    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("uploads form data and downloads binary responses without JSON coercion", async () => {
    const fileBody = new Blob(["approval letter"], { type: "application/pdf" });
    const fetch = vi.fn().mockResolvedValueOnce(jsonResponse({ id: "upload-1" })).mockResolvedValueOnce(new Response(fileBody));
    const client = createApiClient({ baseUrl: "http://localhost:8000", fetch });
    const formData = new FormData();
    formData.append("file", new Blob(["receipt"]), "receipt.pdf");

    await client.upload("/reservations/1/payment", formData);
    const downloaded = await client.download("/reservations/1/payment");

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:8000/reservations/1/payment",
      expect.objectContaining({
        body: formData,
        method: "POST",
      }),
    );
    expect(downloaded.size).toBeGreaterThan(0);
  });
});
