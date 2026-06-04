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
                return self._generate_fallback_pdf(letter_input)

            pdf_path = temp_path / "approval-letter.pdf"
            if not pdf_path.exists():
                raise ApprovalLetterPdfGenerationFailed("LaTeX engine did not produce approval-letter.pdf")
            return pdf_path.read_bytes()

    def _generate_fallback_pdf(self, letter_input: ApprovalLetterInput) -> bytes:
        reservation = letter_input.reservation
        generated_at = _as_utc(letter_input.generated_at).astimezone(BUSINESS_TIMEZONE)
        starts_at = _as_utc(reservation.starts_at).astimezone(BUSINESS_TIMEZONE)
        ends_at = _as_utc(reservation.ends_at).astimezone(BUSINESS_TIMEZONE)
        return _build_fallback_approval_letter_pdf(
            letter_number=letter_input.letter_number,
            generated_date=_format_indonesian_date(generated_at),
            reservation_code=reservation.reservation_code,
            activity_title=reservation.activity_title,
            organization_unit=_organization_unit_name(reservation),
            responsible_person=reservation.student.full_name,
            identity_number=reservation.student.nim or "-",
            active_contact=f"{reservation.student.email} / {reservation.contact_phone or reservation.student.phone or '-'}",
            facility_name=reservation.facility.name,
            facility_location=reservation.facility.location,
            reservation_time=(
                f"{_format_indonesian_date(starts_at)}, {starts_at:%H:%M}--{ends_at:%H:%M} WIB"
            ),
            participant_count=f"{reservation.participant_count} orang",
            extra_requirements=_extra_requirements_text(reservation),
        )

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
            "ORGANIZATION_UNIT": _organization_unit_name(reservation),
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


def _organization_unit_name(reservation: Reservation) -> str:
    if reservation.organization_unit_name:
        return reservation.organization_unit_name
    if reservation.organization_unit is not None:
        return reservation.organization_unit.name
    return ""


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


def _build_fallback_approval_letter_pdf(
    *,
    letter_number: str,
    generated_date: str,
    reservation_code: str,
    activity_title: str,
    organization_unit: str,
    responsible_person: str,
    identity_number: str,
    active_contact: str,
    facility_name: str,
    facility_location: str,
    reservation_time: str,
    participant_count: str,
    extra_requirements: str,
) -> bytes:
    content_lines: list[str] = [
        "q",
        "0.113 0.463 0.404 rg",
        "40 778 95 24 re f",
        "0.059 0.616 0.345 rg",
        "40 748 515 2 re f",
        "Q",
        _pdf_text(48, 783, "IPB SRH", size=17, font="F2", color=(1, 1, 1)),
        _pdf_text(155, 786, "IPB SMART RESERVE HUB", size=13, font="F2"),
        _pdf_text(155, 770, "Direktorat Pengelolaan Fasilitas Kampus", size=9),
        _pdf_text(155, 757, "Jl. Raya Dramaga, Kampus IPB Dramaga, Bogor 16680", size=9),
        _pdf_text(40, 720, "Nomor", size=9, color=(0.42, 0.45, 0.5)),
        _pdf_text(128, 720, letter_number, size=9, font="F2"),
        _pdf_text(40, 705, "Lampiran", size=9, color=(0.42, 0.45, 0.5)),
        _pdf_text(128, 705, "1 berkas", size=9, font="F2"),
        _pdf_text(40, 690, "Perihal", size=9, color=(0.42, 0.45, 0.5)),
        _pdf_text(128, 690, "Permohonan Reservasi Fasilitas Kampus", size=9, font="F2"),
        _pdf_text(40, 675, "Tanggal", size=9, color=(0.42, 0.45, 0.5)),
        _pdf_text(128, 675, generated_date, size=9, font="F2"),
        _pdf_text(163, 640, "Surat Permohonan Reservasi Fasilitas", size=15, font="F2"),
        "0.067 0.094 0.153 RG 0.5 w 163 636 m 432 636 l S",
    ]

    intro = (
        "Dengan hormat, melalui surat ini pemohon mengajukan permohonan penggunaan fasilitas kampus "
        "untuk mendukung pelaksanaan kegiatan akademik/kemahasiswaan berikut."
    )
    content_lines.extend(_pdf_paragraph(intro, x=40, y=612, width=515, size=9.5, leading=13))

    detail_rows = [
        ("Kode reservasi", reservation_code),
        ("Nama kegiatan", activity_title),
        ("Organisasi pemohon", organization_unit),
        ("Penanggung jawab", responsible_person),
        ("NIM/NIP", identity_number),
        ("Kontak aktif", active_contact),
        ("Fasilitas", facility_name),
        ("Lokasi", facility_location),
        ("Tanggal dan waktu", reservation_time),
        ("Estimasi peserta", participant_count),
        ("Kebutuhan tambahan", extra_requirements),
    ]
    content_lines.extend(
        [
            "0.819 0.835 0.859 RG 0.8 w 40 398 515 190 re S",
            "0.973 0.992 0.980 rg 40 548 515 40 re f",
            _pdf_text(58, 564, "Detail Reservasi", size=12, font="F2", color=(0.06, 0.62, 0.35)),
        ]
    )
    y = 532
    for label, value in detail_rows:
        wrapped = _wrap_text(value, 56)
        content_lines.append(_pdf_text(58, y, label, size=8.5, color=(0.42, 0.45, 0.5)))
        content_lines.append(_pdf_text(178, y, wrapped[0], size=8.5, font="F2"))
        for line in wrapped[1:]:
            y -= 11
            content_lines.append(_pdf_text(178, y, line, size=8.5, font="F2"))
        y -= 13

    statement = (
        "Pemohon menyatakan bahwa data yang tercantum pada surat ini benar dan dapat dipertanggungjawabkan. "
        "Pemohon juga memahami bahwa persetujuan reservasi bergantung pada ketersediaan fasilitas, "
        "kelengkapan dokumen, dan hasil verifikasi pengelola."
    )
    content_lines.extend(_pdf_paragraph(statement, x=40, y=374, width=515, size=9, leading=12.5))

    content_lines.append(_pdf_text(40, 324, "Ketentuan Penggunaan Fasilitas", size=12, font="F2"))
    terms = [
        "Fasilitas hanya digunakan untuk kegiatan yang sesuai dengan tujuan permohonan dan jadwal yang telah disetujui.",
        "Pemohon wajib menjaga kebersihan, keamanan, ketertiban, serta tidak mengubah tata ruang tanpa persetujuan pengelola.",
        "Pemohon bertanggung jawab atas kerusakan, kehilangan, atau gangguan operasional yang timbul selama masa penggunaan fasilitas.",
        "Perubahan tanggal, waktu, jumlah peserta, atau kebutuhan teknis harus diajukan ulang melalui IPB Smart Reserve Hub.",
        "Pengelola berhak membatalkan reservasi apabila dokumen tidak lengkap, data tidak valid, atau kegiatan melanggar ketentuan kampus.",
    ]
    y = 304
    for index, term in enumerate(terms, start=1):
        lines = _wrap_text(term, 92)
        content_lines.append(_pdf_text(48, y, f"{index}.", size=8.5, font="F2"))
        content_lines.append(_pdf_text(66, y, lines[0], size=8.5))
        for line in lines[1:]:
            y -= 11
            content_lines.append(_pdf_text(66, y, line, size=8.5))
        y -= 14

    content_lines.extend(
        [
            "0.059 0.616 0.345 RG 0.8 w 40 102 515 52 re S",
            "0.925 0.980 0.941 rg 40 102 515 52 re f",
        ]
    )
    declaration = (
        "Saya menyatakan bersedia mematuhi seluruh ketentuan penggunaan fasilitas IPB Smart Reserve Hub "
        "dan menerima konsekuensi administratif apabila terjadi pelanggaran."
    )
    content_lines.extend(_pdf_paragraph(declaration, x=54, y=136, width=490, size=8.5, leading=11))

    content_lines.extend(
        [
            _pdf_text(392, 82, "Pemohon,", size=9),
            "392 46 m 520 46 l S",
            _pdf_text(392, 30, responsible_person, size=9, font="F2"),
            _pdf_text(392, 16, f"NIM/NIP {identity_number}", size=8),
        ]
    )
    return _build_pdf(content_lines)


def _build_pdf(content_lines: list[str]) -> bytes:
    stream = BytesIO()
    objects: list[bytes] = []
    content = "\n".join(content_lines).encode("ascii")

    def add_object(body: bytes) -> None:
        objects.append(body)

    add_object(b"<< /Type /Catalog /Pages 2 0 R >>")
    add_object(b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
    add_object(
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
        b"/Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>"
    )
    add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>")
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


def _pdf_text(
    x: float,
    y: float,
    value: str,
    *,
    size: float = 10,
    font: str = "F1",
    color: tuple[float, float, float] = (0.067, 0.094, 0.153),
) -> str:
    r, g, b = color
    return f"BT {r:.3f} {g:.3f} {b:.3f} rg /{font} {size:g} Tf 1 0 0 1 {x:g} {y:g} Tm {_pdf_hex_string(value)} Tj ET"


def _pdf_paragraph(value: str, *, x: float, y: float, width: float, size: float, leading: float) -> list[str]:
    max_characters = max(20, int(width / (size * 0.48)))
    return [
        _pdf_text(x, y - (index * leading), line, size=size)
        for index, line in enumerate(_wrap_text(value, max_characters))
    ]


def _wrap_text(value: str, max_characters: int) -> list[str]:
    words = value.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if len(candidate) <= max_characters:
            current = candidate
            continue
        if current:
            lines.append(current)
        current = word
    if current:
        lines.append(current)
    return lines or [""]


def _pdf_hex_string(value: str) -> str:
    encoded = value.encode("utf-16-be")
    return "<FEFF" + encoded.hex().upper() + ">"
