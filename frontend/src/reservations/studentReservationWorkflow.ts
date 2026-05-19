export type ReservationTone =
  | "approved"
  | "cancelled"
  | "completed"
  | "pending"
  | "rejected"
  | "review";

export type StudentReservationWorkflowProjection = {
  activity_title: string;
  cancellation_reason: string | null;
  cancellation_rejection_reason: string | null;
  contact_phone: string;
  document: {
    approval_letter: ReservationDocumentMetadata | null;
    rejection_reason: string | null;
    review_status: string;
    signed_approval_letter: ReservationDocumentMetadata | null;
  };
  document_upload_due_at: string | null;
  document_verification_due_at: string | null;
  ends_at: string;
  event_description: string;
  extra_requirements: {
    av_support: boolean;
    extra_cleaning: boolean;
    logistics_coordination: boolean;
    notes: string | null;
    security_personnel: boolean;
  };
  facility: {
    id: string;
    name: string;
  };
  id: string;
  organization_unit: {
    id: string;
    name: string;
  };
  participant_count: number;
  payment: {
    receipt: ReservationDocumentMetadata | null;
    rejection_reason: string | null;
    required: boolean;
    review_status: string;
  };
  payment_upload_due_at: string | null;
  payment_verification_due_at: string | null;
  price_rupiah: number;
  rejection: {
    reason: string | null;
    source: string;
  } | null;
  reservation_code: string;
  review: {
    admin_removal_reason: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    id: string;
    is_deleted: boolean;
  } | null;
  starts_at: string;
  status: string;
};

type ReservationDocumentMetadata = {
  content_type: string;
  filename: string;
  generated_at?: string | null;
  size_bytes: number;
  uploaded_at?: string | null;
};

export type StudentReservationWorkflowListItem = {
  bucket: "history" | "ongoing";
  date: string;
  detailHref: string;
  facility: string;
  id: string;
  location: string;
  primaryAction: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryAction?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  status: string;
  statusLabel: string;
  time: string;
  tone: ReservationTone;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

function route(reservation: StudentReservationWorkflowProjection, suffix = "") {
  return `/student/reservations/${reservation.id}${suffix}`;
}

function baseListItem(
  reservation: StudentReservationWorkflowProjection,
  {
    bucket,
    primaryAction,
    primaryHref,
    secondaryAction,
    secondaryHref,
    statusLabel,
    tone,
  }: {
    bucket: "history" | "ongoing";
    primaryAction: string;
    primaryHref: string;
    secondaryAction?: string;
    secondaryHref?: string;
    statusLabel: string;
    tone: ReservationTone;
  },
): StudentReservationWorkflowListItem {
  return {
    bucket,
    date: dateFormatter.format(new Date(reservation.starts_at)),
    detailHref: primaryHref,
    facility: reservation.facility.name,
    id: reservation.id,
    location: reservation.organization_unit.name,
    primaryAction,
    primaryHref,
    primaryLabel: primaryAction,
    secondaryAction,
    secondaryHref,
    secondaryLabel: secondaryAction,
    status: statusLabel,
    statusLabel,
    time: `${formatTime(reservation.starts_at)} - ${formatTime(reservation.ends_at)}`,
    tone,
  };
}

function formatTime(value: string) {
  const date = new Date(value);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function cancellableBeforeApproval(reservation: StudentReservationWorkflowProjection) {
  return baseListItem(reservation, {
    bucket: "ongoing",
    primaryAction: "Lihat Detail",
    primaryHref: route(reservation),
    secondaryAction: "Batalkan",
    secondaryHref: route(reservation, "/cancel"),
    statusLabel: "Menunggu",
    tone: "pending",
  });
}

export function mapStudentReservationWorkflow(
  reservation: StudentReservationWorkflowProjection,
): StudentReservationWorkflowListItem {
  if (reservation.status === "rejected" && reservation.rejection?.source === "document") {
    return baseListItem(reservation, {
      bucket: "history",
      primaryAction: "Lihat Detail",
      primaryHref: route(reservation, "/verification/declined"),
      statusLabel: "Dokumen Ditolak",
      tone: "pending",
    });
  }

  if (reservation.status === "rejected" && reservation.rejection?.source === "payment") {
    return baseListItem(reservation, {
      bucket: "history",
      primaryAction: "Lihat Detail",
      primaryHref: route(reservation, "/payment/declined"),
      statusLabel: "Pembayaran Ditolak",
      tone: "rejected",
    });
  }

  if (reservation.status === "approved") {
    return baseListItem(reservation, {
      bucket: "ongoing",
      primaryAction: "Lihat Detail",
      primaryHref: route(reservation, "/accepted"),
      secondaryAction: "Ajukan Pembatalan",
      secondaryHref: route(reservation, "/cancellation"),
      statusLabel: "Disetujui",
      tone: "approved",
    });
  }

  if (reservation.status === "cancellation_requested") {
    return baseListItem(reservation, {
      bucket: "history",
      primaryAction: "Lihat Detail",
      primaryHref: route(reservation),
      statusLabel: "Pembatalan Tercatat",
      tone: "cancelled",
    });
  }

  if (reservation.status === "completed") {
    const hasVisibleReview = reservation.review !== null && !reservation.review.is_deleted;
    return baseListItem(reservation, {
      bucket: hasVisibleReview ? "history" : "ongoing",
      primaryAction: "Lihat Detail",
      primaryHref: route(reservation),
      statusLabel: "Selesai",
      tone: "completed",
    });
  }

  if (reservation.status === "cancelled") {
    return baseListItem(reservation, {
      bucket: "history",
      primaryAction: "Lihat Detail",
      primaryHref: route(reservation),
      statusLabel: "Dibatalkan",
      tone: "cancelled",
    });
  }

  if (reservation.status === "expired") {
    return baseListItem(reservation, {
      bucket: "history",
      primaryAction: "Lihat Detail",
      primaryHref: route(reservation),
      statusLabel: "Kedaluwarsa",
      tone: "rejected",
    });
  }

  if (reservation.status === "rejected") {
    return baseListItem(reservation, {
      bucket: "history",
      primaryAction: "Lihat Detail",
      primaryHref: route(reservation),
      statusLabel: "Ditolak",
      tone: "rejected",
    });
  }

  if (reservation.status === "pending_document_upload" || reservation.document.review_status === "upload_needed") {
    return baseListItem(reservation, {
      bucket: "ongoing",
      primaryAction: "Unggah Surat",
      primaryHref: route(reservation, "/letter"),
      secondaryAction: "Batalkan",
      secondaryHref: route(reservation, "/cancel"),
      statusLabel: "Menunggu Unggah Dokumen",
      tone: "pending",
    });
  }

  if (reservation.status === "pending_document_review" || reservation.document.review_status === "waiting_review") {
    return baseListItem(reservation, {
      bucket: "ongoing",
      primaryAction: "Lihat Detail",
      primaryHref: route(reservation, "/verification/waiting"),
      secondaryAction: "Batalkan",
      secondaryHref: route(reservation, "/cancel"),
      statusLabel: "Menunggu Verifikasi Dokumen",
      tone: "review",
    });
  }

  if (reservation.status === "pending_payment" && reservation.payment.review_status === "upload_needed") {
    return baseListItem(reservation, {
      bucket: "ongoing",
      primaryAction: "Unggah Pembayaran",
      primaryHref: route(reservation, "/payment"),
      secondaryAction: "Batalkan",
      secondaryHref: route(reservation, "/cancel"),
      statusLabel: "Menunggu Pembayaran",
      tone: "pending",
    });
  }

  if (reservation.status === "pending_payment" && reservation.payment.review_status === "waiting_review") {
    return baseListItem(reservation, {
      bucket: "ongoing",
      primaryAction: "Lihat Detail",
      primaryHref: route(reservation, "/payment/waiting"),
      secondaryAction: "Batalkan",
      secondaryHref: route(reservation, "/cancel"),
      statusLabel: "Menunggu Verifikasi Pembayaran",
      tone: "review",
    });
  }

  if (reservation.status === "overdue_verification") {
    return cancellableBeforeApproval(reservation);
  }

  return baseListItem(reservation, {
    bucket: "history",
    primaryAction: "Lihat Detail",
    primaryHref: route(reservation),
    statusLabel: "Ditolak",
    tone: "rejected",
  });
}
