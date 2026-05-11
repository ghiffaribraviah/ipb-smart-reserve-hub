import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatePanel } from "./StatePanel";

describe("StatePanel", () => {
  it("announces loading state with stable status text", () => {
    render(<StatePanel message="Memuat daftar fasilitas." state="loading" title="Memuat" />);

    expect(screen.getByRole("status")).toHaveTextContent("Memuat daftar fasilitas.");
  });

  it("exposes a retry action for recoverable errors", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <StatePanel
        actionLabel="Coba lagi"
        message="Koneksi ke layanan fasilitas gagal."
        onAction={onRetry}
        state="error"
        title="Data belum tersedia"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Coba lagi" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Koneksi ke layanan fasilitas gagal.");
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
