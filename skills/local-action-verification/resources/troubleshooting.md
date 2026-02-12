# Troubleshooting Local Action Verification

## Docker Hub Rate Limits

**Symptoms:** `Too Many Requests`, `pull access denied`, or `unauthorized` errors in the log.

**Fix:**
1. Set `DOCKER_USERNAME` and `DOCKER_PASSWORD` environment variables.
2. Run: `echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin`
3. Re-run the action.

## Image Pull Failures

**Symptoms:** `Container not found`, image download hangs, or architecture mismatch errors.

The default image `catthehacker/ubuntu:act-latest` is ~20GB. Alternatives:

| Image | Size | Best For |
|-------|------|----------|
| `catthehacker/ubuntu:act-latest` | ~20GB | Full GitHub runner compatibility |
| `node:20-bookworm` | ~1GB | Node.js-only workflows |
| `node:20-slim` | ~200MB | Minimal Node.js (may miss system deps) |

To override, add `-P ubuntu-latest=<image>` to the act arguments:
```bash
./run-act.sh "push -j test -P ubuntu-latest=node:20-bookworm"
```

### ARM64 (Apple Silicon) Issues

`act` may pull amd64 images on ARM64 machines, causing slow emulation or crashes.

**Fix:** Use `--container-architecture linux/amd64` explicitly, or pull an ARM64-native image if available.

## Secrets and Environment Variables

Jobs that reference `${{ secrets.* }}` will fail unless secrets are provided.

**Fix:** Create a `.secrets` file (KEY=VALUE format, one per line) and pass it:
```bash
./run-act.sh "push -j deploy --secret-file .secrets"
```

> ⚠️ **Never commit `.secrets`**. Add it to `.gitignore`.

## File Permission Issues

`act` runs as root inside the container. This can cause permission changes to mounted files.

**Symptoms:** `package-lock.json`, `node_modules`, or other files modified after running.

**Fix:** Revert unintended changes:
```bash
git checkout package-lock.json
```

## Timeout / Hanging

**Symptoms:** `run-act.sh` runs past the timeout, or the process appears stuck.

**Causes:**
- A workflow step is waiting for user input
- A network resource is unreachable from inside the container
- The Docker image is still downloading (first run can take 10+ minutes)

**Fixes:**
1. Increase timeout: `ACT_TIMEOUT=1200 ./run-act.sh "..."`
2. Check `act_output.log` for the last step that ran
3. Kill stale containers: `docker ps | grep act | awk '{print $1}' | xargs docker kill`

## Service Containers

`act` has [limited support](https://github.com/nektos/act#known-issues) for `services:` in workflow files. Jobs using service containers (e.g., Postgres, Redis) may not work.

**Workaround:** Start the service manually before running act:
```bash
docker run -d --name test-postgres -p 5432:5432 -e POSTGRES_PASSWORD=test postgres:15
./run-act.sh "push -j test"
docker stop test-postgres && docker rm test-postgres
```
