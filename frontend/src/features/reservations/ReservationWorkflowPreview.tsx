import {
  ConfirmationDialog,
  FileUploadPanel,
  PaymentInstructions,
  ReservationDocumentHub,
  ReservationStatusBadge,
  ReservationStepper,
  ReservationSummaryCard,
} from "./ReservationWorkflowComponents";
import { Button } from "../../components/ui/Button";
import { useState } from "react";

const selectedReceipt = new File(["receipt"], "receipt-final.png", { type: "image/png" });

export function ReservationWorkflowPreview() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background px-md py-lg text-on-surface sm:px-xl">
      <section className="mx-auto grid max-w-container gap-lg">
        <header className="border-b border-outline-variant pb-lg">
          <p className="text-label-bold uppercase text-secondary">IPB Smart Reserve Hub</p>
          <h1 className="mt-sm text-h2 text-primary-container">Reservation Workflow Components</h1>
          <p className="mt-sm max-w-3xl text-body-md text-on-surface-variant">
            Shared reservation components for step progression, student workflow projections, uploads, payment instructions, document metadata, and confirmation actions.
          </p>
        </header>

        <section className="grid gap-md">
          <ReservationStepper completedSteps={[1]} currentStep={2} />
          <ReservationStepper completedSteps={[1, 2, 3]} currentStep={3} isComplete />
        </section>

        <section className="grid gap-lg lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <ReservationSummaryCard
            facilityName="Auditorium CCR"
            rows={[
              { label: "Kode reservasi", value: "RSV-2026-0042" },
              { label: "Waktu", value: "20 Mei 2026, 09.00-11.00 WIB" },
              { label: "Kegiatan", value: "Seminar Teknologi Pangan dan Inovasi Kampus" },
              { label: "Organisasi", value: "BEM KM IPB" },
              { label: "Biaya", value: "Rp2.500.000" },
            ]}
            status="pending_document_review"
          />

          <div className="grid gap-md">
            <section className="grid gap-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-lg shadow-control">
              <p className="text-label-bold uppercase text-secondary">Status</p>
              <div className="flex flex-wrap gap-sm">
                {["pending_document_upload", "pending_document_review", "pending_payment", "approved", "completed", "cancelled", "rejected", "expired"].map((status) => (
                  <ReservationStatusBadge key={status} status={status} />
                ))}
              </div>
            </section>

            <PaymentInstructions
              amountRupiah={2500000}
              deadline="2026-05-19T10:00:00+07:00"
              instructions={"Transfer ke rekening virtual IPB Smart Reserve Hub.\nCantumkan kode reservasi pada berita transfer sebelum mengunggah bukti pembayaran."}
              reservationCode="RSV-2026-0042"
            />
          </div>
        </section>

        <section className="grid gap-lg lg:grid-cols-2">
          <FileUploadPanel kind="signed-letter" state="empty" title="Surat persetujuan" />
          <FileUploadPanel kind="payment-receipt" selectedFile={selectedReceipt} state="uploaded" title="Bukti pembayaran" />
          <FileUploadPanel errorMessage="Format file harus JPG, JPEG, atau PNG maksimal 5 MB." kind="payment-receipt" title="Bukti pembayaran ditolak" />
          <FileUploadPanel kind="signed-letter" state="uploading" title="Mengunggah surat" />
        </section>

        <ReservationDocumentHub
          rows={[
            {
              contentType: "application/pdf",
              downloadUrl: "/student/reservations/res-123/signed-approval-letter/download",
              fileName: "surat-persetujuan-ditandatangani.pdf",
              label: "Surat persetujuan bertanda tangan",
              sizeBytes: 824000,
              status: "verified",
              uploadedAt: "2026-05-10T10:30:00Z",
            },
            {
              contentType: "image/png",
              downloadUrl: "/student/reservations/res-123/payment-receipt/download",
              fileName: "receipt-final.png",
              label: "Bukti pembayaran",
              rejectionReason: null,
              sizeBytes: 420000,
              status: "pending",
              uploadedAt: "2026-05-11T02:15:00Z",
            },
            {
              fileName: null,
              label: "Dokumen kosong",
              status: "pending",
              uploadedAt: null,
            },
          ]}
        />

        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-lg shadow-control">
          <p className="text-label-bold uppercase text-secondary">Konfirmasi</p>
          <h2 className="mt-xs text-h3 text-primary-container">Dialog perubahan workflow</h2>
          <p className="mt-sm max-w-2xl text-body-md text-on-surface-variant">
            Dialog dipakai untuk pembatalan, alasan wajib, dan penjagaan navigasi saat draft belum disimpan.
          </p>
          <Button className="mt-md" onClick={() => setIsDialogOpen(true)} variant="destructive">
            Buka dialog pembatalan
          </Button>
        </section>
      </section>

      <ConfirmationDialog
        cancelLabel="Kembali"
        confirmLabel="Ajukan pembatalan"
        isOpen={isDialogOpen}
        message="Berikan alasan agar staf dapat meninjau permintaan pembatalan reservasi ini."
        onCancel={() => setIsDialogOpen(false)}
        onConfirm={() => undefined}
        reasonLabel="Alasan pembatalan"
        requireReason
        title="Ajukan pembatalan reservasi"
        variant="destructive"
      />
    </main>
  );
}
