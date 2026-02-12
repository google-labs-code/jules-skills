# Automate GitHub Issues

An Agent Skill that sets up your repository to automatically triage and fix GitHub issues using parallel Jules coding agents.

## What It Does

When activated, this skill **bootstraps your repository** with a 5-phase automated pipeline:

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

### Pipeline Overview

```mermaid
flowchart LR
    A["📊 Analyze"] --> B["🧠 Plan"]
    B --> C["✅ Validate"]
    C --> D["🚀 Dispatch"]
    D --> E["🔀 Merge"]
```

| Phase | Script | What it does |
|-------|--------|-------------|
| **Analyze** | `fleet-analyze.ts` | Fetches open issues → structured markdown |
| **Plan** | `fleet-plan.ts` | Jules diagnoses root causes, builds File Ownership Matrix |
| **Validate** | `fleet-dispatch.ts` | Checks no two tasks claim the same file |
| **Dispatch** | `fleet-dispatch.ts` | Spawns parallel Jules sessions via `jules.all()` |
| **Merge** | `fleet-merge.ts` | Sequential merge: update branch → CI → squash |

### Detailed Flow

```mermaid
flowchart TD
    subgraph analyze ["Phase 1: Analyze"]
        A1["Fetch open GitHub issues"] --> A2["Format as structured markdown"]
    end

    subgraph plan ["Phase 2: Plan"]
        A2 --> B1["Create Jules planning session"]
        B1 --> B2["Investigate: trace issues to source code"]
        B2 --> B3["Architect: design solutions with diffs"]
        B3 --> B4["Build File Ownership Matrix"]
        B4 --> B5{"Any file in 2+ tasks?"}
        B5 -- Yes --> B6["Merge overlapping tasks"]
        B6 --> B4
        B5 -- No --> B7["Write task plan to .fleet/"]
    end

    subgraph validate ["Phase 3: Validate"]
        B7 --> C1["Read issue_tasks.json"]
        C1 --> C2{"Ownership conflict?"}
        C2 -- Yes --> C3["❌ Abort before dispatch"]
        C2 -- No --> C4["✅ Safe to parallelize"]
    end

    subgraph dispatch ["Phase 4: Dispatch"]
        C4 --> D1["jules.all — spawn parallel sessions"]
        D1 --> D2["Each session targets same base branch"]
        D2 --> D3["Sessions produce PRs"]
    end

    subgraph merge ["Phase 5: Merge"]
        D3 --> E1["Process PRs sequentially by risk"]
        E1 --> E2["Update branch from base"]
        E2 --> E3{"Merge conflict?"}
        E3 -- No --> E4["Wait for CI"]
        E4 --> E5{"CI passed?"}
        E5 -- Yes --> E6["Squash merge"]
        E5 -- No --> E7["❌ Abort"]
        E6 --> E8{"More PRs?"}
        E8 -- Yes --> E1
        E8 -- No --> E9["✅ All merged"]
        E3 -- Yes --> E10{"Retries left?"}
        E10 -- No --> E11["❌ Escalate to human"]
        E10 -- Yes --> E12["Close old PR"]
        E12 --> E13["Re-dispatch: new Jules session\nagainst current base"]
        E13 --> E14["Wait for new PR"]
        E14 --> E2
    end

    style analyze fill:#1a2332,stroke:#2a4a6b,color:#e0e0e0
    style plan fill:#1a2332,stroke:#2a4a6b,color:#e0e0e0
    style validate fill:#1a2332,stroke:#2a4a6b,color:#e0e0e0
    style dispatch fill:#1a2332,stroke:#2a4a6b,color:#e0e0e0
    style merge fill:#1a2332,stroke:#2a4a6b,color:#e0e0e0
```

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
