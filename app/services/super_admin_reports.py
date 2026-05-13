from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Reservation, ReservationStatus


@dataclass(frozen=True)
class SuperAdminReportKpis:
    total_reservations: int
    approved_reservations: int
    completed_reservations: int
    rejected_reservations: int
    paid_reservation_total_rupiah: int


@dataclass(frozen=True)
class SuperAdminReportTrendPoint:
    date: str
    reservation_count: int
    paid_total_rupiah: int


@dataclass(frozen=True)
class SuperAdminReportAggregate:
    kpis: SuperAdminReportKpis
    status_counts: dict[str, int]
    trend: list[SuperAdminReportTrendPoint]


class SuperAdminReportModule:
    def __init__(self, *, session: Session) -> None:
        self._session = session

    def get_aggregate(self, *, starts_at: datetime, ends_at: datetime) -> SuperAdminReportAggregate:
        reservations = list(
            self._session.scalars(
                select(Reservation)
                .where(
                    Reservation.starts_at >= _as_utc(starts_at),
                    Reservation.starts_at <= _as_utc(ends_at),
                )
                .order_by(Reservation.starts_at.asc(), Reservation.id.asc())
            )
        )
        status_counts: dict[str, int] = {}
        trend_by_date: dict[str, dict[str, int]] = {}
        for reservation in reservations:
            status = reservation.status.value
            status_counts[status] = status_counts.get(status, 0) + 1
            trend_date = _as_utc(reservation.starts_at).date().isoformat()
            trend = trend_by_date.setdefault(trend_date, {"reservation_count": 0, "paid_total_rupiah": 0})
            trend["reservation_count"] += 1
            trend["paid_total_rupiah"] += _paid_amount(reservation)

        paid_total = sum(_paid_amount(reservation) for reservation in reservations)
        return SuperAdminReportAggregate(
            kpis=SuperAdminReportKpis(
                total_reservations=len(reservations),
                approved_reservations=status_counts.get(ReservationStatus.approved.value, 0),
                completed_reservations=status_counts.get(ReservationStatus.completed.value, 0),
                rejected_reservations=status_counts.get(ReservationStatus.rejected.value, 0),
                paid_reservation_total_rupiah=paid_total,
            ),
            status_counts=status_counts,
            trend=[
                SuperAdminReportTrendPoint(
                    date=date,
                    reservation_count=values["reservation_count"],
                    paid_total_rupiah=values["paid_total_rupiah"],
                )
                for date, values in sorted(trend_by_date.items())
            ],
        )


def _paid_amount(reservation: Reservation) -> int:
    if reservation.status in {ReservationStatus.approved, ReservationStatus.completed}:
        return reservation.price_rupiah
    return 0


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
