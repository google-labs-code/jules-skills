---
name: local-action-verification
description: Runs GitHub Actions locally using 'act' to verify code changes before submitting a PR. Use when refactoring code, updating dependencies, or modifying logic that requires CI validation.
allowed-tools:
  - "Bash"
  - "Read"
---

# Local GitHub Actions Verification

You are verifying code changes by running the repository's GitHub Actions workflows locally using `act`. This ensures builds pass before pushing code or opening Pull Requests.

## Step 1: Check Prerequisites

Before running any actions, verify the environment:

1. **Docker**: Confirm the Docker daemon is running:
   ```bash
   docker info > /dev/null 2>&1 && echo "Docker is running" || echo "Docker is NOT running"
   ```
   If Docker is not running, stop and tell the user.

2. **act**: Check if `act` is installed:
   ```bash
   act --version 2>/dev/null || echo "act not found"
   ```
   If missing, install it by running `scripts/install-act.sh` from this skill's directory.

3. **Docker Credentials** (optional): If `DOCKER_USERNAME` and `DOCKER_PASSWORD` are set, authenticate to avoid Docker Hub rate limits:
   ```bash
   echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin
   ```

## Step 2: Analyze Workflows

Do **not** guess job names. You must read the repository's workflows:

1. List workflow files:
   ```bash
   ls .github/workflows/
   ```
2. Read the main CI file (typically `ci.yml`, `main.yml`, or `test.yml`).
3. Identify:
   - **Job ID** (e.g., `build`, `test`, `lint`)
   - **Matrix configurations** (e.g., `node-version: [18, 20]`)
   - **Required secrets** (if any — these will need `--secret-file`)

## Step 3: Run Actions Locally

Running `act` can take a long time. You **MUST** use the background runner script to avoid timeouts.

1. Construct the `act` arguments based on your workflow analysis:
   - Standard: `push -j <JOB_ID>`
   - With matrix: `push -j <JOB_ID> --matrix <KEY>:<VALUE>`

2. Run using the skill's background script:
   ```bash
   bash <SKILL_DIR>/scripts/run-act.sh "<ACT_ARGUMENTS>"
   ```
   Example:
   ```bash
   bash <SKILL_DIR>/scripts/run-act.sh "push -j build --matrix node-version:20.x"
   ```

3. The script will:
   - Run `act` in the background
   - Poll the log file every 10 seconds
   - Print the full log when done
   - Exit with 0 (pass) or 1 (fail)

4. If the run fails, read the full log output, diagnose the issue, fix the code, and re-run.

## Step 4: Cleanup

After verification (pass or fail):

1. **Remove log file**:
   ```bash
   rm -f act_output.log
   ```

2. **Revert unintended changes**: `act` may modify files inside the container that leak to the host (e.g., `package-lock.json`):
   ```bash
   git diff --name-only
   ```
   Revert any files you did not intentionally modify:
   ```bash
   git checkout <file>
   ```

3. **Verify your diff**: Confirm only your intended changes remain:
   ```bash
   git diff --stat
   ```

## Edge Cases

- If `act` hangs or times out, see [Troubleshooting](resources/troubleshooting.md)
- If a job requires secrets, create a `.secrets` file and pass `--secret-file .secrets` in the act arguments
- If the Docker image is too large, pass a lighter image: add `-P ubuntu-latest=node:20-bookworm` to the arguments
