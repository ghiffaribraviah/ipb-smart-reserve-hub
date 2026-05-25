from dataclasses import dataclass
from datetime import UTC, datetime
from io import BytesIO
import os
from pathlib import Path
import subprocess
import tempfile
from zoneinfo import ZoneInfo

from app.models import Reservation

BUSINESS_TIMEZONE = ZoneInfo("Asia/Jakarta")
TEMPLATE_PATH = Path(__file__).with_name("templates") / "approval-letter.tex"
TECTONIC_TIMEOUT_SECONDS = 120


@dataclass(frozen=True)
class ApprovalLetterInput:
    reservation: Reservation
    generated_at: datetime
    letter_number: str


class ApprovalLetterPdfGenerationFailed(Exception):
    pass


class ApprovalLetterPdfGenerator:
    def __init__(self, *, template_path: Path = TEMPLATE_PATH, engine: str = "tectonic") -> None:
        self._template_path = template_path
        self._engine = engine

    def generate(self, letter_input: ApprovalLetterInput) -> bytes:
        rendered = self._render_template(letter_input)
        with tempfile.TemporaryDirectory(prefix="ipb-approval-letter-") as temp_dir:
            temp_path = Path(temp_dir)
            source_path = temp_path / "approval-letter.tex"
            source_path.write_text(rendered, encoding="utf-8")
            env = os.environ.copy()
            env.setdefault("XDG_CACHE_HOME", "/tmp/tectonic-cache")
            try:
                completed = subprocess.run(
                    [self._engine, "--outdir", str(temp_path), str(source_path)],
                    check=False,
                    capture_output=True,
                    env=env,
                    timeout=TECTONIC_TIMEOUT_SECONDS,
                )
            except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
                if isinstance(exc, FileNotFoundError):
                    return self._generate_fallback_pdf(letter_input)
                raise ApprovalLetterPdfGenerationFailed(str(exc)) from exc

            if completed.returncode != 0:
                error = completed.stderr.decode("utf-8", errors="replace")
                raise ApprovalLetterPdfGenerationFailed(error)

            pdf_path = temp_path / "approval-letter.pdf"
            if not pdf_path.exists():
                raise ApprovalLetterPdfGenerationFailed("LaTeX engine did not produce approval-letter.pdf")
            return pdf_path.read_bytes()

    def _generate_fallback_pdf(self, letter_input: ApprovalLetterInput) -> bytes:
        reservation = letter_input.reservation
        generated_at = _as_utc(letter_input.generated_at).astimezone(BUSINESS_TIMEZONE)
        starts_at = _as_utc(reservation.starts_at).astimezone(BUSINESS_TIMEZONE)
        ends_at = _as_utc(reservation.ends_at).astimezone(BUSINESS_TIMEZONE)
        lines = [
            "IPB SMART RESERVE HUB",
            "Surat Permohonan Reservasi Fasilitas",
            f"Nomor: {letter_input.letter_number}",
            "Lampiran: 1 berkas",
            "Perihal: Permohonan Reservasi Fasilitas Kampus",
            f"Tanggal: {_format_indonesian_date(generated_at)}",
            "",
            f"Kode reservasi: {reservation.reservation_code}",
            f"Nama kegiatan: {reservation.activity_title}",
            f"Organisasi pemohon: {reservation.organization_unit_name or reservation.organization_unit.name}",
            f"Penanggung jawab: {reservation.student.full_name}",
            f"NIM/NIP: {reservation.student.nim or '-'}",
            f"Kontak aktif: {reservation.student.email} / {reservation.contact_phone or reservation.student.phone or '-'}",
            f"Fasilitas: {reservation.facility.name}",
            f"Lokasi: {reservation.facility.location}",
            (
                "Tanggal dan waktu: "
                f"{_format_indonesian_date(starts_at)}, {starts_at:%H:%M}--{ends_at:%H:%M} WIB"
            ),
            f"Estimasi peserta: {reservation.participant_count} orang",
            f"Kebutuhan tambahan: {_extra_requirements_text(reservation)}",
            "",
            "Pemohon,",
            reservation.student.full_name,
            f"NIM/NIP {reservation.student.nim or '-'}",
        ]
        return _build_simple_pdf(lines)

    def _render_template(self, letter_input: ApprovalLetterInput) -> str:
        template = self._template_path.read_text(encoding="utf-8")
        reservation = letter_input.reservation
        generated_at = _as_utc(letter_input.generated_at).astimezone(BUSINESS_TIMEZONE)
        starts_at = _as_utc(reservation.starts_at).astimezone(BUSINESS_TIMEZONE)
        ends_at = _as_utc(reservation.ends_at).astimezone(BUSINESS_TIMEZONE)
        replacements = {
            "LETTER_NUMBER": letter_input.letter_number,
            "GENERATED_DATE": _format_indonesian_date(generated_at),
            "RESERVATION_CODE": reservation.reservation_code,
            "ACTIVITY_TITLE": reservation.activity_title,
            "ORGANIZATION_UNIT": reservation.organization_unit_name or reservation.organization_unit.name,
            "RESPONSIBLE_PERSON": reservation.student.full_name,
            "IDENTITY_NUMBER": reservation.student.nim or "-",
            "ACTIVE_CONTACT": f"{reservation.student.email} / {reservation.contact_phone or reservation.student.phone or '-'}",
            "FACILITY_NAME": reservation.facility.name,
            "FACILITY_LOCATION": reservation.facility.location,
            "RESERVATION_TIME": (
                f"{_format_indonesian_date(starts_at)}, "
                f"{starts_at:%H:%M}--{ends_at:%H:%M} WIB"
            ),
            "PARTICIPANT_COUNT": str(reservation.participant_count),
            "EXTRA_REQUIREMENTS": _extra_requirements_text(reservation),
        }
        for name, value in replacements.items():
            template = template.replace(f"<<{name}>>", _escape_latex(value))
        return template


def _extra_requirements_text(reservation: Reservation) -> str:
    labels: list[str] = []
    if reservation.extra_requirement_av_support:
        labels.append("Dukungan AV")
    if reservation.extra_requirement_logistics_coordination:
        labels.append("Koordinasi logistik")
    if reservation.extra_requirement_extra_cleaning:
        labels.append("Pembersihan tambahan")
    if reservation.extra_requirement_security_personnel:
        labels.append("Personel keamanan")
    if reservation.extra_requirement_notes:
        labels.append(reservation.extra_requirement_notes)
    if not labels:
        return "Tidak ada"
    return ", ".join(labels)


def _format_indonesian_date(value: datetime) -> str:
    months = (
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    )
    return f"{value.day} {months[value.month - 1]} {value.year}"


def _escape_latex(value: str) -> str:
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    return "".join(replacements.get(character, character) for character in value)


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _build_simple_pdf(lines: list[str]) -> bytes:
    stream = BytesIO()
    objects: list[bytes] = []
    content_lines = [
        "BT",
        "/F1 11 Tf",
        "14 TL",
        "1 0 0 1 72 780 Tm",
    ]
    for index, line in enumerate(lines):
        if index > 0:
            content_lines.append("T*")
        content_lines.append(f"{_pdf_hex_string(line)} Tj")
    content_lines.append("ET")
    content = "\n".join(content_lines).encode("ascii")

    def add_object(body: bytes) -> None:
        objects.append(body)

    add_object(b"<< /Type /Catalog /Pages 2 0 R >>")
    add_object(b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
    add_object(
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
        b"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>"
    )
    add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    add_object(b"<< /Length " + str(len(content)).encode("ascii") + b" >>\nstream\n" + content + b"\nendstream")

    stream.write(b"%PDF-1.4\n")
    offsets = [0]
    for index, body in enumerate(objects, start=1):
        offsets.append(stream.tell())
        stream.write(f"{index} 0 obj\n".encode("ascii"))
        stream.write(body)
        stream.write(b"\nendobj\n")

    xref_position = stream.tell()
    stream.write(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    stream.write(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        stream.write(f"{offset:010d} 00000 n \n".encode("ascii"))
    stream.write(
        b"trailer\n"
        + f"<< /Size {len(objects) + 1} /Root 1 0 R >>\n".encode("ascii")
        + b"startxref\n"
        + f"{xref_position}\n".encode("ascii")
        + b"%%EOF\n"
    )
    return stream.getvalue()


def _pdf_hex_string(value: str) -> str:
    encoded = value.encode("utf-16-be")
    return "<FEFF" + encoded.hex().upper() + ">"
