from dataclasses import dataclass
from datetime import UTC, datetime
from zoneinfo import ZoneInfo

from app.models import Reservation

BUSINESS_TIMEZONE = ZoneInfo("Asia/Jakarta")


@dataclass(frozen=True)
class ApprovalLetterInput:
    reservation: Reservation
    generated_at: datetime


class ApprovalLetterPdfGenerator:
    def generate(self, letter_input: ApprovalLetterInput) -> bytes:
        reservation = letter_input.reservation
        generated_at = _as_utc(letter_input.generated_at).astimezone(BUSINESS_TIMEZONE)
        starts_at = _as_utc(reservation.starts_at).astimezone(BUSINESS_TIMEZONE)
        ends_at = _as_utc(reservation.ends_at).astimezone(BUSINESS_TIMEZONE)
        lines = [
            "SURAT PERSETUJUAN RESERVASI FASILITAS",
            f"Kode reservasi: {reservation.reservation_code}",
            f"Tanggal generate: {generated_at:%Y-%m-%d}",
            f"Nama mahasiswa: {reservation.student.full_name}",
            f"NIM: {reservation.student.nim or '-'}",
            f"Email: {reservation.student.email}",
            f"Telepon/WhatsApp: {reservation.contact_phone or reservation.student.phone or '-'}",
            f"Organisasi: {reservation.organization_unit_name or reservation.organization_unit.name}",
            f"Fasilitas: {reservation.facility.name}",
            f"Lokasi: {reservation.facility.location}",
            f"Tanggal reservasi: {starts_at:%Y-%m-%d}",
            f"Waktu reservasi: {starts_at:%H:%M}-{ends_at:%H:%M} WIB",
            f"Kegiatan: {reservation.activity_title}",
            f"Deskripsi: {reservation.event_description}",
            f"Jumlah peserta: {reservation.participant_count}",
            "Pernyataan: peminjam bertanggung jawab atas penggunaan fasilitas.",
            "Tanda tangan mahasiswa/perwakilan organisasi:",
            "Persetujuan pihak fasilitas/TU:",
            f"Kontak TU: {reservation.facility.contact_name} - {reservation.facility.contact_phone}",
            f"Verifikasi internal: /staff/reservations/{reservation.id}",
        ]
        return _minimal_pdf(lines)


def _minimal_pdf(lines: list[str]) -> bytes:
    text_commands = ["BT", "/F1 11 Tf", "50 780 Td", "14 TL"]
    for line in lines:
        text_commands.append(f"({_escape_pdf_text(line)}) Tj")
        text_commands.append("T*")
    text_commands.append("ET")
    content = "\n".join(text_commands).encode("latin-1", errors="replace")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(content)).encode("ascii") + b" >>\nstream\n" + content + b"\nendstream",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode("ascii"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")
    xref_offset = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode("ascii"))
    pdf.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode(
            "ascii"
        )
    )
    return bytes(pdf)


def _escape_pdf_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
