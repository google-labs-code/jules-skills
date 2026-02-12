# Jules Agent Skills

A library of Agent Skills designed to work with the Jules SDK. Each skill follows the Agent Skills open standard, for compatibility with coding agents such as Antigravity, Gemini CLI, Claude Code, Cursor.

## Installation & Discovery

Install any skill from this repository using the `skills` CLI. This command will automatically detect your active coding agents and place the skill in the appropriate directory.

```bash
# List all available skills in this repository
npx skills add google-labs-code/jules-skills --list

# Install a specific skill
npx skills add google-labs-code/jules-skills --skill automate-github-issues --global
```

## Available Skills

### automate-github-issues
Automates GitHub issue triage and resolution by analyzing open issues, planning implementation tasks, and dispatching parallel Jules coding agents to fix them.

```bash
npx skills add google-labs-code/jules-skills --skill automate-github-issues --global
```

## Repository Structure

Every directory within `skills/` follows a standardized structure to ensure the AI agent has everything it needs to perform "few-shot" learning and automated quality checks.

```text
skills/[skill-name]/
├── SKILL.md           — The "Mission Control" for the agent
├── scripts/           — Executable scripts (Orchestration & Tooling)
├── resources/         — The knowledge base (Architecture & Guides)
├── assets/            — Templates & configuration files
└── README.md          — User-facing documentation
```

## Adding New Skills
All new skills need to follow the file structure above to implement the Agent Skills open standard.

### Great candidates for new skills
* **Issue Triage**: Skills that analyze issues and dispatch parallel coding agents.
* **Code Review**: Skills that automate code review using Jules sessions.
* **Migration**: Skills that plan and execute large-scale codebase migrations.
* **Documentation**: Skills that generate or update documentation from source code.

This is not an officially supported Google product. This project is not eligible for the [Google Open Source Software Vulnerability Rewards Program](https://bughunters.google.com/open-source-security).