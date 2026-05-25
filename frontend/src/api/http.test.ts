import { afterEach, describe, expect, it, vi } from "vitest";
import { apiDownload, apiPreview, apiRequest, setAuthTokenProvider, setUnauthorizedHandler } from "./http";

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

  it("triggers a browser file save for downloaded blobs", async () => {
    const click = vi.fn();
    const revokeObjectURL = vi.fn();
    const createObjectURL = vi.fn(() => "blob:http://localhost/approval");
    const appendChild = vi.spyOn(document.body, "appendChild");
    const removeChild = vi.spyOn(document.body, "removeChild");
    vi.spyOn(URL, "createObjectURL").mockImplementation(createObjectURL);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(revokeObjectURL);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(click);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("binary", {
        headers: {
          "Content-Disposition": 'attachment; filename="approval.pdf"',
          "Content-Type": "application/pdf",
        },
        status: 200,
      }),
    );

    await apiDownload("/files/approval");

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledTimes(1);
    const anchor = appendChild.mock.calls[0]?.[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("approval.pdf");
    expect(anchor.href).toBe("blob:http://localhost/approval");
    expect(removeChild).toHaveBeenCalledWith(anchor);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/approval");
  });
});

describe("apiPreview", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setAuthTokenProvider(null);
  });

  it("opens a protected blob in a new tab", async () => {
    const open = vi.fn();
    const createObjectURL = vi.fn(() => "blob:http://localhost/preview");
    const revokeObjectURL = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("binary", {
        headers: {
          "Content-Disposition": 'attachment; filename="approval.pdf"',
          "Content-Type": "application/pdf",
        },
        status: 200,
      }),
    );
    vi.spyOn(URL, "createObjectURL").mockImplementation(createObjectURL);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(revokeObjectURL);
    vi.spyOn(window, "open").mockImplementation(open as typeof window.open);

    await expect(apiPreview("/files/approval")).resolves.toMatchObject({
      url: "blob:http://localhost/preview",
    });

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(open).toHaveBeenCalledWith("blob:http://localhost/preview", "_blank", "noopener,noreferrer");
  });
});
