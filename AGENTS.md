# Repository Instructions

## Implementation Workflow

- Always use Test-Driven Development (TDD) when implementing features or fixes.
- Follow a vertical red-green-refactor loop: write one failing behavior test, implement the smallest code to pass it, then refactor while tests are green.
- Tests should verify observable behavior through public service/API interfaces, not private implementation details.
- Do not create broad testing plans up front unless explicitly requested; define the next behavior test at the start of each implementation slice.
