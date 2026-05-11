import { describe, expect, it } from "vitest";
import {
  createMemoryReservationDraftStorage,
  getReservationDraftGuard,
  loadReservationDraft,
  saveReservationDraft,
} from "./reservationFlowState";

describe("reservation flow state", () => {
  it("saves and restores a facility draft without inventing lifecycle states", () => {
    const storage = createMemoryReservationDraftStorage();

    saveReservationDraft(storage, {
      activity: { attendeeCount: 80, eventName: "Seminar Teknologi Pangan" },
      endAt: "2026-05-20T11:00:00+07:00",
      facilityId: "auditorium-ccr",
      startAt: "2026-05-20T09:00:00+07:00",
    });

    expect(loadReservationDraft(storage)).toEqual({
      activity: { attendeeCount: 80, eventName: "Seminar Teknologi Pangan" },
      endAt: "2026-05-20T11:00:00+07:00",
      facilityId: "auditorium-ccr",
      startAt: "2026-05-20T09:00:00+07:00",
    });
  });

  it("redirects draft-dependent detail pages to the earliest recoverable step", () => {
    const emptyStorage = createMemoryReservationDraftStorage();
    const partialStorage = createMemoryReservationDraftStorage();
    saveReservationDraft(partialStorage, { facilityId: "auditorium-ccr" });

    expect(getReservationDraftGuard(emptyStorage, "auditorium-ccr", "details")).toEqual({
      allowed: false,
      redirectTo: "/student/facilities/auditorium-ccr/reserve/time",
    });
    expect(getReservationDraftGuard(partialStorage, "auditorium-ccr", "details")).toEqual({
      allowed: false,
      redirectTo: "/student/facilities/auditorium-ccr/reserve/time",
    });
  });

  it("switches to reservation-id routes after creation", () => {
    const storage = createMemoryReservationDraftStorage();

    saveReservationDraft(storage, {
      endAt: "2026-05-20T11:00:00+07:00",
      facilityId: "auditorium-ccr",
      reservationId: "res-123",
      startAt: "2026-05-20T09:00:00+07:00",
    });

    expect(getReservationDraftGuard(storage, "auditorium-ccr", "details")).toEqual({
      allowed: false,
      redirectTo: "/student/reservations/res-123/letter",
    });
  });
});
