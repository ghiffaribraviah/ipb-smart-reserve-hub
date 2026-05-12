# Issue States

Triage state is stored in issue YAML frontmatter, not external tracker labels.

## Status

Allowed `status` values:

- `needs-triage` - maintainer needs to evaluate this issue.
- `needs-info` - waiting for more information.
- `ready-for-agent` - fully specified and suitable for an AFK agent.
- `ready-for-human` - requires human judgment, access, or manual execution.
- `wontfix` - will not be actioned.
- `done` - completed and verified.

## Category

Allowed `category` values:

- `bug` - something is broken.
- `enhancement` - new feature or improvement.

## Agent Mode

Allowed `agent_mode` values:

- `AFK` - can be implemented by an agent without further human interaction.
- `HITL` - needs human interaction.
- `TBD` - not decided yet.

`ready-for-agent` usually pairs with `agent_mode: AFK`. `ready-for-human` usually pairs with `agent_mode: HITL`.
