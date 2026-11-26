# Jules Agent Skills

<!-- yarkr:badges:start -->
[![Indexed on Yarkr](https://api.yarkr.com/functions/v1/api/api/v1/badges/repos/google-labs-code/jules-skills/version.svg)](https://yarkr.com/arks/google-labs-code/jules-skills)
<!-- yarkr:badges:end -->

A library of Agent Skills designed to work with the Jules SDK. Each skill follows the Agent Skills open standard, for compatibility with coding agents such as Antigravity, Gemini CLI, Claude Code, Cursor.

## Installation & Discovery

Install any skill from this repository using the `skills` CLI. This command will automatically detect your active coding agents and place the skill in the appropriate directory.

```bash
# List all available skills in this repository
npx skills add google-labs-code/jules-skills --list

# Install a specific skill
npx skills add google-labs-code/jules-skills --skill automate-github-issues --global
```

<!-- yarkr:install:start -->
## Install with Yarkr

This repo is indexed on [Yarkr](https://yarkr.com/arks/google-labs-code/jules-skills) as the ark [google-labs-code/jules-skills](https://yarkr.com/arks/google-labs-code/jules-skills), so its skills install into Claude Code, Codex, Cursor and other agent harnesses with one command.

### CLI

Install the whole ark, which Yarkr keeps equal to this repo:

```bash
npx yarkr-cli sync google-labs-code/jules-skills
```

Or add individual skills:

```bash
npx yarkr-cli add skill:google-labs-code/jules-skills/automate-github-issues
npx yarkr-cli add skill:google-labs-code/jules-skills/local-action-verification
```

No Node.js? `curl -fsSL https://yarkr.com/install.sh | sh` (macOS, Linux) or `irm https://yarkr.com/install.ps1 | iex` (Windows PowerShell) installs `yarkr` as a standalone binary; then type `yarkr` in place of `npx yarkr-cli`.

### MCP

Connect your agent to the ark over MCP:

```bash
npx yarkr-cli mcp add google-labs-code/jules-skills
```

Or point any MCP client at `https://api.yarkr.com/functions/v1/api/mcp/o/google-labs-code/jules-skills`.
<!-- yarkr:install:end -->

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
