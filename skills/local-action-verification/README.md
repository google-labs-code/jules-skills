# Local Action Verification

A bootstrapper skill that sets up a repository for local GitHub Actions verification using [nektos/act](https://github.com/nektos/act). After setup, Jules can validate CI passes before pushing code.

## What It Does

When run, this skill copies scripts and instructions into the target repository:

```
scripts/act/
├── install-act.sh    # Installs act (platform-aware, sudo fallback)
└── run-act.sh        # Background runner with log polling and timeout
```

It also adds a **Local CI Verification** section to the repo's `AGENTS.md`, which Jules reads to discover and use the scripts during tasks.

## How It Works

```mermaid
flowchart TD
    A["🎯 Jules receives task<br/>(e.g. 'refactor X, verify CI')"] --> B["📖 Read AGENTS.md"]

    subgraph prereqs ["Step 1: Prerequisites"]
        B --> C{"Docker running?"}
        C -- No --> C1["⛔ Stop, tell user"]
        C -- Yes --> D{"act installed?"}
        D -- No --> D1["Run scripts/act/install-act.sh"]
        D1 --> E["✅ Ready"]
        D -- Yes --> E
    end

    subgraph analyze ["Step 2: Analyze Workflows"]
        E --> F["Read .github/workflows/"]
        F --> G["Identify job IDs,<br/>matrix configs, secrets"]
    end

    subgraph run ["Step 3: Run in Docker"]
        G --> H["scripts/act/run-act.sh<br/>starts act in background"]
        H --> I["act spins up Docker container"]
        I --> J["GitHub Action runs<br/>(build, test, lint)"]
        J --> K{"Exit code?"}
    end

    subgraph heal ["Self-Heal Loop"]
        K -- "❌ Fail" --> L["Read log output"]
        L --> M["Diagnose & fix code"]
        M --> H
    end

    K -- "✅ Pass" --> N

    subgraph cleanup ["Step 4: Cleanup"]
        N["Remove act_output.log"] --> O["Revert unintended changes"]
        O --> P["Verify git diff"]
    end

    P --> Q["🚀 Ready to push / open PR"]

    style prereqs fill:#1a1a2e,stroke:#16213e,color:#e0e0e0
    style analyze fill:#1a1a2e,stroke:#16213e,color:#e0e0e0
    style run fill:#1a1a2e,stroke:#16213e,color:#e0e0e0
    style heal fill:#2d1b1b,stroke:#8b0000,color:#e0e0e0
    style cleanup fill:#1a1a2e,stroke:#16213e,color:#e0e0e0
```

## After Setup

Once the skill has set up the repository, Jules can verify CI locally whenever it's given a coding task. The skill itself is no longer needed — everything Jules needs is in the repo.

### Example Flow
1. Jules receives: *"Refactor lib/utils.js and verify CI"*
2. Jules reads `AGENTS.md` → sees "Local CI Verification" instructions
3. Jules runs `bash scripts/act/run-act.sh "push -j test"`
4. CI passes → Jules pushes / opens PR

## Prerequisites

- **Docker** — Must be installed and running (preinstalled on Jules VMs)
- **act** — Installed automatically by `scripts/act/install-act.sh`

## Limitations

- `act` does [not support all GitHub Actions features](https://github.com/nektos/act#known-issues) (e.g., service containers, some caching)
- Large Docker images can be slow to pull on first run
- Jobs requiring GitHub-specific secrets need a `.secrets` file

This is not an officially supported Google product.
