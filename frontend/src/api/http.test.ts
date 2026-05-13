import { afterEach, describe, expect, it, vi } from "vitest";
import { apiDownload, apiRequest, setAuthTokenProvider, setUnauthorizedHandler } from "./http";

describe("apiRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setAuthTokenProvider(null);
    setUnauthorizedHandler(null);
  });

  it("attaches bearer auth and sends JSON payloads", async () => {
    setAuthTokenProvider(() => "session-token");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    await expect(apiRequest("/facilities", { body: { q: "auditorium" }, method: "POST" })).resolves.toEqual({
      ok: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/facilities",
      expect.objectContaining({
        body: JSON.stringify({ q: "auditorium" }),
        headers: expect.objectContaining({
          Authorization: "Bearer session-token",
          "Content-Type": "application/json",
        }),
        method: "POST",
      }),
    );
  });

  it("keeps multipart bodies intact without forcing a JSON content type", async () => {
    const body = new FormData();
    body.append("receipt", new File(["data"], "receipt.jpg", { type: "image/jpeg" }));
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    await apiRequest("/uploads", { body, method: "POST" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/uploads",
      expect.objectContaining({
        body,
        headers: expect.not.objectContaining({ "Content-Type": expect.any(String) }),
      }),
    );
  });

  it("normalizes backend detail errors and notifies 401 cleanup", async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: "Sesi tidak valid" }), {
        headers: { "Content-Type": "application/json" },
        status: 401,
      }),
    );

    await expect(apiRequest("/auth/me")).rejects.toMatchObject({
      message: "Sesi tidak valid",
      status: 401,
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});

describe("apiDownload", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setAuthTokenProvider(null);
  });

  it("returns binary blobs with attachment filenames", async () => {
    setAuthTokenProvider(() => "download-token");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("binary", {
        headers: {
          "Content-Disposition": 'attachment; filename="approval.pdf"',
          "Content-Type": "application/pdf",
        },
        status: 200,
      }),
    );

    await expect(apiDownload("/files/approval")).resolves.toMatchObject({
      filename: "approval.pdf",
    });
  });
});
