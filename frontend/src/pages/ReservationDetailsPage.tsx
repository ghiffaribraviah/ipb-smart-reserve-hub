import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { apiGet, type ApiError } from "../lib/api-client";
import { formatJakartaWindow, isValidIsoDateTime } from "../lib/jakarta-time";
import type { FacilityDetail, OrganizationUnit } from "../lib/types";

interface ReservationDetailsDraft {
  activityTitle: string;
  eventDescription: string;
  participantCount: string;
  organizationUnitId: string;
  contactPhone: string;
}

const emptyDraft: ReservationDetailsDraft = {
  activityTitle: "",
  eventDescription: "",
  participantCount: "",
  organizationUnitId: "",
  contactPhone: "",
};

function draftStorageKey(
  facilityId: string | undefined,
  startsAt: string,
  endsAt: string,
): string {
  return `reservation-details:${facilityId}:${startsAt}:${endsAt}`;
}

function readDraft(storageKey: string): ReservationDetailsDraft {
  const stored = sessionStorage.getItem(storageKey);
  if (!stored) return emptyDraft;

  try {
    return { ...emptyDraft, ...JSON.parse(stored) };
  } catch {
    return emptyDraft;
  }
}

export function ReservationDetailsPage() {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [searchParams] = useSearchParams();
  const startsAt = searchParams.get("startsAt");
  const endsAt = searchParams.get("endsAt");

  if (
    !(
      isValidIsoDateTime(startsAt) &&
      isValidIsoDateTime(endsAt) &&
      Date.parse(startsAt) < Date.parse(endsAt)
    )
  ) {
    return (
      <Navigate to={`/student/facilities/${facilityId}/reserve/time`} replace />
    );
  }

  const storageKey = draftStorageKey(facilityId, startsAt, endsAt);

  return (
    <ReservationDetailsForm
      key={storageKey}
      facilityId={facilityId}
      startsAt={startsAt}
      endsAt={endsAt}
      storageKey={storageKey}
    />
  );
}

function ReservationDetailsForm({
  facilityId,
  startsAt,
  endsAt,
  storageKey,
}: {
  facilityId: string | undefined;
  startsAt: string;
  endsAt: string;
  storageKey: string;
}) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ReservationDetailsDraft>(() =>
    readDraft(storageKey),
  );

  const {
    data: facility,
    isPending: facilityPending,
    error: facilityError,
  } = useQuery<FacilityDetail, ApiError>({
    queryKey: ["facility-detail", facilityId],
    queryFn: () => apiGet<FacilityDetail>(`/facilities/${facilityId}`),
    retry: false,
    enabled: Boolean(facilityId),
  });

  const {
    data: organizationUnits,
    isPending: organizationUnitsPending,
    error: organizationUnitsError,
  } = useQuery<OrganizationUnit[], ApiError>({
    queryKey: ["organization-units"],
    queryFn: () => apiGet<OrganizationUnit[]>("/organization-units"),
    retry: false,
  });

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, storageKey]);

  const selectedWindow = formatJakartaWindow(startsAt, endsAt);

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase text-secondary">
          Langkah 2 dari 3
        </p>
        <h2 className="text-2xl font-bold">Detail Reservasi</h2>
        {facilityPending ? (
          <p className="text-text-secondary">Memuat detail fasilitas...</p>
        ) : facility ? (
          <p className="text-text-secondary">
            {facility.name} - {selectedWindow}
          </p>
        ) : null}
      </header>

      {facilityError && (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800"
        >
          {facilityError.detail || "Gagal memuat detail fasilitas."}
        </p>
      )}

      <form
        className="grid gap-5 rounded-lg border border-border bg-white p-5 shadow-sm"
        onSubmit={(event) => {
          event.preventDefault();
          const nextParams = new URLSearchParams({ startsAt, endsAt });
          navigate(
            `/student/facilities/${facilityId}/reserve/confirm?${nextParams.toString()}`,
          );
        }}
      >
        <p
          role="note"
          className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
        >
          Judul kegiatan dan Unit Organisasi dapat tampil pada kalender publik.
        </p>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Judul kegiatan</span>
          <input
            value={draft.activityTitle}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                activityTitle: event.target.value,
              }))
            }
            required
            className="rounded border border-border px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Deskripsi kegiatan</span>
          <textarea
            value={draft.eventDescription}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                eventDescription: event.target.value,
              }))
            }
            required
            rows={4}
            className="rounded border border-border px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Jumlah peserta</span>
            <input
              type="number"
              min={1}
              value={draft.participantCount}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  participantCount: event.target.value,
                }))
              }
              required
              className="rounded border border-border px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Unit Organisasi</span>
            <select
              value={draft.organizationUnitId}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  organizationUnitId: event.target.value,
                }))
              }
              required
              className="rounded border border-border px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Pilih unit organisasi</option>
              {organizationUnits?.map((organizationUnit) => (
                <option key={organizationUnit.id} value={organizationUnit.id}>
                  {organizationUnit.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {organizationUnitsPending && (
          <p className="text-sm text-text-secondary">Memuat Unit Organisasi...</p>
        )}
        {organizationUnitsError && (
          <p
            role="alert"
            className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          >
            {organizationUnitsError.detail || "Gagal memuat Unit Organisasi."}
          </p>
        )}
        {organizationUnits && organizationUnits.length === 0 && (
          <p
            role="status"
            className="rounded border border-border bg-surface p-3 text-sm text-text-secondary"
          >
            Belum ada Unit Organisasi aktif yang tersedia.
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Nomor kontak</span>
          <input
            type="tel"
            value={draft.contactPhone}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                contactPhone: event.target.value,
              }))
            }
            required
            className="rounded border border-border px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() =>
              navigate(`/student/facilities/${facilityId}/reserve/time`)
            }
            className="rounded border border-border px-5 py-3 font-medium hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            Kembali
          </button>
          <button
            type="submit"
            className="rounded bg-primary px-6 py-3 font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Lanjut ke konfirmasi
          </button>
        </div>
      </form>
    </article>
  );
}
