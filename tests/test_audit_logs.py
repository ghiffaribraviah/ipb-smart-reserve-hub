from dataclasses import dataclass

from app.services.accounts import UserAccount
from app.services.audit_logs import AuditLogRecorder


@dataclass(frozen=True)
class RecordedAudit:
    actor: UserAccount | None
    action_type: str
    target_type: str
    target_id: str
    facility_id: str | None
    student_id: str | None
    reservation_id: str | None


class StubAuditLogModule:
    def __init__(self) -> None:
        self.records: list[RecordedAudit] = []

    def record(
        self,
        *,
        actor,
        action_type,
        target_type,
        target_id,
        facility_id=None,
        student_id=None,
        reservation_id=None,
    ):
        self.records.append(
            RecordedAudit(
                actor=actor,
                action_type=action_type,
                target_type=target_type,
                target_id=target_id,
                facility_id=facility_id,
                student_id=student_id,
                reservation_id=reservation_id,
            )
        )


def test_audit_log_recorder_records_when_audit_log_module_is_available():
    audit_logs = StubAuditLogModule()
    recorder = AuditLogRecorder(audit_logs)

    recorder.record(
        actor=None,
        action_type="reservation.submitted",
        target_type="reservation",
        target_id="reservation-1",
        facility_id="facility-1",
        student_id="student-1",
        reservation_id="reservation-1",
    )

    assert audit_logs.records == [
        RecordedAudit(
            actor=None,
            action_type="reservation.submitted",
            target_type="reservation",
            target_id="reservation-1",
            facility_id="facility-1",
            student_id="student-1",
            reservation_id="reservation-1",
        )
    ]


def test_audit_log_recorder_noops_when_audit_log_module_is_absent():
    recorder = AuditLogRecorder(None)

    recorder.record(
        actor=None,
        action_type="reservation.submitted",
        target_type="reservation",
        target_id="reservation-1",
    )
