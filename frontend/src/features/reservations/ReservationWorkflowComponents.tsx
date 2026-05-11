import {
  AlertCircle,
  Check,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  LoaderCircle,
  ReceiptText,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { ChangeEvent, DragEvent, KeyboardEvent, ReactNode, useEffect, useId, useRef, useState } from "react";
import { Button } from "../../components/ui/Button";

export type ReservationBackendStatus =
  | "pending_document_upload"
  | "pending_document_review"
  | "pending_payment"
  | "overdue_verification"
  | "approved"
  | "cancellation_requested"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

type Tone = "pending" | "success" | "error" | "neutral";

const reservationStatusConfig: Record<ReservationBackendStatus, { label: string; tone: Tone }> = {
  approved: { label: "Disetujui", tone: "success" },
  cancellation_requested: { label: "Pembatalan Diajukan", tone: "pending" },
  cancelled: { label: "Dibatalkan", tone: "neutral" },
  completed: { label: "Selesai", tone: "success" },
  expired: { label: "Kedaluwarsa", tone: "error" },
  overdue_verification: { label: "Verifikasi Terlambat", tone: "error" },
  pending_document_review: { label: "Menunggu Verifikasi Dokumen", tone: "pending" },
  pending_document_upload: { label: "Menunggu Unggah Dokumen", tone: "pending" },
  pending_payment: { label: "Menunggu Pembayaran", tone: "pending" },
  rejected: { label: "Ditolak", tone: "error" },
};

const toneClasses: Record<Tone, string> = {
  error: "bg-error-container text-error-on-container",
  neutral: "bg-surface-container text-on-surface-variant",
  pending: "bg-tertiary-fixed text-tertiary-on-fixed",
  success: "bg-secondary-container text-secondary-on-container",
};

export function getReservationStatusLabel(status: string) {
  return reservationStatusConfig[status as ReservationBackendStatus]?.label ?? status;
}

export function ReservationStatusBadge({ status }: { status: string }) {
  const config = reservationStatusConfig[status as ReservationBackendStatus];
  const label = config?.label ?? status;
  const tone = config?.tone ?? "neutral";

  return (
    <span className={["inline-flex min-h-7 items-center rounded-full px-sm text-label-sm font-bold", toneClasses[tone]].join(" ")}>
      {label}
    </span>
  );
}

type ReservationStepperProps = {
  completedSteps?: number[];
  currentStep: 1 | 2 | 3;
  isComplete?: boolean;
};

const reservationSteps = [
  { label: "Pilih Waktu", step: 1 },
  { label: "Detail Kegiatan", step: 2 },
  { label: "Konfirmasi", step: 3 },
] as const;

export function ReservationStepper({ completedSteps = [], currentStep, isComplete = false }: ReservationStepperProps) {
  return (
    <nav aria-label="Langkah reservasi" className="rounded-lg border border-outline-variant bg-surface-container-lowest p-md shadow-control">
      <ol className="grid gap-sm sm:grid-cols-3">
        {reservationSteps.map((item) => {
          const done = isComplete || completedSteps.includes(item.step);
          const active = !isComplete && item.step === currentStep;
          return (
            <li
              aria-current={active ? "step" : undefined}
              className={[
                "grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-sm rounded px-sm py-sm",
                done || active ? "bg-secondary-container text-secondary-on-container" : "bg-surface-container text-on-surface-variant",
              ].join(" ")}
              key={item.step}
            >
              <span className={["grid h-8 w-8 place-items-center rounded-full text-label-bold", done ? "bg-secondary text-secondary-on" : "bg-surface-container-lowest"].join(" ")}>
                {done ? <Check aria-hidden="true" className="h-4 w-4" /> : item.step}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-label-bold">{item.label}</span>
                <span className="block text-label-sm">{active ? "Langkah aktif" : done ? "Selesai" : "Belum dimulai"}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

type ReservationSummaryRow = {
  label: string;
  value?: ReactNode;
};

type ReservationSummaryCardProps = {
  facilityImage?: string | null;
  facilityName: string;
  rows: ReservationSummaryRow[];
  status?: string;
  title?: string;
};

export function ReservationSummaryCard({ facilityImage, facilityName, rows, status, title = "Ringkasan reservasi" }: ReservationSummaryCardProps) {
  return (
    <aside aria-label={title} className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-ambient">
      <div className="relative grid aspect-[16/7] place-items-center overflow-hidden bg-primary-container p-lg text-primary-on">
        {facilityImage ? <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" src={facilityImage} /> : null}
        <div className="text-center">
          <p className="text-label-sm text-primary-on/72">Fasilitas</p>
          <h2 className="mt-xs line-clamp-2 text-h3">{facilityName}</h2>
        </div>
      </div>
      <div className="grid gap-md p-lg">
        <div className="flex flex-wrap items-start justify-between gap-sm">
          <h2 className="text-h3 text-primary-container">{title}</h2>
          {status ? <ReservationStatusBadge status={status} /> : null}
        </div>
        <dl className="grid gap-sm">
          {rows.map((row) => (
            <div className="grid gap-xs border-t border-outline-variant pt-sm first:border-t-0 first:pt-0" key={row.label}>
              <dt className="text-label-sm uppercase text-on-surface-variant">{row.label}</dt>
              <dd className="break-words text-body-md font-bold text-on-surface">{row.value || "Belum tersedia"}</dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}

type FileUploadKind = "payment-receipt" | "signed-letter";
type FileUploadState = "empty" | "uploading" | "uploaded" | "failed";

type FileUploadPanelProps = {
  errorMessage?: string;
  kind: FileUploadKind;
  onFileAccepted?: (file: File) => void;
  onFileRejected?: (message: string) => void;
  onFileRemoved?: () => void;
  selectedFile?: File | null;
  state?: FileUploadState;
  title: string;
};

const maxUploadSizeBytes = 5 * 1024 * 1024;

const uploadRules: Record<FileUploadKind, { accept: string; description: string; extensions: string[]; mimeTypes: string[] }> = {
  "payment-receipt": {
    accept: ".jpg,.jpeg,.png,image/jpeg,image/png",
    description: "JPG, JPEG, atau PNG maksimal 5 MB.",
    extensions: [".jpg", ".jpeg", ".png"],
    mimeTypes: ["image/jpeg", "image/png"],
  },
  "signed-letter": {
    accept: ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png",
    description: "PDF, JPG, JPEG, atau PNG maksimal 5 MB.",
    extensions: [".pdf", ".jpg", ".jpeg", ".png"],
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  },
};

export function FileUploadPanel({
  errorMessage,
  kind,
  onFileAccepted,
  onFileRejected,
  onFileRemoved,
  selectedFile,
  state = "empty",
  title,
}: FileUploadPanelProps) {
  const inputId = useId();
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const file = selectedFile ?? internalFile;
  const rules = uploadRules[kind];
  const error = errorMessage ?? internalError;

  function acceptFile(nextFile: File) {
    const validationError = validateUploadFile(nextFile, kind);
    if (validationError) {
      setInternalError(validationError);
      onFileRejected?.(validationError);
      return;
    }
    setInternalError(null);
    setInternalFile(nextFile);
    onFileAccepted?.(nextFile);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (nextFile) {
      acceptFile(nextFile);
    }
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragActive(false);
    const nextFile = event.dataTransfer.files[0];
    if (nextFile) {
      acceptFile(nextFile);
    }
  }

  function removeFile() {
    setInternalFile(null);
    onFileRemoved?.();
  }

  return (
    <section className="grid gap-md rounded-lg border border-outline-variant bg-surface-container-lowest p-lg shadow-control" aria-label={title}>
      <div className="flex flex-wrap items-start justify-between gap-sm">
        <div>
          <h2 className="text-h3 text-primary-container">{title}</h2>
          <p className="mt-xs text-body-md text-on-surface-variant">{rules.description}</p>
        </div>
        {state === "uploading" ? <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-secondary" /> : null}
      </div>

      <label
        className={[
          "grid min-h-36 cursor-pointer place-items-center rounded-lg border-2 border-dashed p-lg text-center transition-colors",
          isDragActive ? "border-secondary bg-secondary-container" : "border-outline-variant bg-secondary-container/25 hover:bg-secondary-container/40",
          error ? "border-error bg-error-container/30" : "",
        ].join(" ")}
        htmlFor={inputId}
        onDragLeave={() => setIsDragActive(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDrop={onDrop}
      >
        <span className="grid gap-sm justify-items-center">
          <UploadCloud aria-hidden="true" className="h-8 w-8 text-secondary" />
          <span className="text-label-bold text-primary-container">Pilih atau tarik file ke sini</span>
          <span className="text-label-sm text-on-surface-variant">Pilih file untuk {title}</span>
        </span>
      </label>
      <input accept={rules.accept} className="sr-only" id={inputId} onChange={onInputChange} type="file" aria-label={`Pilih file untuk ${title}`} />

      {file ? (
        <div className="flex flex-wrap items-center justify-between gap-sm rounded border border-outline-variant bg-surface-container-low p-sm">
          <div className="flex min-w-0 items-center gap-sm">
            <FileText aria-hidden="true" className="h-5 w-5 shrink-0 text-secondary" />
            <div className="min-w-0">
              <p className="truncate text-label-bold text-primary-container">{file.name}</p>
              <p className="text-label-sm text-on-surface-variant">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <Button aria-label={`Hapus ${file.name}`} iconOnly onClick={removeFile} variant="ghost">
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <p className="sr-only" role="status">
        {file ? `${file.name} dipilih` : "Belum ada file dipilih"}
      </p>
      {error ? (
        <p className="flex items-start gap-sm text-body-md text-error" role="alert">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </p>
      ) : null}
    </section>
  );
}

export function validateUploadFile(file: File, kind: FileUploadKind) {
  const rules = uploadRules[kind];
  const extension = file.name.includes(".") ? `.${file.name.split(".").pop()?.toLowerCase()}` : "";
  const allowed = rules.mimeTypes.includes(file.type) || rules.extensions.includes(extension);
  if (!allowed) {
    return `Format file harus ${rules.description}`;
  }
  if (file.size > maxUploadSizeBytes) {
    return "Ukuran file maksimal 5 MB.";
  }
  return null;
}

type PaymentInstructionsProps = {
  amountRupiah?: number | null;
  deadline?: string | null;
  instructions?: string | null;
  reservationCode?: string | null;
  state?: "ready" | "loading" | "unavailable" | "error";
};

export function PaymentInstructions({
  amountRupiah,
  deadline,
  instructions,
  reservationCode,
  state = "ready",
}: PaymentInstructionsProps) {
  if (state !== "ready") {
    const messageByState = {
      error: "Instruksi pembayaran belum dapat dimuat.",
      loading: "Memuat instruksi pembayaran.",
      unavailable: "Pembayaran belum tersedia untuk reservasi ini.",
    };
    return (
      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-lg shadow-control" role={state === "error" ? "alert" : "status"}>
        <h2 className="text-h3 text-primary-container">Instruksi Pembayaran</h2>
        <p className="mt-sm text-body-md text-on-surface-variant">{messageByState[state]}</p>
      </section>
    );
  }

  return (
    <section className="grid gap-md rounded-lg border border-outline-variant bg-surface-container-lowest p-lg shadow-control" aria-label="Instruksi Pembayaran">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <p className="text-label-bold uppercase text-secondary">Instruksi Pembayaran</p>
          <h2 className="mt-xs text-h3 text-primary-container">{reservationCode || "Kode belum tersedia"}</h2>
        </div>
        <p className="rounded-lg bg-primary-container px-md py-sm text-body-lg font-bold text-primary-on">{formatRupiah(amountRupiah)}</p>
      </div>
      <p className="whitespace-pre-line text-body-md text-on-surface-variant">{instructions || "Instruksi pembayaran belum tersedia."}</p>
      <p className="flex items-center gap-sm rounded bg-tertiary-fixed px-md py-sm text-label-bold text-tertiary-on-fixed">
        <Clock3 aria-hidden="true" className="h-4 w-4" />
        Batas unggah: {deadline ? formatDateTime(deadline) : "Belum ditentukan"}
      </p>
    </section>
  );
}

type DocumentReviewStatus = "pending" | "rejected" | "verified";

type ReservationDocumentRow = {
  contentType?: string | null;
  downloadUrl?: string | null;
  fileName?: string | null;
  label: string;
  rejectionReason?: string | null;
  sizeBytes?: number | null;
  status: DocumentReviewStatus;
  uploadedAt?: string | null;
};

type ReservationDocumentHubProps = {
  rows: ReservationDocumentRow[];
};

const documentStatusConfig: Record<DocumentReviewStatus, { label: string; tone: Tone }> = {
  pending: { label: "Menunggu verifikasi", tone: "pending" },
  rejected: { label: "Ditolak", tone: "error" },
  verified: { label: "Terverifikasi", tone: "success" },
};

export function ReservationDocumentHub({ rows }: ReservationDocumentHubProps) {
  const availableRows = rows.filter((row) => row.fileName);

  return (
    <section className="grid gap-md rounded-lg border border-outline-variant bg-surface-container-lowest p-lg shadow-control" aria-label="Dokumen reservasi">
      <div>
        <p className="text-label-bold uppercase text-secondary">Dokumen</p>
        <h2 className="mt-xs text-h3 text-primary-container">Dokumen Reservasi</h2>
      </div>
      {availableRows.length ? (
        <ul className="grid gap-sm" role="list">
          {availableRows.map((row) => (
            <li
              aria-label={`${row.label}: ${row.fileName}`}
              className="grid gap-sm rounded border border-outline-variant bg-surface-container-low p-md sm:grid-cols-[1fr_auto] sm:items-center"
              key={`${row.label}-${row.fileName}`}
            >
              <div className="flex min-w-0 items-start gap-sm">
                {row.label.toLowerCase().includes("bukti") ? (
                  <ReceiptText aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-secondary" />
                ) : (
                  <FileCheck2 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-secondary" />
                )}
                <div className="min-w-0">
                  <p className="text-label-bold text-primary-container">{row.label}</p>
                  <p className="break-words text-body-md text-on-surface">{row.fileName}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {[row.contentType, row.sizeBytes ? formatFileSize(row.sizeBytes) : null, row.uploadedAt ? formatDateTime(row.uploadedAt) : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {row.rejectionReason ? <p className="mt-xs text-label-sm text-error">{row.rejectionReason}</p> : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-sm sm:justify-end">
                <span className={["inline-flex min-h-7 items-center rounded-full px-sm text-label-sm font-bold", toneClasses[documentStatusConfig[row.status].tone]].join(" ")}>
                  {documentStatusConfig[row.status].label}
                </span>
                {row.downloadUrl ? (
                  <a
                    className="inline-flex min-h-10 items-center gap-sm rounded border border-primary-container px-md text-label-bold text-primary-container hover:bg-primary-fixed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                    href={row.downloadUrl}
                  >
                    <Download aria-hidden="true" className="h-4 w-4" />
                    Unduh {row.label}
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded bg-surface-container-low p-md text-body-md text-on-surface-variant">Belum ada dokumen yang tersedia.</p>
      )}
    </section>
  );
}

type ConfirmationDialogProps = {
  cancelLabel: string;
  confirmLabel: string;
  errorMessage?: string;
  isOpen: boolean;
  isPending?: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: (reason?: string) => void;
  reasonLabel?: string;
  requireReason?: boolean;
  title: string;
  variant?: "default" | "destructive";
};

export function ConfirmationDialog({
  cancelLabel,
  confirmLabel,
  errorMessage,
  isOpen,
  isPending = false,
  message,
  onCancel,
  onConfirm,
  reasonLabel = "Alasan",
  requireReason = false,
  title,
  variant = "default",
}: ConfirmationDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState("");
  const canConfirm = !isPending && (!requireReason || reason.trim().length > 0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const firstControl = getDialogControls(dialogRef.current)[0];
    firstControl?.focus();
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function onDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !isPending) {
      onCancel();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    const controls = getDialogControls(dialogRef.current);
    if (!controls.length) {
      return;
    }
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-primary/45 px-md py-lg" onKeyDown={onDialogKeyDown}>
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        aria-modal="true"
        className="grid w-full max-w-lg gap-md rounded-lg border border-outline-variant bg-surface-container-lowest p-lg shadow-ambient"
        ref={dialogRef}
        role="dialog"
      >
        <div className="flex items-start gap-md">
          <span className={["grid h-11 w-11 shrink-0 place-items-center rounded-full", variant === "destructive" ? "bg-error-container text-error" : "bg-primary-fixed text-primary-container"].join(" ")}>
            {variant === "destructive" ? <AlertCircle aria-hidden="true" className="h-5 w-5" /> : <FileCheck2 aria-hidden="true" className="h-5 w-5" />}
          </span>
          <div>
            <h2 className="text-h3 text-primary-container" id={titleId}>
              {title}
            </h2>
            <p className="mt-xs text-body-md text-on-surface-variant" id={descriptionId}>
              {message}
            </p>
          </div>
        </div>
        {requireReason ? (
          <label className="grid gap-xs text-label-bold text-on-surface">
            {reasonLabel}
            <textarea
              className="min-h-28 rounded border border-outline-variant bg-surface-container-lowest px-md py-sm text-body-md font-normal text-on-surface shadow-control focus:border-secondary focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-secondary"
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            />
          </label>
        ) : null}
        {errorMessage ? (
          <p className="text-body-md text-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-sm sm:flex-row sm:justify-end">
          <Button disabled={isPending} onClick={onCancel} variant="outline">
            {cancelLabel}
          </Button>
          <Button disabled={!canConfirm} isLoading={isPending} onClick={() => onConfirm(requireReason ? reason.trim() : undefined)} variant={variant === "destructive" ? "destructive" : "primary"}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getDialogControls(container: HTMLDivElement | null) {
  if (!container) {
    return [];
  }
  return Array.from(container.querySelectorAll<HTMLElement>("button, textarea, input, select, a[href]")).filter((element) => !element.hasAttribute("disabled"));
}

function formatRupiah(amount?: number | null) {
  if (typeof amount !== "number") {
    return "Biaya belum tersedia";
  }
  return new Intl.NumberFormat("id-ID", { currency: "IDR", maximumFractionDigits: 0, style: "currency" }).format(amount);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
