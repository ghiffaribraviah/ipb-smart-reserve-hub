import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ConfirmationDialog,
  FileUploadPanel,
  ReservationDocumentHub,
  ReservationStatusBadge,
  getReservationStatusLabel,
} from "./ReservationWorkflowComponents";

describe("ReservationStatusBadge", () => {
  it("maps every documented backend status to an Indonesian label", () => {
    expect(getReservationStatusLabel("pending_document_upload")).toBe("Menunggu Unggah Dokumen");
    expect(getReservationStatusLabel("pending_document_review")).toBe("Menunggu Verifikasi Dokumen");
    expect(getReservationStatusLabel("pending_payment")).toBe("Menunggu Pembayaran");
    expect(getReservationStatusLabel("overdue_verification")).toBe("Verifikasi Terlambat");
    expect(getReservationStatusLabel("approved")).toBe("Disetujui");
    expect(getReservationStatusLabel("cancellation_requested")).toBe("Pembatalan Diajukan");
    expect(getReservationStatusLabel("completed")).toBe("Selesai");
    expect(getReservationStatusLabel("cancelled")).toBe("Dibatalkan");
    expect(getReservationStatusLabel("rejected")).toBe("Ditolak");
    expect(getReservationStatusLabel("expired")).toBe("Kedaluwarsa");
  });

  it("renders unknown statuses as neutral explicit text", () => {
    render(<ReservationStatusBadge status="backend_future_status" />);

    expect(screen.getByText("backend_future_status")).toBeVisible();
  });
});

describe("FileUploadPanel", () => {
  it("accepts signed approval letter PDFs and rejects payment receipt PDFs", async () => {
    const user = userEvent.setup();
    const onSignedAccepted = vi.fn();
    const onPaymentRejected = vi.fn();
    const signedFile = new File(["pdf"], "surat-persetujuan.pdf", { type: "application/pdf" });
    const paymentFile = new File(["pdf"], "bukti-bayar.pdf", { type: "application/pdf" });

    render(
      <div>
        <FileUploadPanel kind="signed-letter" onFileAccepted={onSignedAccepted} title="Surat persetujuan" />
        <FileUploadPanel kind="payment-receipt" onFileRejected={onPaymentRejected} title="Bukti pembayaran" />
      </div>,
    );

    await user.upload(screen.getByLabelText("Pilih file untuk Surat persetujuan"), signedFile);
    fireEvent.change(screen.getByLabelText("Pilih file untuk Bukti pembayaran"), {
      target: { files: [paymentFile] },
    });

    expect(onSignedAccepted).toHaveBeenCalledWith(signedFile);
    expect(onPaymentRejected).toHaveBeenCalledWith(expect.stringContaining("JPG, JPEG, atau PNG"));
  });

  it("announces selected files and supports removal", async () => {
    const user = userEvent.setup();
    const onFileAccepted = vi.fn();
    const onFileRemoved = vi.fn();
    const file = new File(["image"], "receipt.png", { type: "image/png" });

    render(
      <FileUploadPanel
        kind="payment-receipt"
        onFileAccepted={onFileAccepted}
        onFileRemoved={onFileRemoved}
        selectedFile={file}
        title="Bukti pembayaran"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("receipt.png dipilih");

    await user.click(screen.getByRole("button", { name: "Hapus receipt.png" }));

    expect(onFileRemoved).toHaveBeenCalledOnce();
  });
});

describe("ReservationDocumentHub", () => {
  it("renders only real metadata rows and hides unavailable rows", () => {
    render(
      <ReservationDocumentHub
        rows={[
          {
            downloadUrl: "/download/signed-letter",
            fileName: "surat-ditandatangani.pdf",
            label: "Surat persetujuan bertanda tangan",
            status: "verified",
            uploadedAt: "2026-05-10T10:30:00Z",
          },
          {
            fileName: null,
            label: "Bukti pembayaran",
            status: "pending",
            uploadedAt: null,
          },
        ]}
      />,
    );

    const row = screen.getByRole("listitem", { name: /Surat persetujuan bertanda tangan/ });
    expect(within(row).getByText("surat-ditandatangani.pdf")).toBeVisible();
    expect(within(row).getByRole("link", { name: "Unduh Surat persetujuan bertanda tangan" })).toHaveAttribute("href", "/download/signed-letter");
    expect(screen.queryByText("Bukti pembayaran")).not.toBeInTheDocument();
  });
});

describe("ConfirmationDialog", () => {
  it("requires a reason before confirming reason-required actions", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmationDialog
        cancelLabel="Kembali"
        confirmLabel="Ajukan pembatalan"
        isOpen
        message="Berikan alasan agar staf dapat meninjau permintaan."
        onCancel={() => undefined}
        onConfirm={onConfirm}
        reasonLabel="Alasan pembatalan"
        requireReason
        title="Ajukan pembatalan reservasi"
        variant="destructive"
      />,
    );

    expect(screen.getByRole("button", { name: "Ajukan pembatalan" })).toBeDisabled();

    await user.type(screen.getByLabelText("Alasan pembatalan"), "Jadwal kegiatan berubah");
    await user.click(screen.getByRole("button", { name: "Ajukan pembatalan" }));

    expect(onConfirm).toHaveBeenCalledWith("Jadwal kegiatan berubah");
  });

  it("closes on Escape when not pending", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ConfirmationDialog
        cancelLabel="Tetap di halaman"
        confirmLabel="Keluar"
        isOpen
        message="Perubahan draft belum disimpan."
        onCancel={onCancel}
        onConfirm={() => undefined}
        title="Tinggalkan halaman?"
        variant="default"
      />,
    );

    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
