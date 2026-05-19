from datetime import datetime
from typing import Protocol

from sqlalchemy import exists, select
from sqlalchemy.orm import Session, joinedload

from app.models import FacilityStaffAssignment, Reservation, ReservationPaymentReceipt, ReservationStatus


class StaffReservationOperationsRepository(Protocol):
    def has_facility_assignment(self, staff_id: str, facility_id: str) -> bool:
        raise NotImplementedError

    def list_actionable_queue(self, staff_id: str) -> list[Reservation]:
        raise NotImplementedError

    def list_assigned_reservations(
        self,
        staff_id: str,
        *,
        status: ReservationStatus | None = None,
        facility_id: str | None = None,
        starts_at_from: datetime | None = None,
        starts_at_to: datetime | None = None,
    ) -> list[Reservation]:
        raise NotImplementedError

    def get_assigned_reservation(self, staff_id: str, reservation_id: str) -> Reservation | None:
        raise NotImplementedError

    def list_assigned_facility_schedule(
        self,
        staff_id: str,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> list[Reservation]:
        raise NotImplementedError


class SqlAlchemyStaffReservationOperationsRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def has_facility_assignment(self, staff_id: str, facility_id: str) -> bool:
        return bool(
            self._session.scalar(
                select(
                    exists().where(
                        FacilityStaffAssignment.staff_id == staff_id,
                        FacilityStaffAssignment.facility_id == facility_id,
                    )
                )
            )
        )

    def list_actionable_queue(self, staff_id: str) -> list[Reservation]:
        return list(
            self._session.scalars(
                select(Reservation)
                .join(FacilityStaffAssignment, FacilityStaffAssignment.facility_id == Reservation.facility_id)
                .outerjoin(ReservationPaymentReceipt)
                .options(
                    joinedload(Reservation.facility),
                    joinedload(Reservation.student),
                    joinedload(Reservation.organization_unit),
                    joinedload(Reservation.payment_receipt),
                )
                .where(
                    FacilityStaffAssignment.staff_id == staff_id,
                    (
                        Reservation.status.in_(
                            [
                                ReservationStatus.pending_document_review,
                                ReservationStatus.overdue_verification,
                            ]
                        )
                    )
                    | (
                        (Reservation.status == ReservationStatus.pending_payment)
                        & (ReservationPaymentReceipt.id.is_not(None))
                    ),
                )
                .order_by(Reservation.created_at.desc(), Reservation.id.desc())
            )
        )

    def list_assigned_reservations(
        self,
        staff_id: str,
        *,
        status: ReservationStatus | None = None,
        facility_id: str | None = None,
        starts_at_from: datetime | None = None,
        starts_at_to: datetime | None = None,
    ) -> list[Reservation]:
        filters = [FacilityStaffAssignment.staff_id == staff_id]
        if status is not None:
            filters.append(Reservation.status == status)
        if facility_id is not None:
            filters.append(Reservation.facility_id == facility_id)
        if starts_at_from is not None:
            filters.append(Reservation.starts_at >= starts_at_from)
        if starts_at_to is not None:
            filters.append(Reservation.starts_at <= starts_at_to)

        return list(
            self._session.scalars(
                select(Reservation)
                .join(FacilityStaffAssignment, FacilityStaffAssignment.facility_id == Reservation.facility_id)
                .options(
                    joinedload(Reservation.facility),
                    joinedload(Reservation.student),
                    joinedload(Reservation.organization_unit),
                    joinedload(Reservation.payment_receipt),
                )
                .where(*filters)
                .order_by(Reservation.starts_at.desc(), Reservation.id.desc())
            )
        )

    def get_assigned_reservation(self, staff_id: str, reservation_id: str) -> Reservation | None:
        return self._session.scalar(
            select(Reservation)
            .join(FacilityStaffAssignment, FacilityStaffAssignment.facility_id == Reservation.facility_id)
            .options(
                joinedload(Reservation.facility),
                joinedload(Reservation.student),
                joinedload(Reservation.organization_unit),
                joinedload(Reservation.approval_letter),
                joinedload(Reservation.signed_approval_letter),
                joinedload(Reservation.payment_receipt),
            )
            .where(
                Reservation.id == reservation_id,
                FacilityStaffAssignment.staff_id == staff_id,
            )
        )

    def list_assigned_facility_schedule(
        self,
        staff_id: str,
        facility_id: str,
        *,
        starts_at: datetime,
        ends_at: datetime,
    ) -> list[Reservation]:
        return list(
            self._session.scalars(
                select(Reservation)
                .join(FacilityStaffAssignment, FacilityStaffAssignment.facility_id == Reservation.facility_id)
                .options(
                    joinedload(Reservation.organization_unit),
                    joinedload(Reservation.payment_receipt),
                )
                .where(
                    FacilityStaffAssignment.staff_id == staff_id,
                    Reservation.facility_id == facility_id,
                    Reservation.starts_at < ends_at,
                    Reservation.ends_at > starts_at,
                )
                .order_by(Reservation.starts_at.asc(), Reservation.id.asc())
            )
        )
