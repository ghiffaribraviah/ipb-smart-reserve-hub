from datetime import UTC, datetime
import subprocess
import tempfile
from unittest.mock import patch

from app.models import Facility, OrganizationUnit, Reservation, ReservationStatus, User, UserRole
from app.pdf import ApprovalLetterInput, ApprovalLetterPdfGenerator


def _reservation() -> Reservation:
    reservation = Reservation(
        id="reservation-1",
        facility_id="facility-1",
        student_id="student-1",
        organization_unit_id="unit-1",
        reservation_code="RSV-2026-0001",
        activity_title="Seminar Karier",
        event_description="Seminar persiapan karier untuk mahasiswa tingkat akhir.",
        participant_count=80,
        contact_phone="08123456789",
        price_rupiah=0,
        organization_unit_name="BEM KM IPB",
        starts_at=datetime(2026, 6, 1, 2, tzinfo=UTC),
        ends_at=datetime(2026, 6, 1, 4, tzinfo=UTC),
        status=ReservationStatus.pending_document_upload,
    )
    reservation.student = User(
        id="student-1",
        email="budi@apps.ipb.ac.id",
        full_name="Budi Santoso",
        role=UserRole.student,
        is_active=True,
        nim="G64190001",
        phone="08123456789",
        password_hash="unused",
    )
    reservation.facility = Facility(
        id="facility-1",
        name="Auditorium Andi Hakim Nasoetion",
        location="Kampus IPB Dramaga",
    )
    reservation.organization_unit = OrganizationUnit(id="unit-1", name="BEM KM IPB")
    return reservation


def _letter_input(reservation: Reservation) -> ApprovalLetterInput:
    return ApprovalLetterInput(
        reservation=reservation,
        generated_at=datetime(2026, 5, 1, 3, tzinfo=UTC),
        letter_number="RSV/IPBSRH/2026/000001",
    )


def _pdf_text(content: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".pdf") as pdf:
        pdf.write(content)
        pdf.flush()
        extracted = subprocess.run(
            ["pdftotext", pdf.name, "-"],
            check=True,
            capture_output=True,
            text=True,
        )
    return extracted.stdout


def test_approval_letter_pdf_generator_falls_back_when_tectonic_is_missing():
    generator = ApprovalLetterPdfGenerator()
    reservation = _reservation()

    with patch("app.pdf.subprocess.run", side_effect=FileNotFoundError(2, "No such file or directory", "tectonic")):
        pdf = generator.generate(_letter_input(reservation))

    assert pdf.startswith(b"%PDF-")
    assert len(pdf) > 7_000
    text = _pdf_text(pdf)
    assert "Surat Permohonan Reservasi Fasilitas" in text
    assert "RSV/IPBSRH/2026/000001" in text
    assert "1 Mei 2026" in text
    assert "1 Juni 2026" in text
    assert "09:00" in text
    assert "11:00 WIB" in text
    assert "Budi Santoso" in text
    assert "Auditorium Andi Hakim Nasoetion" in text
    assert "BEM KM IPB" in text
    assert "G64190001" in text
    assert "budi@apps.ipb.ac.id / 08123456789" in text
    assert "Kepada Yth." in text
    assert "Ketentuan Penggunaan Fasilitas" in text
    assert "Lampiran Wajib" in text
    assert "Pernyataan Pemohon" in text
    assert "Proposal atau rundown kegiatan" in text


def test_approval_letter_pdf_generator_falls_back_when_tectonic_exits_with_error():
    generator = ApprovalLetterPdfGenerator()
    reservation = _reservation()

    with patch(
        "app.pdf.subprocess.run",
        return_value=subprocess.CompletedProcess(
            args=["tectonic"],
            returncode=1,
            stdout=b"",
            stderr=b"error: failed to fetch bundle",
        ),
    ):
        pdf = generator.generate(_letter_input(reservation))

    assert pdf.startswith(b"%PDF-")
    assert len(pdf) > 7_000
    assert "Surat Permohonan Reservasi Fasilitas" in _pdf_text(pdf)
