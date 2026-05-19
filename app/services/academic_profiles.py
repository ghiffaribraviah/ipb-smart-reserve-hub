from dataclasses import dataclass


@dataclass(frozen=True)
class AcademicProfile:
    program_studi: str | None
    faculty: str | None
    entry_year: int | None
    degree: str | None


class AcademicProfileDeriver:
    _PROGRAMS = {
        "G64": ("Ilmu Komputer", "Fakultas Matematika dan Ilmu Pengetahuan Alam", "Sarjana"),
    }

    def derive(self, nim: str | None) -> AcademicProfile:
        if nim is None:
            return _unknown_academic_profile()

        normalized_nim = nim.strip().upper()
        program = self._PROGRAMS.get(normalized_nim[:3])
        if program is None:
            return _unknown_academic_profile()

        program_studi, faculty, degree = program
        return AcademicProfile(
            program_studi=program_studi,
            faculty=faculty,
            entry_year=_derive_entry_year(normalized_nim),
            degree=degree,
        )


def _derive_entry_year(nim: str) -> int | None:
    if len(nim) < 5 or not nim[3:5].isdigit():
        return None
    if len(nim) >= 7 and nim[3:5] == "01" and nim[6].isdigit():
        return 2020 + int(nim[6])
    return 2000 + int(nim[3:5])


def _unknown_academic_profile() -> AcademicProfile:
    return AcademicProfile(
        program_studi=None,
        faculty=None,
        entry_year=None,
        degree=None,
    )
