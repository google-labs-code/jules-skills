# Local Action Verification

An Agent Skill that verifies code changes by running GitHub Actions locally using [nektos/act](https://github.com/nektos/act), ensuring CI passes before pushing.

## What It Does

When an agent needs to verify that code changes pass CI, this skill instructs it to:

1. **Check prerequisites** — Docker running, `act` installed, optional Docker Hub auth
2. **Analyze workflows** — Read `.github/workflows/` to identify job IDs and matrix configs
3. **Run locally** — Execute the relevant CI job inside a Docker container via `act`
4. **Self-heal** — If tests fail, read the logs, fix the code, and re-run
5. **Clean up** — Remove log files and revert unintended changes (e.g., `package-lock.json`)

## Example Prompts

```text
Refactor lib/utils.js to use modern ES6+ syntax and verify the changes pass CI locally.
```

```text
Before opening a PR, run the test suite locally to make sure nothing is broken.
```

## How It Works

The agent reads the instructions each time it needs CI verification. No files are copied to the target repo.

The skill provides two helper scripts:
- `install-act.sh` — Installs `act` if missing (platform-aware)
- `run-act.sh` — Runs `act` in the background with log polling to avoid agent timeouts

```mermaid
flowchart TD
    A["🎯 Jules receives task<br/>(e.g. 'refactor X, verify CI')"] --> B["📖 Read SKILL.md"]

    subgraph prereqs ["Step 1: Prerequisites"]
        B --> C{"Docker running?"}
        C -- No --> C1["⛔ Stop, tell user"]
        C -- Yes --> D{"act installed?"}
        D -- No --> D1["Run install-act.sh"]
        D1 --> E["✅ Ready"]
        D -- Yes --> E
    end

    subgraph analyze ["Step 2: Analyze Workflows"]
        E --> F["Read .github/workflows/"]
        F --> G["Identify job IDs,<br/>matrix configs, secrets"]
    end

    subgraph run ["Step 3: Run in Docker"]
        G --> H["run-act.sh starts act<br/>in background"]
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

## Prerequisites

- **Docker** — Must be installed and running
- **Internet access** — To pull runner images (~2GB for `node:20`, ~20GB for full Ubuntu)
- **act** — Installed automatically by the skill if missing

## Limitations

- `act` does [not support all GitHub Actions features](https://github.com/nektos/act#known-issues) (e.g., service containers, some caching)
- Large Docker images can be slow to pull on first run
- Jobs requiring GitHub-specific secrets need a `.secrets` file

This is not an officially supported Google product.
