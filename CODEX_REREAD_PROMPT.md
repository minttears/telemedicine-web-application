# Prompt: Ask Codex To Re-Read Project Context

Use this prompt after updating documentation files.

```text
Re-read the project guidance files before doing anything else:

- AGENTS.md
- Requirements Specification.md
- PROJECT_BRIEF.md
- TASKS.md
- DECISIONS.md
- SECURITY.md
- PLANS.md
- .env.example
- MCP_SETUP.md, if it exists

Treat them as the source of truth for this project.

After reading them:
1. Summarize the project goal.
2. Summarize the tech stack.
3. Summarize the MVP scope.
4. Summarize the user roles and main workflows.
5. Summarize the coding, Git, UI, security, documentation, and MCP rules from AGENTS.md.
6. Confirm which MCP servers are available.
7. Do not change files yet.
8. Wait for my next task.
```
