import subprocess
import sys
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / ".agents" / "scripts" / "local_tracker.py"


def run_tracker(repo_root: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        cwd=repo_root,
        text=True,
        capture_output=True,
        check=False,
    )


def test_next_issue_id_ignores_unrelated_files(tmp_path: Path) -> None:
    issues_dir = tmp_path / "docs" / "issues"
    issues_dir.mkdir(parents=True)
    (issues_dir / "ISSUE-0001-first.md").write_text("", encoding="utf-8")
    (issues_dir / "ISSUE-0007-later.md").write_text("", encoding="utf-8")
    (issues_dir / "notes.md").write_text("", encoding="utf-8")

    result = run_tracker(tmp_path, "next-id", "issue")

    assert result.returncode == 0
    assert result.stdout.strip() == "ISSUE-0008"


def write_issue(
    repo_root: Path,
    filename: str,
    *,
    issue_id: str,
    status: str = "needs-triage",
    category: str = "enhancement",
    blocked_by: list[str] | None = None,
) -> None:
    blocked_by = blocked_by or []
    if blocked_by:
        blocked_section = "blocked_by:\n" + "\n".join(f"  - {item}" for item in blocked_by)
    else:
        blocked_section = "blocked_by: []"
    path = repo_root / "docs" / "issues" / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        f"""---
id: {issue_id}
type: issue
title: Example issue
status: {status}
category: {category}
agent_mode: AFK
area:
  - docs
prd: PRD-0001
{blocked_section}
created: 2026-05-12
updated: 2026-05-12
---

## What to build

Build the example.
""",
        encoding="utf-8",
    )


def test_validate_rejects_duplicate_ids_and_broken_dependencies(tmp_path: Path) -> None:
    write_issue(tmp_path, "ISSUE-0001-first.md", issue_id="ISSUE-0001")
    write_issue(
        tmp_path,
        "ISSUE-0002-second.md",
        issue_id="ISSUE-0001",
        blocked_by=["ISSUE-9999"],
    )

    result = run_tracker(tmp_path, "validate")

    assert result.returncode == 1
    assert "Duplicate id ISSUE-0001" in result.stderr
    assert "Unknown blocked_by reference ISSUE-9999" in result.stderr


def test_status_regenerates_summary_grouped_by_issue_status(tmp_path: Path) -> None:
    write_issue(tmp_path, "ISSUE-0001-ready.md", issue_id="ISSUE-0001", status="ready-for-agent")
    write_issue(tmp_path, "ISSUE-0002-done.md", issue_id="ISSUE-0002", status="done")

    result = run_tracker(tmp_path, "status")

    assert result.returncode == 0
    status = (tmp_path / "docs" / "issues" / "STATUS.md").read_text(encoding="utf-8")
    assert "## ready-for-agent" in status
    assert "- ISSUE-0001 - Example issue" in status
    assert "## done" in status
    assert "- ISSUE-0002 - Example issue" in status


def test_validate_detects_prd_issue_list_mismatch(tmp_path: Path) -> None:
    prd_dir = tmp_path / "docs" / "prd"
    prd_dir.mkdir(parents=True)
    prd_dir.joinpath("PRD-0001-example.md").write_text(
        """---
id: PRD-0001
type: prd
title: Example PRD
status: active
created: 2026-05-12
updated: 2026-05-12
issues: []
---

## Problem Statement
""",
        encoding="utf-8",
    )
    write_issue(tmp_path, "ISSUE-0001-ready.md", issue_id="ISSUE-0001")

    result = run_tracker(tmp_path, "validate")

    assert result.returncode == 1
    assert "PRD-0001 issues list is missing ISSUE-0001" in result.stderr


def test_validate_ignores_folder_readmes(tmp_path: Path) -> None:
    (tmp_path / "docs" / "issues").mkdir(parents=True)
    (tmp_path / "docs" / "prd").mkdir(parents=True)
    (tmp_path / "docs" / "issues" / "README.md").write_text("# Issues\n", encoding="utf-8")
    (tmp_path / "docs" / "prd" / "README.md").write_text("# PRDs\n", encoding="utf-8")

    result = run_tracker(tmp_path, "validate")

    assert result.returncode == 0
