---
name: triage
description: Triage local Markdown issues through status/category frontmatter. Use when user wants to create an issue, review issues, move issue status, or prepare issues for an AFK agent.
---

# Triage

Move local Markdown issues through a small state machine. Do not use GitHub Issues.

## References

- Tracker contract: `docs/agents/issue-tracker.md`
- State schema: `docs/agents/issue-states.md`
- Agent brief guide: `AGENT-BRIEF.md`
- Out-of-scope guide: `OUT-OF-SCOPE.md`

## State Model

Every triaged issue should have exactly one `category` and one `status` in frontmatter.

Statuses:

- `needs-triage`
- `needs-info`
- `ready-for-agent`
- `ready-for-human`
- `wontfix`
- `done`

Categories:

- `bug`
- `enhancement`

Use `agent_mode: AFK` for agent-ready work and `agent_mode: HITL` for human-interaction work.

## Show What Needs Attention

Read `docs/issues/*.md` and present these buckets, oldest first:

1. Issues with missing or invalid frontmatter.
2. `needs-triage`.
3. `needs-info` with new information in `## Triage Notes` or changed issue body.

Let the maintainer pick an issue.

## Create A Single Raw Issue

If the maintainer asks to create one issue from natural language:

1. Get the next ID with `python .agents/scripts/local_tracker.py next-id issue`.
2. Create one `docs/issues/ISSUE-####-slug.md` from `.agents/skills/to-issues/template.md`.
3. Set `status: needs-triage`, `agent_mode: TBD`, and the best initial `category`.
4. Validate and regenerate `STATUS.md`.

For multi-issue decomposition, recommend `to-issues`.

## Triage A Specific Issue

1. Read the full issue file, frontmatter, and canonical sections.
2. Parse prior `## Triage Notes`, `## Agent Brief`, and `## Update Log` so resolved questions are not re-asked.
3. Explore the relevant codebase area using the domain glossary and ADRs.
4. Read `.out-of-scope/*.md` and surface similar prior rejections.
5. Recommend category, status, and agent mode with reasoning. Wait for maintainer direction unless they asked for a direct override.
6. For bugs, attempt reproduction before grilling. Report successful repro, failed repro, or insufficient detail.
7. If needed, run a `grill-with-docs` session.
8. Apply the outcome by editing frontmatter and appending to canonical sections.

## Outcomes

- `ready-for-agent`: add or update `## Agent Brief` using `AGENT-BRIEF.md`.
- `ready-for-human`: add an agent-brief-style section and explain why it needs human execution.
- `needs-info`: append specific questions under `## Triage Notes`.
- `wontfix` bug: append a polite rationale under `## Triage Notes`.
- `wontfix` enhancement: write durable rationale under `.out-of-scope/` and link it from the issue.
- `needs-triage`: update frontmatter and optionally append partial notes.
- `done`: use only when implementation is complete and evidence is recorded.

After edits, run:

```bash
python .agents/scripts/local_tracker.py validate
python .agents/scripts/local_tracker.py status
```

## Quick State Override

If the maintainer says to move an issue to a status, trust them. Confirm the frontmatter and section edits you are about to make, then apply them. If moving to `ready-for-agent` without an agent brief, ask whether they want one.

Do not add repeated AI disclaimers to local Markdown files. Use frontmatter, section headings, and git history as the record.
