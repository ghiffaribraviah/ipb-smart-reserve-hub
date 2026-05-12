#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


ISSUE_STATUSES = (
    "needs-triage",
    "needs-info",
    "ready-for-agent",
    "ready-for-human",
    "wontfix",
    "done",
)
ISSUE_CATEGORIES = ("bug", "enhancement")
AGENT_MODES = ("AFK", "HITL", "TBD", "")
PRD_STATUSES = ("draft", "active", "archived")

ID_PATTERN = {
    "prd": re.compile(r"^PRD-(\d{4})-.*\.md$"),
    "issue": re.compile(r"^ISSUE-(\d{4})-.*\.md$"),
}

TRACKER_DIR = {
    "prd": Path("docs/prd"),
    "issue": Path("docs/issues"),
}


class TrackerFile:
    def __init__(self, path: Path, frontmatter: dict[str, object]) -> None:
        self.path = path
        self.frontmatter = frontmatter

    @property
    def id(self) -> str:
        return str(self.frontmatter.get("id", ""))

    @property
    def title(self) -> str:
        return str(self.frontmatter.get("title", ""))


def next_id(repo_root: Path, artifact_type: str) -> str:
    highest = 0
    directory = repo_root / TRACKER_DIR[artifact_type]
    if directory.exists():
        for path in directory.iterdir():
            match = ID_PATTERN[artifact_type].match(path.name)
            if match:
                highest = max(highest, int(match.group(1)))
    prefix = "PRD" if artifact_type == "prd" else "ISSUE"
    return f"{prefix}-{highest + 1:04d}"


def parse_scalar(value: str) -> object:
    value = value.strip()
    if value == "[]":
        return []
    if value in ("", "null", "None"):
        return ""
    return value.strip('"').strip("'")


def parse_frontmatter(path: Path) -> dict[str, object]:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0].strip() != "---":
        raise ValueError("missing frontmatter")

    frontmatter: dict[str, object] = {}
    current_list_key: str | None = None
    for line in lines[1:]:
        if line.strip() == "---":
            return frontmatter
        if line.startswith("  - ") and current_list_key:
            frontmatter.setdefault(current_list_key, [])
            value = frontmatter[current_list_key]
            if isinstance(value, list):
                value.append(line[4:].strip())
            continue
        current_list_key = None
        if ":" not in line:
            continue
        key, raw_value = line.split(":", 1)
        key = key.strip()
        if raw_value.strip() == "":
            frontmatter[key] = []
            current_list_key = key
        else:
            frontmatter[key] = parse_scalar(raw_value)
    raise ValueError("unterminated frontmatter")


def read_tracker_files(repo_root: Path, artifact_type: str) -> tuple[list[TrackerFile], list[str]]:
    directory = repo_root / TRACKER_DIR[artifact_type]
    files: list[TrackerFile] = []
    errors: list[str] = []
    if not directory.exists():
        return files, errors

    id_pattern = ID_PATTERN[artifact_type]
    for path in sorted(directory.glob("*.md")):
        if not id_pattern.match(path.name):
            continue
        try:
            files.append(TrackerFile(path, parse_frontmatter(path)))
        except ValueError as exc:
            errors.append(f"{path.relative_to(repo_root)}: {exc}")
    return files, errors


def as_list(value: object) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value if str(item)]
    if value in ("", None):
        return []
    return [str(value)]


def validate_tracker(repo_root: Path) -> list[str]:
    issues, errors = read_tracker_files(repo_root, "issue")
    prds, prd_errors = read_tracker_files(repo_root, "prd")
    errors.extend(prd_errors)

    seen_ids: dict[str, Path] = {}
    issue_ids = {issue.id for issue in issues if issue.id}
    prds_by_id = {prd.id: prd for prd in prds if prd.id}

    for tracker_file in [*issues, *prds]:
        relative = tracker_file.path.relative_to(repo_root)
        file_id = tracker_file.id
        if not file_id:
            errors.append(f"{relative}: missing id")
            continue
        if file_id in seen_ids:
            errors.append(f"Duplicate id {file_id}: {seen_ids[file_id].relative_to(repo_root)} and {relative}")
        seen_ids[file_id] = tracker_file.path

    for issue in issues:
        relative = issue.path.relative_to(repo_root)
        metadata = issue.frontmatter
        for field in ("id", "type", "title", "status", "category", "created", "updated", "blocked_by"):
            if field not in metadata:
                errors.append(f"{relative}: missing {field}")
        if metadata.get("type") != "issue":
            errors.append(f"{relative}: type must be issue")
        if metadata.get("status") not in ISSUE_STATUSES:
            errors.append(f"{relative}: invalid status {metadata.get('status')}")
        if metadata.get("category") not in ISSUE_CATEGORIES:
            errors.append(f"{relative}: invalid category {metadata.get('category')}")
        if metadata.get("agent_mode", "") not in AGENT_MODES:
            errors.append(f"{relative}: invalid agent_mode {metadata.get('agent_mode')}")
        prd_id = str(metadata.get("prd", ""))
        if prd_id and prd_id not in prds_by_id:
            errors.append(f"{relative}: unknown prd reference {prd_id}")
        for blocker in as_list(metadata.get("blocked_by", [])):
            if blocker not in issue_ids:
                errors.append(f"{relative}: Unknown blocked_by reference {blocker}")

    for prd in prds:
        relative = prd.path.relative_to(repo_root)
        metadata = prd.frontmatter
        for field in ("id", "type", "title", "status", "created", "updated", "issues"):
            if field not in metadata:
                errors.append(f"{relative}: missing {field}")
        if metadata.get("type") != "prd":
            errors.append(f"{relative}: type must be prd")
        if metadata.get("status") not in PRD_STATUSES:
            errors.append(f"{relative}: invalid status {metadata.get('status')}")
        listed_issues = set(as_list(metadata.get("issues", [])))
        actual_issues = {
            issue.id
            for issue in issues
            if issue.frontmatter.get("prd") == prd.id and issue.id
        }
        for issue_id in sorted(actual_issues - listed_issues):
            errors.append(f"{prd.id} issues list is missing {issue_id}")
        for issue_id in sorted(listed_issues - issue_ids):
            errors.append(f"{relative}: unknown issue reference {issue_id}")

    return errors


def render_status(repo_root: Path) -> str:
    issues, errors = read_tracker_files(repo_root, "issue")
    if errors:
        raise ValueError("\n".join(errors))

    grouped: dict[str, list[TrackerFile]] = {status: [] for status in ISSUE_STATUSES}
    for issue in issues:
        status = str(issue.frontmatter.get("status", ""))
        if status in grouped:
            grouped[status].append(issue)

    lines = [
        "# Issue Status",
        "",
        "Generated from `docs/issues/*.md` frontmatter. Edit issue files, then regenerate this file.",
        "",
    ]
    for status in ISSUE_STATUSES:
        lines.append(f"## {status}")
        lines.append("")
        if grouped[status]:
            for issue in sorted(grouped[status], key=lambda item: item.id):
                lines.append(f"- {issue.id} - {issue.title}")
        else:
            lines.append("- None")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def write_status(repo_root: Path) -> None:
    issues_dir = repo_root / TRACKER_DIR["issue"]
    issues_dir.mkdir(parents=True, exist_ok=True)
    issues_dir.joinpath("STATUS.md").write_text(render_status(repo_root), encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Local Markdown tracker helper")
    subparsers = parser.add_subparsers(dest="command", required=True)

    next_id_parser = subparsers.add_parser("next-id")
    next_id_parser.add_argument("artifact_type", choices=("prd", "issue"))
    subparsers.add_parser("validate")
    subparsers.add_parser("status")

    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    repo_root = Path.cwd()
    if args.command == "next-id":
        print(next_id(repo_root, args.artifact_type))
        return 0
    if args.command == "validate":
        errors = validate_tracker(repo_root)
        if errors:
            for error in errors:
                print(error, file=sys.stderr)
            return 1
        print("Local tracker files are valid.")
        return 0
    if args.command == "status":
        try:
            write_status(repo_root)
        except ValueError as exc:
            print(str(exc), file=sys.stderr)
            return 1
        print("Regenerated docs/issues/STATUS.md")
        return 0
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
