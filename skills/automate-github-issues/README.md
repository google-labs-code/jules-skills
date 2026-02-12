# Automate GitHub Issues Skill

## Install

```bash
npx skills add google-labs-code/jules-skills --skill automate-github-issues --global
```

## Example Prompt

```text
Set up this GitHub repository to automate issue fixes to Jules.
```

## Skill Structure

This repository follows the **Agent Skills** open standard. Each skill is self-contained with its own logic, workflow, and reference materials.

```text
automate-github-issues/
├── SKILL.md           — Core instructions & workflow
├── scripts/           — Orchestration scripts (fleet-analyze, fleet-dispatch, fleet-merge)
│   ├── prompts/       — AI prompt templates
│   └── github/        — GitHub API utilities
├── assets/            — GitHub Actions workflow templates & env config
├── resources/         — Architecture documentation
└── README.md          — This file
```

## How it Works

When activated, the skill runs a 5-phase automated pipeline:

1. **Analyze**: Fetches all open GitHub issues and formats them as a structured markdown document for analysis (`fleet-analyze.ts`).
2. **Plan**: A Jules session performs deep code-level triage — diagnosing root causes, proposing implementations, and producing self-contained task prompts.
3. **Validate**: Ownership validation ensures no two tasks modify the same file, preventing merge conflicts.
4. **Dispatch**: Spawns parallel Jules sessions — one per task — each with a code-rich, self-contained prompt (`fleet-dispatch.ts`).
5. **Merge**: A sequential merge script waits for CI, updates branches, and merges PRs in risk order (lowest first).

## Prerequisites

- [Bun](https://bun.sh) runtime
- A `JULES_API_KEY` (from the Jules SDK)
- A `GITHUB_TOKEN` with repo access

## Manual Setup

After installing the skill, you need to configure two things:

### 1. Set Secrets

Add these as GitHub repository secrets (Settings → Secrets → Actions):

| Secret | Description |
|--------|------------|
| `JULES_API_KEY` | Your Jules API key |
| `GITHUB_TOKEN` | GitHub token with repo access (usually provided automatically) |

### 2. Add GitHub Actions Workflows

Copy the workflow templates from `assets/` into your repository:

```bash
cp .agent/skills/automate-github-issues/assets/fleet-dispatch.yml .github/workflows/
cp .agent/skills/automate-github-issues/assets/fleet-merge.yml .github/workflows/
```

Customize the cron schedule in `fleet-dispatch.yml` to match your preferred cadence.

This is not an officially supported Google product.
