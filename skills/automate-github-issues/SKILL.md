---
name: automate-github-issues
description: Analyze open GitHub issues, plan implementation tasks, and dispatch parallel Jules coding sessions to fix them
allowed-tools:
  - "Bash"
  - "Read"
  - "Write"
---

# Automate GitHub Issues with Jules

You are a fleet orchestrator for automated GitHub issue resolution using the Jules SDK. Your job is to analyze open issues, plan code-level fixes, and dispatch parallel coding agents.

## Overview

This skill automates the entire lifecycle of GitHub issue resolution: fetch issues → analyze root causes → plan tasks → validate ownership → dispatch Jules sessions → sequential merge. It runs as a scheduled pipeline or on-demand via GitHub Actions.

## Prerequisites

- [Bun](https://bun.sh) runtime installed
- `JULES_API_KEY` environment variable set
- `GITHUB_TOKEN` environment variable set (with repo access)
- Repository must have a `.git` directory (used for root detection and repo identification)

## Setup

If this is a fresh install, run the setup script:

```bash
bash scripts/setup.sh
```

This will:
1. Check for (and optionally install) Bun
2. Run `bun install` to fetch dependencies
3. Scaffold a `.env` file from the template

## Workflow Overview

The pipeline has 5 phases:

### Phase 1: Analyze
Fetch all open GitHub issues and format them as structured markdown.

```bash
bun scripts/fleet-analyze.ts
```

### Phase 2: Plan
A Jules session performs deep code-level triage on the issues — diagnosing root causes at the file/function/line level, proposing concrete implementations, and producing self-contained task prompts.

```bash
bun scripts/fleet-plan.ts
```

### Phase 3: Validate
Before dispatching, the orchestrator validates that no two tasks claim the same file. This prevents merge conflicts when parallel PRs land.

### Phase 4: Dispatch
The orchestrator spawns parallel Jules sessions — one per task — each receiving a code-rich, self-contained prompt with the exact files to modify, before/after diffs, and acceptance criteria.

```bash
bun scripts/fleet-dispatch.ts
```

### Phase 5: Merge
After all sessions complete and create PRs, the merge script processes them sequentially in risk order:
1. Update each PR branch from the base branch
2. Wait for CI to pass
3. Squash-merge
4. Move to the next PR

```bash
bun scripts/fleet-merge.ts
```

## Execution Steps

### Automated (GitHub Actions)

Copy the workflow templates from `assets/` to your `.github/workflows/` directory:

- `fleet-dispatch.yml` — Runs on a cron schedule (default: daily 6am UTC) or manual trigger
- `fleet-merge.yml` — Triggered when Jules opens PRs, merges them sequentially

### Manual (Local)

1. **Fetch issues**: `bun scripts/fleet-analyze.ts`
2. **Plan tasks**: `bun scripts/fleet-plan.ts`
3. **Dispatch agents**: `bun scripts/fleet-dispatch.ts`
4. **Merge PRs**: `bun scripts/fleet-merge.ts`

## Customization

### Prompt Tuning
The analysis prompt in `scripts/prompts/analyze-issues.ts` controls how deeply issues are investigated. You can adjust:
- Root cause analysis depth
- Solution implementation detail level
- Merge conflict avoidance rules
- File ownership constraints

### Bootstrap Prompt
The `scripts/prompts/bootstrap.ts` wraps the analysis into a self-executing prompt for scheduled sessions. Modify this to change the end-to-end automation behavior.

### Issue Filtering
Edit `scripts/github/issues.ts` to filter issues by label, milestone, or state.

## Resource References

- [Architecture Overview](resources/architecture.md) — Detailed explanation of the 5-phase pipeline
- [GitHub Actions Templates](assets/) — Ready-to-use workflow files

## Troubleshooting

- **"Unable to parse git remote URL"**: Ensure you have a valid GitHub remote. Run `git remote get-url origin` to verify.
- **Ownership conflict errors**: Two tasks claim the same file. The analysis prompt should merge them, but you may need to manually adjust the task JSON.
- **CI timeout during merge**: The merge script waits up to 10 minutes per PR. Increase `maxWaitMs` in `merge-fleet.ts` if your CI takes longer.
- **Bun not found**: Run `bash scripts/setup.sh` or install Bun manually: `curl -fsSL https://bun.sh/install | bash`
