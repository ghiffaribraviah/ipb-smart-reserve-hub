from app.services.academic_profiles import AcademicProfile, AcademicProfileDeriver


def test_academic_profile_deriver_maps_known_nim_prefix_and_entry_year():
    academic_profile = AcademicProfileDeriver().derive("G64190001")

    assert academic_profile == AcademicProfile(
        program_studi="Ilmu Komputer",
        faculty="Fakultas Matematika dan Ilmu Pengetahuan Alam",
        entry_year=2019,
        degree="Sarjana",
    )


def test_academic_profile_deriver_uses_digit_based_entry_year_for_newer_nim_format():
    academic_profile = AcademicProfileDeriver().derive("G6401230001")

    assert academic_profile.entry_year == 2023


def test_academic_profile_deriver_returns_null_fields_for_unknown_nim():
    academic_profile = AcademicProfileDeriver().derive("ZZZ190001")

    assert academic_profile == AcademicProfile(
        program_studi=None,
        faculty=None,
        entry_year=None,
        degree=None,
    )
