export type ReservationActivityDraft = {
  attendeeCount?: number;
  eventName?: string;
  organizationUnitId?: string;
  purpose?: string;
};

export type ReservationDraft = {
  activity?: ReservationActivityDraft;
  endAt?: string;
  facilityId: string;
  reservationId?: string;
  startAt?: string;
};

export type ReservationDraftStep = "time" | "details";

export type ReservationDraftStorage = {
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
};

export type ReservationDraftGuardResult =
  | { allowed: true; redirectTo?: undefined }
  | { allowed: false; redirectTo: string };

const reservationDraftKey = "ipb-srh-reservation-draft";

export function createMemoryReservationDraftStorage(initialValue?: ReservationDraft): ReservationDraftStorage {
  const values = new Map<string, string>();
  if (initialValue) {
    values.set(reservationDraftKey, JSON.stringify(initialValue));
  }

  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

export function saveReservationDraft(storage: ReservationDraftStorage, draft: ReservationDraft) {
  storage.setItem(reservationDraftKey, JSON.stringify(draft));
}

export function loadReservationDraft(storage: ReservationDraftStorage): ReservationDraft | null {
  const raw = storage.getItem(reservationDraftKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ReservationDraft>;
    if (!parsed.facilityId || typeof parsed.facilityId !== "string") {
      return null;
    }
    return parsed as ReservationDraft;
  } catch {
    return null;
  }
}

export function clearReservationDraft(storage: ReservationDraftStorage) {
  storage.removeItem(reservationDraftKey);
}

export function getReservationDraftGuard(
  storage: ReservationDraftStorage,
  facilityId: string,
  step: ReservationDraftStep,
): ReservationDraftGuardResult {
  const draft = loadReservationDraft(storage);
  const timeRoute = `/student/facilities/${facilityId}/reserve/time`;

  if (!draft || draft.facilityId !== facilityId) {
    return { allowed: step === "time", redirectTo: step === "time" ? undefined : timeRoute } as ReservationDraftGuardResult;
  }

  if (draft.reservationId) {
    return { allowed: false, redirectTo: `/student/reservations/${draft.reservationId}/letter` };
  }

  if (step === "time") {
    return { allowed: true };
  }

  if (!draft.startAt || !draft.endAt) {
    return { allowed: false, redirectTo: timeRoute };
  }

  return { allowed: true };
}
