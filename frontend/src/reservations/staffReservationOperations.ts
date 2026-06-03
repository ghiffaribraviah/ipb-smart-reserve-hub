import type {
  StaffBadgeTone,
  StaffReservationListItem,
  StaffVerificationItem,
} from "../fixtures/staffReservationOperations";

export type StaffReservationOperationResponse = {
  cancellation: {
    requested: boolean;
    review_status: string;
  };
  document: {
    due_at: string | null;
    review_status: string;
  };
  due_at: string | null;
  ends_at: string;
  facility: {
    id: string;
    name: string;
  };
  id: string;
  organization_unit: {
    id: string | null;
    name: string;
  };
  payment: {
    due_at: string | null;
    required: boolean;
    review_status: string;
  };
  reservation_code: string;
  review_status: string;
  starts_at: string;
  status: string;
  student: {
    email: string;
    full_name: string;
    id: string;
  };
  activity_title: string;
  workflow_type: string;
};

export type StaffOperationStatusView = {
  label: string;
  tone: StaffBadgeTone;
};

const statusViews: Record<string, StaffOperationStatusView> = {
  approved: { label: "Disetujui", tone: "success" },
  awaiting_upload: { label: "Menunggu Unggah", tone: "neutral" },
  cancellation_requested: { label: "Menunggu Pembatalan", tone: "warning" },
  cancelled: { label: "Dibatalkan", tone: "neutral" },
  completed: { label: "Selesai", tone: "success" },
  document_review: { label: "Menunggu Verifikasi Dokumen", tone: "warning" },
  expired: { label: "Kedaluwarsa", tone: "neutral" },
  not_actionable: { label: "Tidak Perlu Tindakan", tone: "neutral" },
  not_requested: { label: "Tidak Diajukan", tone: "neutral" },
  payment_review: { label: "Menunggu Verifikasi Pembayaran", tone: "warning" },
  pending_document_review: { label: "Menunggu Verifikasi Dokumen", tone: "warning" },
  pending_document_upload: { label: "Menunggu Unggah Dokumen", tone: "neutral" },
  pending_payment: { label: "Menunggu Pembayaran", tone: "warning" },
  pending_review: { label: "Menunggu Peninjauan", tone: "warning" },
  rejected: { label: "Ditolak", tone: "danger" },
  reservation: { label: "Reservasi", tone: "neutral" },
};

export function mapStaffOperationStatus(item: StaffReservationOperationResponse): StaffOperationStatusView {
  return statusViews[item.workflow_type] ?? statusViews[item.status] ?? statusViews[item.review_status] ?? {
    label: item.review_status.replaceAll("_", " "),
    tone: "neutral",
  };
}

export function mapStaffReservationStatus(status: string): StaffOperationStatusView {
  return statusViews[status] ?? { label: status.replaceAll("_", " "), tone: "neutral" };
}

export function formatStaffDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(new Date(value));
}

function formatStaffTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  })
    .format(new Date(value))
    .replace(".", ":");
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "ST";
}

function avatarTone(seed: string): StaffVerificationItem["avatarTone"] {
  const tones: StaffVerificationItem["avatarTone"][] = ["dark", "green", "light", "neutral"];
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tones[total % tones.length];
}

export function mapStaffVerificationItem(item: StaffReservationOperationResponse): StaffVerificationItem {
  const status = mapStaffOperationStatus(item);

  return {
    actionLabel: "Tinjau Pengajuan",
    applicant: item.student.full_name,
    avatar: initials(item.student.full_name),
    avatarTone: avatarTone(item.id),
    date: formatStaffDate(item.due_at ?? item.starts_at),
    facility: item.facility.name,
    id: item.id,
    role: item.organization_unit.name,
    status: status.label,
    tone: status.tone,
  };
}

function listActionLabel(item: StaffReservationOperationResponse) {
  return item.workflow_type === "document_review" || item.workflow_type === "payment_review"
    ? "Tinjau Pengajuan"
    : "Lihat Detail";
}

export function mapStaffReservationListItem(item: StaffReservationOperationResponse): StaffReservationListItem {
  const status = mapStaffReservationStatus(item.status);

  return {
    actionLabel: listActionLabel(item),
    activity: item.activity_title,
    applicant: item.student.full_name,
    avatar: initials(item.student.full_name),
    avatarTone: avatarTone(item.id),
    date: formatStaffDate(item.starts_at),
    detailHref: `/staff/reservations/${item.id}`,
    facility: item.facility.name,
    facilityId: item.facility.id,
    id: item.id,
    role: item.organization_unit.name,
    status: status.label,
    time: `${formatStaffTime(item.starts_at)} - ${formatStaffTime(item.ends_at)}`,
    tone: status.tone,
  };
}
