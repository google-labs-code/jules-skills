# Automate GitHub Issues

An Agent Skill that sets up your repository to automatically triage and fix GitHub issues using parallel Jules coding agents.

## What It Does

When activated, this skill **bootstraps your repository** with a 5-phase automated pipeline:

1. **Analyze**: Fetches all open GitHub issues and formats them as a structured markdown document for analysis (`fleet-analyze.ts`).
2. **Plan**: A Jules session performs deep code-level triage — diagnosing root causes, proposing implementations, and producing self-contained task prompts.
3. **Validate**: Ownership validation ensures no two tasks modify the same file, preventing merge conflicts.
4. **Dispatch**: Spawns parallel Jules sessions — one per task — each with a code-rich, self-contained prompt (`fleet-dispatch.ts`).
5. **Merge**: A sequential merge workflow waits for CI, updates branches, and merges PRs in risk order (lowest first).

## Example Prompt

```text
Set up this GitHub repository to automate issue fixes with Jules.
```

## What Gets Created

The skill copies the following into your repository:

```
scripts/fleet/               # Pipeline scripts (committed to your repo)
├── fleet-analyze.ts
├── fleet-plan.ts
├── fleet-dispatch.ts
├── fleet-merge.ts
├── package.json
├── prompts/
│   ├── analyze-issues.ts    # Issue analysis prompt template
│   └── bootstrap.ts         # Bootstrap prompt for scheduled sessions
└── github/
    ├── git.ts               # Git repo utilities
    ├── issues.ts            # GitHub issue fetching
    ├── markdown.ts          # Issue → markdown formatting
    └── cache-plugin.ts      # ETag-based API caching

.github/workflows/
├── fleet-dispatch.yml       # Scheduled dispatch (daily cron)
└── fleet-merge.yml          # Auto-merge Jules PRs
```

## Prerequisites

- [Bun](https://bun.sh/) runtime
- A [Jules API key](https://jules.google.com/)
- GitHub token with repo access

## Manual Usage

After setup, run the pipeline locally:

```bash
cd scripts/fleet

# Fetch open issues
bun fleet-analyze.ts

# Plan tasks (creates a Jules planning session)
JULES_API_KEY=<key> bun fleet-plan.ts

# Dispatch parallel agents
JULES_API_KEY=<key> bun fleet-dispatch.ts

# Merge PRs sequentially
GITHUB_TOKEN=<token> bun fleet-merge.ts
```

## Setup (after skill activation)

### 1. Set Secrets

Add `JULES_API_KEY` as a GitHub repository secret (Settings → Secrets → Actions).
`GITHUB_TOKEN` is provided automatically by GitHub Actions.

### 2. Customize

- Adjust the cron schedule in `.github/workflows/fleet-dispatch.yml` (default: daily 6am UTC)
- Tune the analysis prompt in `scripts/fleet/prompts/analyze-issues.ts`

### 3. Commit

Commit all generated files and push.

This is not an officially supported Google product.
