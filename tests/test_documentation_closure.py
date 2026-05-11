from pathlib import Path


def test_backend_gap_index_points_to_stable_contract_documentation():
    backend_gaps = Path("docs/frontend/backend-gaps.md").read_text()

    assert "later backend grilling and implementation sessions" not in backend_gaps
    assert "## Stable Contract Documentation" in backend_gaps
    assert "`README.md`" in backend_gaps
    assert "`CONTEXT.md`" in backend_gaps


def test_readme_documents_student_reservation_file_metadata_shape():
    readme = Path("README.md").read_text()

    assert "`filename`" in readme
    assert "`content_type`" in readme
    assert "`size_bytes`" in readme
    assert "`generated_at`" in readme
    assert "`uploaded_at`" in readme
